import { Layout } from '../components/Layout'

export function ImprintPage() {
  return (
    <Layout title="Legal Notice | OD: COMPLAINTS" description="Legal notice for OD: COMPLAINTS, GD.">
      <article className="max-w-2xl text-left">
        <p className="text-xs uppercase tracking-widest text-neutral-500">Legal</p>
        <h1 className="mt-3 text-3xl font-medium uppercase tracking-widest text-neutral-100">Legal notice</h1>
        <div className="mt-8 space-y-7 text-sm leading-7 text-neutral-400">
          <section><h2 className="text-xs uppercase tracking-widest text-neutral-200">Information pursuant to Section 5 TMG</h2><p className="mt-2">OD: COMPLAINTS<br />Sample Street 12<br />GD<br />Germany</p></section>
          <section><h2 className="text-xs uppercase tracking-widest text-neutral-200">Contact</h2><p className="mt-2">Email: hello@example.com<br />Phone: +49 30 00000000</p></section>
          <section><h2 className="text-xs uppercase tracking-widest text-neutral-200">Responsible for content</h2><p className="mt-2">OD: COMPLAINTS, Sample Street 12, GD</p></section>
          <p>This is a placeholder legal notice and must be completed with the actual details before publication.</p>
        </div>
      </article>
    </Layout>
  )
}