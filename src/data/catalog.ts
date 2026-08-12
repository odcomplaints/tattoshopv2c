// Server-side price source of truth.
//
// The prices a customer is charged MUST come from here, never from the client.
// The frontend (src/data/shop.ts) only holds display copy; the amounts below are
// what actually gets sent to Stripe. Keep the values in sync with shop.ts.
//
// This module is intentionally free of any asset/image imports so it can be
// bundled by both the Vite app and the Cloudflare Pages Functions (functions/).

export type CatalogEntry = {
  /** Product id — matches ShopItem.id in src/data/shop.ts */
  id: string
  /** Display name sent to Stripe as the line item name */
  name: string
  /** Unit price in the smallest currency unit (cents for EUR) */
  priceCents: number
  /** ISO currency code, lowercase */
  currency: string
  /** Whether the item can currently be purchased */
  available: boolean
}

export const catalog: Record<string, CatalogEntry> = {
  'black-sun': { id: 'black-sun', name: 'Black Sun', priceCents: 4500, currency: 'eur', available: true },
  'soft-structure': { id: 'soft-structure', name: 'Soft Structure', priceCents: 3500, currency: 'eur', available: false },
  'talisman-01': { id: 'talisman-01', name: 'Talisman 01', priceCents: 6000, currency: 'eur', available: true },
  'field-study': { id: 'field-study', name: 'Field Study', priceCents: 3000, currency: 'eur', available: true },
}

export function getCatalogEntry(id: string): CatalogEntry | undefined {
  return catalog[id]
}
