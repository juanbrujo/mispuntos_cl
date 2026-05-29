<script setup lang="ts">
import { cn } from '@@/app/lib/utils'

defineProps<{
  modelValue: string | number
  label?: string
  prefix?: string
  placeholder?: string
  programColor?: string
  disabled?: boolean
  error?: string
  hint?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-1 w-full">
    <!-- Label -->
    <label
      v-if="label"
      class="text-label-sm font-label text-on-surface-variant uppercase tracking-wider"
    >
      {{ label }}
    </label>

    <!-- Input wrapper -->
    <div
      :class="[
        'flex items-center gap-2 w-full rounded-lg border transition-all duration-200 bg-surface-container-lowest',
        error
          ? 'border-error ring-1 ring-error'
          : 'border-outline-variant focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/30',
        disabled ? 'opacity-50 pointer-events-none' : ''
      ]"
    >
      <!-- Prefix -->
      <span
        v-if="prefix"
        class="pl-4 text-body-lg font-display font-semibold text-on-surface-variant select-none"
        :style="programColor ? { color: programColor } : undefined"
      >
        {{ prefix }}
      </span>

      <!-- Input -->
      <input
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="flex-1 bg-transparent text-body-lg font-display font-semibold text-on-surface placeholder:text-outline-variant px-4 py-3 outline-none border-none w-full"
        :class="[prefix ? 'pl-1' : 'pl-4']"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Error / Hint -->
    <span
      v-if="error"
      class="text-label-sm text-error mt-1"
    >
      {{ error }}
    </span>
    <span
      v-else-if="hint"
      class="text-label-sm text-on-surface-variant mt-1"
    >
      {{ hint }}
    </span>
  </div>
</template>
