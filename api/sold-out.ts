// GET /api/sold-out — Vercel Edge Function
//
// Returns the ids of products that have been automatically marked sold-out
// via real Stripe purchases (see api/_soldout.ts + api/webhook.ts). The
// frontend merges this list with the static catalog data so a unique item
// (stock: 1) disappears/greys out as "sold out" right after it's bought,
// without needing a manual admin-panel edit + redeploy.

import { getSoldOutIds } from './_soldout'

export const config = { runtime: 'edge' }

export default async function handler(): Promise<Response> {
  const ids = await getSoldOutIds()
  return new Response(JSON.stringify({ ids }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Short cache so repeated visits don't hammer Redis, but new sales
      // still show up within a few seconds.
      'Cache-Control': 'public, max-age=5, stale-while-revalidate=30',
    },
  })
}
