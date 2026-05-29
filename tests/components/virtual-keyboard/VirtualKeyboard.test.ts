import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import VirtualKeyboard from '@@/components/virtual-keyboard/VirtualKeyboard.vue'

describe('VirtualKeyboard', () => {
  it('renders all digit keys 0-9', () => {
    const wrapper = mount(VirtualKeyboard)
    const text = wrapper.text()
    for (let i = 0; i <= 9; i++) {
      expect(text).toContain(String(i))
    }
  })

  it('renders backspace and submit buttons', () => {
    const wrapper = mount(VirtualKeyboard)
    expect(wrapper.find('button[aria-label="Borrar"]').exists()).toBe(true)
    expect(wrapper.find('button[aria-label="Aceptar"]').exists()).toBe(true)
  })

  it('emits input event on digit click', async () => {
    const wrapper = mount(VirtualKeyboard)
    // Click "1"
    const btn = wrapper.findAll('button').filter(b => b.text() === '1')
    await btn[0].trigger('click')
    expect(wrapper.emitted('input')).toBeTruthy()
    expect(wrapper.emitted('input')![0]).toEqual(['1'])
  })

  it('emits backspace event on ⌫ click', async () => {
    const wrapper = mount(VirtualKeyboard)
    await wrapper.find('button[aria-label="Borrar"]').trigger('click')
    expect(wrapper.emitted('backspace')).toBeTruthy()
  })

  it('emits submit event on ↵ click', async () => {
    const wrapper = mount(VirtualKeyboard)
    await wrapper.find('button[aria-label="Aceptar"]').trigger('click')
    expect(wrapper.emitted('submit')).toBeTruthy()
  })

  it('applies disabled class', () => {
    const wrapper = mount(VirtualKeyboard, { props: { disabled: true } })
    expect(wrapper.classes()).toContain('opacity-50')
    expect(wrapper.classes()).toContain('pointer-events-none')
  })
})
