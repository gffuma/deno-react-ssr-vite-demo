// @deno-types="npm:@types/react"
import React from 'react'
// @deno-types="https://cdn.jsdelivr.net/npm/@types/react-dom@18.0.9/client.d.ts"
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.hydrateRoot(
  document.getElementById('root')!,
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
