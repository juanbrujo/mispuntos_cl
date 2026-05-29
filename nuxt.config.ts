import tsconfigPaths from 'vite-tsconfig-paths'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  vite: {
    plugins: [tsconfigPaths()]
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

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
      name: 'Mis Puntos CL',
      short_name: 'PuntosCL',
      description:
        'Gestiona y acumula tus puntos de fidelización de forma inteligente. Controla tus recompensas, canjes y beneficios en un solo lugar.',
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
      title: 'Mis Puntos CL',
      meta: [
        { name: 'description', content: 'Gestiona y acumula tus puntos de fidelización de forma inteligente. Controla tus recompensas, canjes y beneficios en un solo lugar.' },
        { name: 'theme-color', content: '#131313' },
        { property: 'og:title', content: 'Mis Puntos CL' },
        { property: 'og:description', content: 'Gestiona y acumula tus puntos de fidelización de forma inteligente.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: '/social.jpg' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Mis Puntos CL' },
        { name: 'twitter:description', content: 'Gestiona y acumula tus puntos de fidelización de forma inteligente.' },
        { name: 'twitter:image', content: '/social.jpg' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', sizes: '192x192', href: '/pwa-192x192.png' },
        { rel: 'apple-touch-icon', sizes: '512x512', href: '/pwa-512x512.png' }
      ]
    }
  }
})
