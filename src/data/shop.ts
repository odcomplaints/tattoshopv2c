export type ShopItem = {
  id: string
  name: string
  price: string
  category: string
  image: string
  availability: 'available' | 'sold-out'
  description: string
  details: string[]
}

export const shopItems: ShopItem[] = [
  {
    id: 'black-sun',
    name: 'Black Sun',
    price: '45 EUR',
    category: 'Riso Print / A3',
    image: '/assets/shop/black-sun.svg',
    availability: 'available',
    description:
      'Two-colour risograph print on heavy uncoated stock. Dense blackwork study, hand-pulled in a small studio edition.',
    details: ['Format: A3 (297 × 420 mm)', 'Riso print, 2 colours', 'Signed edition of 30', 'Heavy uncoated 300 gsm'],
  },
  {
    id: 'soft-structure',
    name: 'Soft Structure',
    price: '35 EUR',
    category: 'Art Print / A4',
    image: '/assets/shop/soft-structure.svg',
    availability: 'sold-out',
    description:
      'Fineline botanical study printed on matte fine-art paper. Muted greyscale tones, minimal composition.',
    details: ['Format: A4 (210 × 297 mm)', 'Giclée art print', 'Signed edition of 25', 'Matte fine-art 250 gsm'],
  },
  {
    id: 'talisman-01',
    name: 'Talisman 01',
    price: '60 EUR',
    category: 'Risograph / A3',
    image: '/assets/shop/talisman.svg',
    availability: 'available',
    description:
      'Abstract talisman motif, layered risograph in three passes. Each copy varies slightly through the print process.',
    details: ['Format: A3 (297 × 420 mm)', 'Riso print, 3 colours', 'Signed edition of 20', 'Heavy uncoated 300 gsm'],
  },
  {
    id: 'field-study',
    name: 'Field Study',
    price: '30 EUR',
    category: 'Open Edition / A4',
    image: '/assets/shop/field-study.svg',
    availability: 'available',
    description:
      'Loose fineline field study, open edition. An accessible entry piece printed on demand in the studio.',
    details: ['Format: A4 (210 × 297 mm)', 'Giclée art print', 'Open edition', 'Matte fine-art 250 gsm'],
  },
]
