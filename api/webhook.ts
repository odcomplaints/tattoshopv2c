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

import { getCatalogEntry } from '../src/data/catalog.js'
import { recordPurchases } from './_soldout.js'
import { getShippingDetails, isPodLineItem, sendPodOrderEmail } from './_podOrder.js'
import type { PaidLineItem } from './_podOrder.js'
import { getPodProduct, isPrintOnDemand } from '../src/data/printOnDemand.js'
import { bookingDocumentFilenames } from '../src/data/bookingDocuments.js'

const STRIPE_API_BASE = 'https://api.stripe.com'
const STRIPE_API_VERSION = '2026-07-29.dahlia'
const DEFAULT_NOTIFY_EMAIL = 'od.complaints@gmail.com'
const DEFAULT_FROM_EMAIL = 'OD COMPLAINTS <onboarding@resend.dev>'
// Publicly hosted logo used in the email header (email clients need an
// absolute, publicly reachable URL — they can't use bundled/local assets).
const LOGO_URL = 'https://www.odcomplaints.com/assets/email/logo.png'

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

type LineItem = PaidLineItem

async function fetchLineItems(sessionId: string, secretKey: string): Promise<LineItem[]> {
  const response = await fetch(
    `${STRIPE_API_BASE}/v1/checkout/sessions/${encodeURIComponent(sessionId)}/line_items?limit=100&expand[]=data.price.product`,
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
                <img src="${LOGO_URL}" alt="OD COMPLAINTS" width="140" style="display:block;border:0;outline:none;max-width:140px;height:auto;" />
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

type EmailAttachment = { filename: string; content: string }

async function notifyEmail(
  apiKey: string,
  to: string,
  from: string,
  subject: string,
  text: string,
  html: string,
  attachments: EmailAttachment[] = [],
): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, text, html, ...(attachments.length ? { attachments } : {}) }),
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Resend request failed (${response.status}): ${body}`)
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

type BookingDetails = {
  name: string
  email: string
  phone: string
  date: string
  bodyPart: string
  size: string
  motif: string
  checkoutType: string
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  }
  return btoa(binary)
}

async function loadBookingDocuments(siteOrigin: string): Promise<EmailAttachment[]> {
  const attachments: EmailAttachment[] = []
  for (const filename of bookingDocumentFilenames) {
    const response = await fetch(new URL(`/PDFs/${filename}`, siteOrigin))
    if (!response.ok) throw new Error(`Could not load booking document ${filename} (${response.status}).`)
    const bytes = new Uint8Array(await response.arrayBuffer())
    if (bytes.length === 0 || bytes[0] !== 0x25 || bytes[1] !== 0x50 || bytes[2] !== 0x44 || bytes[3] !== 0x46) {
      throw new Error(`Booking document ${filename} is not a valid PDF.`)
    }
    attachments.push({ filename, content: encodeBase64(bytes) })
  }
  return attachments
}

function formatDateDe(key: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  return match ? `${match[3]}.${match[2]}.${match[1]}` : key || '—'
}

function bookingDetailRows(b: BookingDetails, includeContact: boolean): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#7a7a7a;font-size:11px;letter-spacing:1px;text-transform:uppercase;">${label}</td><td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#e5e5e5;font-size:13px;text-align:right;">${escapeHtml(value || '—')}</td></tr>`
  return [
    includeContact ? row('Name', b.name) : '',
    includeContact ? row('E-Mail', b.email) : '',
    includeContact ? row('Telefon', b.phone) : '',
    row('Wunschtermin', formatDateDe(b.date)),
    row('Körperstelle', b.bodyPart),
    row('Größe', b.size),
  ].join('')
}

