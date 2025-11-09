import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/inventory-management-system/',
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    open: true,
    watch: {
      usePolling: true,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
