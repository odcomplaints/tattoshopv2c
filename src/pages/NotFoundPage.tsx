import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'

export function NotFoundPage() {
  return (
    <Layout title="Page not found | OD: COMPLAINTS" description="The requested page could not be found.">
      <section className="flex min-h-[45svh] max-w-xl flex-col justify-center text-left">
        <p className="text-xs uppercase tracking-widest text-neutral-500">404</p>
        <h1 className="mt-3 text-3xl font-medium uppercase tracking-widest text-neutral-100">Not found</h1>
        <p className="mt-5 text-sm text-neutral-400">This page does not exist or has been moved.</p>
        <Link className="button-label mt-8 w-fit border border-accent px-5 py-3 text-xs uppercase tracking-widest transition-colors hover:border-neutral-100" to="/">Back to home</Link>
      </section>
    </Layout>
  )
}