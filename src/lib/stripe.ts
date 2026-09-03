import { loadStripe } from '@stripe/stripe-js'
import type { Stripe } from '@stripe/stripe-js'

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined

if (!publishableKey) {
  // eslint-disable-next-line no-console
  console.warn('VITE_STRIPE_PUBLISHABLE_KEY is not set. Stripe features will be disabled.')
}

let stripePromise: Promise<Stripe | null> | undefined

// Lazily loads and caches a single Stripe.js instance for the whole app.
// Call this wherever you need access to Stripe on the client, e.g. before
// redirecting to Checkout or mounting Stripe Elements.
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null)
  }
  return stripePromise
}
