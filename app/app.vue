
<template>
  <div class="min-h-screen flex flex-col bg-background text-foreground">
    <SiteHeader
      title="Mis Puntos CL"
      subtitle="Gestiona y acumula tus puntos de fidelización de forma inteligente."
      :showBack="false"
    >
      <template #actions>
        <Button variant="ghost" size="icon" aria-label="Notificaciones">
          <i class="i-lucide-bell" />
        </Button>
      </template>
    </SiteHeader>

    <main class="flex-1 w-full flex flex-col items-center justify-center gap-6 p-4 md:p-8">
      <!-- Card de conversión -->
      <ConversionInputCard
        v-model="inputValue"
        label="Puntos a convertir"
        prefix="CLP$"
        placeholder="Ingresa un monto"
        :error="inputError"
        hint="Solo números positivos"
      />

      <!-- Grupo de acciones -->
      <ActionButtonGroup
        :buttons="actionButtons"
        orientation="horizontal"
      />

      <!-- Resultado de programa -->
      <ProgramResultCard
        programName="Andino Rewards"
        programIcon="i-lucide-gift"
        :points="counter.count"
        valueLabel="Puntos acumulados"
        accentColor="#1e88e5"
        chipLabel="Activo"
        chipVariant="success"
      />

      <!-- Teclado virtual -->
      <VirtualKeyboard @input="onKeyboardInput" @backspace="onKeyboardBackspace" @submit="onKeyboardSubmit" />
    </main>

    <SiteFooter :links="footerLinks" />

    <BottomNavigation :items="navItems" @select="onNavSelect" />
  </div>
</template>


<script setup lang="ts">
import SiteHeader from '@@/components/site-header/SiteHeader.vue'
import SiteFooter from '@@/components/site-footer/SiteFooter.vue'
import Button from '@@/components/ui/button/Button.vue'
import ActionButtonGroup from '@@/components/action-button-group/ActionButtonGroup.vue'
import BottomNavigation from '@@/components/bottom-navigation/BottomNavigation.vue'
import ConversionInputCard from '@@/components/conversion-input-card/ConversionInputCard.vue'
import ProgramResultCard from '@@/components/program-result-card/ProgramResultCard.vue'
import VirtualKeyboard from '@@/components/virtual-keyboard/VirtualKeyboard.vue'
import { useCounterStore } from '@@/app/stores/counter'

useHead({
  title: 'Mis Puntos CL',
  meta: [
    { name: 'description', content: 'Gestiona y acumula tus puntos de fidelización de forma inteligente. Controla tus recompensas, canjes y beneficios en un solo lugar.' }
  ],
  link: [
    { rel: 'icon', type: 'image/png', href: '/favicon.png' },
    { rel: 'apple-touch-icon', sizes: '192x192', href: '/pwa-192x192.png' },
    { rel: 'apple-touch-icon', sizes: '512x512', href: '/pwa-512x512.png' }
  ]
})

const counter = useCounterStore()
const inputValue = ref('')
const inputError = ref('')

const actionButtons = [
  { label: 'Sumar', icon: 'i-lucide-plus', color: '#1e88e5', disabled: false },
  { label: 'Restar', icon: 'i-lucide-minus', color: '#e53935', disabled: false }
]

const footerLinks = [
  { label: 'Términos', href: '#' },
  { label: 'Privacidad', href: '#' }
]

const navItems = [
  { label: 'Inicio', icon: 'i-lucide-home', active: true },
  { label: 'Programas', icon: 'i-lucide-layers' },
  { label: 'Perfil', icon: 'i-lucide-user' }
]

function onNavSelect(index: number) {
  // Navegación demo
}

function onKeyboardInput(val: string) {
  inputValue.value += val
}
function onKeyboardBackspace() {
  inputValue.value = inputValue.value.slice(0, -1)
}
function onKeyboardSubmit() {
  // Validar y actualizar contador
  const num = Number(inputValue.value)
  if (isNaN(num) || num < 0) {
    inputError.value = 'Ingresa un número válido'
    return
  }
  inputError.value = ''
  counter.count = num
}
</script>
