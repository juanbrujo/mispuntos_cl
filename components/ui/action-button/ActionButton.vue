<template>
  <button
    :class="[
      'flex items-center justify-center gap-sm py-4 px-lg rounded-md font-bold font-headline-sm hover:brightness-90 transition-all active:scale-95 shadow-sm cursor-pointer',
      colorClass,
      textClass
    ]"
    :type="buttonType"
    @click="$emit('click')"
  >
    <span v-if="icon" class="material-symbols-outlined">{{ icon }}</span>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  icon?: string
  color?: 'whatsapp' | 'primary' | string
  textColor?: string
  type?: 'button' | 'submit' | 'reset'
}>()


const buttonType = computed(() => props.type ?? 'button')

const colorClass = computed(() => {
  if (props.color === 'whatsapp') return 'bg-[#25D366]'
  if (props.color === 'primary') return 'bg-primary'
  if (props.color && props.color.startsWith('bg-')) return props.color
  if (props.color && props.color.startsWith('#')) return ''
  return 'bg-primary'
})
const textClass = computed(() => {
  if (props.color === 'whatsapp') return 'text-white'
  if (props.color === 'primary') return 'text-on-primary'
  if (props.textColor) return props.textColor
  return 'text-on-primary'
})
</script>
