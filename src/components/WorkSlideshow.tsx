import { useEffect, useState } from 'react'
import type { Work } from '../data/work'

type WorkSlideshowProps = {
  items: Work[]
  intervalMs?: number
}

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })

export function WorkSlideshow({ items, intervalMs = 4500 }: WorkSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (items.length < 2) return
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length)
    }, intervalMs)
    return () => window.clearInterval(timer)
  }, [items.length, intervalMs])

  if (items.length === 0) return null

  return (
    <div className="mx-auto max-w-2xl">
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900 sm:aspect-[16/10]">
        {items.map((item, index) => (
          <img
            key={`${item.title}-${item.date.toISOString()}`}
            src={item.image}
            alt={`${item.title}, ${item.style} tattoo on the ${item.bodyPart}`}
            width="800"
            height="1000"
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === activeIndex ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 text-xs uppercase tracking-widest">
        <h2 className="font-medium text-neutral-100">{items[activeIndex].title}</h2>
        <time className="text-neutral-500" dateTime={items[activeIndex].date.toISOString().slice(0, 10)}>
          {dateFormatter.format(items[activeIndex].date)}
        </time>
      </div>
      <p className="mt-1 text-xs text-neutral-500">{items[activeIndex].style} / {items[activeIndex].bodyPart}</p>
      <div className="mt-5 flex justify-center gap-2">
        {items.map((item, index) => (
          <button
            key={`${item.title}-dot`}
            type="button"
            aria-label={`Show slide ${index + 1}`}
            aria-current={index === activeIndex}
            onClick={() => setActiveIndex(index)}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${index === activeIndex ? 'bg-accent' : 'bg-neutral-700'}`}
          />
        ))}
      </div>
    </div>
  )
}
