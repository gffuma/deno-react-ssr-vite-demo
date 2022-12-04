import { serve } from 'https://deno.land/std@0.167.0/http/server.ts'
// @deno-types="https://cdn.jsdelivr.net/npm/@types/react-dom@18.0.9/server.d.ts"
import ReactDOM from 'react-dom/server'
import App from './App.tsx'
import { createAfterTagStreamTransformer } from './streamUtils.ts'

interface ViteInjectPayload {
  head: string
  runTimeScript: string
}

function Skeleton() {
  return (
    <html>
      <head>
        <title>Giova</title>
      </head>
      <body>
        <div id='root'>
          <App />
        </div>
      </body>
    </html>
  )
}

async function handler(req: Request) {
  const reactStream = await ReactDOM.renderToReadableStream(<Skeleton />)
  await reactStream.allReady

  const viteInject = JSON.parse(
    req.headers.get('x-vite-inject')!
  ) as ViteInjectPayload
  const responseStream = reactStream
    .pipeThrough(
      createAfterTagStreamTransformer('</head>', () => viteInject.head)
    )
    .pipeThrough(
      createAfterTagStreamTransformer('</body>', () => viteInject.runTimeScript)
    )

  return new Response(responseStream, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  })
}

await serve(handler, { port: 5099 })
