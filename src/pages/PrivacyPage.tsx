import { Layout } from '../components/Layout'

export function PrivacyPage() {
  return (
    <Layout title="Privacy | OD: COMPLAINTS" description="Privacy information for OD: COMPLAINTS.">
      <article className="max-w-2xl text-left">
        <p className="text-xs uppercase tracking-widest text-neutral-500">Legal</p>
        <h1 className="mt-3 text-3xl font-medium uppercase tracking-widest text-neutral-100">Privacy</h1>
        <div className="mt-8 space-y-7 text-sm leading-7 text-neutral-400">
          <section><h2 className="text-xs uppercase tracking-widest text-neutral-200">Controller</h2><p className="mt-2">OD: COMPLAINTS, Sample Street 12, GD, hello@example.com</p></section>
          <section><h2 className="text-xs uppercase tracking-widest text-neutral-200">Inquiries</h2><p className="mt-2">When you send an inquiry through the form, your submitted data is processed to respond to your request. Form submissions are handled by Formspree.</p></section>
          <section><h2 className="text-xs uppercase tracking-widest text-neutral-200">Your rights</h2><p className="mt-2">Under the GDPR, you have the right to access, rectification, erasure, restriction of processing and data portability. You may also lodge a complaint with a data-protection supervisory authority.</p></section>
          <p>This privacy notice is a placeholder and must be legally reviewed and adapted to the services actually used before publication.</p>
        </div>
      </article>
    </Layout>
  )
}