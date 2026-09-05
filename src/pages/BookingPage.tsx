import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
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
  const formRef = useRef<HTMLFormElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Fields that are always required, even for the Apple/Google Pay express
  // buttons: enough to reach the customer and know their preferred date.
  const EXPRESS_REQUIRED_FIELDS = ['email', 'phone', 'date'] as const
  // Additional fields only required when using the full "Pay Deposit" form,
  // where we ask for the tattoo details up front.
  const FULL_ONLY_REQUIRED_FIELDS = ['name', 'motif', 'bodyPart', 'size'] as const

  function validateRequiredFields(form: HTMLFormElement, fieldNames: readonly string[]): boolean {
    let valid = true
    for (const fieldName of fieldNames) {
      const field = form.elements.namedItem(fieldName) as HTMLInputElement | HTMLTextAreaElement | null
      if (!field) continue
      const isEmpty = !field.value.trim()
      field.setCustomValidity(isEmpty ? 'Dieses Feld wird benötigt.' : '')
      if (isEmpty) valid = false
    }
    // reportValidity() shows the browser's native validation bubble on the
    // first invalid field (including any HTML5 `required`/type checks) and
    // returns false if anything is invalid.
    const reported = form.reportValidity()
    return valid && reported
  }

  // Shared by the form's own submit button and the Apple/Google Pay express
  // buttons: validates the relevant fields first, then sends them to the
  // booking notification endpoint, and only proceeds to payment on success.
  async function submitBookingAndPay(form: HTMLFormElement, mode: 'full' | 'express') {
    if (submitting) return

    const requiredFields =
      mode === 'full' ? [...EXPRESS_REQUIRED_FIELDS, ...FULL_ONLY_REQUIRED_FIELDS] : EXPRESS_REQUIRED_FIELDS
    // Clear custom validity on the fields only required for the full form so
    // an earlier express attempt never blocks a later full submit or vice versa.
    for (const fieldName of FULL_ONLY_REQUIRED_FIELDS) {
      const field = form.elements.namedItem(fieldName) as HTMLInputElement | HTMLTextAreaElement | null
      if (field && mode === 'express') field.setCustomValidity('')
    }
    if (!validateRequiredFields(form, requiredFields)) return

    setSubmitting(true)
    setSubmitError(null)

    const formData = new FormData(form)
    const data: Record<string, string> = {}
    formData.forEach((value, key) => {
      data[key] = typeof value === 'string' ? value : ''
    })

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, checkoutType: mode }),
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || 'Could not submit the form.')
      }
      // Only continue to the deposit payment once the booking details were
      // successfully delivered to the studio.
      window.location.href = DEPOSIT_PAYMENT_LINK
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Deine Anfrage konnte nicht gesendet werden. Bitte versuche es erneut.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await submitBookingAndPay(event.currentTarget, 'full')
  }

  async function handleExpressPay() {
    if (formRef.current) {
      await submitBookingAndPay(formRef.current, 'express')
    }
  }

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
              <p className="mt-2 max-w-sm text-xs leading-5 text-neutral-500">{b.expressCheckoutHint}</p>
              <div className="mt-4 max-w-sm">
                <ExpressPay onPay={handleExpressPay} disabled={submitting} loading={submitting} />
              </div>
              <div className="mt-6 flex items-center gap-4 text-[10px] uppercase tracking-widest text-neutral-600">
                <span className="h-px flex-1 bg-neutral-800" />
                <span>{b.orPayByCard}</span>
                <span className="h-px flex-1 bg-neutral-800" />
              </div>
            </section>

            <form ref={formRef} className="grid gap-10" onSubmit={handleSubmit}>
              {/* Contact */}
              <section className="grid gap-6">
                <h2 className={sectionTitle}>{b.contact}</h2>
                <label className={labelClass}>{b.email}<input className={fieldClass} name="email" type="email" autoComplete="email" required /></label>
                <label className={labelClass}>{b.phone}<input className={fieldClass} name="phone" type="tel" autoComplete="tel" required /></label>
              </section>

              {/* Appointment details */}
              <section className="grid gap-6">
                <h2 className={sectionTitle}>{b.appointmentDetails}</h2>
                <p className="-mt-2 text-xs leading-5 text-neutral-500">{b.appointmentDetailsHint}</p>
                <label className={labelClass}>{b.name}<input className={fieldClass} name="name" autoComplete="name" /></label>
                <label className={labelClass}>{b.motif}<textarea className={fieldClass} name="motif" rows={4} /></label>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className={labelClass}>{b.placement}<input className={fieldClass} name="bodyPart" /></label>
                  <label className={labelClass}>{b.size}<input className={fieldClass} name="size" inputMode="decimal" placeholder={b.sizePlaceholder} /></label>
                </div>
                <label className={labelClass}>{b.preferredDate}<input className={fieldClass} name="date" type="date" required /></label>
              </section>

              {submitError && (
                <p className="text-xs uppercase tracking-widest text-accent">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full border border-accent px-5 py-4 text-xs uppercase tracking-widest transition-colors hover:border-neutral-100 disabled:opacity-60 sm:w-fit"
              >
                {submitting ? '…' : `${b.payDeposit} · ${DEPOSIT}`}
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
