// Fetches the ids of products that were auto-marked sold-out by real Stripe
// purchases (see api/sold-out.ts + api/webhook.ts + api/_soldout.ts). Used to
// live-override the static shop.ts availability without needing a redeploy.

export async function fetchSoldOutIds(): Promise<string[]> {
  try {
    const response = await fetch('/api/sold-out')
    if (!response.ok) return []
    const body = (await response.json()) as { ids?: string[] }
    return Array.isArray(body.ids) ? body.ids : []
  } catch {
    // Network hiccup, KV not configured, offline, etc. — fail silently and
    // fall back to the static availability from shop.ts.
    return []
  }
}
