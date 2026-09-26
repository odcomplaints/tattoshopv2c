import { useState } from 'react'
import type { Work } from '../data/work'

type WorkGridProps = {
  items: Work[]
}

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })

export function WorkGrid({ items }: WorkGridProps) {
  const [selected, setSelected] = useState<Work | null>(null)

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 md:gap-y-12">
      {items.map((item, index) => (
        <article key={`${item.title}-${item.date.toISOString()}`}>
          <button
            type="button"
            onClick={() => setSelected(item)}
            className="block w-full text-left"
            aria-label={`${item.title} vergrößern`}
          >
            <div className="aspect-[4/5] overflow-hidden bg-neutral-900">
              <img
                src={item.image}
                alt={`${item.title}, ${item.style} tattoo`}
                width="800"
                height="1000"
                loading={index > 1 ? 'lazy' : 'eager'}
                decoding="async"
                sizes="(min-width: 768px) 33vw, 50vw"
                className={`h-full w-full object-cover transition-opacity duration-200 hover:opacity-80 ${item.title === 'Relic' ? 'grayscale' : ''}`}
                style={item.zoom ? { transform: `scale(${item.zoom})` } : undefined}
              />
            </div>
          </button>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs uppercase tracking-widest">
            <h2 className="font-medium text-neutral-100">{item.title}</h2>
            <time className="text-neutral-300" dateTime={item.date.toISOString().slice(0, 10)}>{dateFormatter.format(item.date)}</time>
          </div>
          <p className="mt-1 text-xs text-neutral-300">{item.style}</p>
        </article>
      ))}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/95 p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col items-center gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={selected.image}
              alt={`${selected.title}, ${selected.style} tattoo`}
              className={`max-h-[75vh] w-auto max-w-full object-contain ${selected.title === 'Relic' ? 'grayscale' : ''}`}
            />
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs uppercase tracking-widest">
              <h2 className="font-medium text-neutral-100">{selected.title}</h2>
              <time className="text-neutral-300" dateTime={selected.date.toISOString().slice(0, 10)}>{dateFormatter.format(selected.date)}</time>
            </div>
            <p className="text-xs text-neutral-300">{selected.style}</p>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Schließen"
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-950 text-lg leading-none text-neutral-100 transition-colors hover:text-accent"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}