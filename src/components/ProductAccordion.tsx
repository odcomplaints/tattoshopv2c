import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { shopItems } from '../data/shop'
import './ProductAccordion.css'

const PREMIUM = /supreme|bape|dior|balenciaga|prada|palace|xtc|corteiz|casablanca|laarve/i
const MAX_ITEMS = 18

export function ProductAccordion() {
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState<string | null>(null)

  const products = useMemo(
    () =>
      shopItems
        .filter(
          (item) =>
            item.listed !== false &&
            item.availability !== 'sold-out' &&
            PREMIUM.test(item.name) &&
            !/t-shirt|tee|shirt/i.test(item.category),
        )
        .slice(0, MAX_ITEMS),
    [],
  )

  if (products.length === 0) return null

  return (
    <section className="py-10 text-left sm:py-16" aria-label="Don't miss out">
      <div className="mb-8 text-center sm:mb-12">
        <h2 className="text-2xl tracking-widest sm:text-4xl">Dont miss out</h2>
        <p className="mt-3 text-sm tracking-widest text-neutral-400 sm:text-base">Entdecke unsere handverlesene Kollektion</p>
      </div>
      <div className="product-accordion" onMouseLeave={() => setActiveId(null)}>
        {products.map((product) => (
          <div
            key={product.id}
            className={`product-accordion__item${activeId === product.id ? ' is-active' : ''}`}
            role="link"
            tabIndex={0}
            aria-label={`Zu ${product.name} navigieren`}
            onMouseEnter={() => setActiveId(product.id)}
            onFocus={() => setActiveId(product.id)}
            onClick={() => {
              if (activeId === product.id || window.matchMedia('(hover: hover)').matches) navigate(`/shop/${product.id}`)
              else setActiveId(product.id)
            }}
            onKeyDown={(event) => event.key === 'Enter' && navigate(`/shop/${product.id}`)}
          >
            <img src={product.image} alt={product.name} loading="lazy" decoding="async" width="200" height="600" />
          </div>
        ))}
      </div>
    </section>
  )
}
