// POST /api/booking — Vercel Edge Function
//
// Receives the tattoo booking form and emails it to the studio inbox via
// Resend (https://resend.com — free tier: no credit card, 100 emails/day).
//
// Setup (no database needed):
//   1. Create a free Resend account with od.complaints@gmail.com.
//   2. Copy the API key from the dashboard and set RESEND_API_KEY in Vercel
//      (Project → Settings → Environment Variables).
//   3. That's it — until you verify a custom sending domain in Resend, emails
//      are sent from "onboarding@resend.dev" and can only be delivered to the
//      address your Resend account was created with (od.complaints@gmail.com
//      by default below, override with BOOKING_NOTIFY_EMAIL).
//
// Optional extra channels (Discord/Telegram) can still be enabled alongside
// email by setting DISCORD_WEBHOOK_URL / TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID.

export const config = { runtime: 'edge' }

const DEFAULT_NOTIFY_EMAIL = 'od.complaints@gmail.com'
const DEFAULT_FROM_EMAIL = 'OD COMPLAINTS Booking <onboarding@resend.dev>'

type BookingPayload = {
  name?: unknown
  email?: unknown
  phone?: unknown
  motif?: unknown
  bodyPart?: unknown
  size?: unknown
  date?: unknown
  checkoutType?: unknown
  language?: unknown
}

type EmailAttachment = { filename: string; content: string }

const MAX_REFERENCE_FILES = 5
const MAX_REFERENCE_BYTES = 4 * 1024 * 1024
const MAX_REQUEST_BYTES = MAX_REFERENCE_BYTES + 64 * 1024
const ALLOWED_REFERENCE_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  }
  return btoa(binary)
}

async function parseRequest(request: Request): Promise<{ payload: BookingPayload; attachments: EmailAttachment[] }> {
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > MAX_REQUEST_BYTES) throw new Error('Booking files exceed the 4 MB total limit.')

  if (!request.headers.get('content-type')?.includes('multipart/form-data')) {
    return { payload: (await request.json()) as BookingPayload, attachments: [] }
  }

  const form = await request.formData()
  const payload: BookingPayload = {}
  for (const key of ['name', 'email', 'phone', 'motif', 'bodyPart', 'size', 'date', 'checkoutType', 'language'] as const) {
    if (key === 'name') payload.name = form.get(key)
    else if (key === 'email') payload.email = form.get(key)
    else if (key === 'phone') payload.phone = form.get(key)
    else if (key === 'motif') payload.motif = form.get(key)
    else if (key === 'bodyPart') payload.bodyPart = form.get(key)
    else if (key === 'size') payload.size = form.get(key)
    else if (key === 'date') payload.date = form.get(key)
    else if (key === 'checkoutType') payload.checkoutType = form.get(key)
    else payload.language = form.get(key)
  }

  const files = form.getAll('references').filter((value): value is File => value instanceof File && value.size > 0)
  if (files.length > MAX_REFERENCE_FILES) throw new Error(`Please upload no more than ${MAX_REFERENCE_FILES} files.`)

  let totalBytes = 0
  const attachments: EmailAttachment[] = []
  for (const file of files) {
    totalBytes += file.size
    if (totalBytes > MAX_REFERENCE_BYTES) throw new Error('Booking files exceed the 4 MB total limit.')
    if (!ALLOWED_REFERENCE_TYPES.has(file.type)) throw new Error('Only image files and PDFs can be uploaded.')
    const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '').slice(0, 100) || 'reference'
    attachments.push({ filename, content: encodeBase64(new Uint8Array(await file.arrayBuffer())) })
  }

  return { payload, attachments }
}

function buildMessage(b: Record<string, string>, checkoutType: string): string {
  return [
    `📌 Neue Tattoo-Anfrage (${checkoutType === 'express' ? 'Express: Apple/Google Pay' : 'Formular + Karte'})`,
    `Name: ${b.name || '—'}`,
    `E-Mail: ${b.email || '—'}`,
    `Telefon: ${b.phone || '—'}`,
    `Motiv: ${b.motif || '—'}`,
    `Körperstelle: ${b.bodyPart || '—'}`,
    `Größe: ${b.size || '—'}`,
    `Wunschtermin: ${b.date || '—'}`,
  ].join('\n')
}

