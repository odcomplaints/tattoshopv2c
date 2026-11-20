// Print-on-Demand (POD) product configuration.
//
// Products listed here are NOT held in stock: they are printed by an external
// POD provider after an order comes in. The flow is:
//   1. Customer picks a size and pays via Stripe Checkout (api/checkout.ts).
//   2. The Stripe webhook (api/webhook.ts) emails a detailed production order
//      to POD_ORDER_EMAIL (fallback: BOOKING_NOTIFY_EMAIL).
//   3. You place the print order manually with the provider.
//
// Every id here must also exist in src/data/shop.ts (display copy) and
// src/data/catalog.ts (price). This file is kept separate on purpose so the
// admin panel's generated shop.ts/catalog.ts never wipes the POD details.
//
// Must stay free of asset/image imports — it is bundled into the edge functions.

export type PodProduct = {
  /** Product id — matches ShopItem.id / CatalogEntry.id */
  id: string
  /** POD provider the print job is placed with (e.g. Printful, Gelato, Printify). */
  provider: string
  /** Blank garment / provider product reference to select at the provider. */
  blank: string
  /** Garment color to select at the provider. */
  color: string
  /** Print placement + size, e.g. "Front, 30 × 40 cm". */
  placement: string
  /** Link (or file name) of the print-ready design file. */
  printFile: string
  /** Sizes the customer can choose from, in display order. */
  sizes: string[]
  /** Production + shipping time shown to the customer. */
  productionTime: string
  /** Max units per size and order. */
  maxQuantity: number
}

export const podProducts: Record<string, PodProduct> = {
  'pod-tee-01': {
    id: 'pod-tee-01',
    provider: 'PLATZHALTER – POD-Anbieter eintragen',
    blank: 'PLATZHALTER – z. B. Stanley/Stella Creator 2.0 (STTU169)',
    color: 'Schwarz',
    placement: 'Front, ca. 30 × 40 cm',
    printFile: 'PLATZHALTER – Link zur Druckdatei (PNG, 300 dpi)',
    sizes: ['M', 'L'],
    productionTime: '5–10 Werktage',
    maxQuantity: 10,
  },
  'pod-tee-02': {
    id: 'pod-tee-02',
    provider: 'PLATZHALTER – POD-Anbieter eintragen',
    blank: 'PLATZHALTER – z. B. Stanley/Stella Creator 2.0 (STTU169)',
    color: 'Schwarz',
    placement: 'Front, ca. 30 × 40 cm',
    printFile: 'PLATZHALTER – Link zur Druckdatei (PNG, 300 dpi)',
    sizes: ['M', 'L'],
    productionTime: '5–10 Werktage',
    maxQuantity: 10,
  },
  'pod-tee-03': {
    id: 'pod-tee-03',
    provider: 'PLATZHALTER – POD-Anbieter eintragen',
    blank: 'PLATZHALTER – z. B. Stanley/Stella Creator 2.0 (STTU169)',
    color: 'Schwarz',
    placement: 'Front, ca. 30 × 40 cm',
    printFile: 'PLATZHALTER – Link zur Druckdatei (PNG, 300 dpi)',
    sizes: ['M', 'L'],
    productionTime: '5–10 Werktage',
    maxQuantity: 10,
  },
}

export function getPodProduct(id: string): PodProduct | undefined {
  // hasOwn: plain `obj[id]` would also match inherited keys like "toString".
  return Object.hasOwn(podProducts, id) ? podProducts[id] : undefined
}

export function isPrintOnDemand(id: string): boolean {
  return getPodProduct(id) !== undefined
}
