import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import EvilEye from './EvilEye'

// Site-wide EvilEye WebGL background, fixed behind all content, plus a live
// tuning panel (toggle with the "H" key). Adjust every shader parameter in
// real time, then hit "Copy config" to grab the exact values.

export type EyeConfig = {
  eyeColor: string
  pupilColor: string
  backgroundColor: string
  intensity: number
  pupilSize: number
  irisWidth: number
  glowIntensity: number
  scale: number
  noiseScale: number
  pupilFollow: number
  flameSpeed: number
  // Not a shader uniform — opacity of the dark scrim between eye and content,
  // used to keep text readable over the animation.
  scrimOpacity: number
}

const DEFAULT_CONFIG: EyeConfig = {
  eyeColor: '#6e0707',
  pupilColor: '#fb9404',
  backgroundColor: '#000000',
  intensity: 0.2,
  pupilSize: 0.05,
  irisWidth: 0.21,
  glowIntensity: 1,
  scale: 0.7,
  noiseScale: 0.85,
  pupilFollow: 2,
  flameSpeed: 0.15,
  scrimOpacity: 0,
}

const STORAGE_KEY = 'evileye-config'

const SLIDERS: { key: keyof EyeConfig; label: string; min: number; max: number; step: number }[] = [
  { key: 'intensity', label: 'Intensity', min: 0, max: 3, step: 0.05 },
  { key: 'pupilSize', label: 'Pupil size', min: 0, max: 1.5, step: 0.05 },
  { key: 'irisWidth', label: 'Iris width', min: 0.05, max: 1, step: 0.01 },
  { key: 'glowIntensity', label: 'Glow intensity', min: 0, max: 1, step: 0.01 },
  { key: 'scale', label: 'Scale (zoom)', min: 0.3, max: 4, step: 0.05 },
  { key: 'noiseScale', label: 'Noise scale', min: 0.1, max: 3, step: 0.05 },
  { key: 'pupilFollow', label: 'Pupil follow', min: 0, max: 2, step: 0.05 },
  { key: 'flameSpeed', label: 'Flame speed', min: 0, max: 3, step: 0.05 },
  { key: 'scrimOpacity', label: 'Readability scrim', min: 0, max: 0.95, step: 0.01 },
]

function loadConfig(): EyeConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_CONFIG, ...(JSON.parse(raw) as Partial<EyeConfig>) }
  } catch {
    // ignore malformed storage
  }
  return DEFAULT_CONFIG
}

