import { Layout } from '../components/Layout'

export function AboutPage() {
  return (
    <Layout title="About | Mara Kern Tattoo" description="Über Mara Kern, Tattoo Artist für Blackwork und Fineline in Berlin.">
      <section className="max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-neutral-500">Über mich</p>
        <h1 className="mt-3 text-3xl font-medium uppercase tracking-widest text-neutral-100">Mara Kern</h1>
        <div className="mt-8 space-y-5 text-sm leading-7 text-neutral-400">
          <p>Ich tätowiere in Berlin mit einem Fokus auf reduzierte Formen, organische Linien und Motive, die langfristig funktionieren. Meine Arbeiten bewegen sich zwischen Blackwork, Fineline und botanischen Fragmenten.</p>
          <p>Jedes Projekt beginnt mit einem Gespräch über Körperstelle, Idee und Bewegung. Aus Referenzen und deinen Gedanken entsteht ein Entwurf, der für dich und die gewählte Stelle entwickelt wird.</p>
          <p>Termine finden nach Vereinbarung in einem ruhigen Studio in Berlin statt. Die genaue Adresse erhältst du mit der Terminbestätigung.</p>
        </div>
      </section>
    </Layout>
  )
}