import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { shopItems } from '../data/shop'

export function ShopPage() {
  return (
    <Layout title="Shop | OD: COMPLAINTS" description="Limited prints and objects by OD: COMPLAINTS, GD.">
      <section className="border-b border-neutral-800 pb-10 text-left sm:pb-14">
        <p className="text-xs uppercase tracking-widest text-accent">Editions / Objects</p>
        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-3xl font-medium uppercase tracking-widest text-neutral-100">Shop</h1>
          <p className="max-w-md text-sm leading-7 text-neutral-400">Small editions, studies and prints. Shipping within Germany; other destinations on request.</p>
        </div>
      </section>

      <section className="pt-10 text-left sm:pt-14" aria-label="Products">
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 md:gap-y-14">
          {shopItems.map((item) => (
            <Link key={item.id} to={`/shop/${item.id}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
                <img
                  src={item.image}
                  alt={`${item.name}, ${item.category}`}
                  width="800"
                  height="1000"
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-80"
                />
                {item.availability === 'sold-out' && (
                  <span className="absolute left-0 top-0 border border-accent bg-neutral-950 px-2 py-1 text-[10px] uppercase tracking-widest">Sold out</span>
                )}
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-3 text-xs uppercase tracking-widest">
                <h2 className="font-medium text-neutral-100">{item.name}</h2>
                <p className="shrink-0 text-neutral-400">{item.price}</p>
              </div>
              <p className="mt-1 text-xs text-neutral-500">{item.category}</p>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  )
}
