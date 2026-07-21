import { z } from 'zod'

export const workSchema = z.object({
  title: z.string(),
  date: z.date(),
  style: z.string(),
  bodyPart: z.string(),
  image: z.union([z.string().url(), z.string().startsWith('/')]),
})

export type Work = z.infer<typeof workSchema>

export const work: Work[] = [
  { title: 'Night Bloom', date: new Date('2026-06-18'), style: 'Blackwork', bodyPart: 'Unterarm', image: '/assets/work/night-bloom.svg' },
  { title: 'Low Tide', date: new Date('2026-05-30'), style: 'Fineline', bodyPart: 'Oberarm', image: '/assets/work/low-tide.svg' },
  { title: 'Aster', date: new Date('2026-04-12'), style: 'Botanical', bodyPart: 'Wade', image: '/assets/work/aster.svg' },
  { title: 'Still Life', date: new Date('2026-03-07'), style: 'Blackwork', bodyPart: 'Oberschenkel', image: '/assets/work/still-life.svg' },
  { title: 'Trace', date: new Date('2026-02-14'), style: 'Abstract', bodyPart: 'Rippen', image: '/assets/work/trace.svg' },
  { title: 'Field Notes', date: new Date('2026-01-25'), style: 'Fineline', bodyPart: 'Unterarm', image: '/assets/work/field-notes.svg' },
].map((entry) => workSchema.parse(entry))

export const newestWork = [...work].sort((first, second) => second.date.getTime() - first.date.getTime())