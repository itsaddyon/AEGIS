import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // Ensures relative paths for assets in the built HTML
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
