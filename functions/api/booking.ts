// POST /api/booking — Cloudflare Pages Function
//
// Receives the tattoo booking form and emails it to the studio inbox via
// Resend (https://resend.com — free tier: no credit card, 100 emails/day).
//
// Setup (no database needed):
//   1. Create a free Resend account with od.complaints@gmail.com.
//   2. Copy the API key from the dashboard and set RESEND_API_KEY as a
//      Cloudflare Pages environment variable / secret.
//   3. That's it — until you verify a custom sending domain in Resend, emails
//      are sent from "onboarding@resend.dev" and can only be delivered to the
//      address your Resend account was created with (od.complaints@gmail.com
//      by default below, override with BOOKING_NOTIFY_EMAIL).
//
// Optional extra channels (Discord/Telegram) can still be enabled alongside
// email by setting DISCORD_WEBHOOK_URL / TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID.

interface Env {
  RESEND_API_KEY?: string
  BOOKING_NOTIFY_EMAIL?: string
  RESEND_FROM_EMAIL?: string
  DISCORD_WEBHOOK_URL?: string
  TELEGRAM_BOT_TOKEN?: string
  TELEGRAM_CHAT_ID?: string
}

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

function buildMessage(b: Record<string, string>): string {
  return [
    '📌 Neue Tattoo-Anfrage (Deposit gezahlt / im Zahlungsprozess)',
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

async function notifyEmail(apiKey: string, to: string, from: string, subject: string, text: string, html: string): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, text, html }),
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Resend request failed (${response.status}): ${body}`)
  }
}

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context

  let payload: BookingPayload
  try {
    payload = (await request.json()) as BookingPayload
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400)
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

  if (!b.name || !b.email || !b.motif || !b.bodyPart || !b.size) {
    return json({ error: 'Missing required fields.' }, 400)
  }

  const message = buildMessage(b)
  const tasks: Promise<unknown>[] = []

  if (env.RESEND_API_KEY) {
    const to = env.BOOKING_NOTIFY_EMAIL || DEFAULT_NOTIFY_EMAIL
    const from = env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL
    tasks.push(notifyEmail(env.RESEND_API_KEY, to, from, `Neue Tattoo-Anfrage von ${b.name}`, message, buildHtmlMessage(b)))
  }

  if (env.DISCORD_WEBHOOK_URL) tasks.push(notifyDiscord(env.DISCORD_WEBHOOK_URL, message))
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    tasks.push(notifyTelegram(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID, message))
  }

  if (tasks.length === 0) {
    return json({ error: 'Booking notifications are not configured yet (missing RESEND_API_KEY).' }, 500)
  }

  const results = await Promise.allSettled(tasks)
  const anySucceeded = results.some((r) => r.status === 'fulfilled')

  if (!anySucceeded) {
    const firstError = results.find((r): r is PromiseRejectedResult => r.status === 'rejected')
    return json({ error: firstError ? String(firstError.reason) : 'Could not deliver the booking notification.' }, 502)
  }

  return json({ ok: true })
}

