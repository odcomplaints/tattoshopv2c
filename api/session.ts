// GET /api/session?id=cs_test_... — Vercel Edge Function
//
// Lets the success page confirm the real payment status of a Checkout Session
// instead of trusting the client. Returns a small, safe subset of the session.

import { stripeGet, StripeError } from './_stripe.js'
import { claimFileLabels, getWorkById, parseWorkIds } from '../src/data/claims.js'
import type { ClaimableWork } from '../src/data/claims.js'
import { handleClaimPaid } from './_claimFulfillment.js'
import type { SendMail } from './_claimFulfillment.js'

export const config = { runtime: 'edge' }

// Best-effort guard against repeat mails on page reloads when KV is not configured.
const fulfilledHere = new Set<string>()

const sendMail: SendMail = async (apiKey, to, from, subject, text, html, attachments = []) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, text, html, ...(attachments.length ? { attachments } : {}) }),
  })
  if (!response.ok) {
    throw new Error(`Resend request failed (${response.status}): ${await response.text().catch(() => '')}`)
  }
}

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
      id?: string
      created?: number
      status?: string
      payment_status?: string
      amount_total?: number
      currency?: string
      customer_details?: { email?: string }
      metadata?: Record<string, string>
    }>(secretKey, `/v1/checkout/sessions/${encodeURIComponent(id)}`)

    const claims = parseWorkIds(session.metadata?.work_ids)

    // Fallback if the Stripe webhook never arrived (e.g. not set up for the sandbox):
    // fulfil from here. handleClaimPaid is idempotent, so a working webhook is not doubled.
    if (claims.length > 0 && session.payment_status === 'paid' && !fulfilledHere.has(id)) {
      fulfilledHere.add(id)
      try {
        await handleClaimPaid(session as unknown as Record<string, unknown>, {
          resendKey: process.env.RESEND_API_KEY,
          from: process.env.RESEND_FROM_EMAIL || 'OD COMPLAINTS <onboarding@resend.dev>',
          adminTo: process.env.BOOKING_NOTIFY_EMAIL || 'od.complaints@gmail.com',
          siteOrigin: new URL(request.url).origin,
          send: sendMail,
        })
      } catch (error) {
        console.error(`[session] ${id} — claim fulfilment fallback failed:`, error)
      }
    }

    return json({
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      email: session.customer_details?.email ?? null,
      claims: claims.map((workId) => {
        const entry = getWorkById(workId)
        const claimable = entry && entry.claim ? (entry as ClaimableWork) : undefined
        return { workId, title: entry?.title ?? workId, files: claimable ? claimFileLabels(claimable) : ['File'] }
      }),
    })
  } catch (error) {
    if (error instanceof StripeError) {
      return json({ error: error.message }, error.status === 404 ? 404 : 400)
    }
    return json({ error: 'Could not load session.' }, 502)
  }
}
