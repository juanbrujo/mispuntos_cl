<script setup lang="ts">
defineProps<{
  programName: string
  programIcon?: string
  points: string | number
  valueLabel?: string
  accentColor?: string
  chipLabel?: string
  chipVariant?: 'success' | 'warning' | 'info' | 'neutral'
}>()
</script>

<template>
  <div
    class="relative flex items-center gap-4 w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-4 overflow-hidden"
  >
    <!-- 4px vertical color strip -->
    <div
      class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
      :style="{ backgroundColor: accentColor || 'var(--primary)' }"
    />

    <!-- Left: Program Icon -->
    <div
      v-if="programIcon"
      class="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
      :style="{
        backgroundColor: accentColor ? `${accentColor}18` : 'var(--primary)',
        color: accentColor || 'var(--primary)'
      }"
    >
      <i :class="programIcon" />
    </div>

    <!-- Center: Program Name -->
    <div class="flex-1 min-w-0">
      <h3 class="text-body-md font-display font-semibold text-on-surface truncate">
        {{ programName }}
      </h3>
      <span
        v-if="valueLabel"
        class="text-label-sm text-on-surface-variant"
      >
        {{ valueLabel }}
      </span>
    </div>

    <!-- Right: Points -->
    <div class="flex flex-col items-end flex-shrink-0 gap-1">
      <span class="text-headline-sm font-display font-bold text-on-surface">
        {{ points.toLocaleString?.() ?? points }}
      </span>

      <!-- Chip -->
      <span
        v-if="chipLabel"
        class="inline-block px-3 py-0.5 rounded-full text-label-sm font-bold uppercase tracking-wider"
        :class="{
          'bg-secondary/15 text-secondary': chipVariant === 'success',
          'bg-accent/15 text-accent': chipVariant === 'warning',
          'bg-primary/15 text-primary': chipVariant === 'info' || !chipVariant,
          'bg-muted text-muted-foreground': chipVariant === 'neutral'
        }"
        :style="accentColor && chipVariant !== 'neutral' ? {
          backgroundColor: `${accentColor}26`,
          color: accentColor
        } : undefined"
      >
        {{ chipLabel }}
      </span>
    </div>
  </div>
</template>
