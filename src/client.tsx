// @deno-types="npm:@types/react"
import React from 'react'
// @deno-types="https://cdn.jsdelivr.net/npm/@types/react-dom@18.0.9/client.d.ts"
import ReactDOM from 'react-dom/client'
import App from './components/App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

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

ReactDOM.hydrateRoot(
  document.getElementById('root')!,
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)
