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
    expressCheckoutHint: string
    orPayByCard: string
    contact: string
    email: string
    appointmentDetails: string
    appointmentDetailsHint: string
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
  withdrawal: {
    title: string
    sections: { heading: string; body: string }[]
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
      expressCheckoutHint: 'Fill in the form below first — Apple Pay / Google Pay start once your details are complete.',
      orPayByCard: 'or pay by card',
      contact: 'Contact',
      email: 'Email',
      appointmentDetails: 'Appointment Details',
      appointmentDetailsHint: 'Optional for Apple Pay / Google Pay — required only when paying by card below.',
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
        { heading: 'Information pursuant to Section 5 TMG', body: 'Jonas Geiger<br />Unterer Weiler 5<br />73527 Schwäbisch Gmünd<br />Germany' },
        { heading: 'Contact', body: 'Email: od.complaints@gmail.com<br />Phone: +49 176 81072268' },
        { heading: 'VAT identification number', body: 'VAT ID pursuant to Section 27a of the German VAT Act (UStG): DE464396864.' },
        { heading: 'Responsible for content', body: 'Pursuant to Section 18(2) MStV: Jonas Geiger, Unterer Weiler 5, 73527 Schwäbisch Gmünd.' },
        { heading: 'Dispute resolution', body: 'We are not willing and not obliged to participate in dispute resolution proceedings before a consumer arbitration board (Verbraucherschlichtungsstelle) pursuant to the German Consumer Dispute Resolution Act (VSBG).' },
        { heading: 'Liability for content', body: 'As a service provider, we are responsible for our own content on these pages under general law pursuant to Section 7(1) TMG/DDG. We are not obliged to monitor transmitted or stored third-party information or to investigate circumstances indicating unlawful activity. Obligations to remove or block the use of information under general law remain unaffected.' },
        { heading: 'Liability for links', body: 'Our site may contain links to external third-party websites over whose content we have no influence. We therefore cannot accept any liability for this third-party content. The respective provider or operator of the linked pages is always responsible for their content.' },
        { heading: 'Copyright', body: 'Content and works on these pages created by the site operator are subject to German copyright law. Reproduction, editing, distribution and any kind of use beyond the scope of copyright law require the written consent of the respective author or creator.' },
      ],
      closing: 'This legal notice was last reviewed in September 2026.',
    },
    withdrawal: {
      title: 'Right of Withdrawal & Terms of Sale',
      sections: [
        { heading: 'Terms of sale', body: 'Prices shown in the shop are final prices in EUR and include statutory VAT where applicable, plus shipping costs, which are shown before completing the order. Payment is processed exclusively via Stripe (credit/debit card, Apple Pay, Google Pay). We currently ship to Germany, Austria, Switzerland, the Netherlands, Belgium, Luxembourg, France, Denmark, Poland and the Czech Republic. Estimated delivery time is 3–10 business days after receipt of payment, unless stated otherwise for a specific item. The goods remain our property until paid in full.' },
        { heading: 'Right of withdrawal', body: 'You have the right to withdraw from this contract within 14 days without giving any reason. The withdrawal period will expire 14 days after the day on which you, or a third party other than the carrier and indicated by you, acquires physical possession of the last good (in the case of several goods ordered in one order and delivered separately, the last good). To exercise the right of withdrawal, you must inform us (Jonas Geiger, Unterer Weiler 5, 73527 Schwäbisch Gmünd, Germany, od.complaints@gmail.com, +49 176 81072268) of your decision to withdraw from this contract by an unequivocal statement (e.g. a letter sent by post or an email). You may use the model withdrawal form below, but it is not obligatory. To meet the withdrawal deadline, it is sufficient for you to send your communication concerning your exercise of the right of withdrawal before the withdrawal period has expired.' },
        { heading: 'Effects of withdrawal', body: 'If you withdraw from this contract, we shall reimburse all payments received from you, including the costs of delivery (except for supplementary costs resulting from your choice of a type of delivery other than the least expensive type of standard delivery offered by us), without undue delay and in any event not later than 14 days from the day on which we are informed about your decision to withdraw from this contract. We will carry out such reimbursement using the same means of payment as you used for the initial transaction, unless expressly agreed otherwise; in any event, you will not incur any fees as a result of such reimbursement. We may withhold reimbursement until we have received the goods back or until you have supplied evidence of having sent back the goods, whichever is the earliest. You shall send back the goods without undue delay and in any event not later than 14 days from the day on which you communicate your withdrawal from this contract to us. The deadline is met if you send back the goods before the period of 14 days has expired. You will have to bear the direct cost of returning the goods. You are only liable for any diminished value of the goods resulting from handling other than what is necessary to establish the nature, characteristics and functioning of the goods.' },
        { heading: 'Exclusion of the right of withdrawal', body: 'The right of withdrawal does not apply to contracts for the supply of goods made to your specifications or clearly personalised, and to services related to tattoo appointments (e.g. deposits) if the service has been fully performed, or its performance has begun with your prior express consent and acknowledgment that you lose your right of withdrawal once the service is fully performed by us.' },
        { heading: 'Model withdrawal form', body: '(If you want to withdraw from the contract, please fill out this form and send it back to us.)<br /><br />To: Jonas Geiger, Unterer Weiler 5, 73527 Schwäbisch Gmünd, Germany, od.complaints@gmail.com<br /><br />I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract of sale of the following goods (*)/for the provision of the following service (*)<br />— Ordered on (*)/received on (*)<br />— Name of consumer(s)<br />— Address of consumer(s)<br />— Signature of consumer(s) (only if this form is notified on paper)<br />— Date<br /><br />(*) Delete as appropriate.' },
      ],
    },
    privacy: {
      title: 'Privacy',
      sections: [
        { heading: 'Controller', body: 'Jonas Geiger, Unterer Weiler 5, 73527 Schwäbisch Gmünd, Germany, od.complaints@gmail.com, +49 176 81072268' },
        { heading: 'Hosting and server log files', body: 'This website is hosted on Cloudflare Pages. Each time this site is accessed, technical data (such as IP address, browser type, referring page and timestamp) is automatically processed by our hosting provider in server log files to ensure secure and stable delivery of the site, based on our legitimate interest pursuant to Art. 6(1)(f) GDPR. Log data is retained only as long as necessary for this purpose, in line with Cloudflare\u2019s standard retention practices (see cloudflare.com/privacypolicy).' },
        { heading: 'Booking and contact inquiries', body: 'When you send an inquiry through the booking or contact form, the data you submit (such as name, email address and appointment details) is processed to respond to your request and, where applicable, to initiate or perform a contract, pursuant to Art. 6(1)(b) and (f) GDPR. Form submissions are technically handled by Formspree, Inc. (USA), acting as a processor on our behalf. As Formspree is located outside the EU/EEA, data transfer relies on appropriate safeguards (e.g. EU-U.S. Data Privacy Framework or standard contractual clauses). Inquiry data is deleted once it is no longer required, unless statutory retention obligations apply.' },
        { heading: 'Shop orders and payments', body: "Where items are purchased through the shop, order and payment data (such as name, delivery address and order contents) is processed solely to fulfil the purchase contract pursuant to Art. 6(1)(b) GDPR. Payment processing is carried out by Stripe (Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Dublin, Ireland, and its parent company Stripe, Inc., USA), acting as a processor on our behalf. We do not receive or store full payment card details; these are transmitted directly and securely to Stripe. Where data is transferred to Stripe entities outside the EU/EEA, this is based on appropriate safeguards such as the EU-U.S. Data Privacy Framework or standard contractual clauses. For details see Stripe's own privacy policy at stripe.com/privacy." },
        { heading: 'Cookies', body: 'This website does not currently set any cookies or use any tracking or analytics tools. Should this change, this notice will be updated accordingly and, where legally required, your consent will be obtained in advance.' },
        { heading: 'Recipients and storage duration', body: 'Personal data is only shared with the processors named above (hosting, form and payment providers) to the extent necessary and is not sold or passed on to any other third parties. Data is stored only for as long as necessary for the purposes described above or as required by statutory retention periods (e.g. commercial and tax retention periods of up to 10 years for order and invoice data).' },
        { heading: 'Your rights', body: 'Under the GDPR, you have the right to access, rectification, erasure, restriction of processing, data portability, and to object to processing based on legitimate interest. You may withdraw any consent given at any time with future effect. You may also lodge a complaint with a data-protection supervisory authority, in particular the Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg (LfDI Baden-Württemberg), which is competent for our registered business address in Baden-Württemberg.' },
        { heading: 'Data security', body: 'This site uses TLS/SSL encryption to protect the transmission of confidential content such as inquiries and orders you submit to us.' },
      ],
      closing: 'This privacy notice must be legally reviewed and adapted to the services actually used before publication. Last updated: September 2026.',
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
      expressCheckoutHint: 'Fülle zuerst das Formular unten aus — Apple Pay / Google Pay starten erst, wenn deine Angaben vollständig sind.',
      orPayByCard: 'oder mit Karte bezahlen',
      contact: 'Kontakt',
      email: 'E-Mail',
      appointmentDetails: 'Termindetails',
      appointmentDetailsHint: 'Optional bei Apple Pay / Google Pay — nur bei Zahlung per Karte unten erforderlich.',
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
        { heading: 'Angaben gemäß § 5 TMG', body: 'Jonas Geiger<br />Unterer Weiler 5<br />73527 Schwäbisch Gmünd<br />Deutschland' },
        { heading: 'Kontakt', body: 'E-Mail: od.complaints@gmail.com<br />Telefon: +49 176 81072268' },
        { heading: 'Umsatzsteuer-Identifikationsnummer', body: 'USt-IdNr. gemäß § 27a Umsatzsteuergesetz: DE464396864.' },
        { heading: 'Verantwortlich für den Inhalt', body: 'Gemäß § 18 Abs. 2 MStV: Jonas Geiger, Unterer Weiler 5, 73527 Schwäbisch Gmünd.' },
        { heading: 'Streitschlichtung', body: 'Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle gemäß dem Verbraucherstreitbeilegungsgesetz (VSBG) teilzunehmen.' },
        { heading: 'Haftung für Inhalte', body: 'Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG/DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.' },
        { heading: 'Haftung für Links', body: 'Unsere Website kann Links zu externen Websites Dritter enthalten, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.' },
        { heading: 'Urheberrecht', body: 'Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.' },
      ],
      closing: 'Dieses Impressum wurde zuletzt im September 2026 überprüft.',
    },
    withdrawal: {
      title: 'Widerrufsrecht & Verkaufsbedingungen',
      sections: [
        { heading: 'Verkaufsbedingungen', body: 'Die im Shop angezeigten Preise sind Endpreise in EUR und enthalten die gesetzliche Umsatzsteuer, sofern anwendbar, zzgl. Versandkosten, die vor Abschluss der Bestellung angezeigt werden. Die Zahlung erfolgt ausschließlich über Stripe (Kredit-/Debitkarte, Apple Pay, Google Pay). Wir versenden derzeit nach Deutschland, Österreich, in die Schweiz, in die Niederlande, nach Belgien, Luxemburg, Frankreich, Dänemark, Polen und Tschechien. Die voraussichtliche Lieferzeit beträgt 3–10 Werktage nach Zahlungseingang, sofern für einen Artikel nicht anders angegeben. Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.' },
        { heading: 'Widerrufsrecht', body: 'Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat (bei mehreren georderten Waren einer Bestellung, die getrennt geliefert werden: die letzte Ware). Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Jonas Geiger, Unterer Weiler 5, 73527 Schwäbisch Gmünd, Deutschland, od.complaints@gmail.com, +49 176 81072268) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das unten stehende Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist. Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.' },
        { heading: 'Folgen des Widerrufs', body: 'Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet. Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist. Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns zurückzusenden. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden. Sie tragen die unmittelbaren Kosten der Rücksendung der Waren. Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.' },
        { heading: 'Ausschluss des Widerrufsrechts', body: 'Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung von Waren, die nach Kundenspezifikation angefertigt werden oder eindeutig auf die persönlichen Bedürfnisse zugeschnitten sind, sowie bei Dienstleistungen im Zusammenhang mit Tattoo-Terminen (z. B. Anzahlungen), wenn die Dienstleistung vollständig erbracht wurde oder mit ihrer Ausführung mit Ihrer ausdrücklichen vorherigen Zustimmung begonnen wurde und Sie zur Kenntnis genommen haben, dass Sie Ihr Widerrufsrecht bei vollständiger Vertragserfüllung durch uns verlieren.' },
        { heading: 'Muster-Widerrufsformular', body: '(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)<br /><br />An: Jonas Geiger, Unterer Weiler 5, 73527 Schwäbisch Gmünd, Deutschland, od.complaints@gmail.com<br /><br />Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)<br />— Bestellt am (*)/erhalten am (*)<br />— Name des/der Verbraucher(s)<br />— Anschrift des/der Verbraucher(s)<br />— Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)<br />— Datum<br /><br />(*) Unzutreffendes streichen.' },
      ],
    },
    privacy: {
      title: 'Datenschutz',
      sections: [
        { heading: 'Verantwortlicher', body: 'Jonas Geiger, Unterer Weiler 5, 73527 Schwäbisch Gmünd, Deutschland, od.complaints@gmail.com, +49 176 81072268' },
        { heading: 'Hosting und Server-Logfiles', body: 'Diese Website wird bei Cloudflare Pages gehostet. Bei jedem Zugriff auf diese Seite werden technische Daten (wie IP-Adresse, Browsertyp, verweisende Seite und Zeitstempel) automatisch von unserem Hosting-Anbieter in Server-Logfiles verarbeitet, um eine sichere und stabile Auslieferung der Seite zu gewährleisten, gestützt auf unser berechtigtes Interesse gemäß Art. 6 Abs. 1 lit. f DSGVO. Die Logdaten werden nur so lange gespeichert, wie es für diesen Zweck erforderlich ist, entsprechend den Standard-Speicherpraktiken von Cloudflare (siehe cloudflare.com/privacypolicy).' },
        { heading: 'Termin- und Kontaktanfragen', body: 'Wenn du über das Termin- oder Kontaktformular eine Anfrage sendest, werden die von dir übermittelten Daten (wie Name, E-Mail-Adresse und Termindetails) verarbeitet, um deine Anfrage zu beantworten und gegebenenfalls einen Vertrag anzubahnen oder durchzuführen, gemäß Art. 6 Abs. 1 lit. b und f DSGVO. Formularübermittlungen werden technisch von Formspree, Inc. (USA) als Auftragsverarbeiter für uns abgewickelt. Da Formspree außerhalb der EU/des EWR ansässig ist, stützt sich die Datenübermittlung auf geeignete Garantien (z. B. EU-U.S. Data Privacy Framework oder Standardvertragsklauseln). Anfragedaten werden gelöscht, sobald sie nicht mehr benötigt werden, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.' },
        { heading: 'Shop-Bestellungen und Zahlungen', body: 'Werden Artikel über den Shop erworben, werden Bestell- und Zahlungsdaten (z. B. Name, Lieferadresse und Bestellinhalt) ausschließlich zur Erfüllung des Kaufvertrags gemäß Art. 6 Abs. 1 lit. b DSGVO verarbeitet. Die Zahlungsabwicklung erfolgt über Stripe (Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Dublin, Irland, sowie deren Mutterunternehmen Stripe, Inc., USA) als Auftragsverarbeiter für uns. Vollständige Zahlungskartendaten erhalten oder speichern wir nicht selbst; diese werden direkt und verschlüsselt an Stripe übermittelt. Soweit Daten an Stripe-Gesellschaften außerhalb der EU/des EWR übermittelt werden, stützt sich dies auf geeignete Garantien wie das EU-U.S. Data Privacy Framework oder Standardvertragsklauseln. Details findest du in der Datenschutzerklärung von Stripe unter stripe.com/privacy.' },
        { heading: 'Cookies', body: 'Diese Website setzt derzeit keine Cookies und verwendet keine Tracking- oder Analyse-Tools. Sollte sich dies ändern, wird dieser Hinweis entsprechend aktualisiert und, sofern gesetzlich erforderlich, wird deine Einwilligung vorab eingeholt.' },
        { heading: 'Empfänger und Speicherdauer', body: 'Personenbezogene Daten werden nur im erforderlichen Umfang an die oben genannten Auftragsverarbeiter (Hosting-, Formular- und Zahlungsanbieter) weitergegeben und nicht verkauft oder an sonstige Dritte weitergegeben. Daten werden nur so lange gespeichert, wie es für die oben beschriebenen Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen dies vorschreiben (z. B. handels- und steuerrechtliche Aufbewahrungsfristen von bis zu 10 Jahren für Bestell- und Rechnungsdaten).' },
        { heading: 'Deine Rechte', body: 'Nach der DSGVO hast du das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie das Recht, der Verarbeitung auf Grundlage berechtigten Interesses zu widersprechen. Eine erteilte Einwilligung kannst du jederzeit mit Wirkung für die Zukunft widerrufen. Du kannst dich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren, insbesondere beim Landesbeauftragten für den Datenschutz und die Informationsfreiheit Baden-Württemberg (LfDI Baden-Württemberg), der für unseren Firmensitz in Baden-Württemberg zuständig ist.' },
        { heading: 'Datensicherheit', body: 'Diese Seite nutzt eine TLS/SSL-Verschlüsselung, um die Übertragung vertraulicher Inhalte wie von dir übermittelter Anfragen und Bestellungen zu schützen.' },
      ],
      closing: 'Dieser Datenschutzhinweis muss rechtlich geprüft und an die tatsächlich genutzten Dienste angepasst werden, bevor er veröffentlicht wird. Zuletzt aktualisiert: September 2026.',
    },
  },
}
