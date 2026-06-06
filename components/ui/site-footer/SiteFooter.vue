<template>
  <footer class="w-full flex flex-col items-center gap-md px-[var(--margin-mobile)] md:px-[var(--margin-desktop)] text-center py-xl mt-sm bg-surface-container-low border-t border-outline-variant">
    <p class="font-body-sm text-sm font-light text-stone-400 max-w-2xl">
      Los valores son referenciales y pueden variar según promociones vigentes. Las conversiones se basan en canjes estándar de catálogo.
      <button class="text-primary underline hover:no-underline cursor-pointer" @click="showModal = true">Ver detalle</button>.
    </p>
    <p class="font-label-sm text-sm text-stone-400 font-light mt-sm">© 2026 {{ title }}. Otro proyecto devsChile sin © pero con ❤️‍🔥.</p>
  </footer>

  <SourcesModal
    :open="showModal"
    :programs="programs"
    @close="showModal = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { programs } from '../../../app/data/programs'
import SourcesModal from '../sources-modal/SourcesModal.vue'

const props = defineProps<{
  title: string
}>()

const showModal = ref(false)
</script>
