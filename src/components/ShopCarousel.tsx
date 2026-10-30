import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import CircularCarousel from './CircularCarousel'
import { shopItems } from '../data/shop'
import { FEATURED_ORDER } from '../data/featuredOrder'

const MAX_ITEMS = 30

const FEATURED_INDEX = new Map(FEATURED_ORDER.map((id, index) => [id, index]))

export function ShopCarousel() {
  const navigate = useNavigate()

  const items = useMemo(
    () =>
      shopItems
        .filter((item) => item.listed !== false && item.availability !== 'sold-out')
        .sort((a, b) => (FEATURED_INDEX.get(a.id) ?? 999) - (FEATURED_INDEX.get(b.id) ?? 999))
        .slice(0, MAX_ITEMS)
        .map((item) => ({ id: item.id, src: item.image, alt: item.name })),
    [],
  )

  if (items.length === 0) return null

  return (
    <section className="mb-10 border-b border-neutral-800 pb-10 sm:mb-14" aria-label="Highlights">
      <div className="relative left-1/2 h-[200px] w-screen -translate-x-1/2 sm:h-[240px]">
        <CircularCarousel
          items={items}
          preset="panorama"
          cardWidth={110}
          aspectRatio={0.8}
          gap={60}
          curve={0.25}
          stretch={0}
          parallax={0}
          autoplay="step"
          pauseOnHover={false}
          focusOnClick={false}
          depthFade={0}
          innerShade={1}
          cornerRadius={0}
          captions={false}
          onItemClick={(item) => item.id && navigate(`/shop/${item.id}`)}
        />
      </div>
    </section>
  )
}
