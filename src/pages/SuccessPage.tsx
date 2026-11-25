import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ClaimDownloads, ClaimSuccess } from '../components/ClaimSuccess'
import { useShop } from '../context/ShopContext'
import { useLanguage } from '../context/LanguageContext'

export function SuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const type = searchParams.get('type') // 'booking' or empty for shop
  const { clearCart } = useShop()
  const { language, toggleLanguage } = useLanguage()

  const isBooking = type === 'booking'
  const isClaim = type === 'claim'
  const hasClaims = searchParams.get('claims') === '1'

  // The payment already succeeded on Stripe's side by the time the customer
  // lands here, so the cart can be safely emptied. Booking deposits never
  // touch the shop cart, so leave it alone in that case.
  useEffect(() => {
    if (!isBooking) clearCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const title = isClaim
    ? 'Claim | OD COMPLAINTS'
    : isBooking ? 'Zahlung erfolgreich | OD COMPLAINTS' : 'Payment successful | OD COMPLAINTS'
  const description = isClaim ? 'Deine Tattoo-Vorlage.' : isBooking ? 'Dein Termin ist reserviert.' : 'Thank you for your order.'

  return (
    <Layout
      title={title}
      description={description}
      headerExtra={
        <button
          type="button"
          onClick={toggleLanguage}
          aria-label={language === 'en' ? 'Auf Deutsch umschalten' : 'Switch to English'}
          className="lang-toggle mr-0 flex h-9 w-9 items-center justify-center transition-colors lg:mr-[116px]"
        >
          🌐
        </button>
      }
    >
      {isClaim ? (
        <ClaimSuccess sessionId={sessionId} />
      ) : (
      <div className="mx-auto flex min-h-[50svh] max-w-md flex-col items-center justify-center text-center">
        <p className="text-xs uppercase tracking-widest text-accent">
          {isBooking ? (language === 'de' ? 'Buchung bestätigt' : 'Booking confirmed') : language === 'de' ? 'Bestellung bestätigt' : 'Order confirmed'}
        </p>
        <h1 className="mt-4 text-3xl font-medium uppercase tracking-widest text-neutral-100">
          {isBooking ? (language === 'de' ? 'Vielen Dank!' : 'Thank you!') : language === 'de' ? 'Vielen Dank!' : 'Thank you'}
        </h1>
        <p className="mt-4 text-sm leading-7 text-neutral-400">
          {isBooking
            ? language === 'de'
              ? 'Dein Termin ist reserviert! Du erhältst in Kürze eine Bestätigungsmail mit allen Details. Wir melden uns innerhalb von 48h bei dir zur Terminfestlegung.'
              : 'Your booking is confirmed! You will receive a confirmation email shortly. We will contact you within 48 hours to confirm your appointment.'
            : language === 'de'
              ? 'Deine Bestellung war erfolgreich. Du erhältst in Kürze eine Bestätigungsmail mit Bestelldetails und Versandinformationen.'
              : 'Your payment was successful. You will receive a confirmation email shortly with your order details and shipping information.'}
        </p>
        {sessionId && (
          <p className="mt-4 text-[10px] uppercase tracking-widest text-neutral-600">
            {isBooking ? (language === 'de' ? 'Referenz' : 'Reference') : language === 'de' ? 'Referenz' : 'Reference'}: {sessionId}
          </p>
        )}
        <Link
          to={isBooking ? '/' : '/shop'}
          className="mt-8 inline-block border border-accent px-6 py-3 text-xs uppercase tracking-widest text-neutral-100 transition-colors hover:border-neutral-100"
        >
          {isBooking ? (language === 'de' ? 'Zurück zur Startseite' : 'Back to home') : language === 'de' ? 'Weiter einkaufen' : 'Continue shopping'}
        </Link>
        {hasClaims && <ClaimDownloads sessionId={sessionId} />}
      </div>
      )}
    </Layout>
  )
}
