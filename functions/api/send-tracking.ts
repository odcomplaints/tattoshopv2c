// POST /api/send-tracking — Cloudflare Pages Function
//
// Manually triggered from the Admin Panel after you've packed & shipped an
// order privately (no shipping-provider API integration). You fill in the
// customer's email, order/item summary, and the tracking link you got from
// the post office/DHL — this endpoint sends a branded shipping-confirmation
// email via Resend. Protected by a shared secret (ADMIN_SEND_KEY) so random
// visitors can't spam customers with emails through this endpoint.

interface Env {
  RESEND_API_KEY?: string
  RESEND_FROM_EMAIL?: string
  ADMIN_SEND_KEY?: string
}

const DEFAULT_FROM_EMAIL = 'OD COMPLAINTS <onboarding@resend.dev>'
const LOGO_URL = 'https://www.odcomplaints.com/assets/email/logo.png'

type Payload = {
  adminKey?: unknown
  customerEmail?: unknown
  customerName?: unknown
  orderSummary?: unknown
  carrier?: unknown
  trackingUrl?: unknown
  trackingCode?: unknown
  note?: unknown
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Same branded shell used for order confirmation emails (functions/api/webhook.ts)
// so all outgoing customer emails look consistent.
function renderShippingEmailHtml(options: {
  heading: string
  intro: string
  orderSummary: string
  trackingUrl: string
  trackingCode: string
  carrier: string
  note: string
}): string {
  const { heading, intro, orderSummary, trackingUrl, trackingCode, carrier, note } = options
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
                <p style="margin:0 0 6px;color:#FF3939;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Versandbestätigung</p>
                <h1 style="margin:0 0 16px;color:#f5f5f5;font-size:22px;letter-spacing:1px;text-transform:uppercase;font-weight:500;">${heading}</h1>
                <p style="margin:0 0 24px;color:#b5b5b5;font-size:13px;line-height:1.6;">${intro}</p>

                <p style="margin:0 0 6px;color:#7a7a7a;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Bestellung</p>
                <p style="margin:0 0 24px;color:#d5d5d5;font-size:13px;line-height:1.6;white-space:pre-line;">${orderSummary}</p>

                ${
                  trackingUrl
                    ? `<a href="${trackingUrl}" style="display:inline-block;margin-bottom:20px;background-color:#FF3939;color:#ffffff;text-decoration:none;font-size:12px;letter-spacing:1px;text-transform:uppercase;font-weight:600;padding:14px 24px;">Sendung verfolgen</a>`
                    : ''
                }

                ${
                  carrier || trackingCode
                    ? `<p style="margin:0 0 6px;color:#7a7a7a;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Versanddetails</p>
                       <p style="margin:0 0 24px;color:#d5d5d5;font-size:13px;line-height:1.6;">${[carrier, trackingCode].filter(Boolean).join(' · ')}</p>`
                    : ''
                }

                ${note ? `<p style="margin:0 0 6px;color:#d5d5d5;font-size:13px;line-height:1.6;">${note}</p>` : ''}

                <p style="margin:28px 0 0;color:#7a7a7a;font-size:12px;line-height:1.6;">Bei Fragen antworte einfach auf diese E-Mail.</p>
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

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context

  if (!env.RESEND_API_KEY) {
    return json({ error: 'E-Mail-Versand ist nicht konfiguriert (RESEND_API_KEY fehlt).' }, 500)
  }
  if (!env.ADMIN_SEND_KEY) {
    return json({ error: 'ADMIN_SEND_KEY ist auf dem Server nicht gesetzt.' }, 500)
  }

  let payload: Payload
  try {
    payload = (await request.json()) as Payload
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400)
  }

  if (str(payload.adminKey) !== env.ADMIN_SEND_KEY) {
    return json({ error: 'Ungültiger Admin-Schlüssel.' }, 401)
  }

  const customerEmail = str(payload.customerEmail)
  const customerName = str(payload.customerName)
  const orderSummary = str(payload.orderSummary)
  const carrier = str(payload.carrier)
  const trackingUrl = str(payload.trackingUrl)
  const trackingCode = str(payload.trackingCode)
  const note = str(payload.note)

  if (!customerEmail || !isValidEmail(customerEmail)) {
    return json({ error: 'Bitte eine gültige Kunden-E-Mail angeben.' }, 400)
  }
  if (!orderSummary) {
    return json({ error: 'Bitte eine kurze Bestellübersicht angeben.' }, 400)
  }

  const from = env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL
  const heading = `Unterwegs${customerName ? `, ${customerName}` : ''}!`
  const intro = 'Deine Bestellung wurde versendet. Du kannst die Sendung ab jetzt verfolgen.'

  const textLines = [
    `Deine Bestellung wurde versendet${customerName ? `, ${customerName}` : ''}!`,
    ``,
    `Bestellung:`,
    orderSummary,
    ``,
    carrier || trackingCode ? `Versand: ${[carrier, trackingCode].filter(Boolean).join(' · ')}` : '',
    trackingUrl ? `Tracking-Link: ${trackingUrl}` : '',
    ``,
    note,
    ``,
    `— OD COMPLAINTS`,
  ]
    .filter((line) => line !== '')
    .join('\n')

  const html = renderShippingEmailHtml({ heading, intro, orderSummary, trackingUrl, trackingCode, carrier, note })

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [customerEmail],
      subject: 'Deine Bestellung ist unterwegs — OD COMPLAINTS',
      text: textLines,
      html,
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    return json({ error: `Resend request failed (${response.status}): ${body}` }, 502)
  }

  return json({ ok: true })
}
