import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(() => {

  const env = loadEnv(process.cwd(), '');
  return {
    plugins: [react(),],
    server: {
      port: env.VITE_PORT,
      open: false
    },
    preview: {
      port: env.VITE_PORT
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src') // <-- This creates the @ alias
      }
    }
  }
})