function buildHtmlMessage(b: Record<string, string>): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#888;white-space:nowrap;">${label}</td><td style="padding:4px 0;">${value || '—'}</td></tr>`
  return `
    <div style="font-family:sans-serif;font-size:14px;color:#111;">
      <h2 style="margin:0 0 12px;">📌 Neue Tattoo-Anfrage</h2>
      <table cellpadding="0" cellspacing="0">
        ${row('Name', b.name)}
        ${row('E-Mail', b.email)}
        ${row('Telefon', b.phone)}
        ${row('Motiv', b.motif)}
        ${row('Körperstelle', b.bodyPart)}
        ${row('Größe', b.size)}
        ${row('Wunschtermin', b.date)}
      </table>
    </div>`
}

async function notifyDiscord(webhookUrl: string, message: string): Promise<void> {
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message }),
  })
}

async function notifyTelegram(botToken: string, chatId: string, message: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  })
}

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
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, text, html, ...(attachments.length ? { attachments } : {}) }),
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Resend request failed (${response.status}): ${body}`)
  }
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405)
  }

  let payload: BookingPayload
  let attachments: EmailAttachment[]
  try {
    const parsedRequest = await parseRequest(request)
    payload = parsedRequest.payload
    attachments = parsedRequest.attachments
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Invalid booking form data.' }, 400)
  }

  const b = {
    name: str(payload.name),
    email: str(payload.email),
    phone: str(payload.phone),
    motif: str(payload.motif),
    bodyPart: str(payload.bodyPart),
    size: str(payload.size),
    date: str(payload.date),
  }
  const checkoutType = str(payload.checkoutType) === 'express' ? 'express' : 'full'

  // Express checkout (Apple/Google Pay) only requires enough to reach the
  // customer; the full card-payment form additionally asks for tattoo details.
  if (!b.email || !b.phone || !b.date) {
    return json({ error: 'Missing required fields.' }, 400)
  }
  if (checkoutType === 'full' && (!b.name || !b.motif || !b.bodyPart || !b.size)) {
    return json({ error: 'Missing required fields.' }, 400)
  }

  const message = buildMessage(b, checkoutType)
  const tasks: Promise<unknown>[] = []

  const resendKey = process.env.RESEND_API_KEY
  if (attachments.length > 0 && !resendKey) {
    return json({ error: 'File uploads require email delivery to be configured.' }, 500)
  }
  let emailTask: Promise<unknown> | undefined
  if (resendKey) {
    const to = process.env.BOOKING_NOTIFY_EMAIL || DEFAULT_NOTIFY_EMAIL
    const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL
    const subject = b.name ? `Neue Tattoo-Anfrage von ${b.name}` : `Neue Tattoo-Anfrage (Express) — ${b.email}`
    emailTask = notifyEmail(resendKey, to, from, subject, message, buildHtmlMessage(b), attachments)
    tasks.push(emailTask)
  }

  const discordWebhook = process.env.DISCORD_WEBHOOK_URL
  if (discordWebhook) tasks.push(notifyDiscord(discordWebhook, message))

  const telegramToken = process.env.TELEGRAM_BOT_TOKEN
  const telegramChatId = process.env.TELEGRAM_CHAT_ID
  if (telegramToken && telegramChatId) tasks.push(notifyTelegram(telegramToken, telegramChatId, message))

  if (tasks.length === 0) {
    return json({ error: 'Booking notifications are not configured yet (missing RESEND_API_KEY).' }, 500)
  }

  const results = await Promise.allSettled(tasks)
  const emailResult = emailTask ? results[0] : undefined
  if (attachments.length > 0 && emailResult?.status !== 'fulfilled') {
    const reason = emailResult?.status === 'rejected' ? String(emailResult.reason) : 'Could not deliver the booking attachments.'
    return json({ error: reason }, 502)
  }
  const anySucceeded = results.some((r) => r.status === 'fulfilled')

  if (!anySucceeded) {
    const firstError = results.find((r): r is PromiseRejectedResult => r.status === 'rejected')
    return json({ error: firstError ? String(firstError.reason) : 'Could not deliver the booking notification.' }, 502)
  }

  return json({ ok: true })
}

