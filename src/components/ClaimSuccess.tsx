import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { claimCopy } from '../data/claims'
import { useLanguage } from '../context/LanguageContext'

type ClaimInfo = { workId: string; title: string; files: string[] }
type SessionInfo = { paymentStatus?: string; claims?: ClaimInfo[] }
type Phase =
  | { kind: 'loading' }
  | { kind: 'paid'; claims: ClaimInfo[] }
  | { kind: 'pending' }
  | { kind: 'failed' }

// Payment status and purchased templates come from Stripe via /api/session, never from the URL alone.
function useClaimSession(sessionId: string | null): Phase {
  const [phase, setPhase] = useState<Phase>({ kind: sessionId ? 'loading' : 'failed' })

  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    fetch(`/api/session?id=${encodeURIComponent(sessionId)}`)
      .then((response) => (response.ok ? (response.json() as Promise<SessionInfo>) : Promise.reject(new Error('session'))))
      .then((info) => {
        if (cancelled) return
        const claims = info.claims ?? []
        if (claims.length === 0) setPhase({ kind: 'failed' })
        else if (info.paymentStatus === 'paid') setPhase({ kind: 'paid', claims })
        else setPhase({ kind: 'pending' })
      })
      .catch(() => {
        if (!cancelled) setPhase({ kind: 'failed' })
      })
    return () => {
      cancelled = true
    }
  }, [sessionId])

  return phase
}

function DownloadList({ sessionId, claims }: { sessionId: string; claims: ClaimInfo[] }) {
  const { language } = useLanguage()
  const copy = claimCopy[language].success
  const total = claims.reduce((sum, claim) => sum + claim.files.length, 0)
  return (
    <ul className="mt-6 flex flex-col items-center gap-3">
      {claims.flatMap((claim) =>
        claim.files.map((label, index) => (
          <li key={`${claim.workId}-${index}`}>
            <a
              href={`/api/claim-download?session_id=${encodeURIComponent(sessionId)}&work=${encodeURIComponent(claim.workId)}&file=${index}`}
              className="inline-block border border-accent px-6 py-3 text-xs uppercase tracking-widest text-neutral-100 transition-colors hover:border-neutral-100"
            >
              {copy.download}
              {total > 1 ? ` — ${claims.length > 1 ? `${claim.title} ` : ''}${label}` : ''}
            </a>
          </li>
        )),
      )}
    </ul>
  )
}

/** Download section for orders that mix templates with shop items (rendered below the shop confirmation). */
export function ClaimDownloads({ sessionId }: { sessionId: string | null }) {
  const { language } = useLanguage()
  const copy = claimCopy[language].success
  const phase = useClaimSession(sessionId)
  if (!sessionId || phase.kind === 'loading' || phase.kind === 'failed') return null
  return (
    <div className="mt-8 border-t border-neutral-800 pt-6">
      <p className="text-xs uppercase tracking-widest text-neutral-300">{copy.list}</p>
      {phase.kind === 'paid' ? <DownloadList sessionId={sessionId} claims={phase.claims} /> : <p className="mt-3 text-sm leading-7 text-neutral-400">{copy.pending}</p>}
    </div>
  )
}

// Success view for an order that contains only digital templates (/shop/success?type=claim).
export function ClaimSuccess({ sessionId }: { sessionId: string | null }) {
  const { language } = useLanguage()
  const copy = claimCopy[language].success
  const phase = useClaimSession(sessionId)

  const message =
    phase.kind === 'paid' ? copy.body : phase.kind === 'pending' ? copy.pending : phase.kind === 'failed' ? copy.failed : copy.loading

  return (
    <div className="mx-auto flex min-h-[50svh] max-w-md flex-col items-center justify-center text-center">
      <p className="text-xs uppercase tracking-widest text-accent">{copy.eyebrow}</p>
      <h1 className="mt-4 text-3xl font-medium uppercase tracking-widest text-neutral-100">{copy.heading}</h1>
      <p className="mt-4 text-sm leading-7 text-neutral-400" role="status">{message}</p>
      {phase.kind === 'paid' && sessionId && <DownloadList sessionId={sessionId} claims={phase.claims} />}
      {sessionId && <p className="mt-4 break-all text-[10px] uppercase tracking-widest text-neutral-600">{sessionId}</p>}
      <Link
        to="/work"
        className="mt-8 inline-block text-xs uppercase tracking-widest text-neutral-300 underline underline-offset-4 transition-colors hover:text-accent"
      >
        {copy.back}
      </Link>
    </div>
  )
}
