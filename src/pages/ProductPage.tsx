import { Link, useParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { shopItems } from '../data/shop'

export function ProductPage() {
  const { id } = useParams()
  const item = shopItems.find((product) => product.id === id)

  if (!item) {
    return (
      <Layout title="Not found | OD: COMPLAINTS">
        <div className="py-16 text-center">
          <h1 className="text-2xl font-medium uppercase tracking-widest text-neutral-100">Product not found</h1>
          <Link to="/shop" className="mt-6 inline-block text-xs uppercase tracking-widest text-neutral-300 hover:text-accent">
            &larr; Back to shop
          </Link>
        </div>
      </Layout>
    )
  }

  const available = item.availability === 'available'
  const mailto = `mailto:hello@example.com?subject=${encodeURIComponent(`Shop Inquiry: ${item.name}`)}`

  return (
    <Layout
      title={`${item.name} | OD: COMPLAINTS`}
      description={`${item.name} – ${item.category} by OD: COMPLAINTS, GD.`}
    >
      <Link to="/shop" className="inline-block text-xs uppercase tracking-widest text-neutral-400 hover:text-accent">
        &larr; Shop
      </Link>

      <div className="mt-8 grid gap-10 text-left lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
          <img
            src={item.image}
            alt={`${item.name}, ${item.category}`}
            width="800"
            height="1000"
            decoding="async"
            className="h-full w-full object-cover"
          />
          {!available && (
            <span className="absolute left-0 top-0 border border-accent bg-neutral-950 px-2 py-1 text-[10px] uppercase tracking-widest">
              Sold out
            </span>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-500">{item.category}</p>
            <h1 className="mt-2 text-3xl font-medium uppercase tracking-widest text-neutral-100">{item.name}</h1>
            <p className="mt-3 text-lg uppercase tracking-widest text-neutral-300">{item.price}</p>
          </div>

          <p className="max-w-md text-sm leading-7 text-neutral-400">{item.description}</p>

          <ul className="flex flex-col gap-1 border-t border-neutral-800 pt-5 text-xs uppercase tracking-widest text-neutral-500">
            {item.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>

          <a
            href={available ? mailto : undefined}
            className={`mt-2 inline-block w-fit border px-6 py-3 text-xs uppercase tracking-widest transition-colors ${
              available
                ? 'border-neutral-700 text-neutral-200 hover:border-accent hover:text-accent'
                : 'pointer-events-none border-neutral-800 text-neutral-700'
            }`}
            aria-disabled={!available}
          >
            {available ? 'Send inquiry' : 'Unavailable'}
          </a>
        </div>
      </div>
    </Layout>
  )
}
