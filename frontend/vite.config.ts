import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.svg', 'favicon.svg', 'logo-monochrome.svg', 'pwa-192x192.svg', 'pwa-512x512.svg', 'logo-reference.jpg'],
      manifest: {
        name: 'Gajaa Panchang',
        short_name: 'Gajaa Panchang',
        description: 'Daily panchang with tradition-aware calculations and offline support.',
        theme_color: '#0F2747',
        background_color: '#F5FAFD',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'logo-reference.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
            purpose: 'any maskable'
          },
          {
            src: 'logo-reference.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'panchang-api-cache',
              expiration: {
                maxEntries: 64,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api/v1': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
