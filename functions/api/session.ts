// GET /api/session?id=cs_test_...
//
// Lets the success page confirm the real payment status of a Checkout Session
// instead of trusting the client. Returns a small, safe subset of the session.

import { stripeGet, StripeError } from '../_stripe'

interface Env {
  STRIPE_SECRET_KEY: string
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestGet = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context

  if (!env.STRIPE_SECRET_KEY) {
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
    }>(env.STRIPE_SECRET_KEY, `/v1/checkout/sessions/${encodeURIComponent(id)}`)

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
