import { ref } from 'vue'

export function useColorMode() {
  const colorMode = ref<'light' | 'dark'>('light')
  const hasManualOverride = ref(false)

  function setColorMode(mode: 'light' | 'dark') {
    colorMode.value = mode
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', mode === 'dark')
    }
  }

  function applyAutoColorMode(mode: 'light' | 'dark') {
    if (!hasManualOverride.value) setColorMode(mode)
  }

  function toggleColorMode() {
    if (import.meta.server) return
    const next = colorMode.value === 'dark' ? 'light' : 'dark'
    hasManualOverride.value = true
    localStorage.setItem('color-mode', next)
    setColorMode(next)
  }

  function initColorMode() {
    if (import.meta.server) return
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
  }

  return {
    colorMode,
    hasManualOverride,
    setColorMode,
    applyAutoColorMode,
    toggleColorMode,
    initColorMode,
  }
}
