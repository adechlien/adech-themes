import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // JSON palettes stay in the module graph rather than the dependency cache.
  optimizeDeps: { exclude: ['@adech/themes/superior/json', '@adech/themes/legacy/json'] },
  server: {
    proxy: {
      "/api": "http://localhost:3001",
      "/health": "http://localhost:3001",
    },
  },
})
