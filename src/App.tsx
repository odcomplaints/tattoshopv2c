import { Suspense, lazy } from 'react'
import type { ComponentType } from 'react'
import { Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { ScrollToTop } from './components/ScrollToTop'

// Every route except the landing page is its own chunk, so the first visit
// (mostly the Instagram bio link → "/") only downloads what "/" needs.
function page<K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) {
  return lazy(() => load().then((module) => ({ default: module[name] })))
}

const WorkPage = page(() => import('./pages/WorkPage'), 'WorkPage')
const ShopPage = page(() => import('./pages/ShopPage'), 'ShopPage')
const CartPage = page(() => import('./pages/CartPage'), 'CartPage')
const SuccessPage = page(() => import('./pages/SuccessPage'), 'SuccessPage')
const FavoritesPage = page(() => import('./pages/FavoritesPage'), 'FavoritesPage')
const ProductPage = page(() => import('./pages/ProductPage'), 'ProductPage')
const BookingPage = page(() => import('./pages/BookingPage'), 'BookingPage')
const AboutPage = page(() => import('./pages/AboutPage'), 'AboutPage')
const StylesPage = page(() => import('./pages/StylesPage'), 'StylesPage')
const ImprintPage = page(() => import('./pages/ImprintPage'), 'ImprintPage')
const PrivacyPage = page(() => import('./pages/PrivacyPage'), 'PrivacyPage')
const NotFoundPage = page(() => import('./pages/NotFoundPage'), 'NotFoundPage')

// The admin panel only generates code to paste into the repo, so it is only
// needed locally. In production builds `import.meta.env.DEV` is false, the
// branch is dropped and the admin code (incl. its password) never ships.
const AdminPage = import.meta.env.DEV ? page(() => import('./pages/AdminPage'), 'AdminPage') : null

function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<div className="min-h-screen" />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/cart" element={<CartPage />} />
          <Route path="/shop/success" element={<SuccessPage />} />
          <Route path="/shop/favorites" element={<FavoritesPage />} />
          <Route path="/shop/:id" element={<ProductPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/styles" element={<StylesPage />} />
          <Route path="/imprint" element={<ImprintPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          {AdminPage && <Route path="/admin" element={<AdminPage />} />}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
