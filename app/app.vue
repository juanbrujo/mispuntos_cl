<template>
  <TopAppBar :title="appName" :colorMode="colorMode" @toggle-theme="toggleColorMode" @logo-click="() => {}" />

  <!-- Main Content Layout -->
  <div class="flex-grow pt-32 pb-4 px-[var(--margin-mobile)] md:px-[var(--margin-desktop)] max-w-4xl mx-auto w-full" id="main-content">
    <!-- Input Card -->
    <section class="mb-xl">
      <InputCard
        label="Conversión Base"
        :programOptions="programOptions"
        :selectedProgram="selectedProgram"
        :inputValue="inputValue"
        :inputPlaceholder="inputPlaceholder"
        :inputPrefix="inputPrefix"
        :programIcon="programs.find(p => p.id === selectedProgram)?.icon"
        :validationMsg="validationMsg"
        :usdRate="usdRate"
        @update:selectedProgram="(val: string) => (selectedProgram = val)"
        @update:inputValue="(val: string) => (inputValue = val)"
        @open-keyboard="keyboardVisible = true"
      />
    </section>

    <!-- Result Cards List (drag & drop) -->
    <ClientOnly>
      <div
        class="space-y-sm relative"
        @dragover.prevent="onDragOver"
        @drop="onDrop"
        @dragleave="onDragLeaveContainer"
      >
        <template v-for="(card, index) in sortedResultCards" :key="card.programName">
          <!-- Drop zone animada antes de cada card -->
          <div
            class="flex items-center gap-1 transition-all duration-200 ease-in-out overflow-hidden"
            :class="isDragging && dropIndex === index ? 'h-2.5 opacity-100 my-1' : 'h-0 opacity-0 my-0'"
          >
            <div class="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
            <div class="flex-1 h-1 rounded-full bg-primary/40" />
          </div>

          <ResultCard
            :programName="card.programName"
            :programIcon="card.programIcon"
            :programColor="card.programColor"
            :points="card.points"
            :unit="card.unit"
            :chipLabel="card.chipLabel"
            :chipColor="card.chipColor"
            :chipTextColor="card.chipTextColor"
            :checked="checkedCards.has(card.programName)"
            draggable="true"
            @dragstart="onDragStart(card.programName, $event)"
            @dragend="onDragEnd"
            @touchstart="onTouchStart(card.programName, $event)"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
            @toggle="toggleCard(card.programName)"
          />
        </template>

        <!-- Drop zone animada después del último card -->
        <div
          class="flex items-center gap-1 transition-all duration-200 ease-in-out overflow-hidden"
          :class="isDragging && dropIndex === sortedResultCards.length ? 'h-2.5 opacity-100 my-1' : 'h-0 opacity-0 my-0'"
        >
          <div class="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
          <div class="flex-1 h-0.5 rounded-full bg-primary/40" />
        </div>
      </div>
    </ClientOnly>

    <WhatsAppShare
      :visible="checkedCards.size > 0"
      :baseName="selectedProgramName"
      :baseLabel="selectedProgramLabel"
      :cards="checkedCardsData"
      :siteUrl="siteUrl"
    />
  </div>

  <!-- Virtual Keyboard (Mobile Only) -->
  <VirtualKeyboard
    :visible="keyboardVisible"
    @key="onKeyboardKey"
    @backspace="onKeyboardBackspace"
    @clear="onKeyboardClear"
    @done="onKeyboardDone"
  />
  <SiteFooter :title="appName" />
  <Preloader :ready="preloaderReady" />
</template>

<script setup lang="ts">
// ── Imports ──
import { ref, watch, onMounted, computed } from 'vue'
import TopAppBar from '../components/ui/top-app-bar/TopAppBar.vue'
import InputCard from '../components/ui/input-card/InputCard.vue'
import ResultCard from '../components/ui/result-card/ResultCard.vue'
import { SiteFooter } from '../components/ui/site-footer'
import { WhatsAppShare } from '../components/ui/whatsapp-share'
import { VirtualKeyboard } from '../components/ui/virtual-keyboard'
import type { ProgramOption } from '../components/ui/input-card/InputCard.vue'
import { programs, CATEGORY_LABELS } from './data/programs'
import type { Program } from './data/programs'
import { useColorMode } from './composables/useColorMode'
import { useDragReorder } from './composables/useDragReorder'
import { storeToRefs } from 'pinia'
import { useUsdRateStore } from './stores/usdRate'
import Preloader from '../components/ui/preloader/Preloader.vue'

const { public: { appName, siteUrl } } = useRuntimeConfig()

// ── State: UI ──
const isMobile = ref(false)
const keyboardVisible = ref(false)
const validationMsg = ref<string>('')
const checkedCards = ref<Set<string>>(new Set())
const preloaderReady = ref(false)

// Esperar a que Material Icons y USD estén listos
const preloaderMinTime = new Promise(resolve => setTimeout(resolve, 2000))

async function waitForReady() {
  // Material Icons
  if ('fonts' in document) {
    try {
      await document.fonts.load('1em "Material Symbols Outlined"')
      await document.fonts.ready
    } catch { /* ignore */ }
  }
  // USD rate (ya se inició fetchRate en onMounted)
  const usdStore = useUsdRateStore()
  if (usdStore.loading) {
    await new Promise<void>((resolve) => {
      const stop = watch(() => usdStore.loading, (v) => { if (!v) { stop(); resolve() } })
    })
  }
  // Esperar también el tiempo mínimo de 2s
  await preloaderMinTime
  preloaderReady.value = true
}

