import { Layout } from '../components/Layout'
import { WorkGrid } from '../components/WorkGrid'
import { newestWork } from '../data/work'

export function WorkPage() {
  return (
    <Layout title="Work | Mara Kern Tattoo" description="Auswahl aktueller Blackwork-, Fineline- und botanischer Tattoos von Mara Kern.">
      <section>
        <p className="text-xs uppercase tracking-widest text-neutral-500">Archiv</p>
        <h1 className="mt-3 text-3xl font-medium uppercase tracking-widest text-neutral-100">Work</h1>
        <p className="mt-5 max-w-xl text-sm text-neutral-400">Eine Auswahl aktueller Arbeiten, chronologisch sortiert.</p>
      </section>
      <section className="mt-12 sm:mt-16"><WorkGrid items={newestWork} /></section>
    </Layout>
  )
}