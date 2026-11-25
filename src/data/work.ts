// Static data, checked by TypeScript at build time (no runtime validation
// library needed in the browser bundle).
/**
 * Digital tattoo template ("claim") attached to a work. This file is also
 * imported by the Vercel functions in api/, so the price here is the amount
 * that is actually charged — the client only displays it.
 */
export type WorkClaim = {
  /** Price in cents (EUR). */
  priceCents: number
  /** true: the piece is given out once and locked afterwards. false: can be claimed repeatedly. */
  singleClaimOnly: boolean
  /** Set to false to hide the claim UI without deleting the configuration. Defaults to true. */
  isClaimable?: boolean
  /** Manual override for pieces claimed outside the shop (works without KV). */
  claimed?: boolean
  /**
   * Delivered file. '/path' = served from the site (public/), 'https://…' = absolute URL,
   * 'name.zip' = resolved against CLAIM_FILES_BASE_URL (private storage).
   * Defaults to the work's own image.
   */
  file?: string
  /** Several delivered files (e.g. PNG + PDF). Same path rules as `file`; takes precedence over it. */
  files?: string[]
  /** Replaces the default usage-rights text for this piece. */
  licenseNote?: { de: string; en: string }
}

export type Work = {
  /** Stable slug. Referenced by Stripe metadata and claim records — never rename after the first sale. */
  id: string
  title: string
  date: Date
  style: string
  bodyPart: string
  /** Absolute URL or a path under public/, e.g. '/assets/work/1.png' */
  image: string
  zoom?: number
  claim?: WorkClaim
}

const FLASH_CLAIM: WorkClaim = { priceCents: 5000, singleClaimOnly: true }

// Each piece ships as one ZIP (2 PNG + 2 PDF) in public/claims/<id>-<token>/<id>-tattoo-flash.zip.
// The folder token is unguessable; the link is only handed out after payment. Checkout refuses a
// piece whose ZIP is missing, so a piece without its file can never be sold by accident.
const claimWithZip = (folder: string): WorkClaim => ({
  ...FLASH_CLAIM,
  file: `/claims/${folder}/${folder.replace(/-[a-z0-9]{16}$/, '')}-tattoo-flash.zip`,
})
const BRIAR_CLAIM = claimWithZip('briar-niaqu5kfopr73zvl')
const THORN_CLAIM = claimWithZip('thorn-vpyuibt4s3509lkc')
const MIRAGE_CLAIM = claimWithZip('mirage-xhobt4rdi80y2wcu')
const RELIC_CLAIM = claimWithZip('relic-pn8e4racyx26d19i')

export const work: Work[] = [
  { id: 'night-bloom', title: 'Night Bloom', date: new Date('2026-06-18'), style: 'Blackwork', bodyPart: 'Forearm', image: '/assets/work/1.png' },
  { id: 'low-tide', title: 'Low Tide', date: new Date('2026-05-30'), style: 'Fineline', bodyPart: 'Upper arm', image: '/assets/work/2.png' },
  { id: 'relic', title: 'Relic', date: new Date('2026-09-07'), style: 'Blackwork', bodyPart: 'Calf', image: '/assets/work/img-7984.png', zoom: 1.5, claim: RELIC_CLAIM },
  { id: 'briar', title: 'Briar', date: new Date('2026-11-04'), style: 'Tribal', bodyPart: 'Flash design', image: '/assets/work/IMG_8542%201.png', claim: BRIAR_CLAIM },
  { id: 'watchful', title: 'Watchful', date: new Date('2026-11-04'), style: 'Tribal', bodyPart: 'Flash design', image: '/assets/work/IMG_8590%201.png' },
  { id: 'thorn', title: 'Thorn', date: new Date('2026-11-04'), style: 'Tribal', bodyPart: 'Flash design', image: '/assets/work/IMG_8767%201.png', claim: THORN_CLAIM },
  { id: 'ethereal', title: 'Ethereal', date: new Date('2026-11-20'), style: 'Fineline', bodyPart: 'Full body', image: '/assets/work/IMG_8999%201.png' },
  { id: 'mirage', title: 'Mirage', date: new Date('2026-11-20'), style: 'Blackwork', bodyPart: 'Full body', image: '/assets/work/IMG_8999%202.png', claim: MIRAGE_CLAIM },
  // Hidden: Aftermath, Ashes, Reverie, Fracture
  // { title: 'Aftermath', date: new Date('2026-09-22'), style: 'Blackwork', bodyPart: 'Forearm', image: '/assets/work/img-8229.png', zoom: 1.5 },
  // { title: 'Ashes', date: new Date('2026-09-30'), style: 'Blackwork', bodyPart: 'Forearm', image: '/assets/work/img-8367.png', zoom: 1.5 },
  // { title: 'Reverie', date: new Date('2026-09-30'), style: 'Fineline', bodyPart: 'Upper arm', image: '/assets/work/img-8368.png', zoom: 1.5 },
  // { title: 'Fracture', date: new Date('2026-09-30'), style: 'Blackwork', bodyPart: 'Upper arm', image: '/assets/work/img-8371.png', zoom: 1.5 },
  // Temporarily hidden — only the slider images + Relic + Aftermath should show in the Work section.
  // { title: 'Undertow', date: new Date('2026-09-14'), style: 'Blackwork', bodyPart: 'Forearm', image: '/assets/work/img-7976.png', zoom: 1.9 },
  // { title: 'Static', date: new Date('2026-09-13'), style: 'Fineline', bodyPart: 'Upper arm', image: '/assets/work/img-7977.png', zoom: 1.5 },
  // { title: 'Hollow', date: new Date('2026-09-12'), style: 'Blackwork', bodyPart: 'Calf', image: '/assets/work/img-7978.png', zoom: 1.5 },
  // { title: 'Marrow', date: new Date('2026-09-11'), style: 'Abstract', bodyPart: 'Ribs', image: '/assets/work/img-7979.png', zoom: 1.5 },
  // { title: 'Undercurrent', date: new Date('2026-09-08'), style: 'Botanical', bodyPart: 'Upper arm', image: '/assets/work/img-7983.png', zoom: 1.5 },
  // { title: 'Wanderer', date: new Date('2026-09-21'), style: 'Fineline', bodyPart: 'Upper arm', image: '/assets/work/img-8230.png', zoom: 1.5 },
  // { title: 'Threshold', date: new Date('2026-09-20'), style: 'Blackwork', bodyPart: 'Calf', image: '/assets/work/img-8231.png', zoom: 1.5 },
]

export const newestWork = [...work].sort((first, second) => second.date.getTime() - first.date.getTime())