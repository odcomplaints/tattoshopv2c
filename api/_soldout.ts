// Tiny Upstash Redis REST client used to automatically mark limited/unique
// items as sold-out once their stock is exhausted by real purchases.
//
// Works via plain `fetch` (no SDK) so it runs on the Vercel Edge Runtime.
// Configure by adding a Vercel KV / Upstash Redis integration, which sets
// KV_REST_API_URL + KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL/TOKEN — both
// are supported). If neither is configured, these functions silently no-op so
// the webhook keeps working (emails still get sent) — you just won't get
// automatic sold-out tracking until KV is set up.

const SOLD_OUT_SET_KEY = 'sold_out_ids'

function getConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return { url: url.replace(/\/$/, ''), token }
}

async function redisCommand<T = unknown>(command: (string | number)[]): Promise<T | null> {
  const config = getConfig()
  if (!config) return null
  const response = await fetch(config.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  })
  if (!response.ok) {
    console.error(`[soldout] Redis command failed (${response.status}): ${await response.text().catch(() => '')}`)
    return null
  }
  const body = (await response.json()) as { result: T }
  return body.result
}

async function redisPipeline(commands: (string | number)[][]): Promise<unknown[] | null> {
  const config = getConfig()
  if (!config) return null
  const response = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  })
  if (!response.ok) {
    console.error(`[soldout] Redis pipeline failed (${response.status}): ${await response.text().catch(() => '')}`)
    return null
  }
  const body = (await response.json()) as Array<{ result: unknown }>
  return body.map((entry) => entry.result)
}

/**
 * Decrements the remaining stock for each purchased product id and, once a
 * product hits zero, adds it to the sold-out set. `initialStock` should come
 * from the catalog (`CatalogEntry.stock`) so the counter is seeded correctly
 * the first time a given product is ever purchased.
 */
export async function recordPurchases(
  purchases: Array<{ id: string; quantity: number; initialStock: number }>,
): Promise<void> {
  if (!getConfig()) {
    console.log('[soldout] KV not configured (KV_REST_API_URL/TOKEN) — skipping stock tracking.')
    return
  }

  for (const { id, quantity, initialStock } of purchases) {
    if (!id || quantity <= 0) continue
    const stockKey = `stock:${id}`
    // Seed the counter on first use, then decrement — two calls because the
    // REST pipeline doesn't support conditional/scripted logic.
    const results = await redisPipeline([
      ['SETNX', stockKey, initialStock],
      ['DECRBY', stockKey, quantity],
    ])
    const remaining = results ? Number(results[1]) : NaN
    if (Number.isFinite(remaining) && remaining <= 0) {
      await redisCommand(['SADD', SOLD_OUT_SET_KEY, id])
    }
  }
}

/** Returns the ids of all products currently marked sold-out via purchases. */
export async function getSoldOutIds(): Promise<string[]> {
  const result = await redisCommand<string[]>(['SMEMBERS', SOLD_OUT_SET_KEY])
  return Array.isArray(result) ? result : []
}
