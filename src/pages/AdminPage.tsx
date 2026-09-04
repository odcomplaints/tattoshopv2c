import { useEffect, useMemo, useState } from 'react'
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

export function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState(false)

  const [items, setItems] = useState<ShopItem[]>(() => readDraft() ?? initialShopItems)
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null)
  const [copiedShop, setCopiedShop] = useState(false)
  const [copiedCatalog, setCopiedCatalog] = useState(false)
  const [search, setSearch] = useState('')

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

  const shopCode = useMemo(() => generateShopTs(items), [items])
  const catalogCode = useMemo(() => generateCatalogTs(items), [items])

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
    fresh.name = 'New Item'
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

  async function copyToClipboard(text: string, which: 'shop' | 'catalog') {
    try {
      await navigator.clipboard.writeText(text)
      if (which === 'shop') {
        setCopiedShop(true)
        setTimeout(() => setCopiedShop(false), 2000)
      } else {
        setCopiedCatalog(true)
        setTimeout(() => setCopiedCatalog(false), 2000)
      }
    } catch {
      window.alert('Kopieren fehlgeschlagen — bitte Text manuell markieren und kopieren.')
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
              className="border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-accent"
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
      <div className="text-left">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-3xl font-medium uppercase tracking-widest text-neutral-100">Shop Admin</h1>
          <button
            type="button"
            onClick={handleResetDraft}
            className="text-xs uppercase tracking-widest text-neutral-500 hover:text-accent"
          >
            Änderungen verwerfen
          </button>
        </div>
        <p className="mt-2 max-w-2xl text-xs leading-6 text-neutral-500">
          Änderungen hier werden nur lokal in deinem Browser gespeichert. Damit sie live gehen, kopiere unten den
          generierten Code und ersetze damit den kompletten Inhalt von <code className="text-neutral-300">src/data/shop.ts</code> und{' '}
          <code className="text-neutral-300">src/data/catalog.ts</code>, dann committen &amp; pushen (und ggf.{' '}
          <code className="text-neutral-300">npm run sync-stripe</code> laufen lassen, damit Stripe die neuen Preise kennt).
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Item list */}
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suchen…"
              className="border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={handleAddItem}
              className="border border-neutral-700 px-3 py-2 text-xs uppercase tracking-widest text-neutral-200 hover:border-accent hover:text-accent"
            >
              + Neuer Artikel
            </button>
            <ul className="flex max-h-[70vh] flex-col overflow-y-auto border border-neutral-800">
              {filteredItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`flex w-full items-center justify-between gap-2 border-b border-neutral-900 px-3 py-2 text-left text-xs uppercase tracking-widest transition-colors ${
                      item.id === selectedId ? 'bg-neutral-900 text-accent' : 'text-neutral-300 hover:bg-neutral-900/60'
                    }`}
                  >
                    <span className="truncate">{item.name || '(ohne Namen)'}</span>
                    <span className="shrink-0 text-neutral-500">{item.price}</span>
                  </button>
                </li>
              ))}
              {filteredItems.length === 0 && (
                <li className="px-3 py-4 text-xs text-neutral-500">Keine Artikel gefunden.</li>
              )}
            </ul>
          </div>

          {/* Editor */}
          <div className="flex flex-col gap-6">
            {selected ? (
              <div className="flex flex-col gap-4 border border-neutral-800 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xs uppercase tracking-widest text-neutral-400">Artikel bearbeiten</h2>
                  <div className="flex gap-4 text-xs uppercase tracking-widest">
                    <button type="button" onClick={handleDuplicateSelected} className="text-neutral-400 hover:text-accent">
                      Duplizieren
                    </button>
                    <button type="button" onClick={handleDeleteSelected} className="text-neutral-400 hover:text-accent">
                      Löschen
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-neutral-400">
                    ID (technisch, keine Leerzeichen)
                    <input
                      type="text"
                      value={selected.id}
                      onChange={(e) => updateSelected({ id: e.target.value.trim() })}
                      className="border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm normal-case tracking-normal text-neutral-100 outline-none focus:border-accent"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-neutral-400">
                    Name
                    <input
                      type="text"
                      value={selected.name}
                      onChange={(e) => updateSelected({ name: e.target.value })}
                      className="border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm normal-case tracking-normal text-neutral-100 outline-none focus:border-accent"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-neutral-400">
                    Preis (z. B. "390 EUR")
                    <input
                      type="text"
                      value={selected.price}
                      onChange={(e) => updateSelected({ price: e.target.value })}
                      className="border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm normal-case tracking-normal text-neutral-100 outline-none focus:border-accent"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-neutral-400">
                    Kategorie
                    <input
                      type="text"
                      value={selected.category}
                      onChange={(e) => updateSelected({ category: e.target.value })}
                      className="border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm normal-case tracking-normal text-neutral-100 outline-none focus:border-accent"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-neutral-400">
                    Bildpfad (z. B. /assets/shop/foo.png)
                    <input
                      type="text"
                      value={selected.image}
                      onChange={(e) => updateSelected({ image: e.target.value })}
                      className="border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm normal-case tracking-normal text-neutral-100 outline-none focus:border-accent"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-neutral-400">
                    Verfügbarkeit
                    <select
                      value={selected.availability}
                      onChange={(e) => updateSelected({ availability: e.target.value as ShopItem['availability'] })}
                      className="border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm normal-case tracking-normal text-neutral-100 outline-none focus:border-accent"
                    >
                      <option value="available">available</option>
                      <option value="sold-out">sold-out</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-neutral-400">
                    Anzahl (Lagerbestand)
                    <input
                      type="number"
                      min={0}
                      value={selected.stock}
                      onChange={(e) => updateSelected({ stock: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
                      className="border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm normal-case tracking-normal text-neutral-100 outline-none focus:border-accent"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-neutral-400">
                  Beschreibung
                  <textarea
                    value={selected.description}
                    onChange={(e) => updateSelected({ description: e.target.value })}
                    rows={3}
                    className="border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm normal-case tracking-normal leading-6 text-neutral-100 outline-none focus:border-accent"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-neutral-400">
                  Details (eine Zeile pro Stichpunkt)
                  <textarea
                    value={selected.details.join('\n')}
                    onChange={(e) =>
                      updateSelected({
                        details: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean),
                      })
                    }
                    rows={5}
                    className="border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm normal-case tracking-normal leading-6 text-neutral-100 outline-none focus:border-accent"
                  />
                </label>

                {selected.image && (
                  <div className="flex items-center gap-4 border-t border-neutral-900 pt-4">
                    <div className="h-24 w-20 shrink-0 overflow-hidden bg-neutral-900/40">
                      <img src={selected.image} alt="Vorschau" className="h-full w-full object-contain" />
                    </div>
                    <p className="text-xs text-neutral-500">
                      Vorschau — falls hier nichts erscheint, existiert die Bilddatei noch nicht unter diesem Pfad in{' '}
                      <code>public{selected.image}</code>.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">Wähle links einen Artikel aus oder lege einen neuen an.</p>
            )}

            {/* Generated code */}
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xs uppercase tracking-widest text-neutral-400">src/data/shop.ts</h2>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(shopCode, 'shop')}
                    className="cta-solid border border-accent bg-accent px-4 py-1.5 text-xs uppercase tracking-widest transition-colors hover:opacity-90"
                  >
                    {copiedShop ? 'Kopiert!' : 'Code kopieren'}
                  </button>
                </div>
                <pre className="mt-2 max-h-72 overflow-auto border border-neutral-800 bg-neutral-950 p-4 text-[11px] leading-5 text-neutral-300">
                  {shopCode}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xs uppercase tracking-widest text-neutral-400">src/data/catalog.ts</h2>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(catalogCode, 'catalog')}
                    className="cta-solid border border-accent bg-accent px-4 py-1.5 text-xs uppercase tracking-widest transition-colors hover:opacity-90"
                  >
                    {copiedCatalog ? 'Kopiert!' : 'Code kopieren'}
                  </button>
                </div>
                <pre className="mt-2 max-h-72 overflow-auto border border-neutral-800 bg-neutral-950 p-4 text-[11px] leading-5 text-neutral-300">
                  {catalogCode}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
