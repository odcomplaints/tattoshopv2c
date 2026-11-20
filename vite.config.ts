import { defineConfig, loadEnv } from 'vite'
import type { Plugin, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Dev-only: serves /api/* by running the real Vercel Edge handlers from api/
// inside the Vite dev server, so the booking/checkout flow can be tested
// locally against Stripe test mode (keys from .env.local, never bundled).
const INJECTED_MARKER = '__DEV_API_INJECTED_KEYS'

function devApiPlugin(): Plugin {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      // Edge handlers read secrets from process.env, just like on Vercel.
      // Vite restarts in the same process when .env files change, so first
      // drop the values injected last time — otherwise edits would be ignored.
      for (const key of (process.env[INJECTED_MARKER] ?? '').split(',').filter(Boolean)) {
        delete process.env[key]
      }
      // '' prefix = load all vars (incl. non-VITE_ secrets), server-side only.
      const env = loadEnv(server.config.mode, server.config.envDir || process.cwd(), '')
      const injected: string[] = []
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) {
          process.env[key] = value
          injected.push(key)
        }
      }
      process.env[INJECTED_MARKER] = injected.join(',')

      server.middlewares.use('/api', async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const name = url.pathname.replace(/^\/+|\/+$/g, '')
        const file = fileURLToPath(new URL(`./api/${name}.ts`, import.meta.url))
        if (!/^[a-z-]+$/.test(name) || !existsSync(file)) return next()

        try {
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const body = chunks.length ? Buffer.concat(chunks) : undefined

          const headers = new Headers()
          for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') headers.set(key, value)
            else if (Array.isArray(value)) headers.set(key, value.join(', '))
          }

          const origin = `http://${req.headers.host ?? 'localhost'}`
          const request = new Request(`${origin}/api/${name}${url.search}`, {
            method: req.method,
            headers,
            body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
          })

          const mod = (await server.ssrLoadModule(file)) as { default: (r: Request) => Promise<Response> }
          const response = await mod.default(request)

          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (error) {
          console.error(`[dev-api] /api/${name} failed:`, error)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Dev API handler crashed — see terminal.' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), devApiPlugin()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
})
