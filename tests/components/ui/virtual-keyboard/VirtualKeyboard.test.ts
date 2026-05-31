import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import VirtualKeyboard from '@/components/ui/virtual-keyboard/VirtualKeyboard.vue'

describe('VirtualKeyboard', () => {
  it('renderiza las teclas y el botón Cerrar', () => {
    const wrapper = mount(VirtualKeyboard, { props: { visible: true } })
    expect(wrapper.findAll('button.keyboard-key').length).toBe(12)
    expect(wrapper.text()).toContain('Cerrar')
  })

  it('emite key al presionar un número', async () => {
    const wrapper = mount(VirtualKeyboard, { props: { visible: true } })
    await wrapper.findAll('button.keyboard-key')[0].trigger('click') // '1'
    expect(wrapper.emitted('key')).toBeTruthy()
    expect(wrapper.emitted('key')![0]).toEqual(['1'])
  })

  it('emite backspace, clear y done', async () => {
    const wrapper = mount(VirtualKeyboard, { props: { visible: true } })
    // backspace
    await wrapper.findAll('button.keyboard-key')[11].trigger('click')
    expect(wrapper.emitted('backspace')).toBeTruthy()
    // clear
    await wrapper.findAll('button.keyboard-key')[9].trigger('click')
    expect(wrapper.emitted('clear')).toBeTruthy()
    // done
    await wrapper.find('button.text-primary').trigger('click')
    expect(wrapper.emitted('done')).toBeTruthy()
  })
})
