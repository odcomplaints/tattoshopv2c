import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Work } from '../data/work'
import type { ClaimableWork } from '../data/claims'
import { claimCartId, claimCopy, formatClaimPrice, isClaimEnabled } from '../data/claims'
import { useLanguage } from '../context/LanguageContext'
import { useShop } from '../context/ShopContext'
import { getClaimState } from '../lib/claims'
import { responsiveImage } from '../lib/image'
import { ClaimBadge } from './ClaimBadge'

type WorkGridProps = {
  items: Work[]
}

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })

export function WorkGrid({ items }: WorkGridProps) {
  const { claimStatus } = useShop()
  const [selected, setSelected] = useState<Work | null>(null)

  // Lock page scroll while the lightbox is open
  const isOpen = selected !== null
  useEffect(() => {
    if (!isOpen) return
    const { overflow } = document.documentElement.style
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = overflow
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Setup scroll reveal animation for all data-reveal elements
  useEffect(() => {
    const revealElements = document.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    revealElements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [items])

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 md:gap-y-12">
      {items.map((item, index) => (
        <article key={item.id} data-reveal>
          <button
            type="button"
            onClick={() => setSelected(item)}
            className="block w-full text-left"
            aria-label={`${item.title} vergrößern`}
          >
            <div className="aspect-[4/5] overflow-hidden bg-neutral-900">
              <img
                {...responsiveImage(item.image, '(min-width: 768px) 33vw, 50vw')}
                alt={`${item.title}, ${item.style} tattoo`}
                width="800"
                height="1000"
                loading={index > 1 ? 'lazy' : 'eager'}
                decoding="async"
                className="h-full w-full object-cover grayscale transition-opacity duration-200 hover:opacity-80"
                style={item.zoom ? { transform: `scale(${item.zoom})` } : undefined}
              />
            </div>
          </button>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs uppercase tracking-widest">
            <h2 className="font-medium text-neutral-100">{item.title}</h2>
            <time className="text-neutral-300" dateTime={item.date.toISOString().slice(0, 10)}>{dateFormatter.format(item.date)}</time>
          </div>
          <p className="mt-1 text-xs text-neutral-300">{item.style}</p>
          {isClaimEnabled(item) && (
            <div className="mt-2">
              <ClaimBadge state={getClaimState(item, claimStatus)} />
            </div>
          )}
        </article>
      ))}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden overscroll-contain bg-neutral-950/95 p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative flex max-h-full w-full max-w-3xl flex-col items-center gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              {...responsiveImage(selected.image, '(min-width: 768px) 768px, 100vw')}
              alt={`${selected.title}, ${selected.style} tattoo`}
              className="max-h-[55dvh] min-h-0 w-auto max-w-full object-contain grayscale"
            />
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs uppercase tracking-widest">
              <h2 className="font-medium text-neutral-100">{selected.title}</h2>
              <time className="text-neutral-300" dateTime={selected.date.toISOString().slice(0, 10)}>{dateFormatter.format(selected.date)}</time>
            </div>
            <p className="text-xs text-neutral-300">{selected.style}</p>
            {isClaimEnabled(selected) && <ClaimActions piece={selected} />}
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Schließen"
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-950 text-lg leading-none text-neutral-100 transition-colors hover:text-accent"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// "Claim" puts the template into the regular cart and continues with the normal checkout;
// the "i" opens the detail page of the piece.
function ClaimActions({ piece }: { piece: ClaimableWork }) {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const { cart, addToCart, claimStatus } = useShop()
  const copy = claimCopy[language]
  const state = getClaimState(piece, claimStatus)
  const cartId = claimCartId(piece.id)
  const inCart = cart.some((entry) => entry.id === cartId)

  function claim() {
    if (!inCart) addToCart(cartId)
    navigate('/shop/cart')
  }

  return (
    <div className="flex items-stretch gap-2">
      <button
        type="button"
        onClick={claim}
        disabled={state !== 'available'}
        className="border border-accent px-6 py-3 text-xs uppercase tracking-widest text-neutral-100 transition-colors hover:border-neutral-100 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:text-neutral-600"
      >
        {state === 'claimed'
          ? copy.buttonClaimed
          : state === 'reserved'
            ? copy.buttonReserved
            : inCart
              ? copy.buttonInCart
              : copy.button(formatClaimPrice(piece.claim.priceCents))}
      </button>
      <Link
        to={`/work/${piece.id}`}
        aria-label={`${copy.info}: ${piece.title}`}
        title={copy.info}
        className="flex w-11 items-center justify-center border border-neutral-700 font-serif text-sm italic text-neutral-300 transition-colors hover:border-accent hover:text-accent"
      >
        i
      </Link>
    </div>
  )
}