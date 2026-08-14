import { Layout } from '../components/Layout'

export function AboutPage() {
  return (
    <Layout title="About | OD COMPLAINTS" description="About OD COMPLAINTS, tattoo artist for blackwork and fineline in GD.">
      <section className="max-w-2xl text-left">
        <p className="text-xs uppercase tracking-widest text-neutral-300">About</p>
        <h1 className="mt-3 text-3xl font-black uppercase tracking-widest text-neutral-100">OD COMPLAINTS</h1>
        <div className="mt-8 space-y-5 text-sm leading-7 text-neutral-400">
          <p>I tattoo in GD, focusing on reduced forms, organic lines and motifs that age well. My work moves between blackwork, fineline and botanical fragments.</p>
          <p>Every project starts with a conversation about placement, idea and movement. References and your thoughts become a design made for you and your chosen placement.</p>
          <p>Appointments take place by arrangement in a quiet studio in GD. You will receive the exact address with your booking confirmation.</p>
        </div>
      </section>
    </Layout>
  )
}