import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import topLevelAwait from 'vite-plugin-top-level-await'
import wasm from 'vite-plugin-wasm'

export default defineConfig({
  plugins: [react(), topLevelAwait(), wasm()],
  server: {
    port: 3001,
    open: false
  },
  preview: {
    port: 3001
  }
})
