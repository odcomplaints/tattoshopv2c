import type { ReactNode } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, NavLink } from 'react-router-dom'

type LayoutProps = {
  children: ReactNode
  title?: string
  description?: string
}

const navigation = [
  { label: 'Work', to: '/work' },
  { label: 'Booking', to: '/booking' },
  { label: 'About', to: '/about' },
]

export function Layout({
  children,
  title = 'Mara Kern Tattoo | Berlin',
  description = 'Blackwork, Fineline und botanische Tattoos von Mara Kern in Berlin.',
}: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-200">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="text-sm font-semibold uppercase tracking-widest text-neutral-100 transition-colors hover:text-neutral-400">
            Mara Kern
          </Link>
          <nav aria-label="Hauptnavigation">
            <ul className="flex items-center gap-4 text-xs uppercase tracking-widest sm:gap-7">
              {navigation.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `transition-colors hover:text-neutral-50 ${isActive ? 'text-neutral-50' : 'text-neutral-500'}`}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-20">{children}</main>
      <footer className="border-t border-neutral-800 text-xs uppercase tracking-widest text-neutral-500">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>Berlin, Deutschland</p>
          <div className="flex gap-5">
            <Link className="transition-colors hover:text-neutral-100" to="/imprint">Impressum</Link>
            <Link className="transition-colors hover:text-neutral-100" to="/privacy">Datenschutz</Link>
            <a className="transition-colors hover:text-neutral-100" href="https://instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  )
}