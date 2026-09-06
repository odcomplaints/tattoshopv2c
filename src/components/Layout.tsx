import { useState } from 'react'
import type { ReactNode } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logo from '../assets/logoshopbesser.png'
import { useShop } from '../context/ShopContext'
import { useLanguage } from '../context/LanguageContext'
import { CartIcon, HeartIcon } from './icons'

type LayoutProps = {
  children: ReactNode
  title?: string
  description?: string
  headerExtra?: ReactNode
}

const SITE_URL = 'https://odcomplaints.com'
const SITE_NAME = 'OD COMPLAINTS'

const navigation = [
  { key: 'work', to: '/work' },
  { key: 'shop', to: '/shop' },
  { key: 'booking', to: '/booking' },
  { key: 'about', to: '/about' },
] as const

export function Layout({
  children,
  title = 'OD COMPLAINTS | GD',
  description = 'Blackwork, fineline and botanical tattoos by OD COMPLAINTS in GD.',
  headerExtra,
}: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { cartCount, favoritesCount } = useShop()
  const { t } = useLanguage()
  const isShopSection = location.pathname.startsWith('/shop')
  const canonicalUrl = `${SITE_URL}${location.pathname}`
  const ogImage = `${SITE_URL}${logo}`

  return (
    <div className="relative z-10 flex min-h-screen flex-col text-neutral-200">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>
      <header>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 pb-4 pt-10 lg:px-8 lg:pb-6 lg:pt-16">
          <div className="relative flex w-full items-center justify-between gap-6">
            <Link to="/" aria-label="OD COMPLAINTS — home" className="inline-block transition-opacity hover:opacity-80">
              <img src={logo} alt="OD COMPLAINTS" className="h-14 w-auto sm:h-16 lg:h-20" />
            </Link>
            <div className="flex items-center gap-5">
            {isShopSection && (
              <div className="flex items-center gap-5">
                <Link
                  to="/shop/favorites"
                  aria-label="Favorites"
                  className="relative flex items-center text-neutral-300 transition-colors hover:text-accent"
                >
                  <HeartIcon filled={favoritesCount > 0} />
                </Link>
                <Link
                  to="/shop/cart"
                  aria-label={`Cart (${cartCount})`}
                  className="relative flex items-center text-neutral-300 transition-colors hover:text-accent"
                >
                  <CartIcon />
                  {cartCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-medium text-accent-contrast">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            )}
            <button
              type="button"
              className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 lg:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className={`h-px w-6 bg-accent transition-transform ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
              <span className={`h-px w-6 bg-accent transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`h-px w-6 bg-accent transition-transform ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
            </button>
            <nav aria-label="Main navigation" className="hidden lg:absolute lg:left-1/2 lg:top-1/2 lg:block lg:-translate-x-1/2 lg:-translate-y-1/2">
              <ul className="flex flex-nowrap items-center justify-center gap-x-10 gap-y-3 text-xl font-normal uppercase tracking-tight sm:gap-x-14">
                {navigation.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className="inline-block min-w-[7.5rem] text-center origin-center scale-x-150 whitespace-nowrap text-accent transition-colors hover:text-neutral-100"
                    >
                      {t.nav[item.key]}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            </div>
            {headerExtra && (
              <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 lg:block">{headerExtra}</div>
            )}
          </div>
        </div>
        <div
          className={`fixed inset-0 z-40 bg-neutral-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
        <nav
          aria-label="Main navigation"
          className={`fixed inset-y-0 right-0 z-50 flex w-[65%] flex-col border-l border-neutral-800 bg-neutral-950 pt-20 transition-transform duration-300 ease-out lg:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <button
            type="button"
            className="absolute right-5 top-5 text-2xl leading-none text-accent transition-colors hover:text-neutral-100"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            &times;
          </button>
          <ul className="flex flex-col items-center gap-y-8 px-5 py-6 text-3xl uppercase tracking-widest">
            {navigation.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="text-accent transition-colors hover:text-neutral-100"
                >
                  {t.nav[item.key]}
                </NavLink>
              </li>
            ))}
            {isShopSection && (
              <>
                <li>
                  <NavLink
                    to="/shop/favorites"
                    onClick={() => setMenuOpen(false)}
                    className="text-accent transition-colors hover:text-neutral-100"
                  >
                    {t.nav.favorites}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/shop/cart"
                    onClick={() => setMenuOpen(false)}
                    className="text-accent transition-colors hover:text-neutral-100"
                  >
                    {t.nav.cart}{cartCount > 0 ? ` (${cartCount})` : ''}
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 text-center sm:px-8 sm:py-20">{children}</main>
      <footer className="border-t border-neutral-800 text-xs uppercase tracking-widest text-accent">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 px-5 py-6 text-center sm:px-8">
          <p>GD</p>
          <div className="flex justify-center gap-5">
            <Link className="transition-colors hover:text-neutral-100" to="/imprint">{t.footer.legalNotice}</Link>
            <Link className="transition-colors hover:text-neutral-100" to="/privacy">{t.footer.privacy}</Link>
            <a className="transition-colors hover:text-neutral-100" href="https://instagram.com/od.complaints" target="_blank" rel="noreferrer">{t.footer.instagram}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}