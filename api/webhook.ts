// POST /api/webhook — Vercel Edge Function
//
// Receives Stripe webhook events, verifies their signature using the Web
// Crypto API (works on the Vercel Edge Runtime — no Node `crypto` needed),
// and on a successful checkout:
//   1. Fetches the paid line items from Stripe (not stored on the event by
//      default) so the emails below can list what was actually bought.
//   2. Emails YOU (the studio) an order notification via Resend.
//   3. Emails the CUSTOMER an order confirmation via Resend.
//
// Configure the endpoint in the Stripe Dashboard (or `stripe listen`) and set
// STRIPE_WEBHOOK_SECRET to the signing secret shown there. Email delivery
// reuses the same Resend setup as the booking form (RESEND_API_KEY,
// RESEND_FROM_EMAIL, BOOKING_NOTIFY_EMAIL) — see api/booking.ts for setup.

export const config = { runtime: 'edge' }

const STRIPE_API_BASE = 'https://api.stripe.com'
const STRIPE_API_VERSION = '2026-07-29.dahlia'
const DEFAULT_NOTIFY_EMAIL = 'od.complaints@gmail.com'
const DEFAULT_FROM_EMAIL = 'OD COMPLAINTS <onboarding@resend.dev>'

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

type LineItem = { description?: string; quantity?: number; amount_total?: number; currency?: string }

async function fetchLineItems(sessionId: string, secretKey: string): Promise<LineItem[]> {
  const response = await fetch(
    `${STRIPE_API_BASE}/v1/checkout/sessions/${encodeURIComponent(sessionId)}/line_items?limit=100`,
    { headers: { Authorization: `Bearer ${secretKey}`, 'Stripe-Version': STRIPE_API_VERSION } },
  )
  if (!response.ok) return []
  const body = (await response.json()) as { data?: LineItem[] }
  return body.data ?? []
}

function formatMoney(amountCents: number | undefined, currency: string | undefined): string {
  if (typeof amountCents !== 'number') return '—'
  return `${(amountCents / 100).toFixed(2)} ${(currency ?? 'eur').toUpperCase()}`
}

function formatAddress(details: Record<string, unknown> | undefined): string {
  if (!details) return '—'
  const name = typeof details.name === 'string' ? details.name : ''
  const address = details.address as Record<string, unknown> | undefined
  if (!address) return name || '—'
  const parts = [
    address.line1,
    address.line2,
    [address.postal_code, address.city].filter(Boolean).join(' '),
    address.country,
  ].filter((part): part is string => typeof part === 'string' && part.length > 0)
  return [name, ...parts].filter(Boolean).join('\n')
}

async function notifyEmail(apiKey: string, to: string, from: string, subject: string, text: string, html: string): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, text, html }),
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Resend request failed (${response.status}): ${body}`)
  }
}

async function handleCheckoutCompleted(session: Record<string, unknown>): Promise<void> {
  const sessionId = String(session.id ?? '')
  const customerDetails = session.customer_details as { email?: string; name?: string } | undefined
  const customerEmail = customerDetails?.email
  const amountTotal = session.amount_total as number | undefined
  const currency = session.currency as string | undefined
  const shippingDetails = session.shipping_details as Record<string, unknown> | undefined

  const resendKey = process.env.RESEND_API_KEY
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!resendKey) {
    console.log(`[stripe] checkout.session.completed ${sessionId} — RESEND_API_KEY not set, skipping emails.`)
    return
  }

  const lineItems = stripeSecretKey && sessionId ? await fetchLineItems(sessionId, stripeSecretKey) : []
  const itemLines = lineItems.length
    ? lineItems.map((item) => `  • ${item.quantity ?? 1}× ${item.description ?? 'Artikel'} — ${formatMoney(item.amount_total, item.currency ?? currency)}`).join('\n')
    : '  (Artikel konnten nicht geladen werden — siehe Stripe Dashboard)'
  const shippingAddress = formatAddress(shippingDetails)
  const total = formatMoney(amountTotal, currency)

  const adminSubject = `Neue Bestellung — ${total}`
  const adminText = [
    `📦 Neue Shop-Bestellung`,
    `Session: ${sessionId}`,
    `Kunde: ${customerDetails?.name || '—'} <${customerEmail || 'keine E-Mail'}>`,
    ``,
    `Artikel:`,
    itemLines,
    ``,
    `Gesamtbetrag: ${total}`,
    ``,
    `Lieferadresse:`,
    shippingAddress,
  ].join('\n')

  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL
  const adminTo = process.env.BOOKING_NOTIFY_EMAIL || DEFAULT_NOTIFY_EMAIL

  const tasks: Promise<unknown>[] = [
    notifyEmail(resendKey, adminTo, from, adminSubject, adminText, `<pre style="font-family:sans-serif;white-space:pre-wrap;">${adminText}</pre>`),
  ]

  if (customerEmail) {
    const customerSubject = 'Deine Bestellung bei OD COMPLAINTS'
    const customerText = [
      `Danke für deine Bestellung${customerDetails?.name ? `, ${customerDetails.name}` : ''}!`,
      ``,
      `Deine Bestellung:`,
      itemLines,
      ``,
      `Gesamtbetrag: ${total}`,
      ``,
      `Lieferadresse:`,
      shippingAddress,
      ``,
      `Wir versenden deine Bestellung in Kürze und melden uns bei Fragen.`,
      ``,
      `— OD COMPLAINTS`,
    ].join('\n')
    tasks.push(
      notifyEmail(
        resendKey,
        customerEmail,
        from,
        customerSubject,
        customerText,
        `<pre style="font-family:sans-serif;white-space:pre-wrap;">${customerText}</pre>`,
      ),
    )
  }

  await Promise.allSettled(tasks)
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
