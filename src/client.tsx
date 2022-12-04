// @deno-types="npm:@types/react"
import React from 'react'
// @deno-types="https://cdn.jsdelivr.net/npm/@types/react-dom@18.0.9/client.d.ts"
import ReactDOM from 'react-dom/client'
import App from './components/App.tsx'
import {
  QueryClient,
  QueryClientProvider,
  hydrate,
} from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

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

// Hydrate data from SSR
hydrate(
  queryClient,
  JSON.parse(document.querySelector('script.ssr_data')!.textContent!)
)

ReactDOM.hydrateRoot(
  document.getElementById('root')!,
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)
