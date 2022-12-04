import { serve } from 'https://deno.land/std@0.167.0/http/server.ts'
// @deno-types="https://cdn.jsdelivr.net/npm/@types/react-dom@18.0.9/server.d.ts"
import ReactDOM from 'react-dom/server'
import App from './components/App.tsx'
import { createHTMLStreamTransformer, InjectHTMLHook } from './streamUtils.ts'
import {
  QueryClient,
  QueryClientProvider,
  dehydrate,
} from '@tanstack/react-query'

interface ViteInjectPayload {
  head: string
  runTimeScript: string
}

function getViteDevInjectHook(req: Request): InjectHTMLHook {
  const viteInject = JSON.parse(
    req.headers.get('x-vite-inject')!
  ) as ViteInjectPayload
  return {
    afterHeadOpen: () => viteInject.head,
    beforeBodyClose: () => viteInject.runTimeScript,
  }
}

async function handler(req: Request) {
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
      getViteDevInjectHook(req),
    ])
  )

  return new Response(responseStream, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  })
}

await serve(handler, { port: 5099 })
