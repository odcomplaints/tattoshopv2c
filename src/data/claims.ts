// Shared claim helpers + copy for digital tattoo templates ("Claim" on /work).
//
// Used by the React UI and by the Vercel functions in api/, so this module must
// stay free of DOM / asset imports.

import { work } from './work.js'
import type { Work, WorkClaim } from './work.js'

export type ClaimLanguage = 'de' | 'en'
export type ClaimableWork = Work & { claim: WorkClaim }

/** Stripe session metadata marker, read by api/webhook.ts and api/claim-download.ts. */
export const CLAIM_METADATA_TYPE = 'work-claim'

/** Cart lines of digital templates use the id `claim:<workId>` so they never collide with shop product ids. */
export const CLAIM_CART_PREFIX = 'claim:'

export function claimCartId(workId: string): string {
  return `${CLAIM_CART_PREFIX}${workId}`
}

/** Returns the work id of a claim cart line, or null for regular shop products. */
export function workIdFromCartId(cartId: string): string | null {
  return cartId.startsWith(CLAIM_CART_PREFIX) ? cartId.slice(CLAIM_CART_PREFIX.length) : null
}

/** Work ids of a Checkout Session, stored comma-separated in its metadata. */
export function parseWorkIds(value: string | undefined): string[] {
  return (value ?? '').split(',').map((id) => id.trim()).filter(Boolean)
}

export function getWorkById(id: string): Work | undefined {
  return work.find((entry) => entry.id === id)
}

export function isClaimEnabled(entry: Work): entry is ClaimableWork {
  return !!entry.claim && entry.claim.isClaimable !== false && entry.claim.priceCents > 0
}

export function getClaimableWork(id: string): ClaimableWork | undefined {
  const entry = getWorkById(id)
  return entry && isClaimEnabled(entry) ? entry : undefined
}

export const claimableWorkIds: string[] = work.filter(isClaimEnabled).map((entry) => entry.id)

export function formatClaimPrice(cents: number): string {
  const euros = cents / 100
  return Number.isInteger(euros) ? `${euros} €` : `${euros.toFixed(2).replace('.', ',')} €`
}

/** The files handed to the buyer — the work's own image unless dedicated files are configured. */
export function claimDeliveryFiles(entry: ClaimableWork): string[] {
  if (entry.claim.files?.length) return entry.claim.files
  return [entry.claim.file || entry.image]
}