// Booking emails (customer confirmation + studio notification) share one
// branded layout. All customer-provided values are HTML-escaped.
function renderBookingEmailHtml(options: {
  eyebrow: string
  heading: string
  intro: string
  booking: BookingDetails
  includeContact: boolean
  extraHtml: string
}): string {
  const { eyebrow, heading, intro, booking, includeContact, extraHtml } = options
  const motif = booking.motif
    ? `<div style="margin:20px 0;padding:16px;background-color:#1a1a1a;border-left:3px solid #FF3939;">
                  <p style="margin:0 0 6px;color:#7a7a7a;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Motiv</p>
                  <p style="margin:0;color:#d5d5d5;font-size:13px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(booking.motif)}</p>
                </div>`
    : ''
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
                <img src="${LOGO_URL}" alt="OD COMPLAINTS" width="140" style="display:block;border:0;outline:none;max-width:140px;height:auto;" />
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 6px;color:#FF3939;font-size:11px;letter-spacing:2px;text-transform:uppercase;">${eyebrow}</p>
                <h1 style="margin:0 0 16px;color:#f5f5f5;font-size:22px;letter-spacing:1px;text-transform:uppercase;font-weight:500;">${heading}</h1>
                <p style="margin:0 0 24px;color:#b5b5b5;font-size:13px;line-height:1.6;">${intro}</p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                  ${bookingDetailRows(booking, includeContact)}
                </table>

                ${motif}

                ${extraHtml}
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

const CUSTOMER_NEXT_STEPS_HTML = `
                <p style="margin:28px 0 12px;color:#f5f5f5;font-size:13px;font-weight:600;">Nächste Schritte</p>
                <ol style="margin:0;color:#b5b5b5;font-size:13px;line-height:1.8;padding-left:20px;">
                  <li>Wir melden uns innerhalb von 48h bei dir zur Bestätigung des Termins.</li>
                  <li>Die Anzahlung wird mit dem Endpreis verrechnet.</li>
                </ol>

                <p style="margin:28px 0 6px;color:#7a7a7a;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Kontakt &amp; Fragen</p>
                <p style="margin:0;color:#d5d5d5;font-size:13px;line-height:1.6;">
                  <strong>E-Mail:</strong> od.complaints@gmail.com<br/>
                  <strong>Telefon:</strong> +49 176 81072268<br/>
                  <strong>Instagram:</strong> @od.complaints
                </p>

                <p style="margin:28px 0 0;color:#7a7a7a;font-size:12px;line-height:1.6;">Falls du Fragen hast oder deinen Termin ändern möchtest, schreib uns gerne eine E-Mail.</p>`

async function handleBookingDepositPaid(
  session: Record<string, unknown>,
  resendKey: string | undefined,
  siteOrigin: string,
): Promise<void> {
  const sessionId = String(session.id ?? '')
  const metadata = (session.metadata ?? {}) as Record<string, string>
  const customerDetails = session.customer_details as { email?: string; name?: string } | undefined

  const booking: BookingDetails = {
    name: metadata.name || customerDetails?.name || '',
    email: customerDetails?.email || metadata.email || '',
    phone: metadata.phone || '',
    date: metadata.date || '',
    bodyPart: metadata.body_part || '',
    size: metadata.size || '',
    motif: metadata.motif || '',
    checkoutType: metadata.checkout_type || 'full',
  }

  // Delayed payment methods (e.g. SEPA) complete the session before the money
  // arrives; those are confirmed later via checkout.session.async_payment_succeeded.
  if (session.payment_status !== 'paid') {
    console.log(`[stripe] ${sessionId} — booking deposit not paid yet (${String(session.payment_status)}), waiting.`)
    return
  }

  if (!resendKey) {
    console.log(`[stripe] checkout.session.completed ${sessionId} — booking deposit, RESEND_API_KEY not set, skipping emails.`)
    return
  }

  const deposit = formatMoney(session.amount_total as number | undefined, session.currency as string | undefined)
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL
  const adminTo = process.env.BOOKING_NOTIFY_EMAIL || DEFAULT_NOTIFY_EMAIL
  const dateDe = formatDateDe(booking.date)
  const customerAttachments = booking.email ? await loadBookingDocuments(siteOrigin) : []

  const detailsText = [
    `Wunschtermin: ${dateDe}`,
    `Körperstelle: ${booking.bodyPart || '—'}`,
    `Größe: ${booking.size || '—'}`,
    `Motiv: ${booking.motif || '—'}`,
  ].join('\n')

  const tasks: Array<Promise<unknown>> = []

  // Studio: the deposit for a request actually arrived.
  tasks.push(
    notifyEmail(
      resendKey,
      adminTo,
      from,
      `Anzahlung erhalten (${deposit}) — ${booking.name || booking.email} · ${dateDe}`,
      [
        `Anzahlung eingegangen: ${deposit}`,
        `Session: ${sessionId}`,
        `Name: ${booking.name || '—'}`,
        `E-Mail: ${booking.email || '—'}`,
        `Telefon: ${booking.phone || '—'}`,
        detailsText,
      ].join('\n'),
      renderBookingEmailHtml({
        eyebrow: 'Anzahlung eingegangen',
        heading: deposit,
        intro: `Die Anzahlung für folgende Anfrage wurde bezahlt (${booking.checkoutType === 'express' ? 'Express' : 'Formular'}) · Session ${escapeHtml(sessionId)}`,
        booking,
        includeContact: true,
        extraHtml:
          '<p style="margin:28px 0 0;color:#7a7a7a;font-size:12px;line-height:1.6;">Bitte melde dich innerhalb von 48h beim Kunden zur Terminbestätigung.</p>',
      }),
    ),
  )

  // Customer: confirmation of the reserved slot.
  if (booking.email) {
    tasks.push(
      notifyEmail(
        resendKey,
        booking.email,
        from,
        'Dein Tattoo-Termin ist reserviert · OD COMPLAINTS',
        [
          `Danke${booking.name ? `, ${booking.name}` : ''}! Wir haben deine Anzahlung von ${deposit} erhalten.`,
          ``,
          detailsText,
          ``,
          `Wir melden uns innerhalb von 48h bei dir zur Bestätigung des Termins.`,
          `Die Anzahlung wird mit dem Endpreis verrechnet.`,
          ``,
          `— OD COMPLAINTS`,
        ].join('\n'),
        renderBookingEmailHtml({
          eyebrow: 'Buchungsbestätigung',
          heading: 'Dein Termin ist reserviert',
          intro: `Danke${booking.name ? `, ${escapeHtml(booking.name)}` : ''}! Wir haben deine Anzahlung von ${deposit} erhalten.`,
          booking,
          includeContact: false,
          extraHtml: CUSTOMER_NEXT_STEPS_HTML,
        }),
        customerAttachments,
      ),
    )
  }

  const results = await Promise.allSettled(tasks)
  for (const result of results) {
    if (result.status === 'rejected') console.error(`[stripe] booking email failed: ${result.reason}`)
  }
  const sent = results.filter((r) => r.status === 'fulfilled').length
  console.log(`[stripe] checkout.session.completed ${sessionId} — booking deposit, ${sent}/${results.length} emails sent.`)
}

async function handleCheckoutCompleted(session: Record<string, unknown>, siteOrigin: string): Promise<void> {
  const sessionId = String(session.id ?? '')
  const customerDetails = session.customer_details as { email?: string; name?: string } | undefined
  const customerEmail = customerDetails?.email
  const amountTotal = session.amount_total as number | undefined
  const currency = session.currency as string | undefined
  const shippingDetails = getShippingDetails(session) as Record<string, unknown> | undefined

  const resendKey = process.env.RESEND_API_KEY
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  // Booking deposits are tagged via session metadata in api/checkout.ts.
  const metadata = session.metadata as Record<string, string> | undefined
  if (metadata?.type === 'booking-deposit') {
    await handleBookingDepositPaid(session, resendKey, siteOrigin)
    return
  }

  const lineItems = stripeSecretKey && sessionId ? await fetchLineItems(sessionId, stripeSecretKey) : []

  // ========== SHOP ORDER CHECKOUT ==========
  // Auto-mark purchased items as sold-out once their stock is exhausted.
  // Runs independently of email delivery so it still happens even if Resend
  // isn't configured.
  const purchases = lineItems
    .map((item) => {
      const productId = item.price?.product?.metadata?.product_id
      const quantity = item.quantity ?? 1
      const entry = productId ? getCatalogEntry(productId) : undefined
      // POD items are printed to order — never count them against stock.
      if (!productId || !entry || isPrintOnDemand(productId)) return null
      return { id: productId, quantity, initialStock: entry.stock }
    })
    .filter((entry): entry is { id: string; quantity: number; initialStock: number } => entry !== null)
  if (purchases.length > 0) {
    await recordPurchases(purchases).catch((error) => {
      console.error('[soldout] Failed to record purchases:', error)
    })
  }

  const hasPodItems = lineItems.some(isPodLineItem) || metadata?.contains_pod === 'true'

  if (!resendKey) {
    const log = hasPodItems ? console.error : console.log
    log(`[stripe] checkout.session.completed ${sessionId} — RESEND_API_KEY not set, skipping emails${hasPodItems ? ' (incl. POD production order!)' : ''}.`)
    return
  }

  // Line item names come from the server catalog (+ a validated size), not from the customer.
  const itemLabel = (item: LineItem) =>
    `${item.quantity ?? 1}× ${item.description ?? 'Artikel'}${isPodLineItem(item) ? ' (Print on Demand)' : ''}`
  const itemLines = lineItems.length
    ? lineItems.map((item) => `  • ${itemLabel(item)} — ${formatMoney(item.amount_total, item.currency ?? currency)}`).join('\n')
    : '  (Artikel konnten nicht geladen werden — siehe Stripe Dashboard)'
  const itemRows = lineItems.length
    ? lineItems.map((item) => ({
        label: itemLabel(item),
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

  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL
  const adminTo = process.env.BOOKING_NOTIFY_EMAIL || DEFAULT_NOTIFY_EMAIL

  const tasks: Promise<unknown>[] = [
    notifyEmail(resendKey, adminTo, from, adminSubject, adminText, adminHtml),
  ]

  // Print-on-Demand: separate, detailed production order — only once the
  // money has actually arrived (delayed methods like SEPA are handled via
  // checkout.session.async_payment_succeeded).
  if (hasPodItems) {
    if (session.payment_status === 'paid') {
      tasks.push(sendPodOrderEmail({ session, lineItems, resendKey, from, to: podOrderRecipient() }))
    } else {
      console.log(`[stripe] ${sessionId} — POD order not paid yet (${String(session.payment_status)}), waiting for async payment.`)
    }
  }

  const podTimes = [
    ...new Set(
      lineItems
        .filter(isPodLineItem)
        .map((item) => getPodProduct(item.price?.product?.metadata?.product_id ?? '')?.productionTime)
        .filter(Boolean),
    ),
  ]
  const podCustomerNote = hasPodItems
    ? `Print-on-Demand-Artikel werden erst jetzt für dich gedruckt und anschließend versendet (ca. ${podTimes.join(' / ') || '5–10 Werktage'}). Du bekommst eine Versandbestätigung mit Tracking-Nummer.`
    : ''

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
      podCustomerNote || `Wir versenden deine Bestellung in Kürze und melden uns bei Fragen.`,
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
      footerNote: podCustomerNote || 'Wir versenden deine Bestellung in Kürze und melden uns bei Fragen.',
    })
    tasks.push(notifyEmail(resendKey, customerEmail, from, customerSubject, customerText, customerHtml))
  }

  const results = await Promise.allSettled(tasks)
  for (const result of results) {
    if (result.status === 'rejected') console.error(`[stripe] ${sessionId} — order email failed: ${result.reason}`)
  }
}

function podOrderRecipient(): string {
  return process.env.POD_ORDER_EMAIL || process.env.BOOKING_NOTIFY_EMAIL || DEFAULT_NOTIFY_EMAIL
}

// Delayed payment (e.g. SEPA) for a shop order succeeded: now send the POD
// production order that was held back in handleCheckoutCompleted.
async function handleShopAsyncPaymentSucceeded(session: Record<string, unknown>): Promise<void> {
  const sessionId = String(session.id ?? '')
  const metadata = session.metadata as Record<string, string> | undefined
  if (metadata?.contains_pod !== 'true') return

  const resendKey = process.env.RESEND_API_KEY
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!resendKey || !stripeSecretKey) {
    console.error(`[stripe] ${sessionId} — POD order paid but RESEND_API_KEY/STRIPE_SECRET_KEY missing, no production email sent!`)
    return
  }
  const lineItems = await fetchLineItems(sessionId, stripeSecretKey)
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL
  await sendPodOrderEmail({ session, lineItems, resendKey, from, to: podOrderRecipient() }).catch((error) => {
    console.error(`[stripe] ${sessionId} — POD order email failed: ${error}`)
  })
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
      await handleCheckoutCompleted(event.data?.object ?? {}, new URL(request.url).origin)
      break
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data?.object ?? {}
      const metadata = session.metadata as Record<string, string> | undefined
      if (metadata?.type === 'booking-deposit') {
        await handleBookingDepositPaid(session, process.env.RESEND_API_KEY, new URL(request.url).origin)
      } else {
        await handleShopAsyncPaymentSucceeded(session)
      }
      break
    }
    default:
      // Unhandled event types are acknowledged so Stripe stops retrying.
      break
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
