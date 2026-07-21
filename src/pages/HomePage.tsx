import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { WorkGrid } from '../components/WorkGrid'
import { newestWork } from '../data/work'

export function HomePage() {
  return (
    <Layout>
      <section className="flex min-h-[48svh] max-w-3xl flex-col justify-center border-b border-neutral-800 pb-14">
        <p className="text-xs uppercase tracking-widest text-neutral-500">Tattoo Artist / Berlin</p>
        <h1 className="mt-5 text-5xl font-semibold uppercase leading-[0.95] tracking-wide text-neutral-100 sm:text-7xl">Mara Kern</h1>
        <p className="mt-7 max-w-xl text-sm leading-7 text-neutral-400">Blackwork, Fineline und botanische Motive. Individuelle Tattoos, ruhig entwickelt und präzise umgesetzt.</p>
        <Link to="/booking" className="mt-9 w-fit border border-neutral-200 px-5 py-3 text-xs uppercase tracking-widest text-neutral-100 transition-colors hover:bg-neutral-100 hover:text-neutral-950">Book a Session</Link>
      </section>
      <section className="pt-12 sm:pt-20">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-100">Neueste Arbeiten</h2>
          <Link className="text-xs uppercase tracking-widest text-neutral-500 transition-colors hover:text-neutral-100" to="/work">Alle Arbeiten</Link>
        </div>
        <WorkGrid items={newestWork.slice(0, 6)} />
      </section>
    </Layout>
  )
}