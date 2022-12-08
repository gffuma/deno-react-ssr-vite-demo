import * as path from 'https://deno.land/std@0.167.0/path/mod.ts'

function resolveRelativeImport(src: string, url: string) {
  const to = path.resolve(path.dirname(path.fromFileUrl(url)), src)
  return path.relative('.', to)
}

if (!globalThis.__vite_import) {
  const isProd = Deno.env.get('NODE_ENV') === 'production'

  if (isProd) {
    const manifest = JSON.parse(
      Deno.readTextFileSync(path.join(Deno.cwd(), 'dist', 'manifest.json'))
    )
    globalThis.__vite_import = (_src: string, _url?: string) => {
      if (_url) {
        const name = resolveRelativeImport(_src, _url)
        if (manifest[name]) {
          return '/' + manifest[name].file
        }
      }
      return _src
    }
  } else {
    globalThis.__vite_import = (_src: string, _url?: string) => {
      if (_url) {
        return '/' + resolveRelativeImport(_src, _url)
      }
      return _src
    }
  }
}
