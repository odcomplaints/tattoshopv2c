import { getPodProduct } from '../data/printOnDemand'
import { shopItems } from '../data/shop'

/** Unique key of a cart line — the same POD product in two sizes is two lines. */
export function cartKey(entry: { id: string; size?: string }): string {
  return entry.size ? `${entry.id}::${entry.size}` : entry.id
}

/** Max quantity per cart line: POD items are printed to order, others are limited by stock. */
export function maxCartQuantity(id: string): number {
  const pod = getPodProduct(id)
  if (pod) return pod.maxQuantity
  return shopItems.find((item) => item.id === id)?.stock ?? 1
}
