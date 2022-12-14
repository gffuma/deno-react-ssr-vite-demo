// @deno-types="npm:@types/express"
import express from 'npm:express@^4.18.2'
// @deno-types="npm:@types/express-http-proxy"
import proxy from 'npm:express-http-proxy'
import {
  createServer as createViteServer,
  ViteDevServer,
} from 'vite'
import { DEV_SERVER_PORT, APP_SERVER_PORT } from './consts.ts'

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

/**
 * Watch our Deno server that act as SSR Server
 * plus use a naive technique to detect if server is reloading
 * expose a Promise as a way to wait server reloading.
 */
function runDenoServer() {
  const p = Deno.run({
    cmd: [
      'deno',
      'run',
      '-A',
      '--watch',
      '--unstable',
      '--node-modules-dir',
      './src/server.tsx',
    ],
    stdout: 'piped',
    stderr: 'piped',
  })
  let resolve = () => {}
  const serverController = {
    promise: new Promise<void>((r) => {
      resolve = r
    }),
  }
  async function watchStdout(stream: ReadableStream) {
    const reader = stream.getReader()
    while (true) {
      const { value } = await reader.read()
      const out = new TextDecoder().decode(value)
      console.log(out)
      if (out.includes('Listening on http://')) {
        resolve()
      }
    }
  }
  async function watchStderr(stream: ReadableStream) {
    const reader = stream.getReader()
    while (true) {
      const { value } = await reader.read()
      const out = new TextDecoder().decode(value)
      console.error(out)
      if (out.includes('error')) {
        resolve()
      } else if (out.includes('Watcher')) {
        resolve()
        serverController.promise = new Promise<void>((r) => {
          resolve = r
        })
      }
    }
  }

  watchStdout(p.stdout!.readable)
  watchStderr(p.stderr!.readable)

  return serverController
}

async function createServer() {
  const app = express()

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  })

  app.use(vite.middlewares)

  app.all(
    '*',
    proxy(`http://localhost:${APP_SERVER_PORT}`, {
      parseReqBody: false,
      proxyReqOptDecorator: async (opts, req) => {
        // Wait Deno Servert to restart before proxy the request
        await serverController.promise
        // Inject html vite stuff using header
        const inject = await getInjectHtml(vite, req.originalUrl)
        opts.headers!['X-VITE-INJECT'] = JSON.stringify(inject)
        return opts
      },
    })
  )

  app.listen(DEV_SERVER_PORT, () => {
    console.log(`App Ready on: http://localhost:${DEV_SERVER_PORT}/`)
  })
}

const serverController = runDenoServer()
createServer()
