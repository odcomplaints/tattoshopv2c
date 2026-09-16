import { Link, useParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import DomeGallery from '../components/DomeGallery'
import { getTattooStyle } from '../data/tattooStyles'

export function StyleDetailPage() {
  const { id } = useParams()
  const style = id ? getTattooStyle(id) : undefined

  if (!style) {
    return (
      <Layout title="Not found | OD COMPLAINTS">
        <div className="py-16 text-center">
          <h1 className="text-2xl font-medium uppercase tracking-widest text-neutral-100">Style not found</h1>
          <Link to="/styles" className="mt-6 inline-block text-xs uppercase tracking-widest text-neutral-300 hover:text-accent">
            &larr; Back to styles
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title={`${style.name} | OD COMPLAINTS`}
      description={style.shortDescription}
    >
      <Link to="/styles" className="block text-left text-xs uppercase tracking-widest text-neutral-400 hover:text-accent">
        &larr; Styles
      </Link>

      <section className="mt-6 max-w-2xl text-left">
        <p className="text-xs uppercase tracking-widest text-neutral-300">Moodboard</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-widest text-neutral-100">{style.name}</h1>
        <p className="mt-4 text-sm leading-7 text-neutral-400">{style.description}</p>
      </section>

      <div className="relative left-1/2 right-1/2 -mx-[50vw] mt-8 h-[85vh] min-h-[520px] w-screen">
        <DomeGallery images={style.images} grayscale={false} />
      </div>
      <p className="mt-4 text-xs uppercase tracking-widest text-neutral-500">
        Ziehen zum Drehen &middot; Klicken zum Vergrößern
      </p>
    </Layout>
  )
}
