import { useRef } from 'react'
import type { MouseEvent } from 'react'
import gsap from 'gsap'
import './FlowingMenu.css'

export type FlowingMenuItemData = { id: string; text: string; images: string[] }

const ANIMATION = { duration: 0.6, ease: 'expo.out' }

function closestEdge(x: number, y: number, width: number, height: number) {
  const top = (x - width / 2) ** 2 + y ** 2
  const bottom = (x - width / 2) ** 2 + (y - height) ** 2
  return top < bottom ? 'top' : 'bottom'
}

function FlowingMenuItem({ item, onSelect }: { item: FlowingMenuItemData; onSelect: (id: string) => void }) {
  const itemRef = useRef<HTMLDivElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  function edgeFor(event: MouseEvent) {
    const rect = itemRef.current!.getBoundingClientRect()
    return closestEdge(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height)
  }

  function handleEnter(event: MouseEvent) {
    if (!itemRef.current || !marqueeRef.current || !innerRef.current) return
    const edge = edgeFor(event)
    gsap
      .timeline({ defaults: ANIMATION })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(innerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, innerRef.current], { y: '0%' }, 0)
  }

  function handleLeave(event: MouseEvent) {
    if (!itemRef.current || !marqueeRef.current || !innerRef.current) return
    const edge = edgeFor(event)
    gsap
      .timeline({ defaults: ANIMATION })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(innerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
  }

  return (
    <div ref={itemRef} className="flowing-menu__item">
      <a
        href={`?category=${item.id}`}
        className="flowing-menu__link"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onClick={(event) => {
          event.preventDefault()
          onSelect(item.id)
        }}
      >
        {item.text}
      </a>
      <div ref={marqueeRef} className="flowing-menu__marquee">
        <div ref={innerRef} className="flowing-menu__inner-wrap">
          <div className="flowing-menu__inner" aria-hidden="true">
            {Array.from({ length: 32 }, (_, index) => (
              <div
                key={index}
                className="flowing-menu__img"
                style={{ backgroundImage: `url('${item.images[index % item.images.length]}')` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function FlowingMenu({ items, onSelect }: { items: FlowingMenuItemData[]; onSelect: (id: string) => void }) {
  return (
    <div className="flowing-menu">
      <nav className="flowing-menu__nav" aria-label="Kategorien">
        {items.map((item) => (
          <FlowingMenuItem key={item.id} item={item} onSelect={onSelect} />
        ))}
      </nav>
    </div>
  )
}