// ── State: Theme ──
const {
  colorMode,
  toggleColorMode,
  initColorMode,
} = useColorMode()

// ── State: Programs ──
const programOptions: ProgramOption[] = programs.map(p => ({ value: p.id, label: `${p.name}` }))
const selectedProgram = ref<string>('clp')
const inputValue = ref<string>('10000')
const usdRateStore = useUsdRateStore()
const { rate: usdRate } = storeToRefs(usdRateStore)
const { fetchRate } = usdRateStore

// ── Computed ──
const inputPrefix = computed(() => {
  if (selectedProgram.value === 'clp') return '$'
  if (selectedProgram.value === 'bchile') return 'DP$'
  if (selectedProgram.value === 'latam') return 'Mi'
  if (selectedProgram.value === 'lider' || selectedProgram.value === 'bciplus') return '$'
  return 'P✺'
})
const inputPlaceholder = computed(() => {
  if (selectedProgram.value === 'clp' || selectedProgram.value === 'bchile' || selectedProgram.value === 'bciplus' || selectedProgram.value === 'lider') return 'Monto'
  if (selectedProgram.value === 'latam') return 'Millas'
  return 'Puntos'
})

const resultCards = computed(() => {
  const base = programs.find(p => p.id === selectedProgram.value)
  const baseValue = parseFloat(inputValue.value) || 0
  if (!base) return []

  const effRate = (p: Program) => p.getRate ? p.getRate(usdRate.value) : p.rate
  const clpValue = baseValue / effRate(base)

  return programs
    .filter(p => p.id !== base.id)
    .map(p => {
      const converted = clpValue * effRate(p)
      const points = Math.round(converted).toLocaleString('es-CL')
      return {
        programName: p.name, programIcon: p.icon, programColor: p.color,
        points, unit: p.unit,
        chipLabel: p.category ? CATEGORY_LABELS[p.category] : undefined,
        chipColor: p.catColor ? `${p.catColor}22` : undefined,
        chipTextColor: p.catColor,
      }
    })
})

// ── State: Drag & Drop ──
const {
  hasReordered,
  cardOrder,
  isDragging,
  dropIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onDragLeaveContainer,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
} = useDragReorder(resultCards)

const sortedResultCards = computed(() => {
  const cards = [...resultCards.value]

  // Sin reorder manual y base no es CLP → CLP siempre primero
  if (!hasReordered.value && selectedProgram.value !== 'clp') {
    const clpIdx = cards.findIndex(c => c.programName === 'Pesos Chilenos')
    if (clpIdx > 0) {
      const [clpCard] = cards.splice(clpIdx, 1)
      if (clpCard) cards.unshift(clpCard)
    }
    return cards
  }

  const orderMap = new Map(cardOrder.value.map((name, i) => [name, i]))
  return cards.sort((a, b) => {
    const ia = orderMap.get(a.programName) ?? Infinity
    const ib = orderMap.get(b.programName) ?? Infinity
    return ia - ib
  })
})

const selectedProgramName = computed(() => {
  return programs.find(p => p.id === selectedProgram.value)?.name ?? ''
})

const selectedProgramLabel = computed(() => {
  const raw = inputValue.value.replace(/\D/g, '') || '0'
  const formatted = Number(raw).toLocaleString('es-CL')
  const prefix = inputPrefix.value
  // Prefijo antes del monto ($, DP$) o después (Mi, P✺)
  if (prefix === '$' || prefix === 'DP$') return `${prefix}${formatted}`
  return `${formatted} ${prefix}`
})

const checkedCardsData = computed(() => {
  const names = checkedCards.value
  return sortedResultCards.value
    .filter(c => names.has(c.programName))
    .map(c => ({ programName: c.programName, points: c.points, unit: c.unit }))
})

// ── Functions: Virtual Keyboard ──
function onKeyboardKey(key: string) {
  if (!/^\d$/.test(key)) return
  const rawDigits = inputValue.value.replace(/\D/g, '')
  if (rawDigits.length >= 8) return
  inputValue.value = (rawDigits + key).replace(/^0+/, '')
}
function onKeyboardBackspace() { inputValue.value = inputValue.value.slice(0, -1) }
function onKeyboardClear() { inputValue.value = '' }
function onKeyboardDone() { keyboardVisible.value = false }

function toggleCard(name: string) {
  const raw = inputValue.value.replace(/\D/g, '')
  if (!raw || raw === '0') return
  const next = new Set(checkedCards.value)
  if (next.has(name)) next.delete(name)
  else next.add(name)
  checkedCards.value = next
}



// ── Lifecycle ──
onMounted(() => {
  isMobile.value = window.matchMedia('(max-width: 767px)').matches
  initColorMode()
  fetchRate()
  waitForReady()
})

// ── Watchers ──
watch(selectedProgram, () => {
  inputValue.value = ''
  if (isMobile.value && !keyboardVisible.value) keyboardVisible.value = true
})

watch(keyboardVisible, (visible) => {
  if (!isMobile.value) return
  if (visible) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    document.documentElement.style.overflow = 'hidden'
  } else {
    document.documentElement.style.overflow = ''
  }
})

watch(inputValue, (val) => {
  const raw = String(val).replace(/\D/g, '')
  if (!raw || raw === '0') {
    checkedCards.value = new Set()
  }
})
</script>
