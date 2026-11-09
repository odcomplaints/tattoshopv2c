import { z } from 'zod'

/**
 * Feste Bilderliste für den Startseiten-Slider.
 *
 * Die Bilddateien liegen in `public/assets/slider/`, sofern kein Work-Bild wiederverwendet wird.
 * Um ein Bild aus dem Slider zu entfernen: Eintrag hier löschen (Datei kann bleiben oder gelöscht werden).
 * Um ein neues Bild hinzuzufügen: Datei nach `public/assets/slider/` kopieren und hier einen neuen Eintrag ergänzen.
 * Die Reihenfolge hier bestimmt die Reihenfolge im Slider.
 */
export const sliderItemSchema = z.object({
  title: z.string(),
  date: z.date(),
  style: z.string(),
  bodyPart: z.string(),
  image: z.union([z.string().url(), z.string().startsWith('/')]),
  zoom: z.number().optional(),
  offsetY: z.number().optional(),
  mono: z.boolean().optional(),
})

export type SliderItem = z.infer<typeof sliderItemSchema>

export const sliderImages: SliderItem[] = [
  { title: 'Briar', date: new Date('2026-11-04'), style: 'Tribal', bodyPart: 'Flash design', image: '/assets/work/IMG_8542%201.png' },
  { title: 'Low Tide', date: new Date('2026-05-30'), style: 'Fineline', bodyPart: 'Upper arm', image: '/assets/slider/low-tide.png' },
  { title: 'Still Life', date: new Date('2026-03-07'), style: 'Blackwork', bodyPart: 'Thigh', image: '/assets/slider/still-life.png' },
  { title: 'Relic', date: new Date('2026-09-07'), style: 'Blackwork', bodyPart: 'Calf', image: '/assets/slider/relic.png', zoom: 2.2, offsetY: 12, mono: true },
].map((entry) => sliderItemSchema.parse(entry))
