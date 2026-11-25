import type { CartItem } from '../context/ShopContext'

type CheckoutOptions = {
  /** Buyer accepted immediate delivery of digital templates (required when the cart contains one). */
  claimConsent?: boolean
  language?: 'de' | 'en'
}

// Remembers the last open session so a buyer who comes back from Stripe's page can start over
// without being locked out of an exclusive template by their own unfinished checkout.
const PENDING_SESSION_KEY = 'od-complaints-pending-session'

function readPendingSession(): string | undefined {
  try {
    return window.sessionStorage.getItem(PENDING_SESSION_KEY) ?? undefined
  } catch {
    return undefined
  }
}

// Ask the backend to create a Stripe Checkout Session for the current cart and
// redirect the browser to Stripe's hosted checkout page.
export async function startCheckout(cart: CartItem[], options: CheckoutOptions = {}): Promise<void> {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: cart.map(({ id, quantity, size }) => ({ id, quantity, size })),
      claimConsent: options.claimConsent === true,
      language: options.language,
      previousSessionId: readPendingSession(),
    }),
  })

  let data: { id?: string; url?: string; error?: string } = {}
  try {
    data = (await response.json()) as typeof data
  } catch {
    // fall through to the generic error below
  }

  if (!response.ok || !data.url) {
    throw new Error(data.error || 'Checkout could not be started. Please try again.')
  }

  try {
    if (data.id) window.sessionStorage.setItem(PENDING_SESSION_KEY, data.id)
  } catch {
    // storage unavailable: the lock simply expires with the session
  }
  window.location.href = data.url
}
