import { z } from 'zod'

export const workSchema = z.object({
  title: z.string(),
  date: z.date(),
  style: z.string(),
  bodyPart: z.string(),
  image: z.union([z.string().url(), z.string().startsWith('/')]),
  zoom: z.number().optional(),
})

export type Work = z.infer<typeof workSchema>

export const work: Work[] = [
  { title: 'Night Bloom', date: new Date('2026-06-18'), style: 'Blackwork', bodyPart: 'Forearm', image: '/assets/work/1.png' },
  { title: 'Low Tide', date: new Date('2026-05-30'), style: 'Fineline', bodyPart: 'Upper arm', image: '/assets/work/2.png' },
  { title: 'Still Life', date: new Date('2026-03-07'), style: 'Blackwork', bodyPart: 'Thigh', image: '/assets/work/4.png' },
  { title: 'Undertow', date: new Date('2026-09-14'), style: 'Blackwork', bodyPart: 'Forearm', image: '/assets/work/img-7976.png', zoom: 1.9 },
  { title: 'Static', date: new Date('2026-09-13'), style: 'Fineline', bodyPart: 'Upper arm', image: '/assets/work/img-7977.png', zoom: 1.5 },
  { title: 'Hollow', date: new Date('2026-09-12'), style: 'Blackwork', bodyPart: 'Calf', image: '/assets/work/img-7978.png', zoom: 1.5 },
  { title: 'Marrow', date: new Date('2026-09-11'), style: 'Abstract', bodyPart: 'Ribs', image: '/assets/work/img-7979.png', zoom: 1.5 },
  { title: 'Undercurrent', date: new Date('2026-09-08'), style: 'Botanical', bodyPart: 'Upper arm', image: '/assets/work/img-7983.png', zoom: 1.5 },
  { title: 'Relic', date: new Date('2026-09-07'), style: 'Blackwork', bodyPart: 'Calf', image: '/assets/work/img-7984.png', zoom: 1.5 },
].map((entry) => workSchema.parse(entry))

export const newestWork = [...work].sort((first, second) => second.date.getTime() - first.date.getTime())