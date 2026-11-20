import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { HeartIcon } from '../components/icons'
import { ZoomImage } from '../components/ZoomImage'
import { useShop } from '../context/ShopContext'
import { cartKey, maxCartQuantity } from '../lib/cart'
import { shopItems } from '../data/shop'
import { getPodProduct, isPrintOnDemand } from '../data/printOnDemand'

export function ProductPage() {
  const { id } = useParams()
  const item = shopItems.find((product) => product.id === id && product.listed !== false)
  const { addToCart, isFavorite, toggleFavorite, cart, isSoldOut } = useShop()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  useEffect(() => {
    setActiveImageIndex(0)
    setSelectedSize(null)
  }, [id])

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

  const pod = getPodProduct(item.id)
  const needsSize = !!pod && !selectedSize
  const lineKey = cartKey({ id: item.id, size: pod ? (selectedSize ?? undefined) : undefined })
  const inCartQuantity = cart.find((entry) => cartKey(entry) === lineKey)?.quantity ?? 0
  const available = item.availability === 'available' && !isSoldOut(item.id)
  const canAddToCart = available && !needsSize && inCartQuantity < maxCartQuantity(item.id)
  const addLabel = !available
    ? 'Unavailable'
    : needsSize
      ? 'Größe wählen'
      : canAddToCart
        ? 'Add to cart'
        : pod
          ? 'Maximale Menge im Warenkorb'
          : 'Already in cart'
  const favorite = isFavorite(item.id)
  const mailto = `mailto:hello@example.com?subject=${encodeURIComponent(`Shop Inquiry: ${item.name}`)}`

  const sameCategory = shopItems.filter((product) => product.id !== item.id && product.category === item.category)
  const others = shopItems.filter((product) => product.id !== item.id && product.category !== item.category)
  const relatedItems = [...sameCategory, ...others].slice(0, 3)

  const galleryImages = [item.image, ...(item.moodImages ?? [])]
  const currentImage = galleryImages[Math.min(activeImageIndex, galleryImages.length - 1)]

  function goToImage(index: number) {
    const clamped = (index + galleryImages.length) % galleryImages.length
    setActiveImageIndex(clamped)
  }

  return (
    <Layout
      title={`${item.name} | OD COMPLAINTS`}
      description={`${item.name} – ${item.category} by OD COMPLAINTS, GD.`}
    >
      <Link to="/shop" className="-mt-6 block text-left text-xs uppercase tracking-widest text-neutral-400 hover:text-accent sm:-mt-12">
        &larr; Shop
      </Link>

      <div className="mt-8 grid gap-10 text-left lg:grid-cols-2 lg:gap-16">
        <div>
          <div
            className="relative aspect-[4/5] overflow-hidden [touch-action:pan-y_pinch-zoom]"
            onTouchStart={(e) => {
              ;(e.currentTarget as HTMLDivElement & { dataset: { touchStartX?: string } }).dataset.touchStartX = String(
                e.touches[0].clientX,
              )
            }}
            onTouchEnd={(e) => {
              const startX = Number((e.currentTarget as HTMLDivElement).dataset.touchStartX ?? 0)
              const endX = e.changedTouches[0].clientX
              const delta = endX - startX
              if (Math.abs(delta) > 40) {
                goToImage(activeImageIndex + (delta < 0 ? 1 : -1))
              }
            }}
          >
            <ZoomImage
              key={currentImage}
              src={currentImage}
              alt={`${item.name}, ${item.category}`}
              className="h-full w-full animate-[fade-in_0.25s_ease]"
              imgClassName="h-full w-full object-contain"
              zoom={2.5}
            />
            {!available && (
              <span className="absolute left-0 top-0 border border-accent bg-neutral-950 px-2 py-1 text-[10px] uppercase tracking-widest">
                Sold out
              </span>
            )}
            {available && pod && (
              <span className="absolute left-0 top-0 border border-neutral-700 bg-neutral-950 px-2 py-1 text-[10px] uppercase tracking-widest text-neutral-200">
                Print on Demand
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

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goToImage(activeImageIndex - 1)}
                  aria-label="Vorheriges Bild"
                  className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-2xl text-neutral-100 transition-colors hover:text-accent"
                >
                  &lsaquo;
                </button>
                <button
                  type="button"
                  onClick={() => goToImage(activeImageIndex + 1)}
                  aria-label="Nächstes Bild"
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-2xl text-neutral-100 transition-colors hover:text-accent"
                >
                  &rsaquo;
                </button>
              </>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="mt-3 flex justify-center gap-2">
              {galleryImages.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => goToImage(index)}
                  aria-label={`Bild ${index + 1} anzeigen`}
                  aria-current={index === activeImageIndex}
                  className={`relative h-12 w-12 shrink-0 overflow-hidden border transition-colors sm:h-14 sm:w-14 ${
                    index === activeImageIndex ? 'border-accent' : 'border-transparent'
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    width="160"
                    height="160"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-300">{item.category}</p>
            <h1 className="mt-2 text-3xl font-medium uppercase tracking-widest text-neutral-100">{item.name}</h1>
            <p className="mt-3 text-lg uppercase tracking-widest text-neutral-300">{item.price}</p>
          {available && pod ? (
            <p className="text-xs uppercase tracking-widest text-neutral-500">Print on Demand · Wird nach Bestellung gedruckt</p>
          ) : available ? (
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

          {pod && (
            <div className="border border-neutral-800 px-4 py-3 text-xs leading-6 text-neutral-400">
              <p className="uppercase tracking-widest text-neutral-200">Print on Demand</p>
              <p className="mt-1">
                Dieses Shirt wird erst nach deiner Bestellung für dich gedruckt — keine Lagerware. Produktion &amp; Versand:{' '}
                {pod.productionTime}.
              </p>
            </div>
          )}

          {pod && available && (
            <fieldset>
              <legend className="text-xs uppercase tracking-widest text-neutral-300">Größe</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {pod.sizes.map((size) => {
                  const selected = size === selectedSize
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selected}
                      className={`min-w-12 border px-3 py-2 text-xs uppercase tracking-widest transition-colors ${
                        selected
                          ? 'border-accent text-neutral-100'
                          : 'border-neutral-800 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          )}

          <div className="mt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => addToCart(item.id, pod ? (selectedSize ?? undefined) : undefined)}
              disabled={!canAddToCart}
              className={`cta-solid inline-block w-fit border px-6 py-3 text-xs uppercase tracking-widest transition-colors ${
                canAddToCart
                  ? 'border-accent bg-accent hover:opacity-90'
                  : 'pointer-events-none border-neutral-800 text-neutral-700'
              }`}
            >
              {addLabel}
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
              const relatedSoldOut = related.availability === 'sold-out' || isSoldOut(related.id)
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
                      className={`h-full w-full object-contain ${relatedSoldOut ? 'blur-[2px]' : ''}`}
                    />
                    {relatedSoldOut && (
                      <span className="absolute left-0 top-0 border border-accent bg-neutral-950 px-2 py-1 text-[10px] uppercase tracking-widest">
                        Sold out
                      </span>
                    )}
                    {!relatedSoldOut && isPrintOnDemand(related.id) && (
                      <span className="absolute left-0 top-0 border border-neutral-700 bg-neutral-950 px-2 py-1 text-[10px] uppercase tracking-widest text-neutral-200">
                        Print on Demand
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
