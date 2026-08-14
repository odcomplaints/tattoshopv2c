import { Layout } from '../components/Layout'

export function ImprintPage() {
  return (
    <Layout title="Legal Notice | OD COMPLAINTS" description="Legal notice for OD COMPLAINTS, GD.">
      <article className="max-w-2xl text-left">
        <p className="text-xs uppercase tracking-widest text-neutral-300">Legal</p>
        <h1 className="mt-3 text-3xl font-medium uppercase tracking-widest text-neutral-100">Legal notice</h1>
        <div className="mt-8 space-y-7 text-sm leading-7 text-neutral-400">
          <section>
            <h2 className="text-xs uppercase tracking-widest text-neutral-200">Information pursuant to Section 5 TMG</h2>
            <p className="mt-2">OD COMPLAINTS<br />Sample Street 12<br />GD<br />Germany</p>
          </section>
          <section>
            <h2 className="text-xs uppercase tracking-widest text-neutral-200">Contact</h2>
            <p className="mt-2">Email: hello@example.com<br />Phone: +49 30 00000000</p>
          </section>
          <section>
            <h2 className="text-xs uppercase tracking-widest text-neutral-200">VAT identification number</h2>
            <p className="mt-2">
              VAT ID pursuant to Section 27a of the German VAT Act (UStG): [Placeholder — insert VAT ID, or state
              that small business regulation under Section 19 UStG applies and no VAT is charged].
            </p>
          </section>
          <section>
            <h2 className="text-xs uppercase tracking-widest text-neutral-200">Responsible for content</h2>
            <p className="mt-2">
              Pursuant to Section 18(2) MStV: [Placeholder — name of the responsible natural person], Sample Street
              12, GD.
            </p>
          </section>
          <section>
            <h2 className="text-xs uppercase tracking-widest text-neutral-200">Dispute resolution</h2>
            <p className="mt-2">
              We are not willing and not obliged to participate in dispute resolution proceedings before a consumer
              arbitration board (Verbraucherschlichtungsstelle) pursuant to the German Consumer Dispute Resolution
              Act (VSBG).
            </p>
          </section>
          <section>
            <h2 className="text-xs uppercase tracking-widest text-neutral-200">Liability for content</h2>
            <p className="mt-2">
              As a service provider, we are responsible for our own content on these pages under general law
              pursuant to Section 7(1) TMG/DDG. We are not obliged to monitor transmitted or stored third-party
              information or to investigate circumstances indicating unlawful activity. Obligations to remove or
              block the use of information under general law remain unaffected.
            </p>
          </section>
          <section>
            <h2 className="text-xs uppercase tracking-widest text-neutral-200">Liability for links</h2>
            <p className="mt-2">
              Our site may contain links to external third-party websites over whose content we have no influence.
              We therefore cannot accept any liability for this third-party content. The respective provider or
              operator of the linked pages is always responsible for their content.
            </p>
          </section>
          <section>
            <h2 className="text-xs uppercase tracking-widest text-neutral-200">Copyright</h2>
            <p className="mt-2">
              Content and works on these pages created by the site operator are subject to German copyright law.
              Reproduction, editing, distribution and any kind of use beyond the scope of copyright law require the
              written consent of the respective author or creator.
            </p>
          </section>
          <p>This is a placeholder legal notice and must be completed with the actual details, reviewed by a qualified professional, and finalised before publication.</p>
        </div>
      </article>
    </Layout>
  )
}