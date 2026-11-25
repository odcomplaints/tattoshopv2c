// Generates responsive WebP variants for every raster image in public/.
//
//   public/assets/shop/foo.png  ->  public/opt/assets/shop/foo-400.webp
//                                   public/opt/assets/shop/foo-800.webp  ...
//
// Originals stay untouched (the admin panel, emails and OG tags keep using
// them). Components pick a variant via src/lib/image.ts, which reads the
// manifest written here. Images without variants fall back to the original,
// so a missing run never breaks the site — it is only slower.
//
// Incremental: existing variants are skipped, so re-runs only process new
// images. Delete public/opt/ to force a full rebuild (e.g. after changing
// WIDTHS or QUALITY).
//
// Usage: npm run images

import { mkdir, readdir, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, relative, dirname, extname, sep } from 'node:path'
import { cpus } from 'node:os'

// This runs as `prebuild`, also on Vercel. The variants in public/opt/ are
// committed, so if sharp can't load there (missing native binary) the build
// must still go through: warn and keep the existing variants + manifest.
let sharp
try {
  sharp = (await import('sharp')).default
} catch (error) {
  console.warn(`[images] sharp unavailable (${error.message}) — skipping, using committed variants.`)
  process.exit(0)
}

const PUBLIC_DIR = 'public'
const OUT_DIR = join(PUBLIC_DIR, 'opt')
const MANIFEST = join('src', 'data', 'imageManifest.json')
// Must match WIDTHS in src/lib/image.ts.
const WIDTHS = [400, 800, 1200, 2000]
const QUALITY = 78
// Assets that must stay as-is (email clients need PNG; already-small files).
const SKIP_DIRS = ['opt', join('assets', 'email')]
const RASTER = new Set(['.png', '.jpg', '.jpeg'])

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    const rel = relative(PUBLIC_DIR, full)
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.includes(rel)) yield* walk(full)
    } else if (RASTER.has(extname(entry.name).toLowerCase())) {
      yield full
    }
  }
}

function variantPath(rel, width) {
  const base = rel.slice(0, -extname(rel).length)
  return join(OUT_DIR, `${base}-${width}.webp`)
}

async function processImage(file) {
  const rel = relative(PUBLIC_DIR, file)
  // Manifest keys are URL paths exactly as written in the data files' decoded form.
  const key = '/' + rel.split(sep).join('/')
  const meta = await sharp(file).metadata()
  // Respect EXIF rotation (phone photos) for the reported dimensions.
  const rotated = (meta.orientation ?? 1) >= 5
  const width = rotated ? meta.height : meta.width
  const height = rotated ? meta.width : meta.height
  if (!width || !height) return null

  // Always include one variant even for images smaller than the smallest width.
  const widths = WIDTHS.filter((w) => w < width)
  if (widths.length < WIDTHS.length) widths.push(Math.min(width, WIDTHS[WIDTHS.length - 1]))

  let created = 0
  for (const w of widths) {
    const out = variantPath(rel, w)
    if (existsSync(out)) continue
    await mkdir(dirname(out), { recursive: true })
    await sharp(file).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: QUALITY, effort: 5 }).toFile(out)
    created++
  }
  return { key, entry: [width, height, ...widths], created }
}

async function main() {
  if (!existsSync(PUBLIC_DIR)) throw new Error('Run from the project root.')
  const files = []
  for await (const file of walk(PUBLIC_DIR)) files.push(file)

  const manifest = {}
  let created = 0
  let done = 0
  let failed = 0
  const queue = [...files]
  const workers = Array.from({ length: Math.max(1, Math.min(4, cpus().length - 1)) }, async () => {
    while (queue.length) {
      const file = queue.shift()
      try {
        const result = await processImage(file)
        if (result) {
          manifest[result.key] = result.entry
          created += result.created
        }
      } catch (error) {
        failed++
        console.warn(`[images] skipped ${file}: ${error.message}`)
      }
      done++
      if (done % 25 === 0) console.log(`[images] ${done}/${files.length}`)
    }
  })
  await Promise.all(workers)

  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
  await writeFile(MANIFEST, JSON.stringify(sorted) + '\n')
  const outSize = await dirSize(OUT_DIR)
  console.log(`[images] ${files.length} images, ${created} new variants, ${failed} failed, public/opt = ${(outSize / 1048576).toFixed(1)} MB`)
}

async function dirSize(dir) {
  if (!existsSync(dir)) return 0
  let total = 0
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    total += entry.isDirectory() ? await dirSize(full) : (await stat(full)).size
  }
  return total
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
