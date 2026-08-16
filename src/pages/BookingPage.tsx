import { Layout } from '../components/Layout'
import { ExpressPay } from '../components/ExpressPay'

const faqs = [
  ['How does an inquiry work?', 'After receiving your inquiry, I review the motif, placement and timeframe. If the project is a fit, I will reply with possible dates.'],
  ['How much is the deposit?', 'The deposit is 50 EUR and secures your appointment. It is credited towards the final price of your tattoo.'],
  ['How should I prepare?', 'Arrive rested, eat beforehand and avoid alcohol the day before. References help, but a finished design is not required.'],
  ['Do you provide aftercare advice?', 'You will receive written aftercare instructions after your appointment. Depending on the placement, sun, swimming and exercise should be avoided during the first weeks.'],
]

const DEPOSIT = '50,00 EUR'

const fieldClass = 'mt-2 w-full border border-neutral-700 bg-neutral-900 px-3 py-3 text-sm text-neutral-100 outline-none transition-colors placeholder:text-neutral-600 focus:border-neutral-200'
const labelClass = 'block text-xs uppercase tracking-widest text-neutral-400'
const sectionTitle = 'text-sm font-medium uppercase tracking-widest text-neutral-100'

export function BookingPage() {
  return (
    <Layout title="Booking | OD COMPLAINTS" description="Secure your tattoo appointment with a deposit at OD COMPLAINTS in GD.">
      <div className="text-left">
        <header className="border-b border-neutral-800 pb-8">
          <p className="text-xs uppercase tracking-widest text-neutral-200">Checkout</p>
          <h1 className="mt-3 text-3xl font-medium uppercase tracking-widest text-neutral-100">Booking</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-400">Secure your appointment with a deposit of {DEPOSIT}. The amount is credited towards the final price of your tattoo.</p>
        </header>

        <div className="grid gap-14 pt-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.6fr)] lg:gap-20">
          {/* Left: checkout form */}
          <div className="grid gap-10">
            {/* Express checkout */}
            <section>
              <h2 className={sectionTitle}>Express Checkout</h2>
              <div className="mt-4 max-w-sm">
                <ExpressPay onPay={() => {}} />
              </div>
              <div className="mt-6 flex items-center gap-4 text-[10px] uppercase tracking-widest text-neutral-600">
                <span className="h-px flex-1 bg-neutral-800" />
                <span>or pay by card</span>
                <span className="h-px flex-1 bg-neutral-800" />
              </div>
            </section>

            <form className="grid gap-10" action="https://formspree.io/f/PLACEHOLDER" method="POST">
              {/* Contact */}
              <section className="grid gap-6">
                <h2 className={sectionTitle}>Contact</h2>
                <label className={labelClass}>Email<input className={fieldClass} name="email" type="email" autoComplete="email" required /></label>
              </section>

              {/* Appointment details */}
              <section className="grid gap-6">
                <h2 className={sectionTitle}>Appointment Details</h2>
                <label className={labelClass}>Name<input className={fieldClass} name="name" autoComplete="name" required /></label>
                <label className={labelClass}>Motif description<textarea className={fieldClass} name="motif" rows={4} required /></label>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className={labelClass}>Placement<input className={fieldClass} name="bodyPart" required /></label>
                  <label className={labelClass}>Size in cm<input className={fieldClass} name="size" inputMode="decimal" placeholder="e.g. 12" required /></label>
                </div>
                <label className={labelClass}>Preferred date<input className={fieldClass} name="date" type="date" /></label>
              </section>

              {/* Billing address */}
              <section className="grid gap-6">
                <h2 className={sectionTitle}>Billing Address</h2>
                <label className={labelClass}>Address<input className={fieldClass} name="address" autoComplete="street-address" required /></label>
                <div className="grid gap-6 sm:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]">
                  <label className={labelClass}>ZIP code<input className={fieldClass} name="zip" autoComplete="postal-code" required /></label>
                  <label className={labelClass}>City<input className={fieldClass} name="city" autoComplete="address-level2" required /></label>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className={labelClass}>Country<input className={fieldClass} name="country" autoComplete="country-name" defaultValue="Germany" required /></label>
                  <label className={labelClass}>Phone<input className={fieldClass} name="phone" type="tel" autoComplete="tel" /></label>
                </div>
              </section>

              {/* Payment (visual mockup) */}
              <section className="grid gap-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className={sectionTitle}>Payment</h2>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-600">Demo · no real charge</span>
                </div>
                {/* Card fields are visual only and are intentionally not submitted (no name attribute). */}
                <label className={labelClass}>Card number<input className={fieldClass} inputMode="numeric" placeholder="4242 4242 4242 4242" autoComplete="off" /></label>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className={labelClass}>Expiry date<input className={fieldClass} placeholder="MM / YY" autoComplete="off" /></label>
                  <label className={labelClass}>CVC<input className={fieldClass} inputMode="numeric" placeholder="123" autoComplete="off" /></label>
                </div>
              </section>

              <button className="w-full border border-accent px-5 py-4 text-xs uppercase tracking-widest transition-colors hover:border-neutral-100 sm:w-fit" type="submit">
                Pay deposit · {DEPOSIT}
              </button>
            </form>
          </div>

          {/* Right: order summary */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="border border-neutral-800 p-6">
              <h2 className={sectionTitle}>Order Summary</h2>
              <div className="mt-6 flex items-start justify-between gap-3 border-b border-neutral-800 pb-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-neutral-200">Tattoo deposit</p>
                  <p className="mt-1 text-xs text-neutral-300">Credited towards the final price</p>
                </div>
                <p className="shrink-0 text-xs uppercase tracking-widest text-neutral-200">{DEPOSIT}</p>
              </div>
              <div className="mt-6 flex items-center justify-between gap-3 text-xs uppercase tracking-widest text-neutral-400">
                <span>Subtotal</span>
                <span>{DEPOSIT}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs uppercase tracking-widest text-neutral-400">
                <span>Shipping</span>
                <span>—</span>
              </div>
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-neutral-800 pt-6 text-sm uppercase tracking-widest text-neutral-100">
                <span>Total</span>
                <span>{DEPOSIT}</span>
              </div>
            </div>
          </aside>
        </div>

        {/* FAQ */}
        <section className="mt-16 border-t border-neutral-800 pt-10">
          <h2 className={sectionTitle}>FAQ</h2>
          <div className="mt-5 max-w-2xl divide-y divide-neutral-800">
            {faqs.map(([question, answer]) => (
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
