import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy all /api/* requests to the Prime.AI Next.js backend
    // This eliminates CORS issues between :5173 and :3000
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // Log proxy activity for debugging
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[Vite Proxy] Error:', err.message);
          });
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('[Vite Proxy]', req.method, req.url, '→ localhost:3000');
          });
        },
      },
    },
  },
})
