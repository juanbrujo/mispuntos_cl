import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ConversionInputCard from '@@/components/conversion-input-card/ConversionInputCard.vue'

describe('ConversionInputCard', () => {
  it('renders label, prefix and input', () => {
    const wrapper = mount(ConversionInputCard, {
      props: { modelValue: '', label: 'Monto', prefix: '$' }
    })
    expect(wrapper.text()).toContain('Monto')
    expect(wrapper.text()).toContain('$')
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(ConversionInputCard, {
      props: { modelValue: '' }
    })
    const input = wrapper.find('input')
    await input.setValue('5000')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['5000'])
  })

  it('shows error message', () => {
    const wrapper = mount(ConversionInputCard, {
      props: { modelValue: '', error: 'Valor inválido' }
    })
    expect(wrapper.text()).toContain('Valor inválido')
  })

  it('shows hint message when no error', () => {
    const wrapper = mount(ConversionInputCard, {
      props: { modelValue: '', hint: 'Ingresa un monto válido' }
    })
    expect(wrapper.text()).toContain('Ingresa un monto válido')
  })

  it('disables input when disabled prop is true', () => {
    const wrapper = mount(ConversionInputCard, {
      props: { modelValue: '', disabled: true }
    })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })
})
