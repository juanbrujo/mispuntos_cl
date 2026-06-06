<template>
  <div class="sticky bottom-0 pb-4 pt-2 flex justify-end">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-y-8 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-8 opacity-0"
    >
      <ActionButton
        v-if="visible"
        icon="share"
        color="whatsapp"
        class="w-full md:w-auto"
        @click="share"
      >Compartir en WhatsApp</ActionButton>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import ActionButton from '../action-button/ActionButton.vue'

interface CardData {
  programName: string
  points: string
  unit: string
}

const props = defineProps<{
  visible: boolean
  baseName: string
  baseLabel: string
  cards: CardData[]
  siteUrl?: string
}>()

function share() {
  const url = props.siteUrl || 'https://punteria.devschile.cl'

  let text = `*Convertí ${props.baseLabel} ${props.baseName}* a:\n\n`

  for (const card of props.cards) {
    const value = formatCardValue(card.points, card.unit)
    text += `• ${card.programName}: *${value}*\n`
  }

  text += `\nConvierte tus puntos y millas en ${url}`

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
  window.open(whatsappUrl, '_blank')
}

function formatCardValue(points: string, unit: string): string {
  if (unit === '$' || unit === 'DP$') return `${unit} ${points}`
  return `${points} ${unit}`
}
</script>
