// Claim state for exclusive tattoo templates, stored in the same Upstash/KV
// instance as the sold-out tracking (see _soldout.ts).
//
// Keys:
//   claim:hold:<workId>   'pending' | <checkout session id>. SET NX acts as the lock that
//                         keeps two people from paying for the same exclusive piece. It
//                         expires with the Checkout Session and becomes permanent once the
//                         piece is paid.
//   claim:owner:<workId>  session id of the payment that claimed the piece (permanent).
//   claimed_works         set of claimed work ids (read by the public status endpoint).
//   claim:mail:<session>  guard against duplicate confirmation mails on webhook retries.

import { isKvConfigured, redisCommand, redisPipeline } from './_soldout.js'
import { stripeRequest } from './_stripe.js'
import { claimDeliveryFiles } from '../src/data/claims.js'
import type { ClaimableWork } from '../src/data/claims.js'

export { isKvConfigured }

/**
 * Absolute URL of the file a buyer receives, or null when it points at private
 * storage (CLAIM_FILES_BASE_URL) that is not configured.
 */
export function resolveClaimFileUrl(entry: ClaimableWork, siteOrigin: string, index = 0): string | null {
  const file = claimDeliveryFiles(entry)[index]
  if (!file) return null
  if (/^https?:\/\//i.test(file)) return file
  if (file.startsWith('/')) return `${siteOrigin}${file}`
  const base = process.env.CLAIM_FILES_BASE_URL?.replace(/\/$/, '')
  return base ? `${base}/${file}` : null
}

const CLAIMED_SET = 'claimed_works'
const holdKey = (id: string) => `claim:hold:${id}`
const ownerKey = (id: string) => `claim:owner:${id}`
const mailKey = (sessionId: string) => `claim:mail:${sessionId}`

// Stripe Checkout Sessions live at least 30 minutes; the hold outlives the session slightly.
export const CHECKOUT_LIFETIME_SECONDS = 31 * 60
const HOLD_TTL_SECONDS = 35 * 60

export type ReserveResult = 'reserved' | 'claimed' | 'held' | 'no-kv'

export async function reserveClaim(workId: string): Promise<ReserveResult> {
  if (!isKvConfigured()) return 'no-kv'
  const claimed = await redisCommand<number>(['SISMEMBER', CLAIMED_SET, workId])
  if (Number(claimed) === 1) return 'claimed'
  const result = await redisCommand<string | null>(['SET', holdKey(workId), 'pending', 'NX', 'EX', HOLD_TTL_SECONDS])
  // A Redis outage also yields null, so this fails closed instead of risking a double sale.
  return result === 'OK' ? 'reserved' : 'held'
}

export async function attachSessionToHold(workId: string, sessionId: string): Promise<void> {
  await redisCommand(['SET', holdKey(workId), sessionId, 'XX', 'EX', HOLD_TTL_SECONDS])
}

/** Releases the hold only if it still belongs to `expected` ('pending' or a session id). */
export async function releaseHold(workId: string, expected: string): Promise<void> {
  if (!isKvConfigured()) return
  const current = await redisCommand<string | null>(['GET', holdKey(workId)])
  if (current === expected) await redisCommand(['DEL', holdKey(workId)])
}

/**
 * The buyer left Stripe's page and starts over: expire their own still-open session so the
 * hold does not block them for the rest of the session lifetime. Returns true if the hold is free.
 */
export async function reclaimOwnHold(workId: string, previousSessionId: string, secretKey: string): Promise<boolean> {
  if (!isKvConfigured()) return false
  const current = await redisCommand<string | null>(['GET', holdKey(workId)])
  if (current !== previousSessionId) return false
  try {
    await stripeRequest(secretKey, `/v1/checkout/sessions/${encodeURIComponent(previousSessionId)}/expire`, {})
  } catch {
    // Already paid or expired: a paid one must keep its lock, an expired one is released by its webhook.
    return false
  }
  await redisCommand(['DEL', holdKey(workId)])
  return true
}

/** A delayed payment (e.g. SEPA) is still open: keep the piece locked until it succeeds or fails. */
export async function keepHold(workId: string, sessionId: string): Promise<void> {
  if (!isKvConfigured()) return
  const current = await redisCommand<string | null>(['GET', holdKey(workId)])
  if (current === sessionId) await redisCommand(['PERSIST', holdKey(workId)])
}

export type FinalizeResult = 'ok' | 'duplicate' | 'no-kv'

/**
 * Permanently assigns an exclusive piece to a paid session. 'duplicate' means a
 * different session already owns it (double payment) and one of them needs a refund.
 * Safe to call repeatedly for the same session (webhook retries).
 */
export async function finalizeClaim(workId: string, sessionId: string): Promise<FinalizeResult> {
  if (!isKvConfigured()) return 'no-kv'
  await redisCommand(['SET', ownerKey(workId), sessionId, 'NX'])
  const owner = await redisCommand<string | null>(['GET', ownerKey(workId)])
  if (owner !== sessionId) return 'duplicate'
  await redisPipeline([
    ['SADD', CLAIMED_SET, workId],
    ['SET', holdKey(workId), sessionId],
  ])
  return 'ok'
}

export async function getClaimOwner(workId: string): Promise<string | null> {
  if (!isKvConfigured()) return null
  return redisCommand<string | null>(['GET', ownerKey(workId)])
}

export async function getClaimStatus(ids: string[]): Promise<{ claimed: string[]; reserved: string[] }> {
  const empty = { claimed: [], reserved: [] }
  if (!isKvConfigured() || ids.length === 0) return empty
  const results = await redisPipeline([['SMEMBERS', CLAIMED_SET], ...ids.map((id) => ['EXISTS', holdKey(id)])])
  if (!results) return empty
  const claimedSet = new Set(Array.isArray(results[0]) ? (results[0] as string[]) : [])
  return {
    claimed: ids.filter((id) => claimedSet.has(id)),
    reserved: ids.filter((id, index) => !claimedSet.has(id) && Number(results[index + 1]) === 1),
  }
}

export async function wasMailSent(sessionId: string): Promise<boolean> {
  if (!isKvConfigured()) return false
  return Number(await redisCommand<number>(['EXISTS', mailKey(sessionId)])) === 1
}

export async function markMailSent(sessionId: string): Promise<void> {
  await redisCommand(['SET', mailKey(sessionId), '1', 'EX', 7 * 24 * 3600])
}

/** Never take money for a file that cannot be delivered afterwards. */
export async function isDeliverable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok || response.status === 405
  } catch {
    return false
  }
}

export type CartReservation =
  | { ok: true; reserved: string[] }
  | { ok: false; status: number; error: string; reserved: string[] }

/**
 * Locks every exclusive piece of a cart. All-or-nothing: on the first failure the pieces locked
 * so far stay in `reserved` so the caller can release them.
 */
export async function reserveCartClaims(
  entries: ClaimableWork[],
  options: { secretKey: string; previousSessionId: string; production: boolean },
): Promise<CartReservation> {
  const reserved: string[] = []
  for (const entry of entries) {
    if (!entry.claim.singleClaimOnly) continue
    let result = await reserveClaim(entry.id)
    if (result === 'held' && options.previousSessionId) {
      if (await reclaimOwnHold(entry.id, options.previousSessionId, options.secretKey)) result = await reserveClaim(entry.id)
    }
    if (result === 'claimed') return { ok: false, status: 409, error: `${entry.title} has already been claimed.`, reserved }
    if (result === 'held') {
      return { ok: false, status: 409, error: `${entry.title} is being claimed by someone else right now. Please try again in a few minutes.`, reserved }
    }
    if (result === 'no-kv') {
      // Without KV exclusivity cannot be guaranteed — only tolerate that outside production.
      if (options.production) {
        console.error('[claim] KV not configured — refusing to sell an exclusive piece without a lock.')
        return { ok: false, status: 503, error: `${entry.title} is currently not available.`, reserved }
      }
      console.warn('[claim] KV not configured — exclusive lock skipped (non-production).')
      continue
    }
    reserved.push(entry.id)
  }
  return { ok: true, reserved }
}
