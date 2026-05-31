<template>
  <header
    class="bg-surface text-primary border-b border-outline-variant flex justify-between items-center px-[var(--margin-mobile)] md:px-[var(--margin-desktop)] h-16 w-full fixed top-0 z-50">
    <div class="flex items-center gap-sm cursor-pointer" @click="onLogoClick">
      <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;">loyalty</span>
      <h1 class="font-headline-md text-headline-md font-bold text-primary">{{ title }}</h1>
    </div>
    <div class="flex gap-md items-center">
      <button class="p-2 flex align-center rounded-full active:scale-95 duration-100 cursor-pointer" @click="onToggleTheme" aria-label="Cambiar tema">
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;">
          {{ colorMode === 'dark' ? 'light_mode' : 'dark_mode' }}
        </span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'


const props = defineProps<{
  title: string
  colorMode?: 'light' | 'dark'
}>()

const emit = defineEmits<{
  (e: 'toggle-theme'): void
  (e: 'logo-click'): void
}>()

function onToggleTheme() {
  emit('toggle-theme')
}
function onLogoClick() {
  emit('logo-click')
}
</script>
