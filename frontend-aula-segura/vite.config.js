import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    injectRegister: false,
    pwaAssets: {
      disabled: false,
      config: true,
    },
    manifest: {
      name: 'Aula Segura',
      short_name: 'AulaSegura',
      description: 'Registro de llegadas tarde de estudiantes',
      theme_color: '#0b1f4b',
      background_color: '#0b1f4b',
      display: 'standalone',
      lang: 'es',
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      runtimeCaching: [
        {
          urlPattern: /\/api\//,
          handler: 'NetworkOnly',
        },
      ],
    },
    devOptions: {
      enabled: false,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
