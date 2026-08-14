export type Language = 'en' | 'de'

type TranslationShape = {
  nav: {
    work: string
    shop: string
    booking: string
    about: string
    favorites: string
    cart: string
  }
  footer: {
    legalNotice: string
    privacy: string
    instagram: string
  }
  home: {
    eyebrow: string
    tagline: string
    description: string
    bookSession: string
    portfolio: string
  }
}

export const translations: Record<Language, TranslationShape> = {
  en: {
    nav: {
      work: 'Work',
      shop: 'Shop',
      booking: 'Booking',
      about: 'About',
      favorites: 'Favorites',
      cart: 'Cart',
    },
    footer: {
      legalNotice: 'Legal notice',
      privacy: 'Privacy',
      instagram: 'Instagram',
    },
    home: {
      eyebrow: 'Tattoo Artist / GD',
      tagline: 'Get your next Regret',
      description:
        'Blackwork, fineline and botanical motifs. Individual tattoos, considered carefully and executed with precision.',
      bookSession: 'Book a Session',
      portfolio: 'Portfolio',
    },
  },
  de: {
    nav: {
      work: 'Arbeiten',
      shop: 'Shop',
      booking: 'Termin',
      about: 'Über uns',
      favorites: 'Favoriten',
      cart: 'Warenkorb',
    },
    footer: {
      legalNotice: 'Impressum',
      privacy: 'Datenschutz',
      instagram: 'Instagram',
    },
    home: {
      eyebrow: 'Tätowierer / GD',
      tagline: 'Hol dir dein nächstes Bedauern',
      description:
        'Blackwork, Fineline und botanische Motive. Individuelle Tattoos, sorgf\u00e4ltig durchdacht und pr\u00e4zise umgesetzt.',
      bookSession: 'Termin buchen',
      portfolio: 'Portfolio',
    },
  },
}
