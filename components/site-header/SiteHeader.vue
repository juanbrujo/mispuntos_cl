<script setup lang="ts">
import { cn } from '@@/app/lib/utils'

defineProps<{
  title?: string
  subtitle?: string
  showBack?: boolean
}>()

defineEmits<{
  back: []
}>()
</script>

<template>
  <header
    class="sticky top-0 z-40 w-full border-b border-border bg-surface-container-lowest/95 backdrop-blur-md"
  >
    <div class="mx-auto flex items-center gap-3 px-4 md:px-12 h-14 md:h-16 max-w-7xl">
      <!-- Back button -->
      <button
        v-if="showBack"
        class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
        @click="$emit('back')"
        aria-label="Volver"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>

      <!-- Title -->
      <div class="flex-1 min-w-0">
        <h1
          class="text-headline-sm md:text-headline-md font-display font-bold text-on-surface truncate"
        >
          {{ title || 'Mis Puntos CL' }}
        </h1>
        <p
          v-if="subtitle"
          class="text-label-sm text-on-surface-variant truncate"
        >
          {{ subtitle }}
        </p>
      </div>

      <!-- Default slot for actions -->
      <slot name="actions" />
    </div>
  </header>
</template>
