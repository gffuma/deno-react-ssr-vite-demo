import { serve } from 'https://deno.land/std@0.167.0/http/server.ts'
import { serveFile } from 'https://deno.land/std@0.167.0/http/file_server.ts'
// @deno-types="https://cdn.jsdelivr.net/npm/@types/react-dom@18.0.9/server.d.ts"
import ReactDOM from 'react-dom/server'
import App from './components/App.tsx'
import { createHTMLStreamTransformer, InjectHTMLHook } from './streamUtils.ts'
import {
  QueryClient,
  QueryClientProvider,
  dehydrate,
} from '@tanstack/react-query'
import { Router } from 'itty-router'
import { getViteInjectHook } from './viteInject.ts'

const router = Router()

async function serveDist(req: Request) {
  return await serveFile(req, `${Deno.cwd()}/dist${new URL(req.url).pathname}`)
}

router.get('/favicon.ico', serveDist)
router.get('/assets/*', serveDist)

router.get('*', async (req: Request) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        refetchIntervalInBackground: false,
        refetchOnMount: false,
        staleTime: Infinity,
        suspense: true,
        retry: false,
        structuralSharing: false,
      },
    },
  })
  const reactStream = await ReactDOM.renderToReadableStream(
    <html>
      <head />
      <body>
        <div id="root">
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </div>
      </body>
    </html>
  )
  await reactStream.allReady

  const responseStream = reactStream.pipeThrough(
    createHTMLStreamTransformer([
      {
        beforeBodyClose: () =>
          `<script class='ssr_data' type='application/json'>${JSON.stringify(
            dehydrate(queryClient)
          )}</script>`,
      },
      getViteInjectHook(req),
    ])
  )

  return new Response(responseStream, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  })
})

await serve(router.handle, { port: 5099 })
