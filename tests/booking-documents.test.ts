import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import webhook from '../api/webhook'

const expectedFiles = [
  'ConsentbogenDeutsch.pdf',
  'ConsentbogenEnglisch.pdf',
  'Information_Deutsch.pdf',
  'Information_Englisch.pdf',
  'Aftercare_Deutsch.pdf',
  'Aftercare_English.pdf',
]
const secret = 'whsec_test'
const originalFetch = globalThis.fetch

function signedRequest(language: string, paid = true): Request {
  const timestamp = Math.floor(Date.now() / 1000)
  const body = JSON.stringify({
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_booking',
        payment_status: paid ? 'paid' : 'unpaid',
        amount_total: 5000,
        currency: 'eur',
        customer_details: { email: 'customer@example.test' },
        metadata: { type: 'booking-deposit', language },
      },
    },
  })
  const signature = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')
  return new Request('https://example.test/api/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': `t=${timestamp},v1=${signature}` },
    body,
  })
}

test('webhook attaches all six PDFs for both booking languages', async () => {
  const sent: Array<{ to: string[]; attachments?: Array<{ filename: string; content: string }> }> = []
  const pdfs = new Map(
    await Promise.all(expectedFiles.map(async (name) => [name, await readFile(`public/PDFs/${name}`)] as const)),
  )
  globalThis.fetch = async (input, init) => {
    const url = String(input)
    if (url === 'https://api.resend.com/emails') {
      sent.push(JSON.parse(String(init?.body)))
      return new Response('{}', { status: 200 })
    }
    const filename = new URL(url).pathname.split('/').pop() ?? ''
    const content = pdfs.get(filename)
    return content ? new Response(content) : new Response('Not found', { status: 404 })
  }
  const oldWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const oldResendKey = process.env.RESEND_API_KEY
  process.env.STRIPE_WEBHOOK_SECRET = secret
  process.env.RESEND_API_KEY = 'test'

  try {
    for (const language of ['de', 'en']) {
      const request = signedRequest(language)
      const response = await webhook(request)
      assert.equal(response.status, 200)
      const customerEmail = sent.find((email) => email.to.includes('customer@example.test'))
      assert.ok(customerEmail?.attachments)
      assert.deepEqual(customerEmail.attachments.map((file) => file.filename), expectedFiles)
      for (const attachment of customerEmail.attachments) {
        assert.deepEqual(Buffer.from(attachment.content, 'base64'), pdfs.get(attachment.filename))
      }
      assert.equal(sent.filter((email) => !email.to.includes('customer@example.test')).length, 1)
      sent.length = 0
    }

    const unpaidRequest = signedRequest('de', false)
    const response = await webhook(unpaidRequest)
    assert.equal(response.status, 200)
    assert.equal(sent.length, 0)
  } finally {
    globalThis.fetch = originalFetch
    if (oldWebhookSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET
    else process.env.STRIPE_WEBHOOK_SECRET = oldWebhookSecret
    if (oldResendKey === undefined) delete process.env.RESEND_API_KEY
    else process.env.RESEND_API_KEY = oldResendKey
  }
})
