import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ExpressPay } from '../components/ExpressPay'
import { useLanguage } from '../context/LanguageContext'
import { useShop } from '../context/ShopContext'
import { cartKey, maxCartQuantity } from '../lib/cart'
import { claimCopy, formatClaimPrice, getClaimableWork, workIdFromCartId } from '../data/claims'
import { isPrintOnDemand } from '../data/printOnDemand'
import { shopItems } from '../data/shop'
import { startCheckout } from '../lib/checkout'
import { optimizedSrc } from '../lib/image'

function parsePrice(price: string) {
  const match = price.match(/[\d.,]+/)
  return match ? parseFloat(match[0].replace(',', '.')) : 0
}

type CartLineView = {
  key: string
  id: string
  size: string | undefined
  quantity: number
  name: string
  priceLabel: string
  unitPrice: number
  image: string
  category: string
  href: string
  soldOut: boolean
  /** Digital tattoo template (`claim:<workId>`). */
  claim: boolean
}

export function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartCount, isSoldOut } = useShop()
  const { language } = useLanguage()
  const copy = claimCopy[language]
  const [searchParams] = useSearchParams()
  const canceled = searchParams.get('canceled') === '1'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [claimConsent, setClaimConsent] = useState(false)

  const items = cart
    .map((entry): CartLineView | null => {
      const workId = workIdFromCartId(entry.id)
      if (workId !== null) {
        const piece = getClaimableWork(workId)
        if (!piece) return null
        return {
          key: cartKey(entry),
          id: entry.id,
          size: undefined,
          quantity: 1,
          name: piece.title,
          priceLabel: formatClaimPrice(piece.claim.priceCents),
          unitPrice: piece.claim.priceCents / 100,
          image: piece.image,
          category: copy.cart.label,
          href: `/work/${piece.id}`,
          soldOut: isSoldOut(entry.id),
          claim: true,
        }
      }
      const product = shopItems.find((shopItem) => shopItem.id === entry.id)
      if (!product) return null
      return {
        key: cartKey(entry),
        id: entry.id,
        size: entry.size,
        quantity: entry.quantity,
        name: product.name,
        priceLabel: product.price,
        unitPrice: parsePrice(product.price),
        image: product.image,
        category: product.category,
        href: `/shop/${entry.id}`,
        soldOut: product.availability === 'sold-out' || isSoldOut(product.id),
        claim: false,
      }
    })
    .filter((entry): entry is CartLineView => entry !== null)

  const subtotal = items.reduce((total, entry) => total + entry.unitPrice * entry.quantity, 0)
  const hasSoldOutItem = items.some((entry) => entry.soldOut)
  const hasClaim = items.some((entry) => entry.claim)
  const onlyClaims = hasClaim && items.every((entry) => entry.claim)
  // A POD line without a size (e.g. from an old saved cart) can't be printed.
  const hasPodWithoutSize = items.some((entry) => isPrintOnDemand(entry.id) && !entry.size)
  const consentMissing = hasClaim && !claimConsent
  const checkoutBlocked = hasSoldOutItem || hasPodWithoutSize || consentMissing

  async function handleCheckout() {
    setError(null)
    if (consentMissing) {
      setError(copy.cart.consentRequired)
      return
    }
    setLoading(true)
    try {
      await startCheckout(cart, { claimConsent, language })
      // On success the browser is redirected to Stripe, so no further state
      // update is needed here.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout could not be started. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Layout title="Cart | OD COMPLAINTS" description="Your shopping cart at OD COMPLAINTS.">
      <div className="text-left">
        <Link to="/shop" className="inline-block text-xs uppercase tracking-widest text-neutral-400 hover:text-accent">
          &larr; Shop
        </Link>
        <h1 className="mt-6 text-3xl font-medium uppercase tracking-widest text-neutral-100">Cart</h1>

        {canceled && items.length > 0 && (
          <p className="mt-6 border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-xs uppercase tracking-widest text-neutral-300">
            Checkout canceled — your cart is still here.
          </p>
        )}

        {items.length === 0 ? (
          <p className="mt-8 text-sm leading-7 text-neutral-400">
            Your cart is empty.{' '}
            <Link to="/shop" className="text-accent hover:underline">
              Browse the shop
            </Link>
            .
          </p>
        ) : (
          <div className="mt-8 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
            <ul className="flex flex-col gap-6">
              {items.map(({ key, id, size, quantity, name, priceLabel, image, category, href, soldOut, claim }) => {
                const pod = isPrintOnDemand(id)
                return (
                <li key={key} className="flex gap-4 border-b border-neutral-800 pb-6">
                  <Link to={href} className="h-24 w-20 shrink-0 overflow-hidden">
                    <img src={optimizedSrc(image, 200)} alt={name} loading="lazy" decoding="async" className={`h-full w-full object-contain ${soldOut ? 'blur-[2px]' : ''}`} />
                  </Link>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-baseline justify-between gap-3 text-xs uppercase tracking-widest">
                      <Link to={href} className="font-medium text-neutral-100 hover:text-accent">
                        {name}
                      </Link>
                      <p className="shrink-0 text-neutral-400">{priceLabel}</p>
                    </div>
                    <p className="text-xs text-neutral-300">{category}</p>
                    {claim && <p className="text-xs uppercase tracking-widest text-neutral-400">{copy.cart.noShipping}</p>}
                    {pod && (
                      <p className="text-xs uppercase tracking-widest text-neutral-400">
                        Print on Demand{size ? ` · Größe ${size}` : ''}
                      </p>
                    )}
                    {soldOut && (
                      <p className="text-xs uppercase tracking-widest text-accent">
                        {claim
                          ? copy.cart.unavailable
                          : 'Dieser Artikel ist leider ausverkauft — bitte entferne ihn, um fortzufahren.'}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-3 text-xs uppercase tracking-widest">
                      {!claim && (
                      <div className="flex items-center border border-neutral-800">
                        <button
                          type="button"
                          onClick={() => updateQuantity(key, quantity - 1)}
                          className="px-2.5 py-1 text-neutral-300 hover:text-accent"
                          aria-label={`Decrease quantity of ${name}`}
                        >
                          &minus;
                        </button>
                        <span className="px-2 text-neutral-100">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(key, quantity + 1)}
                          disabled={soldOut || quantity >= maxCartQuantity(id)}
                          className="px-2.5 py-1 text-neutral-300 transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-neutral-300"
                          aria-label={`Increase quantity of ${name}`}
                        >
                          +
                        </button>
                      </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFromCart(key)}
                        className="text-neutral-400 transition-colors hover:text-accent"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
                )
              })}
            </ul>

            <div className="flex flex-col gap-6 border-t border-neutral-800 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest">
                <p className="text-neutral-300">
                  Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})
                </p>
                <p className="text-neutral-100">{subtotal.toFixed(2)} EUR</p>
              </div>
              <p className="text-xs leading-6 text-neutral-400">
                {onlyClaims ? copy.cart.noShipping : 'Shipping and taxes are calculated at checkout.'}
              </p>
              {hasClaim && (
                <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-neutral-400">
                  <input
                    type="checkbox"
                    checked={claimConsent}
                    onChange={(event) => setClaimConsent(event.target.checked)}
                    className="mt-1 h-3.5 w-3.5 shrink-0 accent-accent"
                  />
                  <span>{copy.consent}</span>
                </label>
              )}
              {error && (
                <p className="border border-accent bg-neutral-900/40 px-4 py-3 text-xs uppercase tracking-widest text-accent">
                  {error}
                </p>
              )}
              {hasSoldOutItem && (
                <p className="border border-accent bg-neutral-900/40 px-4 py-3 text-xs uppercase tracking-widest text-accent">
                  Bitte entferne die ausverkauften Artikel aus deinem Warenkorb, um fortzufahren.
                </p>
              )}
              {hasPodWithoutSize && (
                <p className="border border-accent bg-neutral-900/40 px-4 py-3 text-xs uppercase tracking-widest text-accent">
                  Bitte entferne Print-on-Demand-Artikel ohne Größe und lege sie mit Größe neu in den Warenkorb.
                </p>
              )}
              <ExpressPay onPay={handleCheckout} loading={loading || checkoutBlocked} />
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading || checkoutBlocked}
                className="w-full border border-accent px-5 py-3.5 text-xs uppercase tracking-widest text-neutral-100 transition-colors hover:border-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Redirecting…' : 'Pay by card'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
