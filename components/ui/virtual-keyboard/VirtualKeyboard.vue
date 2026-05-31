<template>
  <!-- Overlay para cerrar al hacer click fuera -->
  <div
    v-show="visible"
    class="fixed inset-0 z-[59] md:hidden"
    @click="onDone"
  />

  <div
    v-show="true"
    class="fixed bottom-0 left-0 w-full bg-surface-container-highest border-t border-outline-variant transition-transform duration-300 z-[60] md:hidden"
    :class="visible ? 'translate-y-0' : 'translate-y-full'"
    style="will-change: transform;"
  >
    <div class="p-4 grid grid-cols-3 gap-2">
      <button v-for="key in keys" :key="key" class="keyboard-key bg-surface h-14 rounded-md font-bold text-xl flex items-center justify-center" @click="onKey(key)">
        <span v-if="key !== 'backspace' && key !== 'clear'">{{ key }}</span>
        <span v-else-if="key === 'backspace'" class="material-symbols-outlined">backspace</span>
        <span v-else-if="key === 'clear'">C</span>
      </button>
    </div>
    <div class="bg-surface-container-high py-2 flex justify-center">
      <button class="text-primary font-bold px-8 py-2 w-full flex items-center justify-center gap-1" @click="onDone">
        Cerrar
        <span class="material-symbols-outlined">keyboard_arrow_down</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'key', value: string): void
  (e: 'backspace'): void
  (e: 'clear'): void
  (e: 'done'): void
}>()

const keys = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  'clear', '0', 'backspace'
]

function onKey(key: string) {
  if (key === 'backspace') emit('backspace')
  else if (key === 'clear') emit('clear')
  else emit('key', key)
}
function onDone() {
  emit('done')
}
</script>

<style scoped>
.keyboard-key {
  user-select: none;
}
.keyboard-key:active {
  background-color: #dee2ff;
}
</style>
