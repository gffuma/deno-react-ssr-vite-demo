import { defineConfig } from 'npm:vite@^3.1.3'
import react from 'npm:@vitejs/plugin-react@^2.1'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: ['./src/client.tsx']
    }
  },
  optimizeDeps: {
    entries: ['./src/client.tsx'],
  },
})
