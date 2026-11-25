# Projekt: Tattoo-Artist Portfolio & Booking

## Kontext
Minimalistische Online-Präsenz für einen Tätowierer (Berlin).
Stil-Referenz: velkasvestments.de – dunkel, roh, reduziert, Bilder im Fokus.

## Tech-Stack (nicht ändern ohne Rückfrage)
- Vite + React (SPA, react-router), Seiten außer / werden per Route lazy geladen
- Tailwind CSS
- Inhalte als TypeScript-Daten in src/data/ (work.ts, slider.ts, shop.ts, catalog.ts), kein CMS
- Bilder: Originale in public/, WebP-Varianten via `npm run images` (läuft auch automatisch
  vor `npm run build`) nach public/opt/. Im Code Bilder immer über src/lib/image.ts
  einbinden (`responsiveImage()` für <img>, `optimizedSrc()` für CSS/WebGL), nie den Originalpfad direkt
- Backend: Vercel Edge Functions in api/ (Stripe Checkout + Webhook, Mails via Resend)
- Deployment: Vercel (functions/ ist ein veralteter Cloudflare-Stand)

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
/shop        Shop (+ /shop/:id, /shop/cart, /shop/success, /shop/favorites)
/styles      Flash-Motive
/admin       nur lokal im Dev-Server (nicht im Live-Build)
/imprint     Impressum (deutsches Recht, Platzhalter)
/privacy     Datenschutzerklärung (DSGVO, Platzhalter)

## Konventionen
- Komponenten in src/components/ (Layout: src/components/Layout.tsx)
- Galerie-Einträge: src/data/work.ts (title, date, style, bodyPart, image)
- Deutsche UI-Texte, Code/Kommentare auf Englisch
- Nach jeder Änderung muss `npm run build` fehlerfrei durchlaufen
