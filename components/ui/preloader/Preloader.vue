<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ease-in-out"
      :class="ready ? 'opacity-0 pointer-events-none' : 'opacity-100'"
    >
      <div ref="lottieContainer" class="w-[350px] h-[250px]" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  ready: boolean
}>()

const lottieContainer = ref<HTMLElement | null>(null)
let animation: ReturnType<typeof import('lottie-web').default.loadAnimation> | null = null

onMounted(async () => {
  document.body.style.overflow = 'hidden'

  try {
    const lottie = await import('lottie-web')
    const res = await fetch('/loader.json')
    const loaderData = await res.json()
    if (lottieContainer.value) {
      animation = lottie.default.loadAnimation({
        container: lottieContainer.value,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: loaderData,
      })
    }
  } catch {
    // Si falla, el preloader sigue funcionando sin animación
  }
})

watch(() => props.ready, (ready) => {
  if (ready) {
    document.body.style.overflow = ''
    setTimeout(() => {
      if (animation) {
        animation.destroy()
        animation = null
      }
    }, 600)
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  if (animation) {
    animation.destroy()
    animation = null
  }
})
</script>
