/// <reference types="npm:@types/react" />
// <reference types="npm:vite/client" />

// NOTE: npm:vite/client wont work...
interface ImportMetaEnv {
  BASE_URL: string
  MODE: string
  DEV: boolean
  PROD: boolean
  SSR: boolean
}

interface ImportMeta {
  // deno-lint-ignore no-explicit-any
  glob?(src: any, opts?: any): void
  env: ImportMetaEnv;
}