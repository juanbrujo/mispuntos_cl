<script setup lang="ts">
import { cn } from '@@/app/lib/utils'

defineProps<{
  links?: Array<{ label: string; href: string }>
}>()
</script>

<template>
  <footer class="w-full border-t border-border bg-surface-container-lowest py-6 md:py-8 mt-auto">
    <div class="mx-auto px-4 md:px-12 max-w-7xl">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <!-- Brand -->
        <div class="flex flex-col items-center md:items-start gap-1">
          <span class="text-label-md font-display font-bold text-on-surface">
            Mis Puntos CL
          </span>
          <span class="text-label-sm text-on-surface-variant">
            © {{ new Date().getFullYear() }} — Todos los derechos reservados
          </span>
        </div>

        <!-- Links -->
        <nav v-if="links && links.length" class="flex items-center gap-4">
          <a
            v-for="(link, i) in links"
            :key="i"
            :href="link.href"
            class="text-label-sm text-on-surface-variant hover:text-primary transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ link.label }}
          </a>
        </nav>

        <!-- Slot -->
        <slot />
      </div>
    </div>
  </footer>
</template>
