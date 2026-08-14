import { useEffect, useRef } from 'react'

// Click spark burst effect. Adapted from React Bits (ClickSpark) into a fixed,
// viewport-wide overlay that listens for clicks anywhere on the page.
// Desktop only: on touch devices / reduced-motion it renders nothing and attaches
// no listeners, so mobile stays fully performant.

type Easing = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'

type ClickSparkProps = {
  sparkColor?: string
  sparkSize?: number
  sparkRadius?: number
  sparkCount?: number
  duration?: number
  easing?: Easing
  extraScale?: number
}

type Spark = { x: number; y: number; angle: number; startTime: number }

export function ClickSpark({
  sparkColor = '#FF3939',
  sparkSize = 11,
  sparkRadius = 20,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sparksRef = useRef<Spark[]>([])
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!finePointer || reduceMotion) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const easeFunc = (t: number) => {
      switch (easing) {
        case 'linear':
          return t
        case 'ease-in':
          return t * t
        case 'ease-in-out':
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        default:
          return t * (2 - t)
      }
    }

    const draw = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime
        if (elapsed >= duration) return false

        const eased = easeFunc(elapsed / duration)
        const distance = eased * sparkRadius * extraScale
        const lineLength = sparkSize * (1 - eased)

        const x1 = spark.x + distance * Math.cos(spark.angle)
        const y1 = spark.y + distance * Math.sin(spark.angle)
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle)
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle)

        ctx.strokeStyle = sparkColor
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()

        return true
      })

      // Only keep the animation loop alive while sparks exist.
      if (sparksRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(draw)
      } else {
        rafRef.current = null
      }
    }

    const handleClick = (event: MouseEvent) => {
      const now = performance.now()
      for (let i = 0; i < sparkCount; i++) {
        sparksRef.current.push({
          x: event.clientX,
          y: event.clientY,
          angle: (2 * Math.PI * i) / sparkCount,
          startTime: now,
        })
      }
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(draw)
      }
    }

    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('click', handleClick)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, easing, extraScale])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}
