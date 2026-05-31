<template>
  <TopAppBar title="PuntosCL" :colorMode="colorMode" @toggle-theme="toggleColorMode" @logo-click="() => {}" />

  <!-- Main Content Layout -->
  <div class="flex-grow pt-24 pb-8 px-[var(--margin-mobile)] md:px-[var(--margin-desktop)] max-w-4xl mx-auto w-full" id="main-content">
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
        @update:selectedProgram="(val: string) => (selectedProgram = val)"
        @update:inputValue="(val: string) => (inputValue = val)"
        @open-keyboard="keyboardVisible = true"
      />
    </section>

    <!-- Result Cards List (drag & drop) -->
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
          draggable="true"
          @dragstart="onDragStart(card.programName, $event)"
          @dragend="onDragEnd"
          @touchstart="onTouchStart(card.programName, $event)"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
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

    <!-- Action Buttons -->
    <div class="mt-xl grid grid-cols-1 md:grid-cols-2 gap-md">
      <ActionButton icon="share" color="whatsapp">WhatsApp</ActionButton>
      <ActionButton icon="mail" color="primary">Email</ActionButton>
    </div>
  </div>

  <!-- Virtual Keyboard (Mobile Only) -->
  <VirtualKeyboard
    :visible="keyboardVisible"
    @key="onKeyboardKey"
    @backspace="onKeyboardBackspace"
    @clear="onKeyboardClear"
    @done="onKeyboardDone"
  />
  <SiteFooter />
</template>

<script setup lang="ts">
// ── Imports ──
import { ref, watch, onMounted, computed } from 'vue'
import TopAppBar from '../components/ui/top-app-bar/TopAppBar.vue'
import InputCard from '../components/ui/input-card/InputCard.vue'
import ResultCard from '../components/ui/result-card/ResultCard.vue'
import { ActionButton } from '../components/ui/action-button'
import { SiteFooter } from '../components/ui/site-footer'
import { VirtualKeyboard } from '../components/ui/virtual-keyboard'
import type { ProgramOption } from '../components/ui/input-card/InputCard.vue'

// ── State: UI ──
const isMobile = ref(false)
const keyboardVisible = ref(false)
const validationMsg = ref<string>('')

// ── State: Theme ──
const colorMode = ref<'light' | 'dark'>('light')
const hasManualOverride = ref(false)

function setColorMode(mode: 'light' | 'dark') {
  colorMode.value = mode
  document.documentElement.classList.toggle('dark', mode === 'dark')
}
function applyAutoColorMode(mode: 'light' | 'dark') {
  if (!hasManualOverride.value) setColorMode(mode)
}
function toggleColorMode() {
  const next = colorMode.value === 'dark' ? 'light' : 'dark'
  hasManualOverride.value = true
  localStorage.setItem('color-mode', next)
  setColorMode(next)
}

// ── State: Programs ──
const programs = [
  { id: 'clp', name: 'Pesos Chilenos', icon: 'payments', rate: 1, color: '#003dc7', unit: '$' },
  { id: 'cencosud', name: 'Puntos Cencosud', icon: 'shopping_bag', rate: 2, color: '#e30613', unit: 'pts' },
  { id: 'latam', name: 'LATAM Pass', icon: 'flight_takeoff', rate: 0.1, color: '#1b0088', unit: 'Mi' },
  { id: 'lider', name: 'Lider Mi Club', icon: 'storefront', rate: 1.5, color: '#0071ce', unit: 'pts' },
  { id: 'cmr', name: 'CMR Puntos', icon: 'credit_card', rate: 0.142, color: '#7bc143', unit: 'pts' },
  { id: 'bchile', name: 'Dólares Premio', icon: 'currency_exchange', rate: 0.001, color: '#002a61', unit: 'DP$' },
  { id: 'ripley', name: 'Ripley Puntos', icon: 'local_mall', rate: 0.125, color: '#5b2d82', unit: 'pts' },
  { id: 'sky', name: 'SKY Plus', icon: 'airplane_ticket', rate: 0.05, color: '#e80074', unit: 'pts' }
]
const programOptions: ProgramOption[] = programs.map(p => ({ value: p.id, label: `${p.name}` }))
const selectedProgram = ref<string>('clp')
const inputValue = ref<string>('10000')

// ── State: Drag & Drop ──
const CARD_ORDER_KEY = 'card-order'
const CARD_REORDERED_KEY = 'card-reordered'

const hasReordered = ref(false)
const cardOrder = ref<string[]>(loadCardOrder())
const draggedName = ref<string | null>(null)
const isDragging = ref(false)
const dropIndex = ref(-1)

function loadCardOrder(): string[] {
  if (import.meta.server) return []
  try {
    hasReordered.value = localStorage.getItem(CARD_REORDERED_KEY) === 'true'
    const saved = localStorage.getItem(CARD_ORDER_KEY)
    if (saved) return JSON.parse(saved) as string[]
  } catch { /* ignore */ }
  return []
}
function saveCardOrder() {
  if (import.meta.server) return
  try { localStorage.setItem(CARD_ORDER_KEY, JSON.stringify(cardOrder.value)) }
  catch { /* ignore */ }
}

// ── Computed ──
const inputPrefix = computed(() => {
  if (selectedProgram.value === 'clp') return '$'
  if (selectedProgram.value === 'bchile') return 'DP$'
  if (selectedProgram.value === 'latam') return 'Mi'
  return 'P✺'
})
const inputPlaceholder = computed(() => {
  if (selectedProgram.value === 'clp' || selectedProgram.value === 'bchile') return 'Monto'
  if (selectedProgram.value === 'latam') return 'Millas'
  return 'Puntos'
})

const resultCards = computed(() => {
  const base = programs.find(p => p.id === selectedProgram.value)
  const baseValue = parseFloat(inputValue.value) || 0
  if (!base) return []
  const clpValue = baseValue / base.rate
  return programs
    .filter(p => p.id !== base.id)
    .map(p => {
      const converted = clpValue * p.rate
      const points = p.id === 'clp'
        ? Math.round(converted).toLocaleString('es-CL')
        : converted.toLocaleString('es-CL', { maximumFractionDigits: 2 })
      return {
        programName: p.name, programIcon: p.icon, programColor: p.color,
        points, unit: p.unit,
        chipLabel: undefined, chipColor: undefined, chipTextColor: undefined
      }
    })
})

const sortedResultCards = computed(() => {
  const cards = [...resultCards.value]

  // Sin reorder manual y base no es CLP → CLP siempre primero
  if (!hasReordered.value && selectedProgram.value !== 'clp') {
    const clpIdx = cards.findIndex(c => c.programName === 'Pesos Chilenos')
    if (clpIdx > 0) {
      const [clp] = cards.splice(clpIdx, 1)
      cards.unshift(clp)
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

// ── Functions: Drag & Drop ──
function onDragStart(name: string, e: DragEvent) {
  draggedName.value = name
  isDragging.value = true
  dropIndex.value = -1
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', name)
  }
  const el = e.currentTarget as HTMLElement
  requestAnimationFrame(() => el.classList.add('opacity-30'))
}

function onDragOver(e: DragEvent) {
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  if (!draggedName.value) return
  const cards = document.querySelectorAll('.program-card')
  let closestGap = 0
  let closestDist = Infinity
  cards.forEach((card, i) => {
    const rect = card.getBoundingClientRect()
    ;[rect.top, rect.bottom].forEach((y, j) => {
      const dist = Math.abs(e.clientY - y)
      if (dist < closestDist) { closestDist = dist; closestGap = i + j }
    })
  })
  dropIndex.value = closestGap
}

function onDrop(_e: DragEvent) {
  if (!draggedName.value || dropIndex.value < 0) { resetDragState(); return }
  const newOrder = cardOrder.value.filter(n => n !== draggedName.value)
  newOrder.splice(dropIndex.value, 0, draggedName.value)
  cardOrder.value = newOrder
  hasReordered.value = true
  if (!import.meta.server) {
    try { localStorage.setItem(CARD_REORDERED_KEY, 'true') }
    catch { /* ignore */ }
  }
  saveCardOrder()
  resetDragState()
}

function onDragEnd() { resetDragState() }

// ── Functions: Touch Drag (mobile) ──
let touchStartY = 0

function onTouchStart(name: string, e: TouchEvent) {
  // Solo iniciar drag si toca el drag_handle
  const target = e.target as HTMLElement
  if (!target.closest('.drag-handle')) return
  e.preventDefault()
  draggedName.value = name
  isDragging.value = true
  dropIndex.value = -1
  touchStartY = e.touches[0].clientY
  const el = e.currentTarget as HTMLElement
  requestAnimationFrame(() => {
    el.classList.remove('bg-surface-container-lowest')
    el.classList.add('opacity-30')
  })
}

function onTouchMove(e: TouchEvent) {
  if (!draggedName.value) return
  const y = e.touches[0].clientY
  const cards = document.querySelectorAll('.program-card')
  let closestGap = 0
  let closestDist = Infinity
  cards.forEach((card, i) => {
    const rect = card.getBoundingClientRect()
    ;[rect.top, rect.bottom].forEach((yEdge, j) => {
      const dist = Math.abs(y - yEdge)
      if (dist < closestDist) { closestDist = dist; closestGap = i + j }
    })
  })
  dropIndex.value = closestGap
}

function onTouchEnd() {
  if (!draggedName.value) { resetDragState(); return }
  // Ejecutar el drop si hay una posición válida
  if (dropIndex.value >= 0) {
    const newOrder = cardOrder.value.filter(n => n !== draggedName.value)
    newOrder.splice(dropIndex.value, 0, draggedName.value)
    cardOrder.value = newOrder
    hasReordered.value = true
    if (!import.meta.server) {
      try { localStorage.setItem(CARD_REORDERED_KEY, 'true') }
      catch { /* ignore */ }
    }
    saveCardOrder()
  }
  resetDragState()
}

function onDragLeaveContainer(e: DragEvent) {
  const container = e.currentTarget as HTMLElement
  const related = e.relatedTarget as HTMLElement | null
  if (related && container.contains(related)) return
  dropIndex.value = -1
}

function resetDragState() {
  draggedName.value = null
  isDragging.value = false
  dropIndex.value = -1
  document.querySelectorAll('.program-card').forEach(el => {
    const card = el as HTMLElement
    card.classList.remove('opacity-30')
    if (!card.classList.contains('bg-surface-container-lowest')) {
      card.classList.add('bg-surface-container-lowest')
    }
  })
}

// ── Lifecycle ──
onMounted(() => {
  isMobile.value = window.matchMedia('(max-width: 767px)').matches

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
  const saved = localStorage.getItem('color-mode')
  if (saved === 'dark' || saved === 'light') {
    hasManualOverride.value = true
    setColorMode(saved)
  } else {
    setColorMode(prefersDark.matches ? 'dark' : 'light')
  }
  prefersDark.addEventListener('change', (e) => {
    applyAutoColorMode(e.matches ? 'dark' : 'light')
  })
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

watch(resultCards, (cards) => {
  const currentNames = new Set(cards.map(c => c.programName))
  cardOrder.value = cardOrder.value.filter(n => currentNames.has(n))
  for (const name of cards.map(c => c.programName)) {
    if (!cardOrder.value.includes(name)) cardOrder.value.push(name)
  }
  saveCardOrder()
}, { immediate: true })
</script>
