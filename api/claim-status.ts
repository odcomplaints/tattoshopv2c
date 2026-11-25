// GET /api/claim-status — Vercel Edge Function
//
// Public claim state of the exclusive tattoo templates: which pieces are
// already claimed (paid) and which are currently being paid for (reserved).
// The frontend merges this with the static data in src/data/work.ts.

import { getClaimStatus } from './_claims.js'
import { claimableWorkIds } from '../src/data/claims.js'

export const config = { runtime: 'edge' }

export default async function handler(): Promise<Response> {
  const status = await getClaimStatus(claimableWorkIds)
  return new Response(JSON.stringify(status), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=5, stale-while-revalidate=30',
    },
  })
}
