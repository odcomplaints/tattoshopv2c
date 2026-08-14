import { Layout } from '../components/Layout'
import { WorkGrid } from '../components/WorkGrid'
import { newestWork } from '../data/work'

export function WorkPage() {
  return (
    <Layout title="Work | OD COMPLAINTS" description="A selection of recent blackwork, fineline and botanical tattoos by OD COMPLAINTS.">
      <section className="max-w-2xl text-left">
        <p className="text-xs uppercase tracking-widest text-neutral-300">Archive</p>
        <h1 className="mt-3 text-3xl font-medium uppercase tracking-widest text-neutral-100">Work</h1>
        <p className="mt-5 max-w-xl text-sm text-neutral-400">A selection of recent work, sorted chronologically.</p>
      </section>
      <section className="mt-12 text-left sm:mt-16"><WorkGrid items={newestWork} /></section>
    </Layout>
  )
}