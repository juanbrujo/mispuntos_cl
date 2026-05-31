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

    <!-- Result Cards List -->
    <div class="space-y-sm">
      <ResultCard
        v-for="card in resultCards"
        :key="card.programName"
        :programName="card.programName"
        :programIcon="card.programIcon"
        :programColor="card.programColor"
        :points="card.points"
        :unit="card.unit"
        :chipLabel="card.chipLabel"
        :chipColor="card.chipColor"
        :chipTextColor="card.chipTextColor"
      />
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
import { ref, watch, onMounted, computed } from 'vue'
import TopAppBar from '../components/ui/top-app-bar/TopAppBar.vue'
import InputCard from '../components/ui/input-card/InputCard.vue'
import { VirtualKeyboard } from '../components/ui/virtual-keyboard'
import ResultCard from '../components/ui/result-card/ResultCard.vue'
import { ActionButton } from '../components/ui/action-button'
import { SiteFooter } from '../components/ui/site-footer'
import type { ProgramOption } from '../components/ui/input-card/InputCard.vue'

const isMobile = ref(false)
const keyboardVisible = ref(false)

function onKeyboardKey(key: string) {
  if (!/^\d$/.test(key)) return
  const rawDigits = inputValue.value.replace(/\D/g, '')
  if (rawDigits.length >= 8) return
  inputValue.value = (rawDigits + key).replace(/^0+/, '')
}
function onKeyboardBackspace() {
  inputValue.value = inputValue.value.slice(0, -1)
}
function onKeyboardClear() {
  inputValue.value = ''
}
function onKeyboardDone() {
  keyboardVisible.value = false
}

const colorMode = ref<'light' | 'dark'>('light')
const hasManualOverride = ref(false)

function setColorMode(mode: 'light' | 'dark') {
  colorMode.value = mode
  document.documentElement.classList.toggle('dark', mode === 'dark')
}

function applyAutoColorMode(mode: 'light' | 'dark') {
  if (!hasManualOverride.value) {
    setColorMode(mode)
  }
}

function toggleColorMode() {
  const next = colorMode.value === 'dark' ? 'light' : 'dark'
  hasManualOverride.value = true
  localStorage.setItem('color-mode', next)
  setColorMode(next)
}

// Datos de programas (migrados desde design-light.html)
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
const validationMsg = ref<string>('')

// Prefijo y placeholder dinámico según programa seleccionado
const inputPrefix = computed(() => {
  if (selectedProgram.value === 'clp') return '$'
  else if (selectedProgram.value === 'bchile') return 'DP$'
  else if (selectedProgram.value === 'latam') return 'Mi'
  else return 'P✺'
  return ''
})
const inputPlaceholder = computed(() => {
  if (selectedProgram.value === 'clp' || selectedProgram.value === 'bchile') return 'Monto'
  else if (selectedProgram.value === 'latam') return 'Millas'
  else return 'Puntos'
})

onMounted(() => {
  isMobile.value = window.matchMedia('(max-width: 767px)').matches

  // Detectar preferencia del sistema
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

  const saved = localStorage.getItem('color-mode')
  if (saved === 'dark' || saved === 'light') {
    // Usuario tocó el toggle manualmente antes
    hasManualOverride.value = true
    setColorMode(saved)
  } else {
    // Sin override: seguir al sistema
    setColorMode(prefersDark.matches ? 'dark' : 'light')
  }

  // Escuchar cambios del sistema (solo si no hay override manual)
  prefersDark.addEventListener('change', (e) => {
    applyAutoColorMode(e.matches ? 'dark' : 'light')
  })
})

// Al cambiar el programa en mobile: limpia el input y muestra el teclado virtual
watch(selectedProgram, () => {
  inputValue.value = ''
  if (isMobile.value && !keyboardVisible.value) {
    keyboardVisible.value = true
  }
})

// Calcula los resultados de conversión para cada programa
const resultCards = computed(() => {
  const base = programs.find(p => p.id === selectedProgram.value)
  const baseValue = parseFloat(inputValue.value) || 0
  if (!base) return []
  // Valor base en CLP
  const clpValue = baseValue / base.rate
  return programs
    .filter(p => p.id !== base.id)
    .map(p => {
      const converted = clpValue * p.rate
      const points = p.id === 'clp'
        ? Math.round(converted).toLocaleString('es-CL')
        : converted.toLocaleString('es-CL', { maximumFractionDigits: 2 })
      return {
        programName: p.name,
        programIcon: p.icon,
        programColor: p.color,
        points,
        unit: p.unit,
        chipLabel: undefined,
        chipColor: undefined,
        chipTextColor: undefined
      }
    })
})

// Solo validación de display: el max 8 dígitos se fuerza en los handlers
</script>
