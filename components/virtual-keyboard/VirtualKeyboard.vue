<script setup lang="ts">
defineProps<{
  layout?: 'numeric' | 'phone'
  disabled?: boolean
}>()

defineEmits<{
  input: [value: string]
  backspace: []
  clear: []
  submit: []
}>()

const keys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['⌫', '0', '↵']
]

function handleKey(key: string) {
  if (key === '⌫') {
    // do nothing — component emits backspace
  } else if (key === '↵') {
    // submit
  }
}
</script>

<template>
  <div
    class="w-full max-w-sm mx-auto select-none"
    :class="{ 'opacity-50 pointer-events-none': disabled }"
  >
    <div class="grid grid-cols-3 gap-2 md:gap-3">
      <template v-for="(row, ri) in keys" :key="ri">
        <button
          v-for="(key, ki) in row"
          :key="ki"
          :class="[
            'flex items-center justify-center h-14 md:h-16 rounded-lg text-body-lg font-display font-semibold transition-all duration-100 active:scale-95',
            key === '⌫'
              ? 'bg-surface-container text-on-surface-variant'
              : key === '↵'
                ? 'bg-primary text-primary-foreground col-span-1'
                : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
          ]"
          @click="
            key === '⌫'
              ? $emit('backspace')
              : key === '↵'
                ? $emit('submit')
                : $emit('input', key)
          "
          :aria-label="
            key === '⌫' ? 'Borrar' : key === '↵' ? 'Aceptar' : `Tecla ${key}`
          "
        >
          <!-- Backspace icon -->
          <svg
            v-if="key === '⌫'"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <line x1="18" y1="9" x2="12" y2="15" />
            <line x1="12" y1="9" x2="18" y2="15" />
          </svg>
          <!-- Check icon for submit -->
          <svg
            v-else-if="key === '↵'"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span v-else class="text-2xl">{{ key }}</span>
        </button>
      </template>
    </div>
  </div>
</template>
