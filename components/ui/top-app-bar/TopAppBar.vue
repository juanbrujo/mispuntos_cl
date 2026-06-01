<template>
  <header
    class="bg-[linear-gradient(180deg, rgb(255 255 255 / 80%) 0%, rgb(240 240 240 / 40%) 60%)] dark:bg-[linear-gradient(180deg,rgba(26,18,40,0.45)_0%,rgba(10,10,15,0.85)_60%)] backdrop-blur-md text-primary border-outline-variant/20 flex justify-between items-start py-3 px-[var(--margin-mobile)] md:px-[var(--margin-desktop)] w-full fixed top-0 z-50">
    <div class="flex-column">
      <div class="flex items-center gap-md mb-1">
        <h1 class="font-serif text-headline-lg text-primary">{{ title }}</h1>
      </div>
      <p class="text-xs text-black/30 dark:text-white/30">Convierte y compara programas de recompensas y fidelización en pesos chilenos.</p>
    </div>
    <div class="flex ml-4 items-center">
      <button class="flex align-center rounded-full active:scale-95 duration-100 cursor-pointer" @click="onToggleTheme" aria-label="Cambiar tema">
        <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;">
          {{ colorMode === 'dark' ? 'light_mode' : 'dark_mode' }}
        </span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">


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
</script>
