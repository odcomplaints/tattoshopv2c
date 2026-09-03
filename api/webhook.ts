// POST /api/webhook — Vercel Edge Function
//
// Receives Stripe webhook events and verifies their signature using the Web
// Crypto API (works on the Vercel Edge Runtime — no Node `crypto` needed).
//
// Configure the endpoint in the Stripe Dashboard (or `stripe listen`) and set the
// signing secret as STRIPE_WEBHOOK_SECRET. Right now the handler just logs the
// paid order; extend `handleCheckoutCompleted` to email/fulfil as needed.

export const config = { runtime: 'edge' }

// Tolerate up to 5 minutes of clock skew between Stripe and the edge.
const TOLERANCE_SECONDS = 60 * 5

const encoder = new TextEncoder()

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let hex = ''
  for (const b of bytes) hex += b.toString(16).padStart(2, '0')
  return hex
}

// Constant-time string comparison to avoid timing leaks on the signature.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

async function verifyStripeSignature(payload: string, header: string, secret: string): Promise<boolean> {
  // Header format: "t=1699999999,v1=abc...,v1=def..."
  const parts = header.split(',').map((p) => p.trim())
  const timestamp = parts.find((p) => p.startsWith('t='))?.slice(2)
  const signatures = parts.filter((p) => p.startsWith('v1=')).map((p) => p.slice(3))
  if (!timestamp || signatures.length === 0) return false

  const age = Math.floor(Date.now() / 1000) - Number(timestamp)
  if (!Number.isFinite(age) || Math.abs(age) > TOLERANCE_SECONDS) return false

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${payload}`))
  const expected = toHex(signed)

  return signatures.some((sig) => timingSafeEqual(sig, expected))
}

async function handleCheckoutCompleted(session: Record<string, unknown>): Promise<void> {
  // No database/email service is wired up in this project, so we just log.
  // Replace this with order persistence, an email via your provider, etc.
  const id = session.id
  const email = (session.customer_details as { email?: string } | undefined)?.email
  const amount = session.amount_total
  const currency = session.currency
  console.log(`[stripe] checkout.session.completed ${id} — ${amount} ${currency} — ${email ?? 'no email'}`)
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return new Response('Webhook secret not configured', { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  // The raw body is required — do not parse before verifying.
  const payload = await request.text()

  const valid = await verifyStripeSignature(payload, signature, webhookSecret)
  if (!valid) {
    return new Response('Invalid signature', { status: 400 })
  }

  let event: { type?: string; data?: { object?: Record<string, unknown> } }
  try {
    event = JSON.parse(payload)
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data?.object ?? {})
      break
    default:
      // Unhandled event types are acknowledged so Stripe stops retrying.
      break
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
