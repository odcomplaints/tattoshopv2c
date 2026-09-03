import { Layout } from '../components/Layout'
import { ExpressPay } from '../components/ExpressPay'
import { GlobeIcon } from '../components/icons'
import { useLanguage } from '../context/LanguageContext'

const DEPOSIT = '50,00 EUR'
const DEPOSIT_PAYMENT_LINK = 'https://buy.stripe.com/6oU6oI5LCadqeOZ0Nz6c000'

const fieldClass = 'mt-2 w-full border border-neutral-700 bg-neutral-900 px-3 py-3 text-sm text-neutral-100 outline-none transition-colors placeholder:text-neutral-600 focus:border-neutral-200'
const labelClass = 'block text-xs uppercase tracking-widest text-neutral-400'
const sectionTitle = 'text-sm font-medium uppercase tracking-widest text-neutral-100'

export function BookingPage() {
  const { language, toggleLanguage, t } = useLanguage()
  const b = t.booking

  return (
    <Layout
      title="Booking | OD COMPLAINTS"
      description="Secure your tattoo appointment with a deposit at OD COMPLAINTS in GD."
      headerExtra={
        <button
          type="button"
          onClick={toggleLanguage}
          aria-label={language === 'en' ? 'Auf Deutsch umschalten' : 'Switch to English'}
          className="lang-toggle mr-[70px] flex h-9 w-9 items-center justify-center transition-colors sm:mr-[86px] lg:mr-[116px]"
        >
          <GlobeIcon />
        </button>
      }
    >
      <div className="text-left">
        <header className="border-b border-neutral-800 pb-8">
          <p className="text-xs uppercase tracking-widest text-neutral-200">{b.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-medium uppercase tracking-widest text-neutral-100">{b.title}</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-400">{b.intro.replace('{deposit}', DEPOSIT)}</p>
        </header>

        <div className="grid gap-14 pt-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.6fr)] lg:gap-20">
          {/* Left: checkout form */}
          <div className="grid gap-10">
            {/* Express checkout */}
            <section>
              <h2 className={sectionTitle}>{b.expressCheckout}</h2>
              <div className="mt-4 max-w-sm">
                <ExpressPay onPay={() => { window.location.href = DEPOSIT_PAYMENT_LINK }} />
              </div>
              <div className="mt-6 flex items-center gap-4 text-[10px] uppercase tracking-widest text-neutral-600">
                <span className="h-px flex-1 bg-neutral-800" />
                <span>{b.orPayByCard}</span>
                <span className="h-px flex-1 bg-neutral-800" />
              </div>
            </section>

            <form className="grid gap-10" action="https://formspree.io/f/PLACEHOLDER" method="POST">
              {/* Contact */}
              <section className="grid gap-6">
                <h2 className={sectionTitle}>{b.contact}</h2>
                <label className={labelClass}>{b.email}<input className={fieldClass} name="email" type="email" autoComplete="email" required /></label>
              </section>

              {/* Appointment details */}
              <section className="grid gap-6">
                <h2 className={sectionTitle}>{b.appointmentDetails}</h2>
                <label className={labelClass}>{b.name}<input className={fieldClass} name="name" autoComplete="name" required /></label>
                <label className={labelClass}>{b.motif}<textarea className={fieldClass} name="motif" rows={4} required /></label>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className={labelClass}>{b.placement}<input className={fieldClass} name="bodyPart" required /></label>
                  <label className={labelClass}>{b.size}<input className={fieldClass} name="size" inputMode="decimal" placeholder={b.sizePlaceholder} required /></label>
                </div>
                <label className={labelClass}>{b.preferredDate}<input className={fieldClass} name="date" type="date" /></label>
              </section>

              {/* Billing address */}
              <section className="grid gap-6">
                <h2 className={sectionTitle}>{b.billingAddress}</h2>
                <label className={labelClass}>{b.address}<input className={fieldClass} name="address" autoComplete="street-address" required /></label>
                <div className="grid gap-6 sm:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]">
                  <label className={labelClass}>{b.zip}<input className={fieldClass} name="zip" autoComplete="postal-code" required /></label>
                  <label className={labelClass}>{b.city}<input className={fieldClass} name="city" autoComplete="address-level2" required /></label>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className={labelClass}>{b.country}<input className={fieldClass} name="country" autoComplete="country-name" defaultValue="Germany" required /></label>
                  <label className={labelClass}>{b.phone}<input className={fieldClass} name="phone" type="tel" autoComplete="tel" /></label>
                </div>
              </section>

              <button
                type="button"
                onClick={() => { window.location.href = DEPOSIT_PAYMENT_LINK }}
                className="w-full border border-accent px-5 py-4 text-xs uppercase tracking-widest transition-colors hover:border-neutral-100 sm:w-fit"
              >
                {b.payDeposit} · {DEPOSIT}
              </button>
            </form>
          </div>
          {/* Right: order summary */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="border border-neutral-800 p-6">
              <h2 className={sectionTitle}>{b.orderSummary}</h2>
              <div className="mt-6 flex items-start justify-between gap-3 border-b border-neutral-800 pb-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-neutral-200">{b.tattooDeposit}</p>
                  <p className="mt-1 text-xs text-neutral-300">{b.creditedNote}</p>
                </div>
                <p className="shrink-0 text-xs uppercase tracking-widest text-neutral-200">{DEPOSIT}</p>
              </div>
              <div className="mt-6 flex items-center justify-between gap-3 text-xs uppercase tracking-widest text-neutral-400">
                <span>{b.subtotal}</span>
                <span>{DEPOSIT}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs uppercase tracking-widest text-neutral-400">
                <span>{b.shipping}</span>
                <span>—</span>
              </div>
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-neutral-800 pt-6 text-sm uppercase tracking-widest text-neutral-100">
                <span>{b.total}</span>
                <span>{DEPOSIT}</span>
              </div>
            </div>
          </aside>
        </div>

        {/* FAQ */}
        <section className="mt-16 border-t border-neutral-800 pt-10">
          <h2 className={sectionTitle}>{b.faqTitle}</h2>
          <div className="mt-5 max-w-2xl divide-y divide-neutral-800">
            {b.faqs.map(([question, answer]) => (
              <details key={question} className="py-4">
                <summary className="cursor-pointer text-xs uppercase tracking-widest text-neutral-300">{question}</summary>
                <p className="mt-3 text-sm leading-6 text-neutral-300">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}
