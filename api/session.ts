// GET /api/session?id=cs_test_... — Vercel Edge Function
//
// Lets the success page confirm the real payment status of a Checkout Session
// instead of trusting the client. Returns a small, safe subset of the session.

import { stripeGet, StripeError } from './_stripe'

export const config = { runtime: 'edge' }

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed.' }, 405)
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return json({ error: 'Payment is not configured.' }, 500)
  }

  const id = new URL(request.url).searchParams.get('id')
  if (!id || !id.startsWith('cs_')) {
    return json({ error: 'Missing or invalid session id.' }, 400)
  }

  try {
    const session = await stripeGet<{
      status?: string
      payment_status?: string
      amount_total?: number
      currency?: string
      customer_details?: { email?: string }
    }>(secretKey, `/v1/checkout/sessions/${encodeURIComponent(id)}`)

    return json({
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      email: session.customer_details?.email ?? null,
    })
  } catch (error) {
    if (error instanceof StripeError) {
      return json({ error: error.message }, error.status === 404 ? 404 : 400)
    }
    return json({ error: 'Could not load session.' }, 502)
  }
}
