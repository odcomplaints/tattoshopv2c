// Print-on-Demand production order email.
//
// Called by api/webhook.ts once a shop checkout containing POD items is PAID.
// Sends one detailed email to the studio with everything needed to place the
// print job manually at the POD provider: items, sizes, print specs, the full
// shipping address (as a block and as single fields for copy & paste), and the
// payment details.
//
// Recipient: POD_ORDER_EMAIL, falling back to BOOKING_NOTIFY_EMAIL.

import { getPodProduct } from '../src/data/printOnDemand.js'
import type { PodProduct } from '../src/data/printOnDemand.js'

export type PaidLineItem = {
  description?: string
  quantity?: number
  amount_total?: number
  currency?: string
  price?: { unit_amount?: number; product?: { name?: string; metadata?: Record<string, string> } }
}

type Address = {
  line1?: string | null
  line2?: string | null
  postal_code?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
}

type ShippingDetails = { name?: string | null; address?: Address | null }

type PodLine = {
  name: string
  size: string
  quantity: number
  amountTotal: number | undefined
  unitAmount: number | undefined
  pod: PodProduct | undefined
  productId: string
}

const LOGO_URL = 'https://www.odcomplaints.com/assets/email/logo.png'

export function isPodLineItem(item: PaidLineItem): boolean {
  return item.price?.product?.metadata?.print_on_demand === 'true'
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function money(amountCents: number | undefined | null, currency: string | undefined): string {
  if (typeof amountCents !== 'number') return '—'
  return `${(amountCents / 100).toFixed(2).replace('.', ',')} ${(currency ?? 'eur').toUpperCase()}`
}

/**
 * Newer Stripe API versions moved the shipping address to
 * `collected_information.shipping_details`; older ones use `shipping_details`.
 */
export function getShippingDetails(session: Record<string, unknown>): ShippingDetails | undefined {
  const collected = session.collected_information as { shipping_details?: ShippingDetails } | undefined
  return collected?.shipping_details ?? (session.shipping_details as ShippingDetails | undefined) ?? undefined
}

function toPodLines(lineItems: PaidLineItem[]): PodLine[] {
  return lineItems.filter(isPodLineItem).map((item) => {
    const metadata = item.price?.product?.metadata ?? {}
    const productId = metadata.product_id ?? ''
    return {
      name: item.description ?? item.price?.product?.name ?? 'Artikel',
      size: metadata.size || '—',
      quantity: item.quantity ?? 1,
      amountTotal: item.amount_total,
      unitAmount: item.price?.unit_amount,
      pod: getPodProduct(productId),
      productId,
    }
  })
}

function formatOrderDate(unixSeconds: unknown): string {
  const date = typeof unixSeconds === 'number' ? new Date(unixSeconds * 1000) : new Date()
  return date.toLocaleString('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'medium', timeStyle: 'short' })
}

export async function sendPodOrderEmail(options: {
  session: Record<string, unknown>
  lineItems: PaidLineItem[]
  resendKey: string
  from: string
  to: string
}): Promise<void> {
  const { session, lineItems, resendKey, from, to } = options
  const podLines = toPodLines(lineItems)
  if (podLines.length === 0) return

  const sessionId = String(session.id ?? '')
  // Short, human-friendly reference to quote at the provider / in support mails.
  const orderRef = sessionId.slice(-8).toUpperCase() || '—'
  const currency = session.currency as string | undefined
  const customer = (session.customer_details ?? {}) as { name?: string | null; email?: string | null; phone?: string | null }
  const shipping = getShippingDetails(session)
  const address = shipping?.address ?? {}
  const recipientName = shipping?.name || customer.name || ''
  const totalDetails = (session.total_details ?? {}) as { amount_shipping?: number; amount_tax?: number; amount_discount?: number }
  const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : ''
  const dashboardBase = session.livemode ? 'https://dashboard.stripe.com' : 'https://dashboard.stripe.com/test'
  const dashboardUrl = paymentIntent
    ? `${dashboardBase}/payments/${paymentIntent}`
    : `${dashboardBase}/checkout/sessions/${sessionId}`
  const orderDate = formatOrderDate(session.created)
  const otherItems = lineItems.filter((item) => !isPodLineItem(item))
  const totalPieces = podLines.reduce((sum, line) => sum + line.quantity, 0)

  const addressFields: Array<[string, string]> = [
    ['Name', recipientName],
    ['Straße & Nr.', address.line1 ?? ''],
    ['Adresszusatz', address.line2 ?? ''],
    ['PLZ', address.postal_code ?? ''],
    ['Ort', address.city ?? ''],
    ['Bundesland/Region', address.state ?? ''],
    ['Land', address.country ?? ''],
    ['Telefon', customer.phone ?? ''],
    ['E-Mail', customer.email ?? ''],
  ]

  const paymentFields: Array<[string, string]> = [
    ['Zwischensumme', money(session.amount_subtotal as number | undefined, currency)],
    ['Versand (bezahlt)', money(totalDetails.amount_shipping, currency)],
    ...(totalDetails.amount_discount ? [['Rabatt', `−${money(totalDetails.amount_discount, currency)}`] as [string, string]] : []),
    ['Gesamt bezahlt', money(session.amount_total as number | undefined, currency)],
    ['Zahlungsstatus', String(session.payment_status ?? '—')],
    ['Bestelldatum', orderDate],
    ['Stripe Session', sessionId],
    ['Payment Intent', paymentIntent || '—'],
  ]

  // ── Plain-text version ────────────────────────────────────────────────
  const text = [
    `PRINT-ON-DEMAND-AUFTRAG #${orderRef}`,
    `Bestellt am ${orderDate} · ${totalPieces} Stück zu drucken`,
    ``,
    `=== ZU DRUCKEN ===`,
    ...podLines.flatMap((line, index) => [
      `${index + 1}) ${line.quantity}× ${line.name}`,
      `   Größe:        ${line.size}`,
      `   Farbe:        ${line.pod?.color ?? '—'}`,
      `   Anbieter:     ${line.pod?.provider ?? '—'}`,
      `   Blank:        ${line.pod?.blank ?? '—'}`,
      `   Platzierung:  ${line.pod?.placement ?? '—'}`,
      `   Druckdatei:   ${line.pod?.printFile ?? '—'}`,
      `   Produkt-ID:   ${line.productId || '—'}`,
      `   VK bezahlt:   ${money(line.amountTotal, currency)} (${money(line.unitAmount, currency)} / Stück)`,
      ``,
    ]),
    `=== LIEFERADRESSE (an Kunden direkt) ===`,
    ...addressFields.map(([label, value]) => `${label.padEnd(18)} ${value || '—'}`),
    ``,
    `=== ZAHLUNG ===`,
    ...paymentFields.map(([label, value]) => `${label.padEnd(18)} ${value}`),
    `Stripe Dashboard:  ${dashboardUrl}`,
    ...(otherItems.length
      ? [
          ``,
          `=== WEITERE ARTIKEL IN DIESER BESTELLUNG (kein POD – selbst versenden) ===`,
          ...otherItems.map((item) => `  • ${item.quantity ?? 1}× ${item.description ?? 'Artikel'}`),
        ]
      : []),
    ``,
    `=== TO-DO ===`,
    `[ ] Auftrag beim POD-Anbieter anlegen (Größe, Farbe, Druckdatei prüfen)`,
    `[ ] Lieferadresse 1:1 übernehmen, Referenz #${orderRef} angeben`,
    `[ ] Tracking-Nummer per Admin-Panel an den Kunden senden`,
  ].join('\n')

  // ── HTML version ──────────────────────────────────────────────────────
  const label = 'padding:6px 0;color:#7a7a7a;font-size:11px;letter-spacing:1px;text-transform:uppercase;vertical-align:top;width:40%;'
  const value = 'padding:6px 0;color:#e5e5e5;font-size:13px;text-align:right;word-break:break-word;'
  const fieldRows = (fields: Array<[string, string]>) =>
    fields
      .map(([l, v]) => `<tr><td style="${label}">${escapeHtml(l)}</td><td style="${value}">${escapeHtml(v || '—')}</td></tr>`)
      .join('')
  const sectionTitle = (title: string) =>
    `<p style="margin:28px 0 8px;color:#FF3939;font-size:11px;letter-spacing:2px;text-transform:uppercase;">${title}</p>`

  const itemBlocks = podLines
    .map(
      (line, index) => `
        <div style="margin:0 0 12px;padding:16px;background-color:#1a1a1a;border-left:3px solid #FF3939;">
          <p style="margin:0 0 10px;color:#f5f5f5;font-size:15px;font-weight:600;">${index + 1}) ${line.quantity}× ${escapeHtml(line.name)}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${fieldRows([
              ['Größe', line.size],
              ['Menge', String(line.quantity)],
              ['Farbe', line.pod?.color ?? '—'],
              ['Anbieter', line.pod?.provider ?? '—'],
              ['Blank', line.pod?.blank ?? '—'],
              ['Platzierung', line.pod?.placement ?? '—'],
              ['Druckdatei', line.pod?.printFile ?? '—'],
              ['Produkt-ID', line.productId || '—'],
              ['VK bezahlt', `${money(line.amountTotal, currency)} (${money(line.unitAmount, currency)} / Stück)`],
            ])}
          </table>
        </div>`,
    )
    .join('')

  const addressBlock = [
    recipientName,
    address.line1,
    address.line2,
    [address.postal_code, address.city].filter(Boolean).join(' '),
    address.state,
    address.country,
  ]
    .filter((part): part is string => typeof part === 'string' && part.length > 0)
    .map(escapeHtml)
    .join('<br/>')

  const otherItemsHtml = otherItems.length
    ? `${sectionTitle('Weitere Artikel (kein POD – selbst versenden)')}
       <ul style="margin:0;padding-left:18px;color:#d5d5d5;font-size:13px;line-height:1.8;">
         ${otherItems.map((item) => `<li>${item.quantity ?? 1}× ${escapeHtml(item.description ?? 'Artikel')}</li>`).join('')}
       </ul>`
    : ''

  const html = `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#0a0a0a;border-radius:2px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;background-color:#000000;">
                <img src="${LOGO_URL}" alt="OD COMPLAINTS" width="140" style="display:block;border:0;outline:none;max-width:140px;height:auto;" />
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 6px;color:#FF3939;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Print-on-Demand-Auftrag</p>
                <h1 style="margin:0 0 8px;color:#f5f5f5;font-size:22px;letter-spacing:1px;text-transform:uppercase;font-weight:500;">#${escapeHtml(orderRef)}</h1>
                <p style="margin:0 0 24px;color:#b5b5b5;font-size:13px;line-height:1.6;">Bestellt am ${escapeHtml(orderDate)} · <strong style="color:#f5f5f5;">${totalPieces} Stück zu drucken</strong>. Bitte den Druck beim POD-Anbieter beauftragen.</p>

                ${sectionTitle('Zu drucken')}
                ${itemBlocks}

                ${sectionTitle('Lieferadresse (direkt an Kunden)')}
                <p style="margin:0 0 12px;padding:12px 16px;background-color:#1a1a1a;color:#f5f5f5;font-size:14px;line-height:1.7;">${addressBlock || '—'}</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${fieldRows(addressFields)}</table>

                ${sectionTitle('Zahlung')}
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${fieldRows(paymentFields)}</table>
                <p style="margin:12px 0 0;font-size:12px;"><a href="${escapeHtml(dashboardUrl)}" style="color:#FF3939;">Im Stripe Dashboard öffnen →</a></p>

                ${otherItemsHtml}

                ${sectionTitle('To-do')}
                <ol style="margin:0;padding-left:18px;color:#d5d5d5;font-size:13px;line-height:1.8;">
                  <li>Auftrag beim POD-Anbieter anlegen (Größe, Farbe, Druckdatei prüfen)</li>
                  <li>Lieferadresse 1:1 übernehmen, Referenz #${escapeHtml(orderRef)} angeben</li>
                  <li>Tracking-Nummer per Admin-Panel an den Kunden senden</li>
                </ol>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#000000;">
                <p style="margin:0;color:#5a5a5a;font-size:10px;letter-spacing:1px;text-transform:uppercase;">Automatisch erstellt aus dem Stripe-Webhook · OD COMPLAINTS</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  const sizesSummary = podLines.map((line) => `${line.quantity}× ${line.size}`).join(', ')
  const subject = `POD-Auftrag #${orderRef} — ${totalPieces} Stück (${sizesSummary}) — ${recipientName || customer.email || 'Kunde'}`

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html,
      // Replying goes straight to the customer.
      ...(customer.email ? { reply_to: customer.email } : {}),
    }),
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Resend request failed (${response.status}): ${body}`)
  }
}
