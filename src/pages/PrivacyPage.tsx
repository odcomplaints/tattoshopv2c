import { Layout } from '../components/Layout'

export function PrivacyPage() {
  return (
    <Layout title="Privacy | OD COMPLAINTS" description="Privacy information for OD COMPLAINTS.">
      <article className="max-w-2xl text-left">
        <p className="text-xs uppercase tracking-widest text-neutral-300">Legal</p>
        <h1 className="mt-3 text-3xl font-medium uppercase tracking-widest text-neutral-100">Privacy</h1>
        <div className="mt-8 space-y-7 text-sm leading-7 text-neutral-400">
          <section>
            <h2 className="text-xs uppercase tracking-widest text-neutral-200">Controller</h2>
            <p className="mt-2">OD COMPLAINTS, Sample Street 12, GD, hello@example.com</p>
          </section>
          <section>
            <h2 className="text-xs uppercase tracking-widest text-neutral-200">Hosting and server log files</h2>
            <p className="mt-2">
              This website is hosted on Cloudflare Pages. Each time this site is accessed, technical data (such as
              IP address, browser type, referring page and timestamp) is automatically processed by our hosting
              provider in server log files to ensure secure and stable delivery of the site, based on our legitimate
              interest pursuant to Art. 6(1)(f) GDPR. [Placeholder — confirm exact log retention period with hosting
              provider.]
            </p>
          </section>
          <section>
            <h2 className="text-xs uppercase tracking-widest text-neutral-200">Booking and contact inquiries</h2>
            <p className="mt-2">
              When you send an inquiry through the booking or contact form, the data you submit (such as name,
              email address and appointment details) is processed to respond to your request and, where
              applicable, to initiate or perform a contract, pursuant to Art. 6(1)(b) and (f) GDPR. Form submissions
              are technically handled by Formspree, Inc. (USA), acting as a processor on our behalf. As Formspree
              is located outside the EU/EEA, data transfer relies on appropriate safeguards (e.g. EU-U.S. Data
              Privacy Framework or standard contractual clauses). Inquiry data is deleted once it is no longer
              required, unless statutory retention obligations apply.
            </p>
          </section>
          <section>
            <h2 className="text-xs uppercase tracking-widest text-neutral-200">Shop orders and payments</h2>
            <p className="mt-2">
              Where prints are purchased through the shop, order and payment data is processed solely to fulfil
              the purchase contract pursuant to Art. 6(1)(b) GDPR. [Placeholder — to be completed once a payment
              processor, e.g. Stripe, is integrated, including the processor's name, location and applicable
              safeguards for any data transfer outside the EU/EEA.]
            </p>
          </section>
          <section>
            <h2 className="text-xs uppercase tracking-widest text-neutral-200">Cookies</h2>
            <p className="mt-2">
              This website does not currently set any cookies or use any tracking or analytics tools. Should this
              change, this notice will be updated accordingly and, where legally required, your consent will be
              obtained in advance.
            </p>
          </section>
          <section>
            <h2 className="text-xs uppercase tracking-widest text-neutral-200">Recipients and storage duration</h2>
            <p className="mt-2">
              Personal data is only shared with the processors named above (hosting and form provider) to the
              extent necessary and is not sold or passed on to any other third parties. Data is stored only for as
              long as necessary for the purposes described above or as required by statutory retention periods.
            </p>
          </section>
          <section>
            <h2 className="text-xs uppercase tracking-widest text-neutral-200">Your rights</h2>
            <p className="mt-2">
              Under the GDPR, you have the right to access, rectification, erasure, restriction of processing, data
              portability, and to object to processing based on legitimate interest. You may withdraw any consent
              given at any time with future effect. You may also lodge a complaint with a data-protection
              supervisory authority, in particular [Placeholder — name of the competent German state data
              protection authority].
            </p>
          </section>
          <section>
            <h2 className="text-xs uppercase tracking-widest text-neutral-200">Data security</h2>
            <p className="mt-2">
              This site uses TLS/SSL encryption to protect the transmission of confidential content such as
              inquiries you submit to us.
            </p>
          </section>
          <p>
            This privacy notice is a placeholder and must be legally reviewed and adapted to the services actually
            used before publication. Last updated: [Placeholder — date].
          </p>
        </div>
      </article>
    </Layout>
  )
}