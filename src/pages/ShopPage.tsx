import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { HeartIcon } from '../components/icons'
import { useShop } from '../context/ShopContext'
import { shopItems } from '../data/shop'
import { FEATURED_ORDER } from '../data/featuredOrder'

const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
] as const

type SortValue = (typeof SORT_OPTIONS)[number]['value']

function parsePrice(price: string): number {
  const match = price.match(/[\d.,]+/)
  if (!match) return 0
  return parseFloat(match[0].replace(/\./g, '').replace(',', '.'))
}

const FEATURED_INDEX = new Map(FEATURED_ORDER.map((id, index) => [id, index]))

function featuredPriority(id: string): number {
  return FEATURED_INDEX.get(id) ?? FEATURED_ORDER.length
}

const ITEMS_PER_PAGE = 15

export function ShopPage() {
  const { isFavorite, toggleFavorite, isSoldOut } = useShop()
  const [filterOpen, setFilterOpen] = useState(false)
  const [sort, setSort] = useState<SortValue>('default')
  const filterRef = useRef<HTMLDivElement>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const sortedItems = useMemo(() => {
    const items = shopItems.filter((item) => item.listed !== false)
    if (sort === 'price-asc') items.sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
    else if (sort === 'price-desc') items.sort((a, b) => parsePrice(b.price) - parsePrice(a.price))
    else {
      items.sort((a, b) => featuredPriority(a.id) - featuredPriority(b.id))
    }
    return items
  }, [sort])

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / ITEMS_PER_PAGE))
  const pageParam = Number(searchParams.get('page'))
  const currentPage = Number.isFinite(pageParam) && pageParam >= 1 ? Math.min(Math.floor(pageParam), totalPages) : 1

  const visibleItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedItems.slice(start, start + ITEMS_PER_PAGE)
  }, [sortedItems, currentPage])

  function goToPage(page: number) {
    const clamped = Math.min(Math.max(page, 1), totalPages)
    setSearchParams((params) => {
      const next = new URLSearchParams(params)
      if (clamped <= 1) next.delete('page')
      else next.set('page', String(clamped))
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    if (pageParam > totalPages) {
      goToPage(totalPages)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages])

  useEffect(() => {
    if (!filterOpen) return
    function handleClick(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [filterOpen])


  return (
    <Layout title="Shop | OD COMPLAINTS" description="Limited prints and objects by OD COMPLAINTS, GD.">
      <section className="border-b border-neutral-800 pb-10 text-left sm:pb-14">
        <p className="text-xs uppercase tracking-widest text-neutral-200">Editions / Objects</p>
        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-3xl font-medium uppercase tracking-widest text-neutral-100">Shop</h1>
          <p className="max-w-md text-sm leading-7 text-neutral-400">Small editions, studies and prints. Shipping within Germany; other destinations on request.</p>
        </div>
      </section>

      <section className="pt-10 text-left sm:pt-14" aria-label="Products">
        <div className="mb-1.5 flex justify-end sm:mb-2">
          <div ref={filterRef} className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((open) => !open)}
              aria-expanded={filterOpen}
              aria-haspopup="true"
              className="flex items-center gap-1.5 border border-neutral-800 px-3 py-1.5 text-[10px] uppercase tracking-widest text-neutral-400 transition-colors hover:border-neutral-600 hover:text-neutral-200"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
              </svg>
              Filter
              {sort !== 'default' && <span className="text-accent">(1)</span>}
            </button>

            {filterOpen && (
              <div className="absolute right-0 top-full z-30 mt-2 w-56 border border-neutral-800 bg-neutral-950 p-4 shadow-xl">
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-widest text-neutral-500">Sort by</p>
                  <div className="flex flex-col gap-1">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSort(opt.value)
                          setFilterOpen(false)
                          goToPage(1)
                        }}
                        className={`text-left text-[11px] uppercase tracking-wide transition-colors ${sort === opt.value ? 'text-accent' : 'text-neutral-400 hover:text-neutral-200'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 md:gap-y-14">
          {visibleItems.map((item) => {
            const favorite = isFavorite(item.id)
            const soldOut = item.availability === 'sold-out' || isSoldOut(item.id)
            return (
              <div key={item.id} className="group relative">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={item.image}
                    alt={`${item.name}, ${item.category}`}
                    width="800"
                    height="1000"
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className={`h-full w-full object-contain ${soldOut ? 'blur-[2px]' : ''}`}
                  />
                  {soldOut && (
                    <span className="absolute left-0 top-0 border border-accent bg-neutral-950 px-2 py-1 text-[10px] uppercase tracking-widest">Sold out</span>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleFavorite(item.id)}
                    aria-pressed={favorite}
                    aria-label={favorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
                    className={`favorite-toggle absolute bottom-2 right-2 z-20 flex h-8 w-8 items-center justify-center transition-colors ${favorite ? 'text-accent drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]' : ''}`}
                  >
                    <HeartIcon filled={favorite} />
                  </button>
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3 text-xs uppercase tracking-widest">
                  <h2 className="font-medium text-neutral-100">{item.name}</h2>
                  <p className="shrink-0 text-neutral-400">{item.price}</p>
                </div>
                <p className="mt-1 text-xs text-neutral-300">{item.category}</p>
                <Link to={`/shop/${item.id}`} className="absolute inset-0 z-10">
                  <span className="sr-only">View {item.name}</span>
                </Link>
              </div>
            )
          })}
        </div>

        {totalPages > 1 && (
          <nav aria-label="Seitennavigation" className="mt-12 flex items-center justify-center gap-2 sm:mt-16">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="border border-neutral-800 px-3 py-2 text-xs uppercase tracking-widest text-neutral-300 transition-colors hover:border-neutral-600 hover:text-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Vorherige Seite"
            >
              &larr;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                className={`min-w-[2.5rem] border px-3 py-2 text-xs uppercase tracking-widest transition-colors ${
                  page === currentPage
                    ? 'border-accent text-accent'
                    : 'border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-neutral-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="border border-neutral-800 px-3 py-2 text-xs uppercase tracking-widest text-neutral-300 transition-colors hover:border-neutral-600 hover:text-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Nächste Seite"
            >
              &rarr;
            </button>
          </nav>
        )}
      </section>
    </Layout>
  )
}
