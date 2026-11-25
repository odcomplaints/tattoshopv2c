// GET /api/claim-download?session_id=cs_... — Vercel Edge Function
//
// Hands out the purchased template. Access is tied to a Checkout Session that
// Stripe reports as paid for this work, so the file location never has to be
// public. The unguessable session id (success URL / confirmation mail) acts as
// the download credential.

import { stripeGet, StripeError } from './_stripe.js'
import { getClaimOwner, resolveClaimFileUrl } from './_claims.js'
import { claimDeliveryFiles, claimDownloadFilename, getWorkById, parseWorkIds } from '../src/data/claims.js'
import type { ClaimableWork } from '../src/data/claims.js'

export const config = { runtime: 'edge' }

const SESSION_ID_RE = /^cs_(test|live)_[A-Za-z0-9]+$/

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405)

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) return json({ error: 'Payment is not configured.' }, 500)

  const sessionId = new URL(request.url).searchParams.get('session_id') ?? ''
  if (!SESSION_ID_RE.test(sessionId)) return json({ error: 'Missing or invalid session id.' }, 400)

  let session: { payment_status?: string; metadata?: Record<string, string> }
  try {
    session = await stripeGet(secretKey, `/v1/checkout/sessions/${encodeURIComponent(sessionId)}`)
  } catch (error) {
    if (error instanceof StripeError) return json({ error: 'Session not found.' }, error.status === 404 ? 404 : 400)
    return json({ error: 'Could not verify payment.' }, 502)
  }

  const workIds = parseWorkIds(session.metadata?.work_ids)
  if (workIds.length === 0) return json({ error: 'Not a claim purchase.' }, 404)
  if (session.payment_status !== 'paid') return json({ error: 'Payment not completed yet.' }, 402)

  // An order may contain several templates; a single one is picked implicitly.
  const requested = new URL(request.url).searchParams.get('work') ?? (workIds.length === 1 ? workIds[0] : '')
  if (!workIds.includes(requested)) return json({ error: 'Unknown piece for this order.' }, 404)

  // A piece stays downloadable even if its claim is later switched off in the data file.
  const entry = getWorkById(requested)
  if (!entry?.claim) return json({ error: 'Unknown piece.' }, 404)
  const claimable = entry as ClaimableWork

  // A second, duplicate payment for an exclusive piece must not unlock the file.
  if (claimable.claim.singleClaimOnly) {
    const owner = await getClaimOwner(claimable.id)
    if (owner && owner !== sessionId) return json({ error: 'This piece belongs to another purchase.' }, 403)
  }

  const origin = process.env.SITE_URL?.replace(/\/$/, '') || new URL(request.url).origin
  const files = claimDeliveryFiles(claimable)
  const fileIndex = Number(new URL(request.url).searchParams.get('file') ?? '0')
  if (!Number.isInteger(fileIndex) || fileIndex < 0 || fileIndex >= files.length) return json({ error: 'Unknown file.' }, 404)
  const fileUrl = resolveClaimFileUrl(claimable, origin, fileIndex)
  const upstream = fileUrl ? await fetch(fileUrl).catch(() => null) : null
  if (!upstream?.ok || !upstream.body) {
    console.error(`[claim] ${claimable.id} — download failed for ${sessionId} (${fileUrl ?? 'no file url'}).`)
    return json({ error: 'The file is temporarily unavailable. Please contact the studio.' }, 502)
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${claimDownloadFilename(claimable, fileIndex)}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
