import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'

export function NotFoundPage() {
  return (
    <Layout title="Seite nicht gefunden | Mara Kern Tattoo" description="Die angeforderte Seite wurde nicht gefunden.">
      <section className="flex min-h-[45svh] max-w-xl flex-col justify-center">
        <p className="text-xs uppercase tracking-widest text-neutral-500">404</p>
        <h1 className="mt-3 text-3xl font-medium uppercase tracking-widest text-neutral-100">Nicht gefunden</h1>
        <p className="mt-5 text-sm text-neutral-400">Diese Seite existiert nicht oder wurde verschoben.</p>
        <Link className="mt-8 w-fit border border-neutral-200 px-5 py-3 text-xs uppercase tracking-widest text-neutral-100 transition-colors hover:bg-neutral-100 hover:text-neutral-950" to="/">Zur Startseite</Link>
      </section>
    </Layout>
  )
}