export type ShopItem = {
  id: string
  name: string
  price: string
  category: string
  image: string
  availability: 'available' | 'sold-out'
  stock: number
  description: string
  details: string[]
}

export const shopItems: ShopItem[] = [
  // TEMPORARY test product — used to verify the Stripe checkout + webhook +
  // order confirmation emails end-to-end for just 1,00 EUR instead of
  // refunding a real item. Remove this entry (and its counterpart in
  // src/data/catalog.ts) once testing is done.
  {
    id: 'test-produkt',
    name: 'Test-Produkt (bitte nicht kaufen)',
    price: '1,00 EUR',
    category: 'Test',
    image: '/assets/shop/1.png',
    availability: 'available',
    stock: 999,
    description: 'Interner Testartikel für 1,00 EUR, um den Checkout- und E-Mail-Ablauf zu testen.',
    details: ['Nur für Testzwecke'],
  },
  {
    id: 'bape-shark-glow',
    name: 'Bape Shark Glow in the Dark',
    price: '390 EUR',
    category: 'Streetwear / Hoodie',
    image: '/assets/shop/bapesharkglowinthedark.png',
    availability: 'available',
    stock: 1,
    description:
      'Kultiger A Bathing Ape Shark Hoodie mit Glow-in-the-Dark-Print. Ikonisches Haifischmaul auf der Kapuze, schwerer Baumwollstoff.',
    details: ['Marke: A Bathing Ape (BAPE)', 'Material: 100 % Baumwolle', 'Glow-in-the-Dark-Detail', 'Zustand: sehr gut', 'Größe:M'],
  },
  {
    id: 'bape-shark-lila',
    name: 'Bape Shark Hoodie Lila',
    price: '450 EUR',
    category: 'Streetwear / Hoodie',
    image: '/assets/shop/bapesharklila.png',
    availability: 'available',
    stock: 1,
    description:
      'BAPE Shark Hoodie in sattem Lila. Full-Zip-Kapuze mit Haifischmaul-Grafik, Känguru-Tasche und typischem Ape-Camo-Futter.',
    details: ['Marke: A Bathing Ape (BAPE)', 'Material: 100 % Baumwolle', 'Farbe: Lila', 'Zustand: sehr gut', 'Größe: XL'],
  },
  {
    id: 'bape-shark-mickey',
    name: 'Bape Shark × Mickey Mouse',
    price: '620 EUR',
    category: 'Streetwear / Hoodie',
    image: '/assets/shop/bapesharkmickeymouse.png',
    availability: 'available',
    stock: 1,
    description:
      'Limitierte BAPE × Disney Kollaboration. Shark Hoodie mit Mickey-Mouse-Motiv auf der Kapuze – eine der gefragtesten Bape-Kollabs überhaupt.',
    details: ['Marke: BAPE × Disney', 'Material: 100 % Baumwolle', 'Limitierte Kollab-Edition', 'Zustand: sehr gut', 'Größe: bitte anfragen'],
  },
  {
    id: 'bape-shark-multicamo',
    name: 'Bape Shark Multi-Camo',
    price: '470 EUR',
    category: 'Streetwear / Hoodie',
    image: '/assets/shop/bapesharkmulticamo.png',
    availability: 'available',
    stock: 1,
    description:
      'BAPE Shark Hoodie im klassischen Multi-Camo-Muster. Vollfarbiges ABC-Camo allover, Signature Shark-Kapuze, selten in diesem Zustand.',
    details: ['Marke: A Bathing Ape (BAPE)', 'Material: 100 % Baumwolle', 'ABC Camo Allover', 'Zustand: sehr gut', 'Größe: bitte anfragen'],
  },
  {
    id: 'bape-shark-pink',
    name: 'Bape Shark Hoodie Pink',
    price: '450 EUR',
    category: 'Streetwear / Hoodie',
    image: '/assets/shop/bapesharkpink.png',
    availability: 'available',
    stock: 1,
    description:
      'BAPE Shark Hoodie in auffälligem Pink. Statement-Piece für jeden Streetwear-Liebhaber – Full-Zip, Haifischmaul-Kapuze.',
    details: ['Marke: A Bathing Ape (BAPE)', 'Material: 100 % Baumwolle', 'Farbe: Pink', 'Zustand: gut', 'Größe: bitte M'],
  },
  {
    id: 'bape-shark-rot',
    name: 'Bape Shark Hoodie Rot',
    price: '420 EUR',
    category: 'Streetwear / Hoodie',
    image: '/assets/shop/bapesharkrot.png',
    availability: 'available',
    stock: 1,
    description:
      'BAPE Shark Hoodie in kräftigem Rot. Klassisches Haifischmaul-Design, Full-Zip-Reißverschluss, schwere Qualität.',
    details: ['Marke: A Bathing Ape (BAPE)', 'Material: 100 % Baumwolle', 'Farbe: Rot', 'Zustand: gut', 'Größe:M'],
  },
  {
    id: 'supreme-sweatjacke',
    name: 'Supreme Sweatjacke',
    price: '260 EUR',
    category: 'Streetwear / Jacke',
    image: '/assets/shop/supremesweatjacke.png',
    availability: 'available',
    stock: 1,
    description:
      'Supreme Zip-Up Sweatjacke aus der regulären Line. Stickte Box-Logo-Brust, schwerer Fleece-Innenraum, zeitloser Schnitt.',
    details: ['Marke: Supreme', 'Material: Baumwoll-Fleece', 'Gesticktes Box Logo', 'Zustand: sehr gut', 'Größe: bitte anfragen'],
  },
  {
    id: 'supreme-tshirt',
    name: 'Supreme T-Shirt',
    price: '110 EUR',
    category: 'Streetwear / T-Shirt',
    image: '/assets/shop/supremetshirt.png',
    availability: 'available',
    stock: 2,
    description:
      'Supreme T-Shirt aus einer vergangenen Season. Cleanes Grafik-Tee, 100 % Baumwolle, typischer Supreme-Oversized-Fit.',
    details: ['Marke: Supreme', 'Material: 100 % Baumwolle', 'Grafik-Print', 'Zustand: sehr gut', 'Größe: bitte anfragen'],
  },
  {
    id: 'balenciaga-sweatjacke',
    name: 'Balenciaga Sweatjacke',
    price: '590 EUR',
    category: 'Luxury Streetwear / Jacke',
    image: '/assets/shop/balenciagasweatjacke.png',
    availability: 'sold-out',
    stock: 1,
    description:
      'Balenciaga Sweatjacke mit typischem Oversized-Fit. Gedrucktes Logo, hochwertige Baumwollqualität – ein Statement-Piece des Hauses.',
    details: ['Marke: Balenciaga', 'Material: Baumwoll-Fleece', 'Oversized Fit', 'Zustand: sehr gut', 'Größe: bitte anfragen'],
  },
  {
    id: 'corteiz-hoodie',
    name: 'Corteiz Hoodie',
    price: '140 EUR',
    category: 'Streetwear / Hoodie',
    image: '/assets/shop/corteizhoodie.png',
    availability: 'available',
    stock: 1,
    description:
      'Corteiz (CRTZ) Hoodie – einer der gefragtesten Streetwear-Drops aus London. Schwere Qualität, eingestickte Alcatraz-Grafik.',
    details: ['Marke: Corteiz (CRTZ)', 'Material: Schweres Baumwoll-Fleece', 'Alcatraz-Grafik', 'Zustand: sehr gut', 'Größe: bitte anfragen'],
  },
  {
    id: 'cp-company',
    name: 'CP Company Jacke',
    price: '420 EUR',
    category: 'Streetwear / Jacke',
    image: '/assets/shop/cpcompany.png',
    availability: 'available',
    stock: 1,
    description:
      'CP Company Jacke mit ikonischer Linsen-Brille in der Kapuze. Hohe Verarbeitungsqualität, technisches Material, zeitloses Design.',
    details: ['Marke: C.P. Company', 'Material: Technisches Nylon', 'Linsen-Goggle-Kapuze', 'Zustand: sehr gut', 'Größe: bitte anfragen'],
  },
  {
    id: 'dior-sorayama-hoodie',
    name: 'Dior × Sorayama Hoodie',
    price: '1800 EUR',
    category: 'Luxury Streetwear / Hoodie',
    image: '/assets/shop/diorsoyaramahoodie.png',
    availability: 'available',
    stock: 1,
    description:
      'Dior Men × Hajime Sorayama Kollab-Hoodie. Roboter-Grafik des japanischen Futurismus-Meisters auf schwerem Dior-Baumwollstoff. Extrem begehrtes Collector-Piece.',
    details: ['Marke: Dior Men × Hajime Sorayama', 'Material: 100 % Baumwolle', 'Limitierte Kollaboration', 'Zustand: sehr gut', 'Größe: bitte anfragen'],
  },
  {
    id: 'carlo-colucci-1',
    name: 'Carlo Colucci Strickjacke I',
    price: '310 EUR',
    category: 'Vintage / Strickjacke',
    image: '/assets/shop/carlocolucci_1.png',
    availability: 'available',
    stock: 1,
    description:
      'Carlo Colucci Vintage-Strickjacke im typischen 90s-Muster. Kultmarke aus der Hochzeit des deutschen HipHop – seltenes Original.',
    details: ['Marke: Carlo Colucci', 'Material: Wolle / Acryl', 'Vintage 90s', 'Zustand: gut', 'Größe: bitte anfragen'],
  },
  {
    id: 'carlo-colucci-2',
    name: 'Carlo Colucci Strickjacke II',
    price: '310 EUR',
    category: 'Vintage / Strickjacke',
    image: '/assets/shop/carlocolucci_2.png',
    availability: 'available',
    stock: 1,
    description:
      'Zweites Carlo Colucci Vintage-Piece im Mustermix. Charakteristischer Farbblock, dickes Strickgewebe – 90s Streetwear-Nostalgie pur.',
    details: ['Marke: Carlo Colucci', 'Material: Wolle / Acryl', 'Vintage 90s', 'Zustand: gut', 'Größe: bitte anfragen'],
  },
  {
    id: 'spider-hoodie-pink',
    name: 'Spider Hoodie Pink',
    price: '480 EUR',
    category: 'Streetwear / Hoodie',
    image: '/assets/shop/spiderhoodiepink.png',
    availability: 'available',
    stock: 1,
    description:
      'Sp5der Hoodie in Pink mit Web-Grafik allover. Einer der begehrtesten Drops von Young Thugs Brand – dicke Qualität, ikonisches Design.',
    details: ['Marke: Sp5der', 'Material: Schweres Baumwoll-Fleece', 'Web-Allover-Print', 'Zustand: sehr gut', 'Größe:L'],
  },
  {
    id: 'ac-milan-trikot',
    name: 'AC Milan Trikot',
    price: '120 EUR',
    category: 'Vintage / Jersey',
    image: '/assets/shop/acmilantrikot.png',
    availability: 'available',
    stock: 1,
    description:
      'Vintage AC Milan Auswärtstrikot. Klassisches Rot-Schwarz-Design, Originalstickerei – perfekt als Streetwear-Statement.',
    details: ['Verein: AC Milan', 'Typ: Vintage-Trikot', 'Original-Stickerei', 'Zustand: gut', 'Größe: bitte anfragen'],
  },
  {
    id: 'real-madrid-trikot',
    name: 'Real Madrid Trikot',
    price: '110 EUR',
    category: 'Vintage / Jersey',
    image: '/assets/shop/realmadridtrikot.png',
    availability: 'available',
    stock: 1,
    description:
      'Vintage Real Madrid Heimtrikot in Weiß. Ikonisches Wappen-Stickerei, klassisches Sponsor-Layout – ein zeitloser Fußballklassiker.',
    details: ['Verein: Real Madrid C.F.', 'Typ: Vintage-Trikot', 'Original-Stickerei', 'Zustand: gut', 'Größe: bitte anfragen'],
  },
  {
    id: 'manchester-dhl',
    name: 'Manchester × DHL Trikot',
    price: '260 EUR',
    category: 'Streetwear / Jersey',
    image: '/assets/shop/manchesterDHL.png',
    availability: 'available',
    stock: 1,
    description:
      'Das berühmte Manchester United × DHL-Trikot – ein Meme-Kultklassiker der Internetkultur. Äußerst selten im Original zu finden.',
    details: ['Marke: Umbro', 'Typ: Kultkollektion', 'DHL-Sponsor-Print', 'Zustand: sehr gut', 'Größe: M'],
  },
  {
    id: 'olympique-marseille',
    name: 'Olympique Marseille Trikot',
    price: '110 EUR',
    category: 'Vintage / Jersey',
    image: '/assets/shop/olympicmarseille.png',
    availability: 'available',
    stock: 1,
    description:
      'Vintage Olympique de Marseille Trikot. Charakteristisches Blau-Weiß-Design, Kultverein der Ligue 1 – sehr beliebt in der Streetwear-Szene.',
    details: ['Verein: Olympique de Marseille', 'Typ: Vintage-Trikot', 'Original-Stickerei', 'Zustand: gut', 'Größe: M'],
  },
  {
    id: 'arabic-shirt',
    name: 'Arabic Graphic Shirt',
    price: '95 EUR',
    category: 'Vintage / Hemd',
    image: '/assets/shop/arabicshirt.png',
    availability: 'available',
    stock: 1,
    description:
      'Vintage-Hemd mit arabischer Kalligrafie-Grafik. Einzigartiges Stück mit kultureller Tiefe – selten in diesem Zustand.',
    details: ['Typ: Vintage-Hemd', 'Material: Baumwolle', 'Arabischer Grafik-Print', 'Zustand: gut', 'Größe:M'],
  },
  {
    id: 'redbull-jacket',
    name: 'Red Bull Racing Jacke',
    price: '180 EUR',
    category: 'Streetwear / Jacke',
    image: '/assets/shop/redbull.png',
    availability: 'available',
    stock: 1,
    description:
      'Offizielle Red Bull Racing Teamjacke. Leichtes technisches Material, vollständig bestickte Logos, Collector-Item für Motorsportfans.',
    details: ['Marke: Red Bull Racing', 'Material: Technisches Gewebe', 'Offizielle Teamjacke', 'Zustand: sehr gut', 'Größe: M'],
  },
]
