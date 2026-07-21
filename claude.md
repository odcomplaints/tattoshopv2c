# Projekt: Tattoo-Artist Portfolio & Booking

## Kontext
Minimalistische Online-Präsenz für einen Tätowierer (Berlin).
Stil-Referenz: velkasvestments.de – dunkel, roh, reduziert, Bilder im Fokus.

## Tech-Stack (nicht ändern ohne Rückfrage)
- React
- Tailwind CSS
- Astro Content Collections für die Galerie (Markdown/JSON, kein CMS)
- Astro <Image /> für alle Bilder (WebP/AVIF, lazy loading)
- Formspree für das Booking-Formular
- Deployment: Cloudflare Pages

## Design-Regeln
- Hintergrund: neutral-950, Text: neutral-200
- Monospace-Font, Uppercase mit tracking-widest für Headings/Nav
- Kein JavaScript, außer es ist zwingend nötig (z.B. Lightbox)
- Mobile-first, Besucher kommen primär via Instagram-Bio-Link
- Keine Animationen außer dezenten hover/transition-colors

## Seitenstruktur
/            Hero + Galerie-Teaser (6 neueste Arbeiten)
/work        volle Galerie als Grid
/booking     Formular + FAQ (Ablauf, Preise, Aftercare)
/about       Kurzvorstellung, Studio, Stadt
/imprint     Impressum (deutsches Recht, Platzhalter)
/privacy     Datenschutzerklärung (DSGVO, Platzhalter)

## Konventionen
- Komponenten in src/components/, Layouts in src/layouts/
- Galerie-Einträge: src/content/work/*.md mit Frontmatter
  (title, date, style, bodyPart, image)
- Deutsche UI-Texte, Code/Kommentare auf Englisch
- Nach jeder Änderung muss `npm run build` fehlerfrei durchlaufen
