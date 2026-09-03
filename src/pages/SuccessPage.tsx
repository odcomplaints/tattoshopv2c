import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useShop } from '../context/ShopContext'

export function SuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clearCart } = useShop()

  // The payment already succeeded on Stripe's side by the time the customer
  // lands here, so the cart can be safely emptied.
  useEffect(() => {
    clearCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Layout title="Payment successful | OD COMPLAINTS" description="Thank you for your order.">
      <div className="mx-auto flex min-h-[50svh] max-w-md flex-col items-center justify-center text-center">
        <p className="text-xs uppercase tracking-widest text-accent">Order confirmed</p>
        <h1 className="mt-4 text-3xl font-medium uppercase tracking-widest text-neutral-100">Thank you</h1>
        <p className="mt-4 text-sm leading-7 text-neutral-400">
          Your payment was successful. You will receive a confirmation email shortly with your order details and
          shipping information.
        </p>
        {sessionId && (
          <p className="mt-4 text-[10px] uppercase tracking-widest text-neutral-600">Reference: {sessionId}</p>
        )}
        <Link
          to="/shop"
          className="mt-8 inline-block border border-accent px-6 py-3 text-xs uppercase tracking-widest text-neutral-100 transition-colors hover:border-neutral-100"
        >
          Continue shopping
        </Link>
      </div>
    </Layout>
  )
}
