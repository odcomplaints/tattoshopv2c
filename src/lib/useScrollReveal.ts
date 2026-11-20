import { useEffect, useRef } from 'react'

/**
 * Hook for subtle scroll reveal animation using Intersection Observer.
 * Applies fade-in + slight upward movement when element enters viewport.
 */
export function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('reveal-active')
          observer.unobserve(element)
        }
      },
      { threshold }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold])

  return ref
}
