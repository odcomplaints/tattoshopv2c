// Minimal dependency-free PDF invoice for digital template purchases (Edge-compatible).
// Text only, built-in Helvetica. Seller details come from env so no address is hard-coded:
//   INVOICE_SELLER_NAME, INVOICE_SELLER_ADDRESS (lines separated by "|"), INVOICE_TAX_ID, INVOICE_TAX_NOTE

import type { ClaimLanguage } from '../src/data/claims.js'

export type InvoiceLine = { description: string; amountCents: number }

export type InvoiceInput = {
  sessionId: string
  language: ClaimLanguage
  lines: InvoiceLine[]
  buyerName: string
  buyerEmail: string
  buyerAddress: string[]
  date: Date
}

const labels = {
  de: {
    title: 'RECHNUNG',
    number: 'Rechnungsnummer',
    date: 'Rechnungsdatum',
    billTo: 'Rechnungsempfänger',
    description: 'Leistung',
    amount: 'Betrag',
    total: 'Gesamt',
    vatIncluded: 'Enthaltene Umsatzsteuer',
    paid: 'Bezahlt über Stripe. Zahlungsreferenz',
    delivery: 'Lieferung: digitale Dateien per Download-Link / E-Mail.',
    taxId: 'Steuer-Nr./USt-IdNr.',
    thanks: 'Vielen Dank für deinen Einkauf.',
  },
  en: {
    title: 'INVOICE',
    number: 'Invoice no.',
    date: 'Invoice date',
    billTo: 'Bill to',
    description: 'Description',
    amount: 'Amount',
    total: 'Total',
    vatIncluded: 'Included VAT',
    paid: 'Paid via Stripe. Payment reference',
    delivery: 'Delivery: digital files via download link / email.',
    taxId: 'Tax ID / VAT ID',
    thanks: 'Thank you for your purchase.',
  },
} as const

export function invoiceNumber(sessionId: string, date: Date): string {
  const day = date.toISOString().slice(0, 10).replace(/-/g, '')
  return `RE-${day}-${sessionId.slice(-6).toUpperCase()}`
}

export function invoiceFilename(sessionId: string, date: Date): string {
  return `${invoiceNumber(sessionId, date)}.pdf`
}

function formatMoney(cents: number, language: ClaimLanguage): string {
  const value = (cents / 100).toFixed(2)
  return `${language === 'de' ? value.replace('.', ',') : value} EUR`
}

// Built-in fonts use WinAnsi: Latin-1 maps 1:1, a few typographic characters differ.
function winAnsi(text: string): string {
  const special: Record<string, string> = { '€': '\x80', '–': '\x96', '—': '\x97', '„': '\x84', '“': '\x93', '”': '\x94', '’': '\x92' }
  let out = ''
  for (const char of text) {
    const code = char.charCodeAt(0)
    out += special[char] ?? (code >= 32 && code < 256 ? char : code === 10 ? ' ' : '?')
  }
  return out.replace(/[\\()]/g, '\\$&')
}

// Helvetica digits and most letters are ~0.55em wide: good enough to right-align amounts.
const approxWidth = (text: string, size: number) => text.length * size * 0.54

export function buildInvoicePdf(input: InvoiceInput): Uint8Array {
  const text = labels[input.language]
  const sellerName = process.env.INVOICE_SELLER_NAME || 'Jonas Geiger (OD COMPLAINTS)'
  const sellerAddress = (process.env.INVOICE_SELLER_ADDRESS || 'Unterer Weiler 5|73527 Schwäbisch Gmünd|Deutschland|od.complaints@gmail.com')
    .split('|')
    .map((line) => line.trim())
    .filter(Boolean)
  const taxId = process.env.INVOICE_TAX_ID || 'DE464396864'
  // Prices are gross. Set INVOICE_VAT_RATE=0 to omit the VAT breakdown (e.g. Kleinunternehmer).
  const vatRate = Number(process.env.INVOICE_VAT_RATE ?? '19')
  const taxNote = process.env.INVOICE_TAX_NOTE
  const total = input.lines.reduce((sum, line) => sum + line.amountCents, 0)

  const ops: string[] = []
  const put = (x: number, y: number, size: number, value: string, bold = false) => {
    ops.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x.toFixed(1)} ${y.toFixed(1)} Td (${winAnsi(value)}) Tj ET`)
  }
  const putRight = (xRight: number, y: number, size: number, value: string, bold = false) =>
    put(xRight - approxWidth(value, size), y, size, value, bold)
  const rule = (y: number) => ops.push(`0.6 G 0.5 w 50 ${y} m 545 ${y} l S`)

  let y = 790
  put(50, y, 18, sellerName, true)
  y -= 16
  for (const line of sellerAddress) {
    put(50, y, 9, line)
    y -= 12
  }
  if (taxId) put(50, y, 9, `${text.taxId}: ${taxId}`)

  put(50, 690, 22, text.title, true)
  put(50, 660, 10, `${text.number}: ${invoiceNumber(input.sessionId, input.date)}`)
  put(50, 646, 10, `${text.date}: ${input.date.toISOString().slice(0, 10)}`)

  put(330, 660, 9, text.billTo, true)
  let billY = 646
  for (const line of [input.buyerName, ...input.buyerAddress, input.buyerEmail].filter(Boolean)) {
    put(330, billY, 10, line)
    billY -= 13
  }

  rule(590)
  put(50, 575, 9, text.description, true)
  putRight(545, 575, 9, text.amount, true)
  rule(568)

  let rowY = 550
  for (const line of input.lines) {
    put(50, rowY, 10, line.description)
    putRight(545, rowY, 10, formatMoney(line.amountCents, input.language))
    rowY -= 18
  }
  rule(rowY + 8)
  put(50, rowY - 10, 11, text.total, true)
  putRight(545, rowY - 10, 11, formatMoney(total, input.language), true)

  let noteY = rowY - 46
  if (vatRate > 0) {
    const vat = Math.round(total - total / (1 + vatRate / 100))
    put(50, rowY - 28, 9, `${text.vatIncluded} ${vatRate} %: ${formatMoney(vat, input.language)}`)
    noteY -= 4
  }
  if (taxNote) {
    put(50, noteY, 9, taxNote)
    noteY -= 14
  }
  put(50, noteY, 9, text.delivery)
  put(50, noteY - 14, 9, `${text.paid}: ${input.sessionId}`)
  put(50, noteY - 36, 10, text.thanks)

  const content = ops.join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  objects.forEach((body, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`
  })
  const xrefAt = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const offset of offsets) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`

  // Every character is < 256, so the string maps 1:1 to bytes.
  const bytes = new Uint8Array(pdf.length)
  for (let index = 0; index < pdf.length; index++) bytes[index] = pdf.charCodeAt(index)
  return bytes
}

export function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  }
  return btoa(binary)
}
