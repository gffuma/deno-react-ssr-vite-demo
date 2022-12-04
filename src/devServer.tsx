// @deno-types="npm:@types/express"
import express from 'npm:express@^4.18.2'
// @deno-types="npm:@types/express-http-proxy"
import proxy from 'npm:express-http-proxy'
import {
  createServer as createViteServer,
  ViteDevServer,
} from 'npm:vite@^3.1.3'

function parseHeadFromHTML(html: string) {
  const start = '<head>'
  const end = '</head>'
  return html.slice(html.indexOf(start) + start.length, html.indexOf(end))
}

function parseRunTimeScriptFromHTML(html: string) {
  const start = '<body>'
  const end = '</body>'
  return html.slice(html.indexOf(start) + start.length, html.indexOf(end))
}

async function getInjectHtml(server: ViteDevServer, url: string) {
  const entry = `/src/client.tsx`
  const fakeHtml = `<html><head></head><body><script type="module" src="${entry}"></script></body></html>`
  const html = await server.transformIndexHtml(url, fakeHtml)
  return {
    head: parseHeadFromHTML(html),
    runTimeScript: parseRunTimeScriptFromHTML(html),
  }
}

async function createServer() {
  const app = express()

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  })

  app.use(vite.middlewares)

  app.use(
    '*',
    proxy('http://localhost:5099', {
      proxyReqOptDecorator: async (opts, req) => {
        const inject = await getInjectHtml(
          vite,
          req.originalUrl
        )
        opts.headers!['X-VITE-INJECT'] = JSON.stringify(inject)
        return opts
      },
    })
  )

  app.listen(4000)
}

Deno.run({
  cmd: ['deno', 'run', '-A', '--watch', './src/server.tsx']
})
createServer()