function fileExtension(file: string): string {
  return /\.([a-z0-9]{2,5})$/i.exec(file.split(/[?#]/)[0])?.[1]?.toLowerCase() ?? 'png'
}

export function claimDownloadFilename(entry: ClaimableWork, index = 0): string {
  const files = claimDeliveryFiles(entry)
  const suffix = files.length > 1 ? `-${index + 1}` : ''
  return `${entry.id}-tattoo-flash${suffix}.${fileExtension(files[index] ?? files[0])}`
}

/** Short button labels per file, e.g. ["PNG 1", "PNG 2", "PDF 1", "PDF 2"]. */
export function claimFileLabels(entry: ClaimableWork): string[] {
  const extensions = claimDeliveryFiles(entry).map((file) => fileExtension(file).toUpperCase())
  const seen: Record<string, number> = {}
  return extensions.map((ext) => {
    seen[ext] = (seen[ext] ?? 0) + 1
    return extensions.filter((other) => other === ext).length > 1 ? `${ext} ${seen[ext]}` : ext
  })
}

export const claimCopy = {
  de: {
    available: 'Als Vorlage verfügbar',
    claimed: 'Beansprucht',
    reserved: 'Reserviert',
    button: (price: string) => `Claim — ${price}`,
    buttonClaimed: 'Bereits beansprucht',
    buttonReserved: 'Gerade in Bearbeitung',
    buttonInCart: 'Im Warenkorb ansehen',
    info: 'Infos zur Vorlage',
    exclusive: 'Dieses Motiv wird nur einmal vergeben.',
    page: {
      back: '← Work',
      kind: 'Tattoo-Vorlage',
      description: (title: string, style: string) =>
        `„${title}“ als digitale Tattoo-Vorlage (${style}). Du erhältst vier hochauflösende Bilder (PNG und PDF) per E-Mail. Nach dem Claim gehört das Design dir und kann von einem Studio deiner Wahl gestochen werden.`,
      details: ['4 hochauflösende Bilder (PNG und PDF)', 'Per E-Mail nach der Zahlung', 'Download direkt nach dem Kauf'],
      related: 'Weitere Vorlagen',
      notFound: 'Motiv nicht gefunden',
      available: 'Verfügbar',
    },
    cart: {
      label: 'Digitale Tattoo-Vorlage',
      noShipping: 'Kein Versand – Download nach der Zahlung.',
      consentRequired: 'Bitte bestätige die sofortige Bereitstellung der digitalen Datei, um fortzufahren.',
      unavailable: 'Diese Vorlage ist nicht mehr verfügbar — bitte entferne sie, um fortzufahren.',
    },
    licenseTitle: 'Nutzungsrechte',
    license: [
      'Nach dem Claim gehört das Design dir.',
      'Nutzung als Tattoo-Vorlage für dich selbst – umgesetzt von einem Studio deiner Wahl.',
      'Vier hochauflösende Bilder (PNG und PDF) per E-Mail, zusätzlich als Download direkt nach dem Kauf.',
      'Kein Weiterverkauf und keine kommerzielle Nutzung (Merch, Druck, Verkauf) ohne separate Vereinbarung.',
    ],
    consent: 'Ich stimme der sofortigen Bereitstellung der digitalen Datei zu und weiß, dass ich dadurch mein Widerrufsrecht verliere.',
    email: {
      subject: (titles: string) => `Deine Tattoo-Vorlage: ${titles}`,
      eyebrow: 'Claim bestätigt',
      heading: (titles: string) => titles,
      intro: 'Danke für deinen Claim! Das Design gehört jetzt dir. Hier sind deine vier hochauflösenden Bilder (PNG und PDF).',
      download: 'Datei herunterladen',
      next: 'Bring die Datei zu deinem Tattoo-Studio. Bei Fragen zur Umsetzung antworte einfach auf diese E-Mail.',
      total: 'Gesamt',
    },
    success: {
      eyebrow: 'Claim bestätigt',
      heading: 'Vielen Dank!',
      body: 'Das Design gehört jetzt dir. Deine vier hochauflösenden Bilder (PNG und PDF) kannst du hier herunterladen – zusätzlich bekommst du sie per E-Mail.',
      list: 'Deine Vorlagen',
      pending: 'Deine Zahlung wird noch bestätigt. Sobald sie eingegangen ist, erhältst du den Download-Link per E-Mail.',
      loading: 'Zahlung wird geprüft …',
      failed: 'Wir konnten deinen Claim nicht automatisch bestätigen. Falls du bezahlt hast, schreib uns mit der Referenz unten.',
      download: 'Datei herunterladen',
      back: 'Zurück zu Work',
    },
  },
  en: {
    available: 'Available to Claim',
    claimed: 'Claimed',
    reserved: 'Reserved',
    button: (price: string) => `Claim — ${price}`,
    buttonClaimed: 'Already claimed',
    buttonReserved: 'Being claimed right now',
    buttonInCart: 'View cart',
    info: 'Template info',
    exclusive: 'This design is given out only once.',
    page: {
      back: '← Work',
      kind: 'Tattoo template',
      description: (title: string, style: string) =>
        `“${title}” as a digital tattoo template (${style}). You receive four high-resolution images (PNG and PDF) by email. Once claimed, the design is yours and can be tattooed by a studio of your choice.`,
      details: ['4 high-resolution images (PNG and PDF)', 'Sent by email after payment', 'Download right after purchase'],
      related: 'More templates',
      notFound: 'Design not found',
      available: 'Available',
    },
    cart: {
      label: 'Digital tattoo template',
      noShipping: 'No shipping – download after payment.',
      consentRequired: 'Please confirm the immediate delivery of the digital file to continue.',
      unavailable: 'This template is no longer available — please remove it to continue.',
    },
    licenseTitle: 'Usage rights',
    license: [
      'Once claimed, the design belongs to you.',
      'Use as a tattoo template for yourself – applied by a studio of your choice.',
      'Four high-resolution images (PNG and PDF) by email, also as a download right after purchase.',
      'No resale and no commercial use (merch, prints, selling) without a separate agreement.',
    ],
    consent: 'I agree to the immediate delivery of the digital file and understand that I lose my right of withdrawal as a result.',
    email: {
      subject: (titles: string) => `Your tattoo template: ${titles}`,
      eyebrow: 'Claim confirmed',
      heading: (titles: string) => titles,
      intro: 'Thanks for your claim! The design is now yours. Here are your four high-resolution images (PNG and PDF).',
      download: 'Download file',
      next: 'Bring the file to your tattoo studio. If you have questions about the application, just reply to this email.',
      total: 'Total',
    },
    success: {
      eyebrow: 'Claim confirmed',
      heading: 'Thank you!',
      body: 'The design is now yours. Download your four high-resolution images (PNG and PDF) below – they are also sent to you by email.',
      list: 'Your templates',
      pending: 'Your payment is still being confirmed. Once it has arrived you will receive the download link by email.',
      loading: 'Checking payment …',
      failed: 'We could not confirm your claim automatically. If you paid, contact us with the reference below.',
      download: 'Download file',
      back: 'Back to work',
    },
  },
} as const
