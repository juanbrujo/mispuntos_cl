import { defineVitestConfig } from '@nuxt/test-utils/config'

import path from 'path'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    globals: true,
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom'
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/.nuxt/**',
        '**/.output/**',
        '**/*.config.*',
        '**/tests/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/types/**'
      ]
    },
    alias: {
      '@@': path.resolve(__dirname, '.'),
      '@': path.resolve(__dirname, 'app')
    }
  }
})
