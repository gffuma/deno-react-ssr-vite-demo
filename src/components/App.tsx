// @deno-types="npm:@types/react"
import { Suspense } from 'react'
import Pokedex from './Pokedex.tsx'

// NOTE: Deno doesn't support css import for now ... https://github.com/denoland/deno/issues/11961
// Also there is no way to ignore an import: https://github.com/alephjs/aleph.js/issues/507
// Wat whe can do is: use dynamic to skip css import
// Why import.meta.glob?? Because on client build import.meta.glob is a static replaced
// so this import can be processed by vite
if (import.meta.glob) import.meta.glob('./App.css', { eager: true })

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Pokedex />
    </Suspense>
  )
}
