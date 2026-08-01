import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env files from the project root (.env, .env.local, .env.[mode], .env.[mode].local)
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '')
  const apiBase = env.VITE_API_BASE_URL || 'http://localhost:5000/api'

  let proxyTarget = 'http://localhost:5000'
  try {
    proxyTarget = new URL(apiBase).origin
  } catch {
    // If VITE_API_BASE_URL is a relative path like "/api", keep the default target.
  }

  return {
    plugins: [react()],
    envDir: '..',
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
