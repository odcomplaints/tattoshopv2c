import { useMemo, useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'

const PRIVATE_VALUES = [
  'Jonas Geiger',
  'Unterer Weiler 5',
  '73527 Schwäbisch Gmünd',
  'od.complaints@gmail.com',
  '+49 176 81072268',
]

const PRIVATE_VALUE_PATTERN = new RegExp(
  PRIVATE_VALUES.map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'g',
)

type PrivateInfoTextProps = {
  html: string
}

export function PrivateInfoText({ html }: PrivateInfoTextProps) {
  const [revealedValues, setRevealedValues] = useState<Set<number>>(() => new Set())

  const protectedHtml = useMemo(() => {
    let index = 0
    return html.replace(PRIVATE_VALUE_PATTERN, (value) => {
      const currentIndex = index++
      const revealedClass = revealedValues.has(currentIndex) ? ' is-revealed' : ''
      return `<span class="private-info${revealedClass}" data-private-info="${currentIndex}" role="button" tabindex="0" aria-label="Private Angabe anzeigen oder verbergen">${value}</span>`
    })
  }, [html, revealedValues])

  const toggleValue = (index: number) => {
    setRevealedValues((current) => {
      const next = new Set(current)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const handleClick = (event: MouseEvent<HTMLParagraphElement>) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-private-info]')
    if (!target || !event.currentTarget.contains(target)) return

    toggleValue(Number(target.dataset.privateInfo))
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLParagraphElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-private-info]')
    if (!target || !event.currentTarget.contains(target)) return

    event.preventDefault()
    toggleValue(Number(target.dataset.privateInfo))
  }

  return (
    <p
      className="mt-2"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      dangerouslySetInnerHTML={{ __html: protectedHtml }}
    />
  )
}
