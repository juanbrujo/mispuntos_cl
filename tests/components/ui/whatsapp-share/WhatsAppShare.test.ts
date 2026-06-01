import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WhatsAppShare from '@/components/ui/whatsapp-share/WhatsAppShare.vue'

describe('WhatsAppShare', () => {
  const cards = [
    { programName: 'LATAM Pass', points: '333', unit: 'Mi' },
    { programName: 'CMR Puntos', points: '7.042', unit: 'pts' },
  ]

  it('no se renderiza cuando visible es false', () => {
    const wrapper = mount(WhatsAppShare, {
      props: {
        visible: false,
        baseName: 'Pesos Chilenos',
        baseLabel: '$10.000',
        cards,
      }
    })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('se renderiza cuando visible es true', () => {
    const wrapper = mount(WhatsAppShare, {
      props: {
        visible: true,
        baseName: 'Pesos Chilenos',
        baseLabel: '$10.000',
        cards,
      }
    })
    const btn = wrapper.find('button')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toContain('Compartir en WhatsApp')
  })

  it('emite el texto correcto en la URL de WhatsApp', () => {
    // Simular window.open
    const originalOpen = window.open
    let openedUrl = ''
    window.open = (url: string) => { openedUrl = url; return null }

    const wrapper = mount(WhatsAppShare, {
      props: {
        visible: true,
        baseName: 'Pesos Chilenos',
        baseLabel: '$10.000',
        cards,
        siteUrl: 'https://ejemplo.cl',
      }
    })

    wrapper.find('button').trigger('click')

    expect(openedUrl).toContain('wa.me')
    expect(openedUrl).toContain(encodeURIComponent('Pesos Chilenos'))
    expect(openedUrl).toContain(encodeURIComponent('LATAM Pass'))
    expect(openedUrl).toContain(encodeURIComponent('333'))
    expect(openedUrl).toContain(encodeURIComponent('ejemplo.cl'))

    window.open = originalOpen
  })
})
