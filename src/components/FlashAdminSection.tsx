import { useState } from 'react'
import { flashSettings } from '../data/flashSettings'
import type { FlashSettings } from '../data/flashSettings'
import { moodboardImages } from '../data/tattooStyles'

const DRAFT_KEY = 'od-complaints-flash-draft'

function readDraft(): { settings: FlashSettings; error: string } {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY)
    if (!raw) return { settings: flashSettings, error: '' }
    const value: unknown = JSON.parse(raw)
    if (
      typeof value !== 'object' || value === null ||
      !('hidden' in value) || !Array.isArray(value.hidden) ||
      !value.hidden.every((path: unknown) => typeof path === 'string') ||
      !('head' in value) || (value.head !== null && typeof value.head !== 'string')
    ) {
      throw new Error('Invalid flash draft')
    }

    const paths = new Set(moodboardImages.map((image) => image.src))
    const hidden = [...new Set<string>(value.hidden.filter((path: string) => paths.has(path)))]
    if (hidden.length >= paths.size && paths.size > 0) throw new Error('All flashes are hidden')
    const head = value.head && paths.has(value.head) && !hidden.includes(value.head) ? value.head : null
    return { settings: { hidden, head }, error: '' }
  } catch (error) {
    console.error('Flash-Entwurf konnte nicht geladen werden:', error)
    return { settings: flashSettings, error: 'Der lokale Flash-Entwurf konnte nicht geladen werden.' }
  }
}

function generateSettings(settings: FlashSettings): string {
  return [
    'export type FlashSettings = {',
    '  hidden: string[]',
    '  head: string | null',
    '}',
    '',
    `export const flashSettings: FlashSettings = ${JSON.stringify(settings, null, 2)}`,
    '',
  ].join('\n')
}

export function FlashAdminSection() {
  const [draft] = useState(readDraft)
  const [settings, setSettings] = useState(draft.settings)
  const [storageError, setStorageError] = useState(draft.error)
  const [copyStatus, setCopyStatus] = useState('')

  function updateSettings(next: FlashSettings) {
    setSettings(next)
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(next))
      setStorageError('')
    } catch (error) {
      console.error('Flash-Entwurf konnte nicht gespeichert werden:', error)
      setStorageError('Der Flash-Entwurf konnte nicht lokal gespeichert werden.')
    }
  }

  function setVisible(path: string, visible: boolean) {
    const hidden = visible ? settings.hidden.filter((item) => item !== path) : [...settings.hidden, path]
    const head = !visible && settings.head === path ? null : settings.head
    updateSettings({ hidden, head })
  }

  async function copySettings() {
    try {
      await navigator.clipboard.writeText(generateSettings(settings))
      setCopyStatus('Konfiguration kopiert.')
    } catch (error) {
      console.error('Flash-Konfiguration konnte nicht kopiert werden:', error)
      setCopyStatus('Kopieren fehlgeschlagen. Den Code unten manuell markieren und kopieren.')
    }
  }

  const visibleCount = moodboardImages.filter((image) => !settings.hidden.includes(image.src)).length

  return (
    <section className="mt-12 border-t border-neutral-800 pt-8" aria-labelledby="flash-admin-heading">
      <h2 id="flash-admin-heading" className="text-lg font-medium uppercase tracking-widest text-neutral-100">
        Browse Flashes verwalten
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-neutral-400">
        Sichtbare Motive auswählen und ein Startmotiv für die Spin-Ansicht festlegen. Der Entwurf wird nur in
        diesem Browser gespeichert. Für die Veröffentlichung den Code in src/data/flashSettings.ts einfügen,
        speichern und die Website neu deployen.
      </p>
      {storageError && <p role="alert" className="mt-3 text-sm text-accent">{storageError}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button type="button" onClick={copySettings} className="cta-solid border border-accent bg-accent px-5 py-3 text-xs uppercase tracking-widest hover:opacity-90">
          Flash-Konfiguration kopieren
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Flash-Entwurf auf den veröffentlichten Stand zurücksetzen?')) {
              updateSettings(flashSettings)
            }
          }}
          className="text-xs uppercase tracking-widest text-neutral-400 hover:text-accent"
        >
          Flash-Entwurf zurücksetzen
        </button>
        <span className="text-xs text-neutral-400">{visibleCount} von {moodboardImages.length} sichtbar</span>
      </div>
      {copyStatus && <p role="status" className="mt-3 text-xs text-neutral-300">{copyStatus}</p>}
      <details className="mt-4 text-xs text-neutral-400">
        <summary className="cursor-pointer">Konfiguration zum manuellen Kopieren anzeigen</summary>
        <textarea readOnly aria-label="Flash-Konfiguration" value={generateSettings(settings)} rows={8} className="mt-3 w-full border border-neutral-800 bg-neutral-950 p-3 font-mono text-neutral-200" />
      </details>
      <label className="mt-6 flex items-center gap-2 text-sm text-neutral-300">
        <input type="radio" name="flash-head" checked={settings.head === null} onChange={() => updateSettings({ ...settings, head: null })} className="accent-accent" />
        Startmotiv automatisch wählen (bisherige Ansicht)
      </label>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {moodboardImages.map((image) => {
          const visible = !settings.hidden.includes(image.src)
          const name = image.alt || image.src
          return (
            <div key={image.src} className="border border-neutral-800 p-3">
              <img src={image.src} alt={name} loading="lazy" className="aspect-square w-full object-contain" />
              <p className="mt-2 break-all text-xs text-neutral-300">{name}</p>
              <label className="mt-3 flex items-center gap-2 text-xs text-neutral-300">
                <input type="checkbox" checked={visible} disabled={visible && visibleCount === 1} onChange={(event) => setVisible(image.src, event.target.checked)} className="accent-accent" />
                Sichtbar
              </label>
              <label className={`mt-2 flex items-center gap-2 text-xs ${visible ? 'text-neutral-300' : 'text-neutral-600'}`}>
                <input type="radio" name="flash-head" checked={settings.head === image.src} disabled={!visible} onChange={() => updateSettings({ ...settings, head: image.src })} className="accent-accent" />
                Startmotiv
              </label>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-neutral-500">Mindestens ein Motiv muss sichtbar bleiben. Wird das Startmotiv ausgeblendet, wird die automatische Auswahl verwendet.</p>
    </section>
  )
}
