import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Ensures every route change starts scrolled to the top of the page,
// instead of keeping the previous page's scroll position (which caused
// links like "Start an inquiry" to land mid-page on mobile).
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
