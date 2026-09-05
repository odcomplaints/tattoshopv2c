import { Link, useParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { HeartIcon } from '../components/icons'
import { useShop } from '../context/ShopContext'
import { shopItems } from '../data/shop'

export function ProductPage() {
  const { id } = useParams()
  const item = shopItems.find((product) => product.id === id)
  const { addToCart, isFavorite, toggleFavorite, cart } = useShop()

  if (!item) {
    return (
      <Layout title="Not found | OD COMPLAINTS">
        <div className="py-16 text-center">
          <h1 className="text-2xl font-medium uppercase tracking-widest text-neutral-100">Product not found</h1>
          <Link to="/shop" className="mt-6 inline-block text-xs uppercase tracking-widest text-neutral-300 hover:text-accent">
            &larr; Back to shop
          </Link>
        </div>
      </Layout>
    )
  }

  const inCartQuantity = cart.find((entry) => entry.id === item.id)?.quantity ?? 0
  const available = item.availability === 'available'
  const canAddToCart = available && inCartQuantity < item.stock
  const favorite = isFavorite(item.id)
  const mailto = `mailto:hello@example.com?subject=${encodeURIComponent(`Shop Inquiry: ${item.name}`)}`

  const sameCategory = shopItems.filter((product) => product.id !== item.id && product.category === item.category)
  const others = shopItems.filter((product) => product.id !== item.id && product.category !== item.category)
  const relatedItems = [...sameCategory, ...others].slice(0, 3)

  return (
    <Layout
      title={`${item.name} | OD COMPLAINTS`}
      description={`${item.name} – ${item.category} by OD COMPLAINTS, GD.`}
    >
      <Link to="/shop" className="block text-left text-xs uppercase tracking-widest text-neutral-400 hover:text-accent">
        &larr; Shop
      </Link>

      <div className="mt-8 grid gap-10 text-left lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={item.image}
            alt={`${item.name}, ${item.category}`}
            width="800"
            height="1000"
            decoding="async"
            className="h-full w-full object-contain"
          />
          {!available && (
            <span className="absolute left-0 top-0 border border-accent bg-neutral-950 px-2 py-1 text-[10px] uppercase tracking-widest">
              Sold out
            </span>
          )}
          <button
            type="button"
            onClick={() => toggleFavorite(item.id)}
            aria-pressed={favorite}
            aria-label={favorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
            className={`favorite-toggle absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center transition-colors ${favorite ? 'text-accent drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]' : ''}`}
          >
            <HeartIcon filled={favorite} />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-300">{item.category}</p>
            <h1 className="mt-2 text-3xl font-medium uppercase tracking-widest text-neutral-100">{item.name}</h1>
            <p className="mt-3 text-lg uppercase tracking-widest text-neutral-300">{item.price}</p>
          {available ? (
            <p className="text-xs uppercase tracking-widest text-neutral-500">
              {item.stock === 1 ? '1 Stück verfügbar' : `${item.stock} Stück verfügbar`}
            </p>
          ) : null}
          </div>

          <p className="max-w-md text-sm leading-7 text-neutral-400">{item.description}</p>

          <ul className="flex flex-col gap-1 border-t border-neutral-800 pt-5 text-xs uppercase tracking-widest text-neutral-300">
            {item.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>

          <div className="mt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => addToCart(item.id)}
              disabled={!canAddToCart}
              className={`cta-solid inline-block w-fit border px-6 py-3 text-xs uppercase tracking-widest transition-colors ${
                canAddToCart
                  ? 'border-accent bg-accent hover:opacity-90'
                  : 'pointer-events-none border-neutral-800 text-neutral-700'
              }`}
            >
              {available ? (canAddToCart ? 'Add to cart' : 'Already in cart') : 'Unavailable'}
            </button>
            <a
              href={available ? mailto : undefined}
              className={`inline-block w-fit border px-6 py-3 text-xs uppercase tracking-widest transition-colors ${
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
      </div>

      {relatedItems.length > 0 && (
        <section className="mt-16 border-t border-neutral-800 pt-10 text-left sm:mt-24 sm:pt-14" aria-label="Related products">
          <h2 className="text-xs uppercase tracking-widest text-neutral-200">Das könnte dir auch gefallen</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 md:gap-y-14">
            {relatedItems.map((related) => {
              const relatedFavorite = isFavorite(related.id)
              return (
                <div key={related.id} className="group relative">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={related.image}
                      alt={`${related.name}, ${related.category}`}
                      width="800"
                      height="1000"
                      loading="lazy"
                      decoding="async"
                      sizes="(min-width: 768px) 33vw, 50vw"
                      className="h-full w-full object-contain"
                    />
                    {related.availability === 'sold-out' && (
                      <span className="absolute left-0 top-0 border border-accent bg-neutral-950 px-2 py-1 text-[10px] uppercase tracking-widest">
                        Sold out
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleFavorite(related.id)}
                      aria-pressed={relatedFavorite}
                      aria-label={
                        relatedFavorite
                          ? `Remove ${related.name} from favorites`
                          : `Add ${related.name} to favorites`
                      }
                      className={`favorite-toggle absolute bottom-2 right-2 z-20 flex h-8 w-8 items-center justify-center transition-colors ${relatedFavorite ? 'text-accent drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]' : ''}`}
                    >
                      <HeartIcon filled={relatedFavorite} />
                    </button>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-3 text-xs uppercase tracking-widest">
                    <h3 className="font-medium text-neutral-100">{related.name}</h3>
                    <p className="shrink-0 text-neutral-400">{related.price}</p>
                  </div>
                  <p className="mt-1 text-xs text-neutral-300">{related.category}</p>
                  <Link to={`/shop/${related.id}`} className="absolute inset-0 z-10">
                    <span className="sr-only">View {related.name}</span>
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </Layout>
  )
}