export default function SiteBackground() {
  const [config, setConfig] = useState<EyeConfig>(loadConfig)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Persist tuning across reloads.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch {
      // ignore write failures (private mode etc.)
    }
  }, [config])

  // Toggle the debug panel with "H" (ignored while typing in a field).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== 'h' || e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      setOpen((o) => !o)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const setNum = useCallback((key: keyof EyeConfig, value: number) => {
    setConfig((c) => ({ ...c, [key]: value }))
  }, [])

  const setStr = useCallback((key: keyof EyeConfig, value: string) => {
    setConfig((c) => ({ ...c, [key]: value }))
  }, [])

  const snippet = useMemo(() => {
    const c = config
    return [
      '<EvilEye',
      `  eyeColor="${c.eyeColor}"`,
      `  pupilColor="${c.pupilColor}"`,
      `  backgroundColor="${c.backgroundColor}"`,
      `  intensity={${c.intensity}}`,
      `  pupilSize={${c.pupilSize}}`,
      `  irisWidth={${c.irisWidth}}`,
      `  glowIntensity={${c.glowIntensity}}`,
      `  scale={${c.scale}}`,
      `  noiseScale={${c.noiseScale}}`,
      `  pupilFollow={${c.pupilFollow}}`,
      `  flameSpeed={${c.flameSpeed}}`,
      '/>',
      `// scrimOpacity: ${c.scrimOpacity}`,
      `// JSON: ${JSON.stringify(c)}`,
    ].join('\n')
  }, [config])

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }, [snippet])

  return (
    <>
      {/* Fixed WebGL background behind everything (Layout content is z-10). */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <EvilEye
          eyeColor={config.eyeColor}
          pupilColor={config.pupilColor}
          backgroundColor={config.backgroundColor}
          intensity={config.intensity}
          pupilSize={config.pupilSize}
          irisWidth={config.irisWidth}
          glowIntensity={config.glowIntensity}
          scale={config.scale}
          noiseScale={config.noiseScale}
          pupilFollow={config.pupilFollow}
          flameSpeed={config.flameSpeed}
        />
        {/* Dark scrim keeps content readable over the animation. */}
        <div style={{ position: 'absolute', inset: 0, background: '#0a0a0a', opacity: config.scrimOpacity }} />
      </div>

      {open &&
        createPortal(
          <DebugPanel
            config={config}
            setNum={setNum}
            setStr={setStr}
            snippet={snippet}
            copied={copied}
            onCopy={copy}
            onReset={() => setConfig(DEFAULT_CONFIG)}
            onClose={() => setOpen(false)}
          />,
          document.body,
        )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Debug panel — portaled to <body> so the site's global red/uppercase styles
// (scoped to #root) don't leak in. All styling is inline and self-contained.
// ---------------------------------------------------------------------------

type PanelProps = {
  config: EyeConfig
  setNum: (key: keyof EyeConfig, value: number) => void
  setStr: (key: keyof EyeConfig, value: string) => void
  snippet: string
  copied: boolean
  onCopy: () => void
  onReset: () => void
  onClose: () => void
}

function DebugPanel({ config, setNum, setStr, snippet, copied, onCopy, onReset, onClose }: PanelProps) {
  const label: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }
  const btn: React.CSSProperties = {
    flex: 1,
    padding: '8px 10px',
    fontSize: 12,
    fontWeight: 600,
    color: '#e5e5e5',
    background: '#1c1c1c',
    border: '1px solid #3a3a3a',
    borderRadius: 6,
    cursor: 'pointer',
    textTransform: 'none',
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        width: 300,
        maxHeight: 'calc(100vh - 24px)',
        overflowY: 'auto',
        zIndex: 2147483000,
        padding: 14,
        background: 'rgba(12,12,12,0.94)',
        border: '1px solid #333',
        borderRadius: 10,
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        color: '#e5e5e5',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        fontSize: 12,
        letterSpacing: 'normal',
        textTransform: 'none',
        lineHeight: 1.4,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <strong style={{ fontSize: 13 }}>EvilEye — Tuning</strong>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
          aria-label="Close (H)"
        >
          ×
        </button>
      </div>

      {/* Colors */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {([
          ['eyeColor', 'Eye'],
          ['pupilColor', 'Pupil'],
          ['backgroundColor', 'Background'],
        ] as [keyof EyeConfig, string][]).map(([key, name]) => (
          <label key={key} style={{ flex: 1, minWidth: 0 }}>
            <div style={label}>
              <span>{name}</span>
            </div>
            <input
              type="color"
              value={config[key] as string}
              onChange={(e) => setStr(key, e.target.value)}
              title={config[key] as string}
              style={{ width: '100%', height: 28, background: 'none', border: '1px solid #3a3a3a', borderRadius: 6, cursor: 'pointer' }}
            />
          </label>
        ))}
      </div>

      {/* Sliders */}
      {SLIDERS.map((s) => (
        <div key={s.key} style={{ marginBottom: 10 }}>
          <div style={label}>
            <span>{s.label}</span>
            <span style={{ color: '#888' }}>{Number(config[s.key]).toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={s.min}
            max={s.max}
            step={s.step}
            value={config[s.key] as number}
            onChange={(e) => setNum(s.key, parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: config.eyeColor }}
          />
        </div>
      ))}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button onClick={onCopy} style={{ ...btn, background: copied ? '#14532d' : '#1c1c1c', borderColor: copied ? '#22c55e' : '#3a3a3a' }}>
          {copied ? '✓ Copied!' : 'Copy config'}
        </button>
        <button onClick={onReset} style={{ ...btn, flex: '0 0 auto' }}>
          Reset
        </button>
      </div>

      <pre
        style={{
          marginTop: 12,
          padding: 10,
          background: '#0a0a0a',
          border: '1px solid #262626',
          borderRadius: 6,
          fontSize: 10.5,
          lineHeight: 1.45,
          color: '#9ca3af',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        {snippet}
      </pre>

      <p style={{ margin: '10px 0 0', fontSize: 10.5, color: '#666' }}>Press H to toggle this panel.</p>
    </div>
  )
}
