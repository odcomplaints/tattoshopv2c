// POST /api/checkout
//
// Creates a Stripe Checkout Session from the client's cart and returns the
// hosted Checkout URL to redirect to. Prices are looked up server-side from the
// catalog — the amounts the client sends are ignored on purpose.

import { getCatalogEntry } from '../../src/data/catalog'
import { stripeRequest, StripeError, randomSuffix } from '../_stripe'

interface Env {
  STRIPE_SECRET_KEY: string
  // Optional override for the public site origin (e.g. https://od-complaints.pages.dev).
  // Falls back to the request origin when unset.
  SITE_URL?: string
}

type CartLine = { id: unknown; quantity: unknown }

// Countries we are willing to ship physical prints to.
const SHIPPING_COUNTRIES = ['DE', 'AT', 'CH', 'NL', 'BE', 'LU', 'FR', 'DK', 'PL', 'CZ']

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context

  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: 'Payment is not configured. Missing STRIPE_SECRET_KEY.' }, 500)
  }

  let payload: { items?: CartLine[] }
  try {
    payload = (await request.json()) as { items?: CartLine[] }
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400)
  }

  const rawItems = Array.isArray(payload.items) ? payload.items : []
  if (rawItems.length === 0) {
    return json({ error: 'Your cart is empty.' }, 400)
  }

  // Validate every line against the server catalog and build trusted line items.
  const lineItems: Array<Record<string, unknown>> = []
  for (const raw of rawItems) {
    const id = typeof raw.id === 'string' ? raw.id : ''
    const quantity = Math.floor(Number(raw.quantity))
    const entry = getCatalogEntry(id)

    if (!entry) {
      return json({ error: `Unknown product: ${id || '(missing id)'}.` }, 400)
    }
    if (!entry.available) {
      return json({ error: `${entry.name} is sold out.` }, 409)
    }
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 20) {
      return json({ error: `Invalid quantity for ${entry.name}.` }, 400)
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

  // Resolve the public origin for success/cancel redirects.
  const origin = env.SITE_URL?.replace(/\/$/, '') || new URL(request.url).origin

  try {
    const session = await stripeRequest<{ id: string; url: string }>(
      env.STRIPE_SECRET_KEY,
      '/v1/checkout/sessions',
      {
        mode: 'payment',
        // NOTE: never set `payment_method_types` — omitting it enables dynamic
        // payment methods (cards, Apple Pay, Google Pay, …) configured in the
        // Stripe Dashboard for maximum conversion.
        line_items: lineItems,
        success_url: `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/shop/cart?canceled=1`,
        billing_address_collection: 'auto',
        shipping_address_collection: { allowed_countries: SHIPPING_COUNTRIES },
        // A single flat-rate shipping option for physical prints.
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              display_name: 'Standard shipping',
              fixed_amount: { amount: 500, currency: 'eur' },
              delivery_estimate: {
                minimum: { unit: 'business_day', value: 3 },
                maximum: { unit: 'business_day', value: 7 },
              },
            },
          },
        ],
        // Tag sessions from this flow so they can be compared in the Dashboard.
        integration_identifier: `od-complaints-web-${randomSuffix()}`,
        // Stripe Tax is intentionally NOT enabled here: turning on automatic_tax
        // without an active tax registration silently collects no tax. Enable it
        // in the Dashboard + here once registrations are in place.
      },
    )

    return json({ id: session.id, url: session.url })
  } catch (error) {
    if (error instanceof StripeError) {
      return json({ error: error.message }, error.status >= 400 && error.status < 500 ? 400 : 502)
    }
    return json({ error: 'Could not start checkout. Please try again.' }, 502)
  }
}
