// POST /api/webhook — Cloudflare Pages Function
//
// Receives Stripe webhook events, verifies their signature using the Web
// Crypto API (works on the Cloudflare edge runtime — no Node `crypto` needed),
// and on a successful checkout:
//   1. Fetches the paid line items from Stripe (not stored on the event by
//      default) so the emails below can list what was actually bought.
//   2. Emails YOU (the studio) an order notification via Resend.
//   3. Emails the CUSTOMER an order confirmation via Resend.
//
// Configure the endpoint in the Stripe Dashboard (or `stripe listen`) and set
// STRIPE_WEBHOOK_SECRET to the signing secret shown there. Email delivery
// reuses the same Resend setup as the booking form (RESEND_API_KEY,
// RESEND_FROM_EMAIL, BOOKING_NOTIFY_EMAIL) — see functions/api/booking.ts.

interface Env {
  STRIPE_WEBHOOK_SECRET: string
  STRIPE_SECRET_KEY?: string
  RESEND_API_KEY?: string
  RESEND_FROM_EMAIL?: string
  BOOKING_NOTIFY_EMAIL?: string
}

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

// Shared branded HTML wrapper for all outgoing order emails. Uses inline
// styles and no external images so it renders consistently across email
// clients (Gmail strips <style> blocks and blocks remote images by default).
function renderOrderEmailHtml(options: {
  eyebrow: string
  heading: string
  intro: string
  itemRows: Array<{ label: string; amount: string }>
  total: string
  shippingAddress: string
  footerNote: string
}): string {
  const { eyebrow, heading, intro, itemRows, total, shippingAddress, footerNote } = options
  const rows = itemRows
    .map(
      (row) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#e5e5e5;font-size:13px;">${row.label}</td>
          <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#e5e5e5;font-size:13px;text-align:right;white-space:nowrap;">${row.amount}</td>
        </tr>`,
    )
    .join('')

  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#0a0a0a;border-radius:2px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;background-color:#000000;">
                <p style="margin:0;color:#ffffff;font-size:14px;letter-spacing:4px;text-transform:uppercase;font-weight:600;">OD COMPLAINTS</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 6px;color:#FF3939;font-size:11px;letter-spacing:2px;text-transform:uppercase;">${eyebrow}</p>
                <h1 style="margin:0 0 16px;color:#f5f5f5;font-size:22px;letter-spacing:1px;text-transform:uppercase;font-weight:500;">${heading}</h1>
                <p style="margin:0 0 24px;color:#b5b5b5;font-size:13px;line-height:1.6;">${intro}</p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                  ${rows}
                  <tr>
                    <td style="padding:14px 0 0;color:#ffffff;font-size:13px;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Gesamt</td>
                    <td style="padding:14px 0 0;color:#ffffff;font-size:13px;text-align:right;font-weight:600;">${total}</td>
                  </tr>
                </table>

                <p style="margin:24px 0 6px;color:#7a7a7a;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Lieferadresse</p>
                <p style="margin:0;color:#d5d5d5;font-size:13px;line-height:1.6;white-space:pre-line;">${shippingAddress}</p>

                <p style="margin:28px 0 0;color:#7a7a7a;font-size:12px;line-height:1.6;">${footerNote}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#000000;">
                <p style="margin:0;color:#5a5a5a;font-size:10px;letter-spacing:1px;text-transform:uppercase;">OD COMPLAINTS · odcomplaints.com</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
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

async function handleCheckoutCompleted(session: Record<string, unknown>, env: Env): Promise<void> {
  const sessionId = String(session.id ?? '')
  const customerDetails = session.customer_details as { email?: string; name?: string } | undefined
  const customerEmail = customerDetails?.email
  const amountTotal = session.amount_total as number | undefined
  const currency = session.currency as string | undefined
  const shippingDetails = session.shipping_details as Record<string, unknown> | undefined

  if (!env.RESEND_API_KEY) {
    console.log(`[stripe] checkout.session.completed ${sessionId} — RESEND_API_KEY not set, skipping emails.`)
    return
  }

  const lineItems = env.STRIPE_SECRET_KEY && sessionId ? await fetchLineItems(sessionId, env.STRIPE_SECRET_KEY) : []
  const itemLines = lineItems.length
    ? lineItems.map((item) => `  • ${item.quantity ?? 1}× ${item.description ?? 'Artikel'} — ${formatMoney(item.amount_total, item.currency ?? currency)}`).join('\n')
    : '  (Artikel konnten nicht geladen werden — siehe Stripe Dashboard)'
  const itemRows = lineItems.length
    ? lineItems.map((item) => ({
        label: `${item.quantity ?? 1}× ${item.description ?? 'Artikel'}`,
        amount: formatMoney(item.amount_total, item.currency ?? currency),
      }))
    : [{ label: 'Artikel konnten nicht geladen werden', amount: '—' }]
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
  const adminHtml = renderOrderEmailHtml({
    eyebrow: 'Neue Bestellung',
    heading: total,
    intro: `Kunde: ${customerDetails?.name || '—'} &lt;${customerEmail || 'keine E-Mail'}&gt; · Session ${sessionId}`,
    itemRows,
    total,
    shippingAddress,
    footerNote: 'Diese Benachrichtigung wurde automatisch anhand des Stripe-Webhooks erstellt.',
  })

  const from = env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL
  const adminTo = env.BOOKING_NOTIFY_EMAIL || DEFAULT_NOTIFY_EMAIL

  const tasks: Promise<unknown>[] = [
    notifyEmail(env.RESEND_API_KEY, adminTo, from, adminSubject, adminText, adminHtml),
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
    const customerHtml = renderOrderEmailHtml({
      eyebrow: 'Bestellbestätigung',
      heading: `Danke${customerDetails?.name ? `, ${customerDetails.name}` : ''}!`,
      intro: 'Wir haben deine Bestellung erhalten und bereiten sie für den Versand vor.',
      itemRows,
      total,
      shippingAddress,
      footerNote: 'Wir versenden deine Bestellung in Kürze und melden uns bei Fragen.',
    })
    tasks.push(notifyEmail(env.RESEND_API_KEY, customerEmail, from, customerSubject, customerText, customerHtml))
  }

  await Promise.allSettled(tasks)
}

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context

  if (!env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Webhook secret not configured', { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  // The raw body is required — do not parse before verifying.
  const payload = await request.text()

  const valid = await verifyStripeSignature(payload, signature, env.STRIPE_WEBHOOK_SECRET)
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
      await handleCheckoutCompleted(event.data?.object ?? {}, env)
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
