import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import path from 'path'

// ARGUS runs inside a PyWebView shell, so we build to relative
// paths and a fixed local dev port matching the AEGIS suite convention.
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5177,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
