import { Layout } from '../components/Layout'

export function PrivacyPage() {
  return (
    <Layout title="Datenschutz | Mara Kern Tattoo" description="Datenschutzhinweise von Mara Kern Tattoo.">
      <article className="max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-neutral-500">Rechtliches</p>
        <h1 className="mt-3 text-3xl font-medium uppercase tracking-widest text-neutral-100">Datenschutz</h1>
        <div className="mt-8 space-y-7 text-sm leading-7 text-neutral-400">
          <section><h2 className="text-xs uppercase tracking-widest text-neutral-200">Verantwortliche Stelle</h2><p className="mt-2">Mara Kern Tattoo, Musterstraße 12, 10999 Berlin, hello@example.com</p></section>
          <section><h2 className="text-xs uppercase tracking-widest text-neutral-200">Kontaktanfragen</h2><p className="mt-2">Bei einer Anfrage über das Formular werden die von dir eingegebenen Daten zur Bearbeitung deiner Anfrage verarbeitet. Der Versand erfolgt über Formspree.</p></section>
          <section><h2 className="text-xs uppercase tracking-widest text-neutral-200">Deine Rechte</h2><p className="mt-2">Du hast nach DSGVO insbesondere das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit. Du kannst dich außerdem bei einer Datenschutzaufsichtsbehörde beschweren.</p></section>
          <p>Diese Datenschutzerklärung ist ein Platzhalter und muss vor Veröffentlichung rechtlich geprüft und an die tatsächlich eingesetzten Dienste angepasst werden.</p>
        </div>
      </article>
    </Layout>
  )
}