import type { CartItem } from '../context/ShopContext'

// Ask the backend to create a Stripe Checkout Session for the current cart and
// redirect the browser to Stripe's hosted checkout page.
export async function startCheckout(cart: CartItem[]): Promise<void> {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: cart.map(({ id, quantity }) => ({ id, quantity })) }),
  })

  let data: { url?: string; error?: string } = {}
  try {
    data = (await response.json()) as { url?: string; error?: string }
  } catch {
    // fall through to the generic error below
  }

  if (!response.ok || !data.url) {
    throw new Error(data.error || 'Checkout could not be started. Please try again.')
  }

  window.location.href = data.url
}
