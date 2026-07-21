import type { Work } from '../data/work'

type WorkGridProps = {
  items: Work[]
}

const dateFormatter = new Intl.DateTimeFormat('de-DE', { month: 'short', year: 'numeric' })

export function WorkGrid({ items }: WorkGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 md:gap-y-12">
      {items.map((item, index) => (
        <article key={`${item.title}-${item.date.toISOString()}`}>
          <div className="aspect-[4/5] overflow-hidden bg-neutral-900">
            <img
              src={item.image}
              alt={`${item.title}, ${item.style} Tattoo am ${item.bodyPart}`}
              width="800"
              height="1000"
              loading={index > 1 ? 'lazy' : 'eager'}
              decoding="async"
              sizes="(min-width: 768px) 33vw, 50vw"
              className="h-full w-full object-cover transition-opacity duration-200 hover:opacity-80"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs uppercase tracking-widest">
            <h2 className="font-medium text-neutral-100">{item.title}</h2>
            <time className="text-neutral-500" dateTime={item.date.toISOString().slice(0, 10)}>{dateFormatter.format(item.date)}</time>
          </div>
          <p className="mt-1 text-xs text-neutral-500">{item.style} / {item.bodyPart}</p>
        </article>
      ))}
    </div>
  )
}