import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { ClickSpark } from './components/ClickSpark'

// Site-wide WebGL background is code-split so ogl doesn't block first paint.
const SiteBackground = lazy(() => import('./components/SiteBackground'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
          <SiteBackground />
        </Suspense>
        <App />
        <ClickSpark />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
