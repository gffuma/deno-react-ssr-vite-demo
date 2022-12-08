// @deno-types="npm:@types/react"
import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Pokedex from './Pokedex.tsx'
import Pokemon from './Pokemon.tsx'

__vite_import('./App.css')

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Pokedex />} />
        <Route path="/pokemon/:name" element={<Pokemon />} />
      </Routes>
    </Suspense>
  )
}
