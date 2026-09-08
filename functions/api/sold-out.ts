// GET /api/sold-out — Cloudflare Pages Function equivalent of api/sold-out.ts.

interface Env {
  KV_REST_API_URL?: string
  KV_REST_API_TOKEN?: string
  UPSTASH_REDIS_REST_URL?: string
  UPSTASH_REDIS_REST_TOKEN?: string
}

import { getSoldOutIds } from '../_soldout'

export const onRequestGet = async (context: { env: Env }): Promise<Response> => {
  const ids = await getSoldOutIds(context.env)
  return new Response(JSON.stringify({ ids }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=5, stale-while-revalidate=30',
    },
  })
}
