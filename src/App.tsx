import { Route, Routes } from 'react-router-dom'
import { AboutPage } from './pages/AboutPage'
import { BookingPage } from './pages/BookingPage'
import { HomePage } from './pages/HomePage'
import { ImprintPage } from './pages/ImprintPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { ProductPage } from './pages/ProductPage'
import { ShopPage } from './pages/ShopPage'
import { WorkPage } from './pages/WorkPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/work" element={<WorkPage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/shop/:id" element={<ProductPage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/imprint" element={<ImprintPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
