<template>
  <div class="bg-surface-container-lowest border border-outline-variant rounded-md p-lg shadow-lg">
    <label class="font-label-md text-label-md text-on-surface-variant mb-sm block uppercase">{{ label }}</label>
    <div class="flex flex-col md:flex-row gap-md">
      <div class="relative flex-1">
        <select
          class="w-full h-14 pl-12 pr-4 rounded-md border-2 border-outline-variant bg-surface focus:border-primary focus:ring-0 outline-none appearance-none font-medium text-headline-sm transition-all cursor-pointer font-['Geist_Mono',monospace]"
          :value="selectedProgram"
          @change="(e: any) => $emit('update:selectedProgram', (e.target as HTMLSelectElement).value)"
        >
          <option v-for="option in programOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <span v-if="programIcon" class="material-symbols-outlined absolute left-4 top-4 text-on-surface-variant">{{ programIcon }}</span>
      </div>
      <div class="relative flex-1">
        <span v-if="inputPrefix" class="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold select-none z-10">{{ inputPrefix }}</span>
        <input
          class="w-full h-14 pl-14 pr-4 rounded-md border-2 border-outline-variant bg-surface focus:border-primary focus:ring-0 outline-none font-medium text-headline-sm transition-all font-['Geist_Mono',monospace]"
          :class="inputPrefix === 'DP$' ? 'pl-14' : 'pl-11'"
          :placeholder="inputPlaceholder"
          type="text"
          :value="formattedValue"
          :readonly="isMobile"
          :tabindex="isMobile ? 0 : 1"
          @beforeinput="onBeforeInput"
          @input="onDesktopInput"
          @click="onInputClick"
          inputmode="numeric"
          autocomplete="off"
          maxlength="8"
        />
      </div>
    </div>
    <p v-if="validationMsg" class="mt-2 text-error text-label-sm">{{ validationMsg }}</p>
    <div v-if="usdRate" class="mt-2 flex items-center justify-end gap-1.5 text-xs text-on-surface-variant">
      <span class="material-symbols-outlined text-[14px]">currency_exchange</span>
      <span>USD/CLP <strong>${{ usdRate.toLocaleString('es-CL') }}</strong></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const props = defineProps<{
  label: string
  programOptions: ProgramOption[]
  selectedProgram: string
  inputValue: string | number
  inputPlaceholder?: string
  inputPrefix?: string
  programIcon?: string
  validationMsg?: string
  usdRate?: number
}>()

// Formatear inputValue como miles
const formattedValue = computed(() => {
const val = String(props.inputValue).replace(/\D/g, '')
  if (!val) return ''
  return Number(val).toLocaleString('es-CL')
})

// Detectar móvil (simple, por ancho de pantalla)
const isMobile = ref(false)
onMounted(() => {
  isMobile.value = window.matchMedia('(max-width: 767px)').matches
})

const emit = defineEmits([
  'update:inputValue',
  'update:selectedProgram',
  'open-keyboard',
])

function onBeforeInput(e: Event) {
  const ie = e as InputEvent
  const data = ie.data
  if (data && !/^\d*$/.test(data)) {
    ie.preventDefault()
  }
}

function onDesktopInput(e: Event) {
  const target = e.target as HTMLInputElement
  let raw = target.value.replace(/\D/g, '')
  if (raw.length > 8) raw = raw.slice(0, 8)
  emit('update:inputValue', raw)
}

function onInputClick(e: Event) {
  if (isMobile.value) {
    e.preventDefault()
    emit('open-keyboard')
  }
}

export interface ProgramOption {
  value: string
  label: string
}
</script>

<style scoped>
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  print-color-adjust: exact;
}
</style>
