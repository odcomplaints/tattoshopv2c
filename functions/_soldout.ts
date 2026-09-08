// Cloudflare Pages equivalent of api/_soldout.ts — see that file for details.
// Reads KV_REST_API_URL/TOKEN or UPSTASH_REDIS_REST_URL/TOKEN from the Pages
// environment bindings instead of `process.env`.

interface SoldOutEnv {
  KV_REST_API_URL?: string
  KV_REST_API_TOKEN?: string
  UPSTASH_REDIS_REST_URL?: string
  UPSTASH_REDIS_REST_TOKEN?: string
}

const SOLD_OUT_SET_KEY = 'sold_out_ids'

function getConfig(env: SoldOutEnv): { url: string; token: string } | null {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return { url: url.replace(/\/$/, ''), token }
}

async function redisCommand<T = unknown>(env: SoldOutEnv, command: (string | number)[]): Promise<T | null> {
  const config = getConfig(env)
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

async function redisPipeline(env: SoldOutEnv, commands: (string | number)[][]): Promise<unknown[] | null> {
  const config = getConfig(env)
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

export async function recordPurchases(
  env: SoldOutEnv,
  purchases: Array<{ id: string; quantity: number; initialStock: number }>,
): Promise<void> {
  if (!getConfig(env)) {
    console.log('[soldout] KV not configured (KV_REST_API_URL/TOKEN) — skipping stock tracking.')
    return
  }

  for (const { id, quantity, initialStock } of purchases) {
    if (!id || quantity <= 0) continue
    const stockKey = `stock:${id}`
    const results = await redisPipeline(env, [
      ['SETNX', stockKey, initialStock],
      ['DECRBY', stockKey, quantity],
    ])
    const remaining = results ? Number(results[1]) : NaN
    if (Number.isFinite(remaining) && remaining <= 0) {
      await redisCommand(env, ['SADD', SOLD_OUT_SET_KEY, id])
    }
  }
}

export async function getSoldOutIds(env: SoldOutEnv): Promise<string[]> {
  const result = await redisCommand<string[]>(env, ['SMEMBERS', SOLD_OUT_SET_KEY])
  return Array.isArray(result) ? result : []
}
