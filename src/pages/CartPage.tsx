import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ExpressPay } from '../components/ExpressPay'
import { useShop } from '../context/ShopContext'
import { shopItems } from '../data/shop'
import type { ShopItem } from '../data/shop'

function parsePrice(price: string) {
  const match = price.match(/[\d.,]+/)
  return match ? parseFloat(match[0].replace(',', '.')) : 0
}

export function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartCount } = useShop()
  const [searchParams] = useSearchParams()
  const canceled = searchParams.get('canceled') === '1'
  const [_loading, _setLoading] = useState(false);
const [_error, _setError] = useState<string | null>(null);
  

  const items = cart
    .map((entry) => {
      const product = shopItems.find((shopItem) => shopItem.id === entry.id)
      return product ? { id: entry.id, quantity: entry.quantity, product } : null
    })
    .filter((entry): entry is { id: string; quantity: number; product: ShopItem } => entry !== null)

  const subtotal = items.reduce((total, entry) => total + parsePrice(entry.product.price) * entry.quantity, 0)

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
              {items.map(({ id, quantity, product }) => (
                <li key={id} className="flex gap-4 border-b border-neutral-800 pb-6">
                  <Link to={`/shop/${id}`} className="h-24 w-20 shrink-0 overflow-hidden bg-neutral-900">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-baseline justify-between gap-3 text-xs uppercase tracking-widest">
                      <Link to={`/shop/${id}`} className="font-medium text-neutral-100 hover:text-accent">
                        {product.name}
                      </Link>
                      <p className="shrink-0 text-neutral-400">{product.price}</p>
                    </div>
                    <p className="text-xs text-neutral-300">{product.category}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs uppercase tracking-widest">
                      <div className="flex items-center border border-neutral-800">
                        <button
                          type="button"
                          onClick={() => updateQuantity(id, quantity - 1)}
                          className="px-2.5 py-1 text-neutral-300 hover:text-accent"
                          aria-label={`Decrease quantity of ${product.name}`}
                        >
                          &minus;
                        </button>
                        <span className="px-2 text-neutral-100">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(id, quantity + 1)}
                          className="px-2.5 py-1 text-neutral-300 hover:text-accent"
                          aria-label={`Increase quantity of ${product.name}`}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(id)}
                        className="text-neutral-400 transition-colors hover:text-accent"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-6 border-t border-neutral-800 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest">
                <p className="text-neutral-300">
                  Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})
                </p>
                <p className="text-neutral-100">{subtotal.toFixed(2)} EUR</p>
              </div>
              <p className="text-xs leading-6 text-neutral-400">
                Shipping and taxes are calculated at checkout. Payment is not connected yet — the buttons below are a
                preview.
              </p>
<ExpressPay onPay={() => {}} />            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
