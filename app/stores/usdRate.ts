import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUsdRateStore = defineStore('usdRate', () => {
  const rate = ref(940)
  const lastUpdated = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchRate() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch('https://cl.dolarapi.com/v1/cotizaciones/usd')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      // Usar ultimoCierre redondeado (estándar: 49→abajo, 50→arriba)
      rate.value = Math.round(data.ultimoCierre ?? data.venta ?? data.compra ?? 940)
      lastUpdated.value = data.fechaActualizacion ?? new Date().toISOString()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al obtener USD'
      // Mantiene el último valor válido
    } finally {
      loading.value = false
    }
  }

  return {
    rate,
    lastUpdated,
    loading,
    error,
    fetchRate,
  }
})
