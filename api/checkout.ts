// POST /api/checkout — Vercel Edge Function
//
// Creates a Stripe Checkout Session from either:
//   1. Shop cart items (physical products) and digital tattoo templates (`claim:<workId>` lines)
//   2. Booking deposit (€50 for tattoo appointment)
//
// Prices are looked up server-side from the catalog — the amounts the
// client sends are ignored on purpose.

import { getCatalogEntry } from '../src/data/catalog.js'
import { stripeRequest, StripeError, randomSuffix } from './_stripe.js'
import { getSoldOutIds } from './_soldout.js'
import { getPodProduct } from '../src/data/printOnDemand.js'
import { bookingConfig, isDateKeyAvailable } from '../src/data/bookingConfig.js'
import { CLAIM_METADATA_TYPE, claimDeliveryFiles, formatClaimPrice, getClaimableWork, workIdFromCartId } from '../src/data/claims.js'
import type { ClaimableWork } from '../src/data/claims.js'
import {
  CHECKOUT_LIFETIME_SECONDS,
  attachSessionToHold,
  isDeliverable,
  releaseHold,
  reserveCartClaims,
  resolveClaimFileUrl,
} from './_claims.js'

export const config = { runtime: 'edge' }

type CartLine = { id: unknown; quantity: unknown; size?: unknown }
type CheckoutPayload = {
  items?: CartLine[]
  bookingData?: Record<string, unknown>
  checkoutType?: unknown
  /** Buyer accepted immediate delivery of digital templates (waiver of withdrawal). */
  claimConsent?: unknown
  language?: unknown
  /** Still-open session of the same buyer, see reserveCartClaims(). */
  previousSessionId?: unknown
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
  // Lines with a `claim:<workId>` id are digital tattoo templates (see src/data/work.ts).
  const soldOutIds = await getSoldOutIds()
  const lineItems: Array<Record<string, unknown>> = []
  const claimEntries: ClaimableWork[] = []
  let hasPodItems = false
  let hasPhysicalItems = false
  for (const raw of rawItems) {
    const id = typeof raw.id === 'string' ? raw.id : ''
    const quantity = Math.floor(Number(raw.quantity))

    const workId = workIdFromCartId(id)
    if (workId !== null) {
      const claimEntry = getClaimableWork(workId)
      if (!claimEntry) return json({ error: `This design cannot be claimed: ${workId || '(missing id)'}.` }, 404)
      if (quantity !== 1 || claimEntries.some((entry) => entry.id === claimEntry.id)) {
        return json({ error: `${claimEntry.title} can only be claimed once per order.` }, 400)
      }
      if (claimEntry.claim.claimed) return json({ error: `${claimEntry.title} has already been claimed.` }, 409)
      claimEntries.push(claimEntry)
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: claimEntry.claim.priceCents,
          product_data: {
            name: `Tattoo-Vorlage: ${claimEntry.title}`,
            description: `Digitale Datei · ${formatClaimPrice(claimEntry.claim.priceCents)} · Download direkt nach der Zahlung`,
            metadata: { work_id: claimEntry.id },
          },
        },
      })
      continue
    }

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
    hasPhysicalItems = true
  }

  // Digital templates are delivered immediately, so the buyer must explicitly waive the right of withdrawal.
  if (claimEntries.length > 0 && payload.claimConsent !== true) {
    return json({ error: 'Missing consent to immediate delivery of digital files.' }, 400)
  }

  // Never take money for a file that cannot be delivered afterwards.
  for (const claimEntry of claimEntries) {
    for (let index = 0; index < claimDeliveryFiles(claimEntry).length; index++) {
      const fileUrl = resolveClaimFileUrl(claimEntry, origin, index)
      if (!fileUrl || !(await isDeliverable(fileUrl))) {
        console.error(`[claim] ${claimEntry.id} — delivery file not reachable (${fileUrl ?? 'CLAIM_FILES_BASE_URL missing'}).`)
        return json({ error: `${claimEntry.title} is currently not available.` }, 503)
      }
    }
  }

  const reservation = await reserveCartClaims(claimEntries, {
    secretKey,
    previousSessionId: typeof payload.previousSessionId === 'string' ? payload.previousSessionId : '',
    production: process.env.VERCEL_ENV === 'production',
  })
  const releaseAll = (ids: string[]) =>
    Promise.all(ids.map((workId) => releaseHold(workId, 'pending').catch(() => undefined)))
  if (!reservation.ok) {
    await releaseAll(reservation.reserved)
    return json({ error: reservation.error }, reservation.status)
  }

  const hasClaims = claimEntries.length > 0
  const claimOnly = hasClaims && !hasPhysicalItems
  const language = payload.language === 'de' ? 'de' : 'en'
  const metadata: Record<string, string> = claimOnly
    ? { type: CLAIM_METADATA_TYPE }
    : { type: 'shop-order', contains_pod: hasPodItems ? 'true' : 'false' }
  if (hasClaims) {
    metadata.work_ids = claimEntries.map((entry) => entry.id).join(',')
    metadata.work_titles = claimEntries.map((entry) => entry.title).join(', ').slice(0, 480)
    metadata.language = language
    metadata.withdrawal_waiver = 'accepted'
  }

  try {
    const session = await stripeRequest<{ id: string; url: string }>(secretKey, '/v1/checkout/sessions', {
      mode: 'payment',
      // NOTE: never set `payment_method_types` — omitting it enables dynamic
      // payment methods (cards, Apple Pay, Google Pay, …) configured in the
      // Stripe Dashboard for maximum conversion.
      line_items: lineItems as unknown as import('./_stripe.js').FormValue[],
      success_url: `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}${claimOnly ? '&type=claim' : hasClaims ? '&claims=1' : ''}`,
      cancel_url: `${origin}/shop/cart?canceled=1`,
      billing_address_collection: 'auto',
      // Digital-only orders need no address, shipping or phone number.
      ...(hasPhysicalItems
        ? {
            shipping_address_collection: { allowed_countries: SHIPPING_COUNTRIES },
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
          }
        : {}),
      // POD providers usually require a phone number for the carrier.
      ...(hasPodItems ? { phone_number_collection: { enabled: true } } : {}),
      // The exclusive-piece lock lives as long as the session does.
      ...(hasClaims ? { expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_LIFETIME_SECONDS } : {}),
      ...(hasClaims
        ? { custom_text: { submit: { message: 'Digitale Dateien werden sofort nach der Zahlung bereitgestellt.' } } }
        : {}),
      metadata,
      // Tag sessions from this flow so they can be compared in the Dashboard.
      integration_identifier: `od-complaints-web-${randomSuffix()}`,
      // Stripe Tax is intentionally NOT enabled here: turning on automatic_tax
      // without an active tax registration silently collects no tax. Enable it
      // in the Dashboard + here once registrations are in place.
    })

    await Promise.all(reservation.reserved.map((workId) => attachSessionToHold(workId, session.id)))
    return json({ id: session.id, url: session.url })
  } catch (error) {
    await releaseAll(reservation.reserved)
    if (error instanceof StripeError) {
      return json({ error: error.message }, error.status >= 400 && error.status < 500 ? 400 : 502)
    }
    return json({ error: 'Could not start checkout. Please try again.' }, 502)
  }
}
