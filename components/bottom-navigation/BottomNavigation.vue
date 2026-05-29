<script setup lang="ts">
interface NavItem {
  label: string
  icon: string
  active?: boolean
  color?: string
}

const props = defineProps<{
  items: NavItem[]
}>()

const emit = defineEmits<{
  select: [index: number]
}>()
</script>

<template>
  <nav class="fixed bottom-0 left-0 w-full bg-surface-container-high border-t border-border flex justify-around z-50 py-2 md:hidden">
    <button
      v-for="(item, i) in items"
      :key="i"
      :class="[
        'flex flex-col items-center flex-1 px-2 py-1 transition-colors',
        item.active ? 'text-primary' : 'text-muted-foreground'
      ]"
      :style="item.color && item.active ? { color: item.color } : undefined"
      @click="$emit('select', i)"
      aria-current="page"
    >
      <i :class="item.icon" class="text-xl mb-1" />
      <span class="text-xs font-medium">{{ item.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
@media (min-width: 768px) {
  nav {
    display: none;
  }
}
</style>
