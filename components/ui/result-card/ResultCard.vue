
<template>
  <div class="program-card flex items-center bg-surface-container-lowest border border-outline-variant rounded-md overflow-hidden relative p-4 group cursor-grabbing hover:shadow-md hover:bg-surface-container-low transition-all duration-[0.2s] ease-in-out active:scale-[0.98]">
    <!-- Color Strip -->
    <div class="absolute left-0 top-0 bottom-0 w-1" :style="{ backgroundColor: programColor }"></div>

    <!-- Icono en círculo -->
    <div class="flex items-center justify-center w-10 h-10 rounded-full mr-md" :style="{ backgroundColor: programColor + '15' }">
      <span v-if="programIcon" class="material-symbols-outlined" :style="{ color: programColor }">{{ programIcon }}</span>
    </div>

    <!-- Info principal -->
    <div class="flex-grow">
      <p class="font-label-sm text-label-sm text-on-surface-variant uppercase">
        {{ programName }}
        <span v-if="chipLabel" class="ml-2 px-3 py-1 rounded-full text-xs font-bold" :style="{ background: chipColor, color: chipTextColor }">{{ chipLabel }}</span>
      </p>
      <p class="font-headline-sm text-headline-sm font-medium text-on-surface">
        <span class="font-display">{{ points }}</span>
        <span v-if="unit" class="text-body-md font-normal text-on-surface-variant ml-1">{{ unit }}</span>
      </p>
    </div>

    <!-- Acciones -->
    <div class="flex gap-2 items-center">
      <span class="material-symbols-outlined drag-handle text-outline display-inline-block md:display-none">drag_handle</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
  programName: string
  programIcon?: string // nombre del icono material-symbols
  programColor: string
  points: string | number
  unit?: string
  chipLabel?: string
  chipColor?: string
  chipTextColor?: string
}>()
</script>
