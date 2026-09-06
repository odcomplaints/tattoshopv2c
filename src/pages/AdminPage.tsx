import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Layout } from '../components/Layout'
import { shopItems as initialShopItems } from '../data/shop'
import type { ShopItem } from '../data/shop'

// ─────────────────────────────────────────────────────────────────────────
// Local-only admin tool.
//
// There is no backend/database in this project — `src/data/shop.ts` and
// `src/data/catalog.ts` are the source of truth and are committed to the repo.
// This page lets you edit everything visually, then generates the exact
// TypeScript file contents for both files so you can paste them back in and
// commit. Your edits are auto-saved to localStorage so a reload won't lose
// your work, but nothing here touches the real files or the live site until
// you paste the generated code yourself.
// ─────────────────────────────────────────────────────────────────────────

const DRAFT_KEY = 'od-complaints-admin-draft'
const AUTH_KEY = 'od-complaints-admin-auth'
// Simple client-side gate so this isn't immediately editable by any visitor
// who finds the URL. This is NOT real security — anyone reading the source
// can see/bypass it. Don't put anything truly secret behind it.
const ADMIN_PASSWORD = 'odcomplaints2026'

function emptyItem(): ShopItem {
  return {
    id: '',
    name: '',
    price: '0 EUR',
    category: '',
    image: '/assets/shop/',
    availability: 'available',
    stock: 1,
    description: '',
    details: [],
  }
}

function parsePriceToCents(price: string): number {
  const match = price.trim().match(/^([\d.,]+)/)
  if (!match) return 0
  return Math.round(Number(match[1].replace(',', '.')) * 100)
}

function escapeSingle(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function generateShopTs(items: ShopItem[]): string {
  const lines: string[] = []
  lines.push(`export type ShopItem = {`)
  lines.push(`  id: string`)
  lines.push(`  name: string`)
  lines.push(`  price: string`)
  lines.push(`  category: string`)
  lines.push(`  image: string`)
  lines.push(`  availability: 'available' | 'sold-out'`)
  lines.push(`  stock: number`)
  lines.push(`  description: string`)
  lines.push(`  details: string[]`)
  lines.push(`}`)
  lines.push(``)
  lines.push(`export const shopItems: ShopItem[] = [`)
  for (const item of items) {
    lines.push(`  {`)
    lines.push(`    id: '${escapeSingle(item.id)}',`)
    lines.push(`    name: '${escapeSingle(item.name)}',`)
    lines.push(`    price: '${escapeSingle(item.price)}',`)
    lines.push(`    category: '${escapeSingle(item.category)}',`)
    lines.push(`    image: '${escapeSingle(item.image)}',`)
    lines.push(`    availability: '${item.availability}',`)
    lines.push(`    stock: ${Number.isFinite(item.stock) ? item.stock : 0},`)
    lines.push(`    description:`)
    lines.push(`      '${escapeSingle(item.description)}',`)
    lines.push(`    details: [${item.details.map((d) => `'${escapeSingle(d)}'`).join(', ')}],`)
    lines.push(`  },`)
  }
  lines.push(`]`)
  lines.push(``)
  return lines.join('\n')
}

function generateCatalogTs(items: ShopItem[]): string {
  const lines: string[] = []
  lines.push(`// Server-side price source of truth.`)
  lines.push(`//`)
  lines.push(`// The prices a customer is charged MUST come from here, never from the client.`)
  lines.push(`// The frontend (src/data/shop.ts) only holds display copy; the amounts below are`)
  lines.push(`// what actually gets sent to Stripe. Keep the values in sync with shop.ts.`)
  lines.push(`//`)
  lines.push(`// This module is intentionally free of any asset/image imports so it can be`)
  lines.push(`// bundled by both the Vite app and the Cloudflare Pages Functions (functions/).`)
  lines.push(``)
  lines.push(`export type CatalogEntry = {`)
  lines.push(`  /** Product id — matches ShopItem.id in src/data/shop.ts */`)
  lines.push(`  id: string`)
  lines.push(`  /** Display name sent to Stripe as the line item name */`)
  lines.push(`  name: string`)
  lines.push(`  /** Unit price in the smallest currency unit (cents for EUR) */`)
  lines.push(`  priceCents: number`)
  lines.push(`  /** ISO currency code, lowercase */`)
  lines.push(`  currency: string`)
  lines.push(`  /** Whether the item can currently be purchased */`)
  lines.push(`  available: boolean`)
  lines.push(`}`)
  lines.push(``)
  lines.push(`export const catalog: Record<string, CatalogEntry> = {`)
  for (const item of items) {
    const cents = parsePriceToCents(item.price)
    const available = item.availability === 'available' && item.stock > 0
    lines.push(
      `  '${item.id}': { id: '${item.id}', name: '${escapeSingle(item.name)}', priceCents: ${cents}, currency: 'eur', available: ${available} },`,
    )
  }
  lines.push(`}`)
  lines.push(``)
  lines.push(`export function getCatalogEntry(id: string): CatalogEntry | undefined {`)
  lines.push(`  return catalog[id]`)
  lines.push(`}`)
  lines.push(``)
  return lines.join('\n')
}

function readDraft(): ShopItem[] | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as ShopItem[]) : null
  } catch {
    return null
  }
}

