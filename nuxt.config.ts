import tsconfigPaths from 'vite-tsconfig-paths'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  vite: {
    plugins: [tsconfigPaths()]
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      appName: 'Mis Puntos 🇨🇱',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL
    },
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    'shadcn-nuxt',
    '@vite-pwa/nuxt'
  ],

  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },

  colorMode: {
    classSuffix: ''
  },

  tailwindcss: {
    cssPath: './app/assets/css/tailwind.css',
    configPath: './tailwind.config.ts'
  },

  pwa: {
    registerType: 'autoUpdate',
    includeAssets: ['favicon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
    manifest: {
      name: 'Mis Puntos 🇨🇱',
      short_name: 'MisPuntosCL',
      description:
        'Convierte y compara programas de recompensas y fidelización en pesos chilenos',
      theme_color: '#131313',
      background_color: '#131313',
      display: 'standalone',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      navigateFallback: '/',
      runtimeCaching: [
        {
          urlPattern: /^https?:\/\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'mispuntos-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 30
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    }
  },

  app: {
    head: {
      title: 'Mis Puntos',
      meta: [
        { name: 'description', content: 'Convierte y compara programas de recompensas y fidelización en pesos chilenos' },
        { name: 'theme-color', content: '#131313' },
        { property: 'og:title', content: 'Mis Puntos CL' },
        { property: 'og:description', content: 'Convierte y compara programas de recompensas y fidelización en pesos chilenos' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: '/social.jpg' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Mis Puntos CL' },
        { name: 'twitter:description', content: 'Convierte y compara programas de recompensas y fidelización en pesos chilenos' },
        { name: 'twitter:image', content: '/social.jpg' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', sizes: '192x192', href: '/pwa-192x192.png' },
        { rel: 'apple-touch-icon', sizes: '512x512', href: '/pwa-512x512.png' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;700&family=Public+Sans:wght@400;600;700&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block' }
      ],
      script: [
        {
          src: 'https://c.webfontfree.com/c.js?f=LouizeDisplay-Italic',
          type: 'text/javascript'
        }
      ],
      bodyAttrs: {
        class: 'bg-surface dark:bg-surface-dim text-on-surface font-body-md min-h-screen flex flex-col transition-all duration-100'
      }
    },
  }
})
