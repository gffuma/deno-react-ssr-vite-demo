const isProd = Deno.env.get('NODE_ENV') === 'production'

// deno-lint-ignore no-explicit-any
export const manifest: Record<string, any> = isProd
  ? JSON.parse(Deno.readTextFileSync(`${Deno.cwd()}/dist/manifest.json`))
  : {}