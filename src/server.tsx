import { serve } from 'https://deno.land/std@0.167.0/http/server.ts'
// @deno-types="https://cdn.jsdelivr.net/npm/@types/react-dom@18.0.9/server.d.ts"
import ReactDOM from 'react-dom/server'
import App from './components/App.tsx'
import { createAfterTagStreamTransformer } from './streamUtils.ts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface ViteInjectPayload {
  head: string
  runTimeScript: string
}

function transformStreamViteDev(req: Request, stream: ReadableStream) {
  const viteInject = JSON.parse(
    req.headers.get('x-vite-inject')!
  ) as ViteInjectPayload
  return stream
    .pipeThrough(
      createAfterTagStreamTransformer('</head>', () => viteInject.head)
    )
    .pipeThrough(
      createAfterTagStreamTransformer('</body>', () => viteInject.runTimeScript)
    )
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

  return new Response(transformStreamViteDev(req, reactStream), {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  })
}

await serve(handler, { port: 5099 })
