import { useEffect, useRef, useState } from 'react'

type Slide = { src: string; alt: string; x?: number; y?: number; zoom?: number }
type Pos = { x: number; y: number; zoom: number }

const STORAGE_KEY = 'heroDebugPositions-v2'

const INTERVAL_MS = 5000
const SWIPE_THRESHOLD = 50

export function ShopHeroBanner({ slides }: { slides: Slide[] }) {
  const [active, setActive] = useState(0)
  const [debug, setDebug] = useState(false)
  const [positions, setPositions] = useState<Record<string, Pos>>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    } catch {
      return {}
    }
  })
  const [copied, setCopied] = useState(false)
  const drag = useRef<{ x: number; y: number } | null>(null)
  const touchStart = useRef(0)
  const mouseStart = useRef<number | null>(null)
  const touchEnd = useRef(0)

  useEffect(() => {
    if (slides.length < 2 || debug) return
    const timer = window.setInterval(() => setActive((index) => (index + 1) % slides.length), INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [slides.length, active, debug])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      if (event.key.toLowerCase() !== 'd' || event.ctrlKey || event.metaKey || event.altKey) return
      if (target.closest('input:not([type=range]), textarea, select, [contenteditable]')) return
      setDebug((value) => !value)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function posOf(slide: Slide): Pos {
    return positions[slide.src] ?? { x: slide.x ?? 50, y: slide.y ?? 50, zoom: slide.zoom ?? 100 }
  }

  function updatePos(patch: Partial<Pos>) {
    const slide = slides[active]
    const next = { ...positions, [slide.src]: { ...posOf(slide), ...patch } }
    setPositions(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function clamp(value: number) {
    return Math.min(100, Math.max(0, Math.round(value * 10) / 10))
  }

  function goBy(direction: 1 | -1) {
    setActive((index) => (index + direction + slides.length) % slides.length)
  }

  function handleTouchEnd() {
    if (debug) return
    const diff = touchStart.current - touchEnd.current
    if (Math.abs(diff) > SWIPE_THRESHOLD && slides.length > 1) goBy(diff > 0 ? 1 : -1)
    touchStart.current = 0
    touchEnd.current = 0
  }

  return (
    <section
      className="relative left-1/2 mb-8 h-[42.5vh] min-h-[500px] w-screen -translate-x-1/2 touch-pan-y select-none overflow-hidden bg-black max-[968px]:h-[40vh] max-[968px]:min-h-[320px] max-[640px]:h-[28vh] max-[640px]:min-h-[200px] sm:mb-12"
      aria-roledescription="carousel"
      aria-label="Hero"
      onTouchStart={(event) => {
        touchStart.current = event.touches[0].clientX
        touchEnd.current = event.touches[0].clientX
      }}
      onTouchMove={(event) => {
        touchEnd.current = event.touches[0].clientX
      }}
      onTouchEnd={handleTouchEnd}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest('[data-hero-debug]')) return
        if (!debug) {
          if (event.pointerType === 'mouse') mouseStart.current = event.clientX
          return
        }
        drag.current = { x: event.clientX, y: event.clientY }
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        if (!debug || !drag.current) return
        const rect = event.currentTarget.getBoundingClientRect()
        const current = posOf(slides[active])
        updatePos({
          x: clamp(current.x - ((event.clientX - drag.current.x) / rect.width) * 100),
          y: clamp(current.y - ((event.clientY - drag.current.y) / rect.height) * 100),
        })
        drag.current = { x: event.clientX, y: event.clientY }
      }}
      onPointerUp={(event) => {
        drag.current = null
        if (mouseStart.current === null) return
        const diff = mouseStart.current - event.clientX
        mouseStart.current = null
        if (Math.abs(diff) > SWIPE_THRESHOLD && slides.length > 1) goBy(diff > 0 ? 1 : -1)
      }}
      onPointerLeave={() => {
        mouseStart.current = null
      }}
      onDragStart={(event) => event.preventDefault()}
    >
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.src}
            role="img"
            aria-label={slide.alt}
            aria-hidden={index !== active}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${index === active ? 'z-[1] opacity-100' : 'opacity-0'}`}
            style={{
              backgroundImage: `url('${slide.src}')`,
              backgroundPosition: `${posOf(slide).x}% ${posOf(slide).y}%`,
              transform: posOf(slide).zoom !== 100 ? `scale(${posOf(slide).zoom / 100})` : undefined,
            }}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-black/20 to-black/50" />

      {debug && (
        <div
          data-hero-debug
          className="fixed bottom-4 left-4 z-[100] w-64 space-y-2 border border-white/30 bg-black/90 p-3 text-xs normal-case tracking-normal text-white"
        >
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setActive((active - 1 + slides.length) % slides.length)}>&larr;</button>
            <span>Bild {active + 1} / {slides.length}</span>
            <button type="button" onClick={() => setActive((active + 1) % slides.length)}>&rarr;</button>
          </div>
          {(['x', 'y', 'zoom'] as const).map((key) => (
            <label key={key} className="block">
              {key === 'zoom' ? 'Zoom' : key.toUpperCase()}: {posOf(slides[active])[key]}
              {key === 'zoom' ? '%' : ''}
              <input
                type="range"
                min={key === 'zoom' ? 100 : 0}
                max={key === 'zoom' ? 250 : 100}
                step={key === 'zoom' ? 1 : 0.5}
                value={posOf(slides[active])[key]}
                onChange={(event) => updatePos({ [key]: Number(event.target.value) })}
                className="w-full"
              />
            </label>
          ))}
          <p className="text-[10px] text-neutral-400">Bild im Banner ziehen verschiebt es ebenfalls. Autoplay ist aus.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => updatePos({ x: 50, y: 50, zoom: 100 })}>Reset</button>
            <button
              type="button"
              onClick={() => {
                const out = slides.map((slide) => ({ file: decodeURIComponent(slide.src.split('/').pop() ?? ''), ...posOf(slide) }))
                navigator.clipboard.writeText(JSON.stringify(out, null, 2))
                setCopied(true)
                window.setTimeout(() => setCopied(false), 1500)
              }}
            >
              {copied ? 'Kopiert!' : 'Werte kopieren'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
