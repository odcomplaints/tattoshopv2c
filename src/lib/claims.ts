import { isClaimEnabled } from '../data/claims'
import type { Work } from '../data/work'

export type ClaimStatus = { claimed: string[]; reserved: string[] }

export type ClaimState = 'none' | 'available' | 'reserved' | 'claimed'

// Combines the static flags in src/data/work.ts with the live status from the API.
export function getClaimState(work: Work, status: ClaimStatus): ClaimState {
  if (!isClaimEnabled(work)) return 'none'
  if (work.claim.claimed || status.claimed.includes(work.id)) return 'claimed'
  if (status.reserved.includes(work.id)) return 'reserved'
  return 'available'
}

// Live claim state (api/claim-status.ts). Fails silently so the page falls back
// to the static `claim.claimed` flags in src/data/work.ts.
export async function fetchClaimStatus(): Promise<ClaimStatus> {
  try {
    const response = await fetch('/api/claim-status')
    if (!response.ok) return { claimed: [], reserved: [] }
    const body = (await response.json()) as Partial<ClaimStatus>
    return {
      claimed: Array.isArray(body.claimed) ? body.claimed : [],
      reserved: Array.isArray(body.reserved) ? body.reserved : [],
    }
  } catch {
    return { claimed: [], reserved: [] }
  }
}
