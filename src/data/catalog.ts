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
  'bape-shark-glow': { id: 'bape-shark-glow', name: 'Bape Shark Glow in the Dark', priceCents: 39000, currency: 'eur', available: true },
  'bape-shark-lila': { id: 'bape-shark-lila', name: 'Bape Shark Hoodie Lila', priceCents: 45000, currency: 'eur', available: true },
  'bape-shark-mickey': { id: 'bape-shark-mickey', name: 'Bape Shark × Mickey Mouse', priceCents: 62000, currency: 'eur', available: true },
  'bape-shark-multicamo': { id: 'bape-shark-multicamo', name: 'Bape Shark Multi-Camo', priceCents: 47000, currency: 'eur', available: true },
  'bape-shark-pink': { id: 'bape-shark-pink', name: 'Bape Shark Hoodie Pink', priceCents: 45000, currency: 'eur', available: true },
  'bape-shark-rot': { id: 'bape-shark-rot', name: 'Bape Shark Hoodie Rot', priceCents: 42000, currency: 'eur', available: true },
  'supreme-sweatjacke': { id: 'supreme-sweatjacke', name: 'Supreme Sweatjacke', priceCents: 26000, currency: 'eur', available: true },
  'supreme-tshirt': { id: 'supreme-tshirt', name: 'Supreme T-Shirt', priceCents: 11000, currency: 'eur', available: true },
  'balenciaga-sweatjacke': { id: 'balenciaga-sweatjacke', name: 'Balenciaga Sweatjacke', priceCents: 59000, currency: 'eur', available: false },
  'corteiz-hoodie': { id: 'corteiz-hoodie', name: 'Corteiz Hoodie', priceCents: 14000, currency: 'eur', available: true },
  'cp-company': { id: 'cp-company', name: 'CP Company Jacke', priceCents: 42000, currency: 'eur', available: true },
  'dior-sorayama-hoodie': { id: 'dior-sorayama-hoodie', name: 'Dior × Sorayama Hoodie', priceCents: 180000, currency: 'eur', available: true },
  'carlo-colucci-1': { id: 'carlo-colucci-1', name: 'Carlo Colucci Strickjacke I', priceCents: 31000, currency: 'eur', available: true },
  'carlo-colucci-2': { id: 'carlo-colucci-2', name: 'Carlo Colucci Strickjacke II', priceCents: 31000, currency: 'eur', available: true },
  'spider-hoodie-pink': { id: 'spider-hoodie-pink', name: 'Spider Hoodie Pink', priceCents: 48000, currency: 'eur', available: true },
  'ac-milan-trikot': { id: 'ac-milan-trikot', name: 'AC Milan Trikot', priceCents: 12000, currency: 'eur', available: true },
  'real-madrid-trikot': { id: 'real-madrid-trikot', name: 'Real Madrid Trikot', priceCents: 11000, currency: 'eur', available: true },
  'manchester-dhl': { id: 'manchester-dhl', name: 'Manchester × DHL Trikot', priceCents: 26000, currency: 'eur', available: true },
  'olympique-marseille': { id: 'olympique-marseille', name: 'Olympique Marseille Trikot', priceCents: 11000, currency: 'eur', available: true },
  'arabic-shirt': { id: 'arabic-shirt', name: 'Arabic Graphic Shirt', priceCents: 9500, currency: 'eur', available: true },
  'redbull-jacket': { id: 'redbull-jacket', name: 'Red Bull Racing Jacke', priceCents: 18000, currency: 'eur', available: true },
}

export function getCatalogEntry(id: string): CatalogEntry | undefined {
  return catalog[id]
}
