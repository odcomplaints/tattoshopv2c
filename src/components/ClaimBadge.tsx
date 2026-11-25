import { claimCopy } from '../data/claims'
import { useLanguage } from '../context/LanguageContext'
import type { ClaimState } from '../lib/claims'

export function ClaimBadge({ state }: { state: ClaimState }) {
  const { language } = useLanguage()
  if (state === 'none') return null
  const copy = claimCopy[language]
  const label = state === 'available' ? copy.available : state === 'reserved' ? copy.reserved : copy.claimed
  return (
    <span
      className={`inline-block border px-2 py-0.5 text-[10px] uppercase tracking-widest ${
        state === 'available' ? 'border-accent text-accent' : 'border-neutral-700 text-neutral-500'
      }`}
    >
      {label}
    </span>
  )
}