type TrackingForm = {
  customerEmail: string
  customerName: string
  orderSummary: string
  carrier: string
  trackingUrl: string
  trackingCode: string
  note: string
}

function emptyTrackingForm(): TrackingForm {
  return {
    customerEmail: '',
    customerName: '',
    orderSummary: '',
    carrier: '',
    trackingUrl: '',
    trackingCode: '',
    note: '',
  }
}

// Sends the shipping-confirmation email through /api/send-tracking. The
// endpoint is protected by ADMIN_SEND_KEY on the server — we reuse the same
// password you use to log into this panel so there's nothing extra to
// remember (set ADMIN_SEND_KEY to the same value in Vercel/Cloudflare env vars).
function ShippingConfirmationSection() {
  const [form, setForm] = useState<TrackingForm>(emptyTrackingForm())
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  function update(patch: Partial<TrackingForm>) {
    setForm((current) => ({ ...current, ...patch }))
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')
    try {
      const response = await fetch('/api/send-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, adminKey: ADMIN_PASSWORD }),
      })
      const data = (await response.json().catch(() => ({}))) as { error?: string }
      if (!response.ok) {
        setStatus('error')
        setErrorMessage(data.error || 'Senden fehlgeschlagen.')
        return
      }
      setStatus('sent')
      setForm(emptyTrackingForm())
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setErrorMessage('Netzwerkfehler. Bitte erneut versuchen.')
    }
  }

  return (
    <div className="mt-12 border-t border-neutral-800 pt-8">
      <h2 className="text-lg font-medium uppercase tracking-widest text-neutral-100">Versandbestätigung senden</h2>
      <p className="mt-2 max-w-2xl text-sm text-neutral-400">
        Nachdem du das Paket privat verpackt und zur Post/Packstation gebracht hast: hier Kunden-E-Mail und den
        Tracking-Link eintragen und senden — der Kunde bekommt automatisch eine gebrandete E-Mail mit Trackinglink.
      </p>

      <form onSubmit={handleSend} className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Kunden-E-Mail *">
          <input
            type="email"
            required
            value={form.customerEmail}
            onChange={(e) => update({ customerEmail: e.target.value })}
            className={inputClass}
            placeholder="kunde@example.com"
          />
        </Field>
        <Field label="Kundenname (optional)">
          <input
            type="text"
            value={form.customerName}
            onChange={(e) => update({ customerName: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Versanddienstleister (z. B. DHL)">
          <input
            type="text"
            value={form.carrier}
            onChange={(e) => update({ carrier: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Sendungsnummer (optional)">
          <input
            type="text"
            value={form.trackingCode}
            onChange={(e) => update({ trackingCode: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Tracking-Link">
          <input
            type="url"
            value={form.trackingUrl}
            onChange={(e) => update({ trackingUrl: e.target.value })}
            className={inputClass}
            placeholder="https://www.dhl.de/..."
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Bestellübersicht * (z. B. „1× Bape Shark Hoodie Rot“)">
            <textarea
              required
              value={form.orderSummary}
              onChange={(e) => update({ orderSummary: e.target.value })}
              rows={2}
              className={`${inputClass} leading-6`}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Zusätzliche Nachricht (optional)">
            <textarea
              value={form.note}
              onChange={(e) => update({ note: e.target.value })}
              rows={2}
              className={`${inputClass} leading-6`}
            />
          </Field>
        </div>

        <div className="sm:col-span-2 flex items-center gap-4">
          <button
            type="submit"
            disabled={status === 'sending'}
            className="cta-solid border border-accent bg-accent px-5 py-3 text-xs uppercase tracking-widest transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {status === 'sending' ? 'Wird gesendet…' : status === 'sent' ? '✓ Gesendet' : 'Versandmail senden'}
          </button>
          {status === 'error' && <p className="text-xs uppercase tracking-widest text-accent">{errorMessage}</p>}
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs uppercase tracking-widest text-neutral-400">
      {label}
      {children}
    </label>
  )
}

const inputClass =
  'border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm normal-case tracking-normal text-neutral-100 outline-none transition-colors focus:border-accent'

export function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState(false)

  const [items, setItems] = useState<ShopItem[]>(() => readDraft() ?? initialShopItems)
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'shop' | 'catalog'>('idle')
  const [search, setSearch] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    if (window.sessionStorage.getItem(AUTH_KEY) === '1') {
      setAuthed(true)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(items))
  }, [items])

  const selected = items.find((item) => item.id === selectedId) ?? null

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter((item) => item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q))
  }, [items, search])

  function updateSelected(patch: Partial<ShopItem>) {
    if (!selected) return
    setItems((current) => current.map((item) => (item.id === selected.id ? { ...item, ...patch } : item)))
  }

  function handleAddItem() {
    const fresh = emptyItem()
    let n = 1
    let id = 'new-item'
    const existingIds = new Set(items.map((i) => i.id))
    while (existingIds.has(id)) {
      n += 1
      id = `new-item-${n}`
    }
    fresh.id = id
    fresh.name = 'Neuer Artikel'
    setItems((current) => [...current, fresh])
    setSelectedId(id)
  }

  function handleDeleteSelected() {
    if (!selected) return
    if (!window.confirm(`"${selected.name}" wirklich löschen?`)) return
    setItems((current) => current.filter((item) => item.id !== selected.id))
    setSelectedId(null)
  }

  function handleDuplicateSelected() {
    if (!selected) return
    let n = 2
    let id = `${selected.id}-copy`
    const existingIds = new Set(items.map((i) => i.id))
    while (existingIds.has(id)) {
      n += 1
      id = `${selected.id}-copy-${n}`
    }
    const copy: ShopItem = { ...selected, id, name: `${selected.name} (Kopie)` }
    setItems((current) => [...current, copy])
    setSelectedId(id)
  }

  function handleResetDraft() {
    if (!window.confirm('Alle lokalen Änderungen verwerfen und auf den zuletzt im Code committeten Stand zurücksetzen?')) return
    setItems(initialShopItems)
    setSelectedId(initialShopItems[0]?.id ?? null)
  }

  async function copyShopCode() {
    try {
      await navigator.clipboard.writeText(generateShopTs(items))
      setCopyStatus('shop')
      setTimeout(() => setCopyStatus('idle'), 2500)
    } catch {
      window.alert('Kopieren fehlgeschlagen. Bitte versuche es erneut.')
    }
  }

  async function copyCatalogCode() {
    try {
      await navigator.clipboard.writeText(generateCatalogTs(items))
      setCopyStatus('catalog')
      setTimeout(() => setCopyStatus('idle'), 2500)
    } catch {
      window.alert('Kopieren fehlgeschlagen. Bitte versuche es erneut.')
    }
  }

  if (!authed) {
    return (
      <Layout title="Admin | OD COMPLAINTS" description="Shop admin tool.">
        <div className="mx-auto max-w-sm py-24 text-left">
          <h1 className="text-2xl font-medium uppercase tracking-widest text-neutral-100">Admin</h1>
          <p className="mt-3 text-sm text-neutral-400">Passwort eingeben, um den Shop-Editor zu öffnen.</p>
          <form
            className="mt-6 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (passwordInput === ADMIN_PASSWORD) {
                window.sessionStorage.setItem(AUTH_KEY, '1')
                setAuthed(true)
                setAuthError(false)
              } else {
                setAuthError(true)
              }
            }}
          >
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Passwort"
              className={inputClass}
              autoFocus
            />
            {authError && <p className="text-xs uppercase tracking-widest text-accent">Falsches Passwort.</p>}
            <button
              type="submit"
              className="cta-solid border border-accent bg-accent px-5 py-3 text-xs uppercase tracking-widest transition-colors hover:opacity-90"
            >
              Einloggen
            </button>
          </form>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Admin | OD COMPLAINTS" description="Shop admin tool.">
      <div className="mx-auto max-w-4xl text-left">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-medium uppercase tracking-widest text-neutral-100">Shop verwalten</h1>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowHelp((v) => !v)}
              className="text-xs uppercase tracking-widest text-neutral-500 hover:text-accent"
            >
              {showHelp ? 'Hilfe ausblenden' : 'Wie funktioniert das?'}
            </button>
            <button
              type="button"
              onClick={handleResetDraft}
              className="text-xs uppercase tracking-widest text-neutral-500 hover:text-accent"
            >
              Zurücksetzen
            </button>
          </div>
        </div>

        {showHelp && (
          <div className="mt-4 border border-neutral-800 bg-neutral-900/40 p-4 text-xs leading-6 text-neutral-400">
            1. Artikel links auswählen und Felder rechts bearbeiten — wird automatisch lokal gespeichert.
            <br />
            2. Oben auf <strong className="text-neutral-200">„Shop-Datei kopieren“</strong> klicken und in{' '}
            <code className="text-neutral-300">src/data/shop.ts</code> einfügen (alles ersetzen).
            <br />
            3. Danach auf <strong className="text-neutral-200">„Katalog-Datei kopieren“</strong> klicken und in{' '}
            <code className="text-neutral-300">src/data/catalog.ts</code> einfügen (alles ersetzen).
            <br />
            4. Committen &amp; pushen, optional <code className="text-neutral-300">npm run sync-stripe</code> ausführen.
          </div>
        )}

        {/* Copy actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-neutral-800 py-4">
          <button
            type="button"
            onClick={copyShopCode}
            className="cta-solid flex-1 border border-accent bg-accent px-5 py-3 text-xs uppercase tracking-widest transition-colors hover:opacity-90 sm:flex-none"
          >
            {copyStatus === 'shop' ? '✓ Kopiert' : 'Shop-Datei kopieren'}
          </button>
          <button
            type="button"
            onClick={copyCatalogCode}
            className="cta-solid flex-1 border border-accent bg-accent px-5 py-3 text-xs uppercase tracking-widest transition-colors hover:opacity-90 sm:flex-none"
          >
            {copyStatus === 'catalog' ? '✓ Kopiert' : 'Katalog-Datei kopieren'}
          </button>
          <p className="text-xs text-neutral-500">{items.length} Artikel insgesamt</p>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-[240px_1fr]">
          {/* Item list */}
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suchen…"
              className={inputClass}
            />
            <button
              type="button"
              onClick={handleAddItem}
              className="border border-neutral-700 px-3 py-2.5 text-xs uppercase tracking-widest text-neutral-200 transition-colors hover:border-accent hover:text-accent"
            >
              + Neuer Artikel
            </button>
            <ul className="flex max-h-[65vh] flex-col gap-1 overflow-y-auto">
              {filteredItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`flex w-full items-center gap-3 border px-2.5 py-2 text-left transition-colors ${
                      item.id === selectedId
                        ? 'border-accent bg-neutral-900'
                        : 'border-transparent hover:border-neutral-800 hover:bg-neutral-900/50'
                    }`}
                  >
                    <span className="h-10 w-10 shrink-0 overflow-hidden bg-neutral-900/60">
                      {item.image && (
                        <img src={item.image} alt="" className="h-full w-full object-contain" loading="lazy" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-xs uppercase tracking-widest ${
                          item.id === selectedId ? 'text-accent' : 'text-neutral-200'
                        }`}
                      >
                        {item.name || '(ohne Namen)'}
                      </span>
                      <span className="block truncate text-[11px] text-neutral-500">{item.price}</span>
                    </span>
                    {item.availability === 'sold-out' && (
                      <span className="shrink-0 text-[9px] uppercase tracking-widest text-neutral-600">Sold out</span>
                    )}
                  </button>
                </li>
              ))}
              {filteredItems.length === 0 && (
                <li className="px-2.5 py-4 text-xs text-neutral-500">Keine Artikel gefunden.</li>
              )}
            </ul>
          </div>

          {/* Editor */}
          {selected ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-5 border-b border-neutral-800 pb-6">
                <div className="h-28 w-24 shrink-0 overflow-hidden bg-neutral-900/40">
                  {selected.image && (
                    <img src={selected.image} alt="Vorschau" className="h-full w-full object-contain" />
                  )}
                </div>
                <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-medium uppercase tracking-widest text-neutral-100">
                      {selected.name || '(ohne Namen)'}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">{selected.price}</p>
                  </div>
                  <div className="flex gap-4 text-xs uppercase tracking-widest">
                    <button type="button" onClick={handleDuplicateSelected} className="text-neutral-400 hover:text-accent">
                      Duplizieren
                    </button>
                    <button type="button" onClick={handleDeleteSelected} className="text-neutral-400 hover:text-accent">
                      Löschen
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name">
                  <input
                    type="text"
                    value={selected.name}
                    onChange={(e) => updateSelected({ name: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Preis (z. B. „390 EUR“)">
                  <input
                    type="text"
                    value={selected.price}
                    onChange={(e) => updateSelected({ price: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Kategorie">
                  <input
                    type="text"
                    value={selected.category}
                    onChange={(e) => updateSelected({ category: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Anzahl (Lagerbestand)">
                  <input
                    type="number"
                    min={0}
                    value={selected.stock}
                    onChange={(e) => updateSelected({ stock: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Verfügbarkeit">
                  <select
                    value={selected.availability}
                    onChange={(e) => updateSelected({ availability: e.target.value as ShopItem['availability'] })}
                    className={inputClass}
                  >
                    <option value="available">Verfügbar</option>
                    <option value="sold-out">Ausverkauft</option>
                  </select>
                </Field>
                <Field label="Bildpfad">
                  <input
                    type="text"
                    value={selected.image}
                    onChange={(e) => updateSelected({ image: e.target.value })}
                    className={inputClass}
                    placeholder="/assets/shop/foo.png"
                  />
                </Field>
              </div>

              <Field label="Beschreibung">
                <textarea
                  value={selected.description}
                  onChange={(e) => updateSelected({ description: e.target.value })}
                  rows={3}
                  className={`${inputClass} leading-6`}
                />
              </Field>

              <Field label="Details (eine Zeile pro Stichpunkt)">
                <textarea
                  value={selected.details.join('\n')}
                  onChange={(e) =>
                    updateSelected({
                      details: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean),
                    })
                  }
                  rows={5}
                  className={`${inputClass} leading-6`}
                />
              </Field>

              <p className="text-xs text-neutral-600">
                Technische ID: <code className="text-neutral-400">{selected.id}</code> — ändere sie nur, wenn du weißt was
                du tust; sie darf nicht doppelt vorkommen.
                <button
                  type="button"
                  onClick={() => {
                    const next = window.prompt('Neue technische ID (keine Leerzeichen):', selected.id)
                    if (next && next.trim()) updateSelected({ id: next.trim() })
                  }}
                  className="ml-2 text-neutral-400 underline hover:text-accent"
                >
                  ID ändern
                </button>
              </p>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Wähle links einen Artikel aus oder lege einen neuen an.</p>
          )}
        </div>

        <ShippingConfirmationSection />
      </div>
    </Layout>
  )
}
