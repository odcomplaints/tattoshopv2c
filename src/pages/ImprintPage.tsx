import { Layout } from '../components/Layout'

export function ImprintPage() {
  return (
    <Layout title="Impressum | Mara Kern Tattoo" description="Impressum von Mara Kern Tattoo, Berlin.">
      <article className="max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-neutral-500">Rechtliches</p>
        <h1 className="mt-3 text-3xl font-medium uppercase tracking-widest text-neutral-100">Impressum</h1>
        <div className="mt-8 space-y-7 text-sm leading-7 text-neutral-400">
          <section><h2 className="text-xs uppercase tracking-widest text-neutral-200">Angaben gemäß § 5 TMG</h2><p className="mt-2">Mara Kern Tattoo<br />Musterstraße 12<br />10999 Berlin<br />Deutschland</p></section>
          <section><h2 className="text-xs uppercase tracking-widest text-neutral-200">Kontakt</h2><p className="mt-2">E-Mail: hello@example.com<br />Telefon: +49 30 00000000</p></section>
          <section><h2 className="text-xs uppercase tracking-widest text-neutral-200">Verantwortlich für Inhalte</h2><p className="mt-2">Mara Kern, Musterstraße 12, 10999 Berlin</p></section>
          <p>Dies ist ein Platzhalter-Impressum und muss vor der Veröffentlichung mit den tatsächlichen Angaben ergänzt werden.</p>
        </div>
      </article>
    </Layout>
  )
}