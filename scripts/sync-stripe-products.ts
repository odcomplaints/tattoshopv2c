// One-off / re-runnable script: syncs every item in `src/data/shop.ts` to your
// Stripe product catalog (Products + Prices). Safe to re-run — it looks up
// existing products by metadata.shop_id before creating new ones, and archives
// the previous price when the euro amount has changed (Stripe prices are
// immutable, so a "price change" means creating a new Price object).
//
// Usage:
//   STRIPE_SECRET_KEY=sk_live_xxx npx tsx scripts/sync-stripe-products.ts
//
// Add --dry-run to only print what would happen, without calling Stripe:
//   STRIPE_SECRET_KEY=sk_live_xxx npx tsx scripts/sync-stripe-products.ts --dry-run

import Stripe from 'stripe'
import { shopItems } from '../src/data/shop'

const secretKey = process.env.STRIPE_SECRET_KEY
const dryRun = process.argv.includes('--dry-run')

if (!secretKey) {
  console.error('Missing STRIPE_SECRET_KEY environment variable.')
  console.error('Run like: STRIPE_SECRET_KEY=sk_live_xxx npx tsx scripts/sync-stripe-products.ts')
  process.exit(1)
}

const stripe = new Stripe(secretKey)

// Parses "180 EUR" -> { amount: 18000, currency: 'eur' } (Stripe wants the
// smallest currency unit, i.e. cents).
function parsePrice(price: string): { amount: number; currency: string } {
  const match = price.trim().match(/^([\d.,]+)\s*([A-Za-z]+)$/)
  if (!match) throw new Error(`Could not parse price "${price}"`)
  const numeric = Number(match[1].replace(',', '.'))
  const currency = match[2].toLowerCase()
  return { amount: Math.round(numeric * 100), currency }
}

function absoluteImageUrl(image: string): string | undefined {
  const base = process.env.SITE_BASE_URL
  if (!base) return undefined
  return new URL(image, base).toString()
}

async function findExistingProductByShopId(shopId: string): Promise<Stripe.Product | undefined> {
  // Stripe doesn't support querying by metadata directly via list(), so we
  // search using the Search API (requires no special activation for Products).
  const result = await stripe.products.search({
    query: `metadata['shop_id']:'${shopId}'`,
    limit: 1,
  })
  return result.data[0]
}

async function syncItem(item: (typeof shopItems)[number]) {
  const { amount, currency } = parsePrice(item.price)
  const imageUrl = absoluteImageUrl(item.image)

  console.log(`\n→ ${item.name} (${item.id}) — ${amount / 100} ${currency.toUpperCase()}`)

  if (dryRun) {
    console.log('  [dry-run] would create/update product + price')
    return
  }

  let product = await findExistingProductByShopId(item.id)

  if (product) {
    product = await stripe.products.update(product.id, {
      name: item.name,
      description: item.description,
      images: imageUrl ? [imageUrl] : undefined,
      active: item.availability === 'available' && item.stock > 0,
      metadata: {
        shop_id: item.id,
        category: item.category,
        stock: String(item.stock),
      },
    })
    console.log(`  Updated product ${product.id}`)
  } else {
    product = await stripe.products.create({
      name: item.name,
      description: item.description,
      images: imageUrl ? [imageUrl] : undefined,
      active: item.availability === 'available' && item.stock > 0,
      metadata: {
        shop_id: item.id,
        category: item.category,
        stock: String(item.stock),
      },
    })
    console.log(`  Created product ${product.id}`)
  }

  // Check whether the current default price already matches; if so, skip.
  const existingPrices = await stripe.prices.list({ product: product.id, active: true, limit: 10 })
  const matchingPrice = existingPrices.data.find(
    (p) => p.unit_amount === amount && p.currency === currency,
  )

  if (matchingPrice) {
    if (product.default_price !== matchingPrice.id) {
      await stripe.products.update(product.id, { default_price: matchingPrice.id })
    }
    console.log(`  Price already up to date (${matchingPrice.id})`)
    return
  }

  // Create the new price and set it as the product's default first — Stripe
  // refuses to archive a price while it is still the product's default_price.
  // Only after the new default is in place can we safely archive the old ones.
  const newPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: amount,
    currency,
  })
  await stripe.products.update(product.id, { default_price: newPrice.id })

  for (const oldPrice of existingPrices.data) {
    if (oldPrice.id === newPrice.id) continue
    await stripe.prices.update(oldPrice.id, { active: false })
  }

  console.log(`  Created new price ${newPrice.id}`)
}

async function main() {
  console.log(`Syncing ${shopItems.length} items to Stripe${dryRun ? ' (dry run)' : ''}...`)
  for (const item of shopItems) {
    try {
      await syncItem(item)
    } catch (error) {
      console.error(`  ✗ Failed for ${item.id}:`, error instanceof Error ? error.message : error)
    }
  }
  console.log('\nDone.')
}

main()
