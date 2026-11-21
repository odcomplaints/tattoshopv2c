// POST /api/checkout — Vercel Edge Function
//
// Creates a Stripe Checkout Session from either:
//   1. Shop cart items (physical products)
//   2. Booking deposit (€50 for tattoo appointment)
//
// Prices are looked up server-side from the catalog — the amounts the
// client sends are ignored on purpose.

import { getCatalogEntry } from '../src/data/catalog.js'
import { stripeRequest, StripeError, randomSuffix } from './_stripe.js'
import { getSoldOutIds } from './_soldout.js'
import { getPodProduct } from '../src/data/printOnDemand.js'
import { bookingConfig, isDateKeyAvailable } from '../src/data/bookingConfig.js'

export const config = { runtime: 'edge' }

type CartLine = { id: unknown; quantity: unknown; size?: unknown }
type CheckoutPayload = {
  items?: CartLine[]
  bookingData?: Record<string, unknown>
  checkoutType?: unknown
}

// Countries we are willing to ship physical prints to.
const SHIPPING_COUNTRIES = ['DE', 'AT', 'CH', 'NL', 'BE', 'LU', 'FR', 'DK', 'PL', 'CZ']

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function clip(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

function formatDateDe(key: string): string {
  const [y, m, d] = key.split('-')
  return `${d}.${m}.${y}`
}

type Booking = {
  checkoutType: 'full' | 'express'
  language: 'de' | 'en'
  name: string
  email: string
  phone: string
  date: string
  bodyPart: string
  size: string
  motif: string
}

// Mirrors the validation in api/booking.ts so a deposit can never be taken
// for an incomplete request or an unavailable date.
function parseBooking(raw: Record<string, unknown>, rawType: unknown): Booking | { error: string } {
  const booking: Booking = {
    checkoutType: rawType === 'express' ? 'express' : 'full',
    language: raw.language === 'de' ? 'de' : 'en',
    name: str(raw.name),
    email: str(raw.email),
    phone: str(raw.phone),
    date: str(raw.date),
    bodyPart: str(raw.bodyPart),
    size: str(raw.size),
    motif: str(raw.motif),
  }
  if (!booking.email || !booking.phone || !booking.date) return { error: 'Missing required fields.' }
  if (booking.checkoutType === 'full' && (!booking.name || !booking.motif || !booking.bodyPart || !booking.size)) {
    return { error: 'Missing required fields.' }
  }
  if (!EMAIL_RE.test(booking.email)) return { error: 'Invalid email address.' }
  // One day of tolerance: the server runs in UTC, the customer in their own timezone.
  if (!isDateKeyAvailable(booking.date, new Date(), 1)) return { error: 'The selected date is not available.' }
  return booking
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405)
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return json({ error: 'Payment is not configured. Missing STRIPE_SECRET_KEY.' }, 500)
  }

  let payload: CheckoutPayload
  try {
    payload = (await request.json()) as CheckoutPayload
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400)
  }

  const isBookingCheckout = !!payload.bookingData
  const rawItems = Array.isArray(payload.items) ? payload.items : []

  if (!isBookingCheckout && rawItems.length === 0) {
    return json({ error: 'Your cart is empty.' }, 400)
  }

  // Resolve the public origin for success/cancel redirects.
  const origin = process.env.SITE_URL?.replace(/\/$/, '') || new URL(request.url).origin

  // ========== BOOKING DEPOSIT CHECKOUT ==========
  if (isBookingCheckout) {
    const booking = parseBooking(payload.bookingData ?? {}, payload.checkoutType)
    if ('error' in booking) {
      return json({ error: booking.error }, 400)
    }

    // Booking details live in session metadata (shown in the Stripe Dashboard
    // and delivered with the webhook event). Stripe caps each value at 500
    // characters, so long free-text fields are truncated here; the full text
    // already reached the studio via /api/booking.
    const metadata = {
      type: 'booking-deposit',
      checkout_type: booking.checkoutType,
      language: booking.language,
      name: clip(booking.name, 200),
      email: clip(booking.email, 200),
      phone: clip(booking.phone, 100),
      date: booking.date,
      body_part: clip(booking.bodyPart, 200),
      size: clip(booking.size, 100),
      motif: clip(booking.motif, 500),
    }

    try {
      const session = await stripeRequest<{ id: string; url: string }>(secretKey, '/v1/checkout/sessions', {
        mode: 'payment',
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'eur',
              unit_amount: bookingConfig.depositCents,
              product_data: {
                name: 'Tattoo-Anzahlung',
                description: `Wunschtermin ${formatDateDe(booking.date)} · wird mit dem Endpreis verrechnet`,
              },
            },
          },
        ],
        customer_email: booking.email,
        metadata,
        payment_intent_data: {
          description: `Tattoo-Anzahlung ${booking.name || booking.email} (${booking.date})`,
          metadata,
        },
        success_url: `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}&type=booking`,
        cancel_url: `${origin}/booking?canceled=1`,
        integration_identifier: `booking_${randomSuffix()}`,
      })

      return json({ id: session.id, url: session.url })
    } catch (error) {
      if (error instanceof StripeError) {
        return json({ error: error.message }, 400)
      }
      throw error
    }
  }

  // ========== SHOP CART CHECKOUT ==========
  // Validate every line against the server catalog and build trusted line items.
  const soldOutIds = await getSoldOutIds()
  const lineItems: Array<Record<string, unknown>> = []
  let hasPodItems = false
  for (const raw of rawItems) {
    const id = typeof raw.id === 'string' ? raw.id : ''
    const quantity = Math.floor(Number(raw.quantity))
    const entry = getCatalogEntry(id)

    if (!entry) {
      return json({ error: `Unknown product: ${id || '(missing id)'}.` }, 400)
    }
    const pod = getPodProduct(id)
    // POD items are printed to order, so the purchase-based sold-out set never applies.
    if (!entry.available || (!pod && soldOutIds.includes(id))) {
      return json({ error: `${entry.name} is sold out.` }, 409)
    }
    const maxQuantity = pod ? pod.maxQuantity : 20
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > maxQuantity) {
      return json({ error: `Invalid quantity for ${entry.name}.` }, 400)
    }

    if (pod) {
      const size = typeof raw.size === 'string' ? raw.size : ''
      if (!pod.sizes.includes(size)) {
        return json({ error: `Please choose a valid size for ${entry.name}.` }, 400)
      }
      hasPodItems = true
      // Size + POD flag travel on the Stripe product so the webhook can build
      // the production order from the paid line items.
      lineItems.push({
        quantity,
        price_data: {
          currency: entry.currency,
          unit_amount: entry.priceCents,
          product_data: {
            name: `${entry.name} – Größe ${size}`,
            description: `Print on Demand · wird nach Bestellung gedruckt (${pod.productionTime})`,
            metadata: { product_id: entry.id, size, print_on_demand: 'true' },
          },
        },
      })
      continue
    }

    lineItems.push({
      quantity,
      price_data: {
        currency: entry.currency,
        unit_amount: entry.priceCents,
        product_data: { name: entry.name, metadata: { product_id: entry.id } },
      },
    })
  }

  try {
    const session = await stripeRequest<{ id: string; url: string }>(secretKey, '/v1/checkout/sessions', {
      mode: 'payment',
      // NOTE: never set `payment_method_types` — omitting it enables dynamic
      // payment methods (cards, Apple Pay, Google Pay, …) configured in the
      // Stripe Dashboard for maximum conversion.
      line_items: lineItems as unknown as import('./_stripe.js').FormValue[],
      success_url: `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop/cart?canceled=1`,
      billing_address_collection: 'auto',
      shipping_address_collection: { allowed_countries: SHIPPING_COUNTRIES },
      // POD providers usually require a phone number for the carrier.
      ...(hasPodItems ? { phone_number_collection: { enabled: true } } : {}),
      metadata: { type: 'shop-order', contains_pod: hasPodItems ? 'true' : 'false' },
      // A single flat-rate shipping option for physical prints.
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            display_name: 'Standard shipping',
            fixed_amount: { amount: 500, currency: 'eur' },
            // POD items are printed first, so the estimate is longer.
            delivery_estimate: {
              minimum: { unit: 'business_day', value: hasPodItems ? 5 : 3 },
              maximum: { unit: 'business_day', value: hasPodItems ? 12 : 7 },
            },
          },
        },
      ],
      // Tag sessions from this flow so they can be compared in the Dashboard.
      integration_identifier: `od-complaints-web-${randomSuffix()}`,
      // Stripe Tax is intentionally NOT enabled here: turning on automatic_tax
      // without an active tax registration silently collects no tax. Enable it
      // in the Dashboard + here once registrations are in place.
    })

    return json({ id: session.id, url: session.url })
  } catch (error) {
    if (error instanceof StripeError) {
      return json({ error: error.message }, error.status >= 400 && error.status < 500 ? 400 : 502)
    }
    return json({ error: 'Could not start checkout. Please try again.' }, 502)
  }
}
