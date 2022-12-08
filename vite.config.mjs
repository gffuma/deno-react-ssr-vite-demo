import { defineConfig } from 'npm:vite@^3.1.3'
import react from 'npm:@vitejs/plugin-react@^2.1'
import denoImport from './src/vitePluginDenoImport.ts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [denoImport(), react()],
  build: {
    manifest: true,
    rollupOptions: {
      input: ['./src/client.tsx'],
    },
  },
})
