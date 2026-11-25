// Webhook-side handling for digital tattoo template purchases ("Claim").
// Called from api/webhook.ts for Checkout Sessions tagged with
// metadata.type = 'work-claim' (see api/claim-checkout.ts).

import {
  finalizeClaim,
  keepHold,
  markMailSent,
  releaseHold,
  wasMailSent,
} from './_claims.js'
import { claimCopy, claimDeliveryFiles, claimFileLabels, formatClaimPrice, getWorkById, parseWorkIds } from '../src/data/claims.js'
import type { ClaimLanguage, ClaimableWork } from '../src/data/claims.js'

type Session = Record<string, unknown>

export type SendMail = (apiKey: string, to: string, from: string, subject: string, text: string, html: string) => Promise<void>

export type ClaimContext = {
  resendKey: string | undefined
  from: string
  adminTo: string
  siteOrigin: string
  send: SendMail
}

const LOGO_URL = 'https://www.odcomplaints.com/assets/email/logo.png'

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function renderClaimEmailHtml(options: {
  eyebrow: string
  heading: string
  intro: string
  amount: string
  totalLabel: string
  downloadLabel: string
  downloads: ReadonlyArray<{ title: string; url: string }>
  licenseTitle: string
  license: readonly string[]
  footerNote: string
}): string {
  const { eyebrow, heading, intro, amount, totalLabel, downloadLabel, downloads, licenseTitle, license, footerNote } = options
  const licenseItems = license
    .map((line) => `<li style="margin:0 0 6px;">${escapeHtml(line)}</li>`)
    .join('')
  const downloadButtons = downloads
    .map(
      (download) => `
                <p style="margin:0 0 12px;">
                  <a href="${escapeHtml(download.url)}" style="display:inline-block;border:1px solid #FF3939;padding:12px 24px;color:#f5f5f5;font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">${escapeHtml(downloadLabel)}${downloads.length > 1 ? ` — ${escapeHtml(download.title)}` : ''}</a>
                </p>`,
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
                <p style="margin:0 0 6px;color:#FF3939;font-size:11px;letter-spacing:2px;text-transform:uppercase;">${escapeHtml(eyebrow)}</p>
                <h1 style="margin:0 0 16px;color:#f5f5f5;font-size:22px;letter-spacing:1px;text-transform:uppercase;font-weight:500;">${escapeHtml(heading)}</h1>
                <p style="margin:0 0 24px;color:#b5b5b5;font-size:13px;line-height:1.6;">${escapeHtml(intro)}</p>${downloadButtons}
                <p style="margin:16px 0 0;"></p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr>
                    <td style="padding:14px 0 0;border-top:1px solid #2a2a2a;color:#ffffff;font-size:13px;letter-spacing:1px;text-transform:uppercase;font-weight:600;">${escapeHtml(totalLabel)}</td>
                    <td style="padding:14px 0 0;border-top:1px solid #2a2a2a;color:#ffffff;font-size:13px;text-align:right;font-weight:600;">${escapeHtml(amount)}</td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;color:#7a7a7a;font-size:11px;letter-spacing:1px;text-transform:uppercase;">${escapeHtml(licenseTitle)}</p>
                <ul style="margin:0;padding-left:18px;color:#b5b5b5;font-size:12px;line-height:1.6;">${licenseItems}</ul>
                <p style="margin:28px 0 0;color:#7a7a7a;font-size:12px;line-height:1.6;">${escapeHtml(footerNote)}</p>
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

/**
 * checkout.session.completed / async_payment_succeeded for a session with digital templates
 * (metadata.work_ids). Idempotent: Stripe retries webhooks, so the lock and the mail guard
 * tolerate repeats.
 */
export async function handleClaimPaid(session: Session, context: ClaimContext): Promise<void> {
  const sessionId = String(session.id ?? '')
  const metadata = (session.metadata ?? {}) as Record<string, string>
  const entries: ClaimableWork[] = []
  for (const workId of parseWorkIds(metadata.work_ids)) {
    const found = getWorkById(workId)
    if (found?.claim) entries.push(found as ClaimableWork)
    else console.error(`[claim] ${sessionId} — paid session for unknown work "${workId}". Check the Stripe Dashboard!`)
  }
  if (entries.length === 0) return

  if (session.payment_status !== 'paid') {
    // Delayed payment method: keep the pieces locked until async_payment_succeeded / _failed.
    for (const entry of entries) if (entry.claim.singleClaimOnly) await keepHold(entry.id, sessionId)
    console.log(`[claim] ${sessionId} — ${entries.map((entry) => entry.id).join(', ')} not paid yet (${String(session.payment_status)}), waiting for async payment.`)
    return
  }

  const duplicates: ClaimableWork[] = []
  for (const entry of entries) {
    const outcome = entry.claim.singleClaimOnly ? await finalizeClaim(entry.id, sessionId) : 'ok'
    if (outcome === 'duplicate') {
      duplicates.push(entry)
      console.error(`[claim] ${sessionId} — ${entry.id} was already claimed by another payment. REFUND NEEDED.`)
    } else if (outcome === 'no-kv') {
      console.warn(`[claim] ${sessionId} — KV not configured, ${entry.id} not locked. Set claimed: true in src/data/work.ts.`)
    }
  }
  const delivered = entries.filter((entry) => !duplicates.includes(entry))

  if (!context.resendKey) {
    console.log(`[claim] ${sessionId} — RESEND_API_KEY not set, skipping emails (customer can still use the success page link).`)
    return
  }
  if (await wasMailSent(sessionId)) return

  const language: ClaimLanguage = metadata.language === 'de' ? 'de' : 'en'
  const copy = claimCopy[language]
  const customerDetails = session.customer_details as { email?: string; name?: string } | undefined
  const customerEmail = customerDetails?.email
  // Only the templates — the session total may also include shop items and shipping.
  const amount = formatClaimPrice(entries.reduce((sum, entry) => sum + entry.claim.priceCents, 0))
  const titles = entries.map((entry) => entry.title).join(', ')
  const publicOrigin = process.env.SITE_URL?.replace(/\/$/, '') || context.siteOrigin
  const downloads = delivered.flatMap((entry) => {
    const labels = claimFileLabels(entry)
    return claimDeliveryFiles(entry).map((_, index) => ({
      title: labels.length > 1 || delivered.length > 1 ? `${delivered.length > 1 ? `${entry.title} ` : ''}${labels[index]}`.trim() : entry.title,
      url: `${publicOrigin}/api/claim-download?session_id=${encodeURIComponent(sessionId)}&work=${encodeURIComponent(entry.id)}&file=${index}`,
    }))
  })
  const hasDuplicate = duplicates.length > 0
  const duplicateWarning = `⚠️ Bereits vergeben: ${duplicates.map((entry) => entry.title).join(', ')} – diese Zahlung (anteilig) bitte zurückerstatten!`

  const tasks: Promise<unknown>[] = [
    context.send(
      context.resendKey,
      context.adminTo,
      context.from,
      `${hasDuplicate ? 'ACHTUNG Doppel-Claim — ' : 'Neuer Claim — '}${titles} (${amount})`,
      [
        hasDuplicate ? duplicateWarning : '🎨 Neuer Claim',
        ...entries.map((entry) => `Motiv: ${entry.title} (${entry.id})`),
        `Kunde: ${customerDetails?.name || '—'} <${customerEmail || 'keine E-Mail'}>`,
        `Betrag (Vorlagen): ${amount}`,
        `Session: ${sessionId}`,
        ...downloads.map((download) => `Download ${download.title}: ${download.url}`),
        ...(hasDuplicate ? ['Für bereits vergebene Motive wurde der Download gesperrt und nicht per Mail verschickt.'] : []),
      ].join('\n'),
      `<p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;">${
        hasDuplicate ? `<strong>${escapeHtml(duplicateWarning)}</strong><br>` : '<strong>🎨 Neuer Claim</strong><br>'
      }Motiv: ${escapeHtml(titles)}<br>Kunde: ${escapeHtml(customerDetails?.name || '—')} &lt;${escapeHtml(customerEmail || 'keine E-Mail')}&gt;<br>Betrag (Vorlagen): ${escapeHtml(amount)}<br>Session: ${escapeHtml(sessionId)}</p>`,
    ),
  ]

  if (customerEmail && downloads.length > 0) {
    const deliveredTitles = delivered.map((entry) => entry.title).join(', ')
    tasks.push(
      context.send(
        context.resendKey,
        customerEmail,
        context.from,
        copy.email.subject(deliveredTitles),
        [
          copy.email.intro,
          '',
          ...downloads.map((download) => `${copy.email.download} (${download.title}): ${download.url}`),
          '',
          ...copy.license.map((line) => `• ${line}`),
          '',
          copy.email.next,
          '',
          '— OD COMPLAINTS',
        ].join('\n'),
        renderClaimEmailHtml({
          eyebrow: copy.email.eyebrow,
          heading: copy.email.heading(deliveredTitles),
          intro: copy.email.intro,
          amount: formatClaimPrice(delivered.reduce((sum, entry) => sum + entry.claim.priceCents, 0)),
          totalLabel: copy.email.total,
          downloadLabel: copy.email.download,
          downloads,
          licenseTitle: copy.licenseTitle,
          license: copy.license,
          footerNote: copy.email.next,
        }),
      ),
    )
  }

  const results = await Promise.allSettled(tasks)
  let failed = 0
  for (const result of results) {
    if (result.status === 'rejected') {
      failed++
      console.error(`[claim] ${sessionId} — email failed: ${result.reason}`)
    }
  }
  if (failed === 0) await markMailSent(sessionId)
}

/** checkout.session.expired / async_payment_failed: the pieces become available again. */
export async function handleClaimAbandoned(session: Session): Promise<void> {
  const sessionId = String(session.id ?? '')
  const metadata = (session.metadata ?? {}) as Record<string, string>
  for (const workId of parseWorkIds(metadata.work_ids)) {
    const entry = getWorkById(workId)
    if (!entry?.claim?.singleClaimOnly) continue
    await releaseHold(entry.id, sessionId)
    console.log(`[claim] ${sessionId} — hold on ${entry.id} released.`)
  }
}
