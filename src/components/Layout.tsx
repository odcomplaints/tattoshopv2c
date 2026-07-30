import { useState } from 'react'
import type { ReactNode } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/logoshopbesser.png'

type LayoutProps = {
  children: ReactNode
  title?: string
  description?: string
}

const navigation = [
  { label: 'Work', to: '/work' },
  { label: 'Shop', to: '/shop' },
  { label: 'Booking', to: '/booking' },
  { label: 'About', to: '/about' },
]

export function Layout({
  children,
  title = 'OD: COMPLAINTS | GD',
  description = 'Blackwork, fineline and botanical tattoos by OD: COMPLAINTS in GD.',
}: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative z-10 flex min-h-screen flex-col text-neutral-200">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 lg:px-8 lg:py-6">
          <Link to="/" aria-label="OD: COMPLAINTS — home" className="inline-block transition-opacity hover:opacity-80">
            <img src={logo} alt="OD: COMPLAINTS" className="h-14 w-auto sm:h-16 lg:h-20" />
          </Link>
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
          <nav aria-label="Main navigation" className="hidden lg:block">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-3xl uppercase tracking-widest sm:gap-x-10">
              {navigation.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `transition-colors hover:text-neutral-100 ${isActive ? 'text-accent' : 'text-neutral-500'}`}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
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
                  className={({ isActive }) => `transition-colors hover:text-neutral-100 ${isActive ? 'text-accent' : 'text-neutral-500'}`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 text-center sm:px-8 sm:py-20">{children}</main>
      <footer className="border-t border-neutral-800 text-xs uppercase tracking-widest text-neutral-500">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 px-5 py-6 text-center sm:px-8">
          <p>GD</p>
          <div className="flex justify-center gap-5">
            <Link className="transition-colors hover:text-neutral-100" to="/imprint">Legal notice</Link>
            <Link className="transition-colors hover:text-neutral-100" to="/privacy">Privacy</Link>
            <a className="transition-colors hover:text-accent" href="https://instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  )
}