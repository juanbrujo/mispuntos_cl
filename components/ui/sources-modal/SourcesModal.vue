<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-[9998] flex items-center justify-center p-4" @click.self="emit('close')">
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="emit('close')" />

        <!-- Modal -->
        <div class="relative w-[90%] max-h-[85vh] bg-surface rounded-md shadow-2xl overflow-hidden flex flex-col z-10 border border-primary">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-primary">
            <h3 class="font-headline-sm text-headline-xs md:text-headline-md md:font-light text-on-surface">Fuentes &amp; tasas de referencia</h3>
            <button
              class="flex items-center p-1 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
              @click="emit('close')"
              aria-label="Cerrar"
            >
              <span class="material-symbols-outlined text-primary">close</span>
            </button>
          </div>

          <!-- Lista para mobile/desktop -->
          <div class="overflow-y-auto p-4 md:p-6">
            <dl class="divide-y divide-on-surface-variant">
              <div v-for="p in programs" :key="p.id" class="py-3 space-y-1">
                <dt class="font-semibold text-foreground text-sm">{{ p.name }}</dt>
                <dd class="text-xs text-on-surface-variant grid grid-cols-[1fr_2fr] gap-x-2 gap-y-0.5">
                  <span class="text-outline">Acumulación:</span>
                  <span>{{ p.sub ?? '—' }}</span>
                  <span class="text-outline">Canje / valor:</span>
                  <span>{{ getRateDesc(p) }}</span>
                  <span class="text-outline">Fuente:</span>
                  <span>
                    <a
                      v-if="getSource(p).startsWith('http')"
                      :href="getSource(p)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-primary underline hover:no-underline break-all"
                    >{{ getSource(p) }}</a>
                    <span v-else class="break-all">{{ getSource(p) }}</span>
                  </span>
                </dd>
              </div>
            </dl>

            <!-- Disclaimer -->
            <div class="mt-6 text-xs text-on-surface-variant leading-relaxed p-4 border border-dashed border-primary rounded-lg">
              ⚠️ Los valores son referenciales y pueden cambiar sin aviso. SKY Plus no publica valor monetario oficial por punto; se usa ~USD 0,01/pto como referencia de mercado. BCI Puntos y Pesos OpenSky finalizaron en jul-2025; se muestra BciPlus+ (cashback 1%). Verifica siempre en los sitios oficiales de cada programa antes de tomar decisiones financieras.
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Program } from '../../../app/data/programs'

defineProps<{
  open: boolean
  programs: Program[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

function getRateDesc(p: Program): string {
  const descs: Record<string, string> = {
    clp: 'Referencia CLP',
    cencosud: '1 pt cada $300',
    latam: 'USD 0,032 por milla al TC',
    lider: '6% cashback',
    cmr: '1 pt cada $200',
    bchile: '1 DP ≈ $903 CLP',
    ripley: '1 pt cada $125',
    sky: '~USD 0,01/pto (ref. mercado)',
    itau: '1,5 pts cada $350',
    bciplus: '1% cashback',
    copec: '1 pt cada $100',
  }
  return descs[p.id] ?? '—'
}

function getSource(p: Program): string {
  const sources: Record<string, string> = {
    clp: 'https://www.bcentral.cl/',
    cencosud: 'https://puntoscencosud.cl',
    latam: 'https://latampass.latam.com/es_cl',
    lider: 'https://liderbci.cl/mi-club',
    cmr: 'https://cmrpuntos.cl',
    bchile: 'https://travel.cl',
    ripley: 'https://home.ripley.cl/minisitios/ripleypuntos',
    sky: 'https://skyairline.com/cl/sky-plus',
    itau: 'https://itaubeneficios.cl',
    bciplus: 'https://bci.cl/personas/tarjetas/bciplus',
    copec: 'https://fullcopec.cl',
  }
  return sources[p.id] ?? '—'
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
