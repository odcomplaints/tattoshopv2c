// Responsive image helper.
//
// Data files keep referencing the original images (e.g. '/assets/shop/x.png').
// `npm run images` (scripts/optimize-images.mjs) writes WebP variants to
// public/opt/ plus a manifest of which widths exist. These helpers turn an
// original path into the right <img> attributes. Images missing from the
// manifest (new, not yet optimized, or remote URLs) fall back to the original.

import manifest from '../data/imageManifest.json'

/** [originalWidth, originalHeight, ...availableVariantWidths] */
const entries = manifest as unknown as Record<string, number[]>

function lookup(src: string): { key: string; width: number; height: number; widths: number[] } | null {
  if (!src.startsWith('/')) return null
  let key: string
  try {
    key = decodeURI(src.split(/[?#]/)[0])
  } catch {
    return null
  }
  const entry = entries[key]
  if (!entry) return null
  const [width, height, ...widths] = entry
  return { key, width, height, widths }
}

function variantUrl(key: string, width: number): string {
  const base = key.slice(0, key.lastIndexOf('.'))
  return encodeURI(`/opt${base}-${width}.webp`)
}

/**
 * URL of the smallest variant that is at least `minWidth` px wide — for
 * places that need a single URL (CSS backgrounds, WebGL textures).
 */
export function optimizedSrc(src: string, minWidth: number): string {
  const info = lookup(src)
  if (!info) return src
  const width = info.widths.find((w) => w >= minWidth) ?? info.widths[info.widths.length - 1]
  return variantUrl(info.key, width)
}

export type ResponsiveImageProps = {
  src: string
  srcSet?: string
  sizes?: string
  width?: number
  height?: number
}

/**
 * Spread onto an <img>: `<img {...responsiveImage(src, '50vw')} alt="" />`.
 * `sizes` describes the rendered width so the browser picks the smallest
 * sufficient variant. width/height are the intrinsic ratio (prevents layout shift).
 */
export function responsiveImage(src: string, sizes: string): ResponsiveImageProps {
  const info = lookup(src)
  if (!info) return { src }
  const largest = info.widths[info.widths.length - 1]
  return {
    src: variantUrl(info.key, info.widths.find((w) => w >= 800) ?? largest),
    srcSet: info.widths.map((w) => `${variantUrl(info.key, w)} ${w}w`).join(', '),
    sizes,
    width: info.width,
    height: info.height,
  }
}
