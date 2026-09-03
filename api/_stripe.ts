// Minimal, dependency-free Stripe REST client for the Vercel Edge Runtime.
//
// We talk to the Stripe API directly with `fetch` instead of the Node SDK so the
// code runs on Vercel Edge Functions without any bundling, polyfill, or
// Node-builtin concerns. (This mirrors functions/_stripe.ts, which is the
// Cloudflare Pages equivalent kept for reference / future use.)

const STRIPE_API_BASE = 'https://api.stripe.com'

// Pin the API version so behaviour does not silently change when Stripe ships a
// new default. Keep in sync with the version you develop against.
export const STRIPE_API_VERSION = '2026-07-29.dahlia'

export class StripeError extends Error {
  status: number
  code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'StripeError'
    this.status = status
    this.code = code
  }
}

export type FormValue = string | number | boolean | FormObject | FormValue[]
export interface FormObject {
  [key: string]: FormValue | null | undefined
}

// Stripe expects application/x-www-form-urlencoded bodies with bracketed paths
// for nested structures, e.g. line_items[0][price_data][currency]=eur.
export function encodeForm(data: FormObject, prefix = ''): string {
  const parts: string[] = []
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue
    const path = prefix ? `${prefix}[${key}]` : key
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const itemPath = `${path}[${index}]`
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          parts.push(encodeForm(item as FormObject, itemPath))
        } else {
          parts.push(`${encodeURIComponent(itemPath)}=${encodeURIComponent(String(item))}`)
        }
      })
    } else if (typeof value === 'object') {
      parts.push(encodeForm(value as FormObject, path))
    } else {
      parts.push(`${encodeURIComponent(path)}=${encodeURIComponent(String(value))}`)
    }
  }
  return parts.filter(Boolean).join('&')
}

export async function stripeGet<T = unknown>(
  secretKey: string,
  path: string,
  query: Record<string, string> = {},
): Promise<T> {
  const qs = new URLSearchParams(query).toString()
  const response = await fetch(`${STRIPE_API_BASE}${path}${qs ? `?${qs}` : ''}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Stripe-Version': STRIPE_API_VERSION,
    },
  })
  const body = (await response.json()) as { error?: { message?: string; code?: string } }
  if (!response.ok) {
    throw new StripeError(body?.error?.message ?? 'Stripe request failed', response.status, body?.error?.code)
  }
  return body as T
}

export async function stripeRequest<T = unknown>(
  secretKey: string,
  path: string,
  params: FormObject,
): Promise<T> {
  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': STRIPE_API_VERSION,
      // Safe automatic retries on network blips without duplicate charges.
      'Idempotency-Key': crypto.randomUUID(),
    },
    body: encodeForm(params),
  })

  const body = (await response.json()) as { error?: { message?: string; code?: string } }
  if (!response.ok) {
    throw new StripeError(body?.error?.message ?? 'Stripe request failed', response.status, body?.error?.code)
  }
  return body as T
}

// A short random label so Checkout sessions from this flow are easy to compare
// in the Stripe Dashboard (best-practice `integration_identifier` suffix).
export function randomSuffix(length = 8): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ''
  for (const b of bytes) out += letters[b % letters.length]
  return out
}
