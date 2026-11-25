import { Link, useNavigate, useParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ClaimBadge } from '../components/ClaimBadge'
import { ZoomImage } from '../components/ZoomImage'
import { useLanguage } from '../context/LanguageContext'
import { useShop } from '../context/ShopContext'
import { claimCartId, claimCopy, formatClaimPrice, getClaimableWork, isClaimEnabled } from '../data/claims'
import { work } from '../data/work'
import { getClaimState } from '../lib/claims'
import { responsiveImage } from '../lib/image'

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })

// Detail page of a claimable piece — same layout as the shop product page (ProductPage).
export function WorkClaimPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language } = useLanguage()
  const { cart, addToCart, claimStatus } = useShop()
  const copy = claimCopy[language]
  const piece = getClaimableWork(id ?? '')

  if (!piece) {
    return (
      <Layout title="Not found | OD COMPLAINTS">
        <div className="py-16 text-center">
          <h1 className="text-2xl font-medium uppercase tracking-widest text-neutral-100">{copy.page.notFound}</h1>
          <Link to="/work" className="mt-6 inline-block text-xs uppercase tracking-widest text-neutral-300 hover:text-accent">
            {copy.page.back}
          </Link>
        </div>
      </Layout>
    )
  }

  const state = getClaimState(piece, claimStatus)
  const cartId = claimCartId(piece.id)
  const inCart = cart.some((entry) => entry.id === cartId)
  const canClaim = state === 'available'
  const license = piece.claim.licenseNote ? [piece.claim.licenseNote[language]] : copy.license
  const related = work.filter(isClaimEnabled).filter((entry) => entry.id !== piece.id).slice(0, 3)

  // Claiming puts the template into the regular cart and continues with the normal checkout.
  function claim() {
    if (!inCart) addToCart(cartId)
    navigate('/shop/cart')
  }

  return (
    <Layout
      title={`${piece.title} | OD COMPLAINTS`}
      description={`${piece.title} – ${copy.page.kind} (${piece.style}) by OD COMPLAINTS, GD.`}
    >
      <Link to="/work" className="-mt-6 block text-left text-xs uppercase tracking-widest text-neutral-400 hover:text-accent sm:-mt-12">
        {copy.page.back}
      </Link>

      <div className="mt-8 grid gap-10 text-left lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden [touch-action:pan-y_pinch-zoom]">
            <ZoomImage
              src={piece.image}
              alt={`${piece.title}, ${piece.style} tattoo template`}
              className="h-full w-full animate-[fade-in_0.25s_ease]"
              imgClassName="h-full w-full object-contain"
              zoom={2.5}
            />
            {state !== 'available' && (
              <span className="absolute left-0 top-0 border border-accent bg-neutral-950 px-2 py-1 text-[10px] uppercase tracking-widest">
                {state === 'reserved' ? copy.reserved : copy.claimed}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-300">{copy.page.kind}</p>
            <h1 className="mt-2 text-3xl font-medium uppercase tracking-widest text-neutral-100">{piece.title}</h1>
            <p className="mt-3 text-lg uppercase tracking-widest text-neutral-300">{formatClaimPrice(piece.claim.priceCents)}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <ClaimBadge state={state} />
              {piece.claim.singleClaimOnly && state === 'available' && (
                <p className="text-xs uppercase tracking-widest text-neutral-500">{copy.exclusive}</p>
              )}
            </div>
          </div>

          <p className="max-w-md text-sm leading-7 text-neutral-400">{copy.page.description(piece.title, piece.style)}</p>

          <ul className="flex flex-col gap-1 border-t border-neutral-800 pt-5 text-xs uppercase tracking-widest text-neutral-300">
            <li>{piece.style}</li>
            <li>{monthFormatter.format(piece.date)}</li>
            {copy.page.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>

          <div className="border border-neutral-800 px-4 py-3 text-xs leading-6 text-neutral-400">
            <p className="uppercase tracking-widest text-neutral-300">{copy.licenseTitle}</p>
            <ul className="mt-2 flex flex-col gap-1">
              {license.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="mt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={claim}
              disabled={!canClaim}
              className={`cta-solid inline-block w-fit border px-6 py-3 text-xs uppercase tracking-widest transition-colors ${
                canClaim ? 'border-accent bg-accent hover:opacity-90' : 'pointer-events-none border-neutral-800 text-neutral-700'
              }`}
            >
              {state === 'claimed'
                ? copy.buttonClaimed
                : state === 'reserved'
                  ? copy.buttonReserved
                  : inCart
                    ? copy.buttonInCart
                    : copy.button(formatClaimPrice(piece.claim.priceCents))}
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-neutral-800 pt-10 text-left sm:mt-24 sm:pt-14" aria-label={copy.page.related}>
          <h2 className="text-xs uppercase tracking-widest text-neutral-200">{copy.page.related}</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 md:gap-y-14">
            {related.map((entry) => (
              <div key={entry.id} className="group relative">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    {...responsiveImage(entry.image, '(min-width: 768px) 33vw, 50vw')}
                    alt={`${entry.title}, ${entry.style} tattoo template`}
                    width="800"
                    height="1000"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3 text-xs uppercase tracking-widest">
                  <h3 className="font-medium text-neutral-100">{entry.title}</h3>
                  <p className="shrink-0 text-neutral-400">{formatClaimPrice(entry.claim.priceCents)}</p>
                </div>
                <p className="mt-1 text-xs text-neutral-300">{copy.page.kind}</p>
                <Link to={`/work/${entry.id}`} className="absolute inset-0 z-10">
                  <span className="sr-only">{entry.title}</span>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </Layout>
  )
}
