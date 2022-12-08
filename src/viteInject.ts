import { InjectHTMLHook } from './streamUtils.ts'
import { manifest } from './viteBuildManifest.ts'

const isProd = Deno.env.get('NODE_ENV') === 'production'

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

function getViteProdInjectHook(): InjectHTMLHook {
  const css = new Set<string>()
  const scripts = new Set<string>()
  Object.keys(manifest).forEach((k) => {
    if (manifest[k].isEntry === true) {
      scripts.add(manifest[k].file)
      manifest[k].css.forEach((f: string) => css.add(f))
    }
  })

  const cssHTML = Array.from(css)
    .map((f) => `<link rel="stylesheet" href="/${f}">`)
    .join('')
  const scriptsHtml = Array.from(scripts)
    .map((f) => `<script type="module" crossorigin src="/${f}"></script>`)
    .join('')

  return {
    afterHeadOpen: () => cssHTML,
    beforeBodyClose: () => scriptsHtml,
  }
}

const getViteInjectHook = (() => {
  if (isProd) {
    const hook = getViteProdInjectHook()
    return (_: Request) => hook
  } else {
    return getViteDevInjectHook
  }
})()

export { getViteInjectHook }