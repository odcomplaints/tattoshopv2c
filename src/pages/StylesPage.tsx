import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import DomeGallery from '../components/DomeGallery'
import { moodboardImages } from '../data/tattooStyles'

const INTRO_TEXT = 'Eine laufend wachsende Sammlung aus Designs, Flashes und Referenzen.'
const INTRO_SESSION_KEY = 'moodboard-intro-seen'
const TYPE_SPEED_MS = 35
const HOLD_MS = 1400

export function StylesPage() {
  const navigate = useNavigate()
  const [introText, setIntroText] = useState('')
  const [introVisible, setIntroVisible] = useState(false)
  const [showIntro, setShowIntro] = useState(false)
  const hasRunRef = useRef(false)

  useEffect(() => {
    if (hasRunRef.current) return
    hasRunRef.current = true

    let alreadySeen = false
    try {
      alreadySeen = sessionStorage.getItem(INTRO_SESSION_KEY) === '1'
    } catch {
      alreadySeen = false
    }

    if (alreadySeen) return

    setShowIntro(true)
    setIntroVisible(true)

    let i = 0
    const typeInterval = setInterval(() => {
      i += 1
      setIntroText(INTRO_TEXT.slice(0, i))
      if (i >= INTRO_TEXT.length) {
        clearInterval(typeInterval)
        const holdTimeout = setTimeout(() => {
          setIntroVisible(false)
          const removeTimeout = setTimeout(() => setShowIntro(false), 600)
          return () => clearTimeout(removeTimeout)
        }, HOLD_MS)
        return () => clearTimeout(holdTimeout)
      }
    }, TYPE_SPEED_MS)

    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, '1')
    } catch {
      // ignore storage errors (e.g. private browsing)
    }

    return () => clearInterval(typeInterval)
  }, [])

  return (
    <Layout
      title="Moodboard | OD COMPLAINTS"
      description="Ein gemeinsames Moodboard mit Designs, Flashes und Referenzen von OD COMPLAINTS."
      hideChrome
    >
      <div className="relative h-[100dvh] w-screen overflow-hidden">
        <DomeGallery
          images={moodboardImages}
          grayscale={false}
          imageFilter="invert(1) brightness(1.1)"
          fit={0.75}
          padFactor={0.05}
        />

        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1)
            } else {
              navigate('/')
            }
          }}
          aria-label="Zurück"
          className="absolute left-5 top-5 z-30 flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-100 transition-colors hover:text-accent sm:left-8 sm:top-8"
        >
          <span aria-hidden="true">&larr;</span> Zurück
        </button>

        {showIntro && (
          <div
            className={`pointer-events-none absolute inset-x-0 top-1/2 z-30 flex -translate-y-1/2 justify-center px-6 text-center transition-opacity duration-[600ms] ease-out ${introVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            <p className="max-w-md text-sm uppercase tracking-widest text-neutral-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-base">
              {introText}
              <span className="inline-block w-[0.5ch] animate-pulse">|</span>
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}
