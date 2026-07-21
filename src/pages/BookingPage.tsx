import { Layout } from '../components/Layout'

const faqs = [
  ['Wie läuft eine Anfrage ab?', 'Nach deiner Anfrage prüfe ich Motiv, Platzierung und zeitlichen Rahmen. Bei passender Idee melde ich mich mit möglichen Terminen.'],
  ['Wie hoch ist die Anzahlung?', 'Eine Anzahlung sichert deinen Termin. Die genaue Höhe richtet sich nach Aufwand und wird bei der Terminvereinbarung kommuniziert.'],
  ['Wie bereite ich mich vor?', 'Komm ausgeruht, iss vorher etwas und vermeide Alkohol am Vortag. Referenzen helfen, ein fertiges Design ist nicht nötig.'],
  ['Gibt es Hinweise zur Aftercare?', 'Du bekommst nach dem Termin eine schriftliche Pflegeanleitung. In den ersten Wochen sind Sonne, Schwimmen und Sport je nach Stelle zu vermeiden.'],
]

const fieldClass = 'mt-2 w-full border border-neutral-700 bg-neutral-900 px-3 py-3 text-sm text-neutral-100 outline-none transition-colors placeholder:text-neutral-600 focus:border-neutral-200'

export function BookingPage() {
  return (
    <Layout title="Booking | Mara Kern Tattoo" description="Sende eine unverbindliche Tattoo-Anfrage an Mara Kern in Berlin.">
      <div className="grid gap-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:gap-24">
        <section>
          <p className="text-xs uppercase tracking-widest text-neutral-500">Anfrage</p>
          <h1 className="mt-3 text-3xl font-medium uppercase tracking-widest text-neutral-100">Booking</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-400">Erzähl mir kurz von deiner Idee. Je konkreter die Angaben, desto besser kann ich einschätzen, ob und wie sich das Motiv umsetzen lässt.</p>
          <form className="mt-10 grid gap-6" action="https://formspree.io/f/PLACEHOLDER" method="POST">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="text-xs uppercase tracking-widest text-neutral-400">Name<input className={fieldClass} name="name" autoComplete="name" required /></label>
              <label className="text-xs uppercase tracking-widest text-neutral-400">E-Mail<input className={fieldClass} name="email" type="email" autoComplete="email" required /></label>
            </div>
            <label className="text-xs uppercase tracking-widest text-neutral-400">Motiv-Beschreibung<textarea className={fieldClass} name="motif" rows={5} required /></label>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="text-xs uppercase tracking-widest text-neutral-400">Körperstelle<input className={fieldClass} name="bodyPart" required /></label>
              <label className="text-xs uppercase tracking-widest text-neutral-400">Größe in cm<input className={fieldClass} name="size" inputMode="decimal" placeholder="z. B. 12" required /></label>
            </div>
            <label className="text-xs uppercase tracking-widest text-neutral-400">Budget<input className={fieldClass} name="budget" placeholder="z. B. bis 400 EUR" required /></label>
            <label className="text-xs uppercase tracking-widest text-neutral-400">Nachricht<textarea className={fieldClass} name="message" rows={4} /></label>
            <button className="w-fit border border-neutral-200 px-5 py-3 text-xs uppercase tracking-widest text-neutral-100 transition-colors hover:bg-neutral-100 hover:text-neutral-950" type="submit">Anfrage senden</button>
          </form>
        </section>
        <aside className="border-t border-neutral-800 pt-8 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
          <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-100">FAQ</h2>
          <div className="mt-5 divide-y divide-neutral-800">
            {faqs.map(([question, answer]) => <details key={question} className="py-4"><summary className="cursor-pointer text-xs uppercase tracking-widest text-neutral-300">{question}</summary><p className="mt-3 text-sm leading-6 text-neutral-500">{answer}</p></details>)}
          </div>
        </aside>
      </div>
    </Layout>
  )
}