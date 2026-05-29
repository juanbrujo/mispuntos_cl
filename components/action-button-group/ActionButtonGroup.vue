<script setup lang="ts">
import { Button } from '@@/components/ui/button'

interface ActionButton {
  label: string
  icon?: string
  color?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  buttons: ActionButton[]
  orientation?: 'horizontal' | 'vertical'
}>(), {
  orientation: 'horizontal'
})
</script>

<template>
  <div :class="[
    'flex gap-2 w-full',
    orientation === 'vertical' ? 'flex-col' : 'flex-row'
  ]">
    <Button
      v-for="(btn, i) in buttons"
      :key="i"
      :style="btn.color ? { backgroundColor: btn.color } : undefined"
      :disabled="btn.disabled"
      class="flex-1"
    >
      <span v-if="btn.icon" class="mr-2"><i :class="btn.icon" /></span>
      {{ btn.label }}
    </Button>
  </div>
</template>

<style scoped>
/* Responsive: stack vertically on mobile */
@media (max-width: 640px) {
  .flex-row {
    flex-direction: column !important;
  }
}
</style>
