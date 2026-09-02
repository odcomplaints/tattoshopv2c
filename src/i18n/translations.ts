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
  about: {
    eyebrow: string
    title: string
    paragraphs: string[]
  }
  booking: {
    eyebrow: string
    title: string
    intro: string
    expressCheckout: string
    orPayByCard: string
    contact: string
    email: string
    appointmentDetails: string
    name: string
    motif: string
    placement: string
    size: string
    sizePlaceholder: string
    preferredDate: string
    billingAddress: string
    address: string
    zip: string
    city: string
    country: string
    phone: string
    payment: string
    demoNote: string
    cardNumber: string
    expiry: string
    cvc: string
    payDeposit: string
    orderSummary: string
    tattooDeposit: string
    creditedNote: string
    subtotal: string
    shipping: string
    total: string
    faqTitle: string
    faqs: [string, string][]
  }
  legal: {
    eyebrow: string
  }
  imprint: {
    title: string
    sections: { heading: string; body: string }[]
    closing: string
  }
  privacy: {
    title: string
    sections: { heading: string; body: string }[]
    closing: string
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
    about: {
      eyebrow: 'About',
      title: 'OD COMPLAINTS',
      paragraphs: [
        'I tattoo in GD, focusing on reduced forms, organic lines and motifs that age well. My work moves between blackwork, fineline and botanical fragments.',
        'Every project starts with a conversation about placement, idea and movement. References and your thoughts become a design made for you and your chosen placement.',
        'Appointments take place by arrangement in a quiet studio in GD. You will receive the exact address with your booking confirmation.',
      ],
    },
    booking: {
      eyebrow: 'Checkout',
      title: 'Booking',
      intro: 'Secure your appointment with a deposit of {deposit}. The amount is credited towards the final price of your tattoo.',
      expressCheckout: 'Express Checkout',
      orPayByCard: 'or pay by card',
      contact: 'Contact',
      email: 'Email',
      appointmentDetails: 'Appointment Details',
      name: 'Name',
      motif: 'Motif description',
      placement: 'Placement',
      size: 'Size in cm',
      sizePlaceholder: 'e.g. 12',
      preferredDate: 'Preferred date',
      billingAddress: 'Billing Address',
      address: 'Address',
      zip: 'ZIP code',
      city: 'City',
      country: 'Country',
      phone: 'Phone',
      payment: 'Payment',
      demoNote: 'Demo · no real charge',
      cardNumber: 'Card number',
      expiry: 'Expiry date',
      cvc: 'CVC',
      payDeposit: 'Pay deposit',
      orderSummary: 'Order Summary',
      tattooDeposit: 'Tattoo deposit',
      creditedNote: 'Credited towards the final price',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      total: 'Total',
      faqTitle: 'FAQ',
      faqs: [
        ['How does an inquiry work?', 'After receiving your inquiry, I review the motif, placement and timeframe. If the project is a fit, I will reply with possible dates.'],
        ['How much is the deposit?', 'The deposit is 50 EUR and secures your appointment. It is credited towards the final price of your tattoo.'],
        ['How should I prepare?', 'Arrive rested, eat beforehand and avoid alcohol the day before. References help, but a finished design is not required.'],
        ['Do you provide aftercare advice?', 'You will receive written aftercare instructions after your appointment. Depending on the placement, sun, swimming and exercise should be avoided during the first weeks.'],
      ],
    },
    legal: {
      eyebrow: 'Legal',
    },
    imprint: {
      title: 'Legal notice',
      sections: [
        { heading: 'Information pursuant to Section 5 TMG', body: 'OD COMPLAINTS<br />Sample Street 12<br />GD<br />Germany' },
        { heading: 'Contact', body: 'Email: hello@example.com<br />Phone: +49 30 00000000' },
        { heading: 'VAT identification number', body: 'VAT ID pursuant to Section 27a of the German VAT Act (UStG): [Placeholder — insert VAT ID, or state that small business regulation under Section 19 UStG applies and no VAT is charged].' },
        { heading: 'Responsible for content', body: 'Pursuant to Section 18(2) MStV: [Placeholder — name of the responsible natural person], Sample Street 12, GD.' },
        { heading: 'Dispute resolution', body: 'We are not willing and not obliged to participate in dispute resolution proceedings before a consumer arbitration board (Verbraucherschlichtungsstelle) pursuant to the German Consumer Dispute Resolution Act (VSBG).' },
        { heading: 'Liability for content', body: 'As a service provider, we are responsible for our own content on these pages under general law pursuant to Section 7(1) TMG/DDG. We are not obliged to monitor transmitted or stored third-party information or to investigate circumstances indicating unlawful activity. Obligations to remove or block the use of information under general law remain unaffected.' },
        { heading: 'Liability for links', body: 'Our site may contain links to external third-party websites over whose content we have no influence. We therefore cannot accept any liability for this third-party content. The respective provider or operator of the linked pages is always responsible for their content.' },
        { heading: 'Copyright', body: 'Content and works on these pages created by the site operator are subject to German copyright law. Reproduction, editing, distribution and any kind of use beyond the scope of copyright law require the written consent of the respective author or creator.' },
      ],
      closing: 'This is a placeholder legal notice and must be completed with the actual details, reviewed by a qualified professional, and finalised before publication.',
    },
    privacy: {
      title: 'Privacy',
      sections: [
        { heading: 'Controller', body: 'OD COMPLAINTS, Sample Street 12, GD, hello@example.com' },
        { heading: 'Hosting and server log files', body: 'This website is hosted on Cloudflare Pages. Each time this site is accessed, technical data (such as IP address, browser type, referring page and timestamp) is automatically processed by our hosting provider in server log files to ensure secure and stable delivery of the site, based on our legitimate interest pursuant to Art. 6(1)(f) GDPR. [Placeholder — confirm exact log retention period with hosting provider.]' },
        { heading: 'Booking and contact inquiries', body: 'When you send an inquiry through the booking or contact form, the data you submit (such as name, email address and appointment details) is processed to respond to your request and, where applicable, to initiate or perform a contract, pursuant to Art. 6(1)(b) and (f) GDPR. Form submissions are technically handled by Formspree, Inc. (USA), acting as a processor on our behalf. As Formspree is located outside the EU/EEA, data transfer relies on appropriate safeguards (e.g. EU-U.S. Data Privacy Framework or standard contractual clauses). Inquiry data is deleted once it is no longer required, unless statutory retention obligations apply.' },
        { heading: 'Shop orders and payments', body: "Where prints are purchased through the shop, order and payment data is processed solely to fulfil the purchase contract pursuant to Art. 6(1)(b) GDPR. [Placeholder — to be completed once a payment processor, e.g. Stripe, is integrated, including the processor's name, location and applicable safeguards for any data transfer outside the EU/EEA.]" },
        { heading: 'Cookies', body: 'This website does not currently set any cookies or use any tracking or analytics tools. Should this change, this notice will be updated accordingly and, where legally required, your consent will be obtained in advance.' },
        { heading: 'Recipients and storage duration', body: 'Personal data is only shared with the processors named above (hosting and form provider) to the extent necessary and is not sold or passed on to any other third parties. Data is stored only for as long as necessary for the purposes described above or as required by statutory retention periods.' },
        { heading: 'Your rights', body: 'Under the GDPR, you have the right to access, rectification, erasure, restriction of processing, data portability, and to object to processing based on legitimate interest. You may withdraw any consent given at any time with future effect. You may also lodge a complaint with a data-protection supervisory authority, in particular [Placeholder — name of the competent German state data protection authority].' },
        { heading: 'Data security', body: 'This site uses TLS/SSL encryption to protect the transmission of confidential content such as inquiries you submit to us.' },
      ],
      closing: 'This privacy notice is a placeholder and must be legally reviewed and adapted to the services actually used before publication. Last updated: [Placeholder — date].',
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
    about: {
      eyebrow: 'Über uns',
      title: 'OD COMPLAINTS',
      paragraphs: [
        'Ich tätowiere in GD und konzentriere mich auf reduzierte Formen, organische Linien und Motive, die gut altern. Meine Arbeit bewegt sich zwischen Blackwork, Fineline und botanischen Fragmenten.',
        'Jedes Projekt beginnt mit einem Gespräch über Platzierung, Idee und Bewegung. Referenzen und deine Gedanken werden zu einem Design, das für dich und deine gewählte Platzierung gemacht ist.',
        'Termine finden nach Vereinbarung in einem ruhigen Studio in GD statt. Die genaue Adresse erhältst du mit deiner Terminbestätigung.',
      ],
    },
    booking: {
      eyebrow: 'Kasse',
      title: 'Termin',
      intro: 'Sichere dir deinen Termin mit einer Anzahlung von {deposit}. Der Betrag wird auf den Endpreis deines Tattoos angerechnet.',
      expressCheckout: 'Express-Kasse',
      orPayByCard: 'oder mit Karte bezahlen',
      contact: 'Kontakt',
      email: 'E-Mail',
      appointmentDetails: 'Termindetails',
      name: 'Name',
      motif: 'Motivbeschreibung',
      placement: 'Platzierung',
      size: 'Größe in cm',
      sizePlaceholder: 'z. B. 12',
      preferredDate: 'Wunschtermin',
      billingAddress: 'Rechnungsadresse',
      address: 'Adresse',
      zip: 'Postleitzahl',
      city: 'Stadt',
      country: 'Land',
      phone: 'Telefon',
      payment: 'Zahlung',
      demoNote: 'Demo · keine echte Abbuchung',
      cardNumber: 'Kartennummer',
      expiry: 'Ablaufdatum',
      cvc: 'CVC',
      payDeposit: 'Anzahlung bezahlen',
      orderSummary: 'Bestellübersicht',
      tattooDeposit: 'Tattoo-Anzahlung',
      creditedNote: 'Wird auf den Endpreis angerechnet',
      subtotal: 'Zwischensumme',
      shipping: 'Versand',
      total: 'Gesamt',
      faqTitle: 'FAQ',
      faqs: [
        ['Wie läuft eine Anfrage ab?', 'Nach Erhalt deiner Anfrage prüfe ich Motiv, Platzierung und Zeitrahmen. Wenn das Projekt passt, melde ich mich mit möglichen Terminen zurück.'],
        ['Wie hoch ist die Anzahlung?', 'Die Anzahlung beträgt 50 EUR und sichert deinen Termin. Sie wird auf den Endpreis deines Tattoos angerechnet.'],
        ['Wie sollte ich mich vorbereiten?', 'Komm ausgeruht, iss vorher etwas und verzichte am Vortag auf Alkohol. Referenzen helfen, ein fertiges Design ist aber nicht erforderlich.'],
        ['Gibt es Nachsorge-Hinweise?', 'Du erhältst nach deinem Termin schriftliche Nachsorgehinweise. Je nach Platzierung solltest du in den ersten Wochen Sonne, Schwimmen und Sport vermeiden.'],
      ],
    },
    legal: {
      eyebrow: 'Rechtliches',
    },
    imprint: {
      title: 'Impressum',
      sections: [
        { heading: 'Angaben gemäß § 5 TMG', body: 'OD COMPLAINTS<br />Musterstraße 12<br />GD<br />Deutschland' },
        { heading: 'Kontakt', body: 'E-Mail: hello@example.com<br />Telefon: +49 30 00000000' },
        { heading: 'Umsatzsteuer-Identifikationsnummer', body: 'USt-IdNr. gemäß § 27a Umsatzsteuergesetz: [Platzhalter — USt-IdNr. eintragen oder angeben, dass die Kleinunternehmerregelung nach § 19 UStG gilt und keine Umsatzsteuer berechnet wird].' },
        { heading: 'Verantwortlich für den Inhalt', body: 'Gemäß § 18 Abs. 2 MStV: [Platzhalter — Name der verantwortlichen Person], Musterstraße 12, GD.' },
        { heading: 'Streitschlichtung', body: 'Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle gemäß dem Verbraucherstreitbeilegungsgesetz (VSBG) teilzunehmen.' },
        { heading: 'Haftung für Inhalte', body: 'Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG/DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.' },
        { heading: 'Haftung für Links', body: 'Unsere Website kann Links zu externen Websites Dritter enthalten, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.' },
        { heading: 'Urheberrecht', body: 'Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.' },
      ],
      closing: 'Dies ist ein Platzhalter-Impressum und muss mit den tatsächlichen Angaben vervollständigt, von einer fachkundigen Person geprüft und vor Veröffentlichung finalisiert werden.',
    },
    privacy: {
      title: 'Datenschutz',
      sections: [
        { heading: 'Verantwortlicher', body: 'OD COMPLAINTS, Musterstraße 12, GD, hello@example.com' },
        { heading: 'Hosting und Server-Logfiles', body: 'Diese Website wird bei Cloudflare Pages gehostet. Bei jedem Zugriff auf diese Seite werden technische Daten (wie IP-Adresse, Browsertyp, verweisende Seite und Zeitstempel) automatisch von unserem Hosting-Anbieter in Server-Logfiles verarbeitet, um eine sichere und stabile Auslieferung der Seite zu gewährleisten, gestützt auf unser berechtigtes Interesse gemäß Art. 6 Abs. 1 lit. f DSGVO. [Platzhalter — genaue Speicherdauer der Logfiles beim Hosting-Anbieter bestätigen.]' },
        { heading: 'Termin- und Kontaktanfragen', body: 'Wenn du über das Termin- oder Kontaktformular eine Anfrage sendest, werden die von dir übermittelten Daten (wie Name, E-Mail-Adresse und Termindetails) verarbeitet, um deine Anfrage zu beantworten und gegebenenfalls einen Vertrag anzubahnen oder durchzuführen, gemäß Art. 6 Abs. 1 lit. b und f DSGVO. Formularübermittlungen werden technisch von Formspree, Inc. (USA) als Auftragsverarbeiter für uns abgewickelt. Da Formspree außerhalb der EU/des EWR ansässig ist, stützt sich die Datenübermittlung auf geeignete Garantien (z. B. EU-U.S. Data Privacy Framework oder Standardvertragsklauseln). Anfragedaten werden gelöscht, sobald sie nicht mehr benötigt werden, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.' },
        { heading: 'Shop-Bestellungen und Zahlungen', body: 'Werden Prints über den Shop erworben, werden Bestell- und Zahlungsdaten ausschließlich zur Erfüllung des Kaufvertrags gemäß Art. 6 Abs. 1 lit. b DSGVO verarbeitet. [Platzhalter — zu vervollständigen, sobald ein Zahlungsdienstleister, z. B. Stripe, integriert ist, einschließlich Name, Standort und geltender Garantien für eine Datenübermittlung außerhalb der EU/des EWR.]' },
        { heading: 'Cookies', body: 'Diese Website setzt derzeit keine Cookies und verwendet keine Tracking- oder Analyse-Tools. Sollte sich dies ändern, wird dieser Hinweis entsprechend aktualisiert und, sofern gesetzlich erforderlich, wird deine Einwilligung vorab eingeholt.' },
        { heading: 'Empfänger und Speicherdauer', body: 'Personenbezogene Daten werden nur im erforderlichen Umfang an die oben genannten Auftragsverarbeiter (Hosting- und Formularanbieter) weitergegeben und nicht verkauft oder an sonstige Dritte weitergegeben. Daten werden nur so lange gespeichert, wie es für die oben beschriebenen Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen dies vorschreiben.' },
        { heading: 'Deine Rechte', body: 'Nach der DSGVO hast du das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie das Recht, der Verarbeitung auf Grundlage berechtigten Interesses zu widersprechen. Eine erteilte Einwilligung kannst du jederzeit mit Wirkung für die Zukunft widerrufen. Du kannst dich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren, insbesondere bei [Platzhalter — Name der zuständigen deutschen Landesdatenschutzbehörde].' },
        { heading: 'Datensicherheit', body: 'Diese Seite nutzt eine TLS/SSL-Verschlüsselung, um die Übertragung vertraulicher Inhalte wie von dir übermittelter Anfragen zu schützen.' },
      ],
      closing: 'Dieser Datenschutzhinweis ist ein Platzhalter und muss rechtlich geprüft und an die tatsächlich genutzten Dienste angepasst werden, bevor er veröffentlicht wird. Zuletzt aktualisiert: [Platzhalter — Datum].',
    },
  },
}
