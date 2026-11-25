import assert from 'node:assert/strict'
import test from 'node:test'
import { buildInvoicePdf, invoiceNumber } from '../api/_invoice.ts'

test('invoice number is deterministic per session', () => {
  const date = new Date('2026-11-25T10:00:00Z')
  assert.equal(invoiceNumber('cs_test_abc123xyz789', date), 'RE-20261125-XYZ789')
})

test('invoice PDF is well-formed and escapes special characters', () => {
  const bytes = buildInvoicePdf({
    sessionId: 'cs_test_abc123xyz789',
    language: 'de',
    date: new Date('2026-11-25T10:00:00Z'),
    buyerName: 'Jörg (Test) \\ Müller',
    buyerEmail: 'a@b.de',
    buyerAddress: [],
    lines: [{ description: 'Digitale Tattoo-Vorlage: Briar', amountCents: 5000 }],
  })
  const pdf = String.fromCharCode(...bytes)
  assert.ok(pdf.startsWith('%PDF-1.4'))
  assert.ok(pdf.endsWith('%%EOF'))
  assert.ok(pdf.includes('50,00 EUR'))
  assert.ok(pdf.includes('J\xf6rg \\(Test\\) \\\\ M\xfcller'))
  const startxref = Number(/startxref\n(\d+)/.exec(pdf)?.[1])
  assert.equal(pdf.slice(startxref, startxref + 4), 'xref')
})
