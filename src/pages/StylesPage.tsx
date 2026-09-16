import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import InfiniteMenu from '../components/InfiniteMenu'
import type { InfiniteMenuItem } from '../components/InfiniteMenu'
import { moodboardImages } from '../data/tattooStyles'

const INTRO_TEXT = 'Eine laufend wachsende Sammlung aus Designs, Flashes und Referenzen.'
const INTRO_SESSION_KEY = 'moodboard-intro-seen'
const TYPE_SPEED_MS = 35
const HOLD_MS = 1400
const STUDIO_EMAIL = 'od.complaints@gmail.com'

export function StylesPage() {
  const navigate = useNavigate()
  const [introText, setIntroText] = useState('')
  const [introVisible, setIntroVisible] = useState(false)
  const [showIntro, setShowIntro] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InfiniteMenuItem | null>(null)
  const hasRunRef = useRef(false)

  const menuItems: InfiniteMenuItem[] = useMemo(
    () => moodboardImages.map((img) => ({ image: img.src, title: img.alt ?? '' })),
    [],
  )

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
      <div className="relative h-[100dvh] w-screen overflow-hidden bg-neutral-950">
        <div className="h-full w-full [filter:invert(1)_brightness(1.1)]">
          <InfiniteMenu
            items={menuItems}
            backgroundColor="#ffffff"
            subdivisions={2}
            scale={1.2}
            showLabels={false}
            actionLabel="HMU!"
            actionButtonColor="#8B0000"
            onItemOpen={(item) => setSelectedItem(item)}
          />
        </div>

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

        {selectedItem && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-neutral-950/90 p-6"
            onClick={() => setSelectedItem(null)}
          >
            <div
              className="relative flex w-full max-w-sm flex-col items-center gap-6 border border-neutral-800 bg-neutral-950 p-6 text-center"
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={selectedItem.image}
                alt=""
                className="max-h-[40vh] w-full object-contain [filter:invert(1)_brightness(1.1)]"
              />
              <div>
                <p className="text-lg font-black uppercase tracking-widest text-accent">Hit me up!</p>
                <p className="mt-2 text-xs uppercase tracking-widest text-neutral-400">
                  Dieses Design als Referenz verwenden
                </p>
              </div>

              <div className="flex w-full flex-col gap-3">
                <a
                  href={`mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent(
                    `Anfrage zu Flash-Design${selectedItem.title ? `: ${selectedItem.title}` : ''}`,
                  )}&body=${encodeURIComponent(
                    `Hi, ich interessiere mich für dieses Flash-Design:\n${new URL(selectedItem.image, window.location.origin).href}\n\nMeine Wunschvorstellungen:\n`,
                  )}`}
                  className="w-full border border-accent px-5 py-3 text-xs uppercase tracking-widest text-neutral-100 transition-colors hover:border-neutral-100"
                >
                  Anfrage per E-Mail
                </a>
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/booking?ref=${encodeURIComponent(selectedItem.image)}&title=${encodeURIComponent(selectedItem.title ?? '')}`,
                    )
                  }
                  className="w-full border border-neutral-700 px-5 py-3 text-xs uppercase tracking-widest text-neutral-100 transition-colors hover:border-neutral-100"
                >
                  Direkt Termin buchen
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label="Schließen"
                className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-950 text-lg leading-none text-neutral-100 transition-colors hover:text-accent"
              >
                &times;
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
