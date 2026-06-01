import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { InputCard } from '@/components/ui/input-card'

describe('InputCard', () => {
  const programOptions = [
    { value: 'clp', label: 'CLP (Pesos Chilenos)' },
    { value: 'cmr', label: 'CMR Puntos' }
  ]

  it('renderiza label y opciones', () => {
    const wrapper = mount(InputCard, {
      props: {
        label: 'Conversión Base',
        programOptions,
        selectedProgram: 'clp',
        inputValue: '',
      }
    })
    expect(wrapper.text()).toContain('Conversión Base')
    expect(wrapper.findAll('option').length).toBe(2)
  })

  it('emite update:selectedProgram al cambiar select', async () => {
    const wrapper = mount(InputCard, {
      props: {
        label: 'Conversión',
        programOptions,
        selectedProgram: 'clp',
        inputValue: ''
      }
    })
    await wrapper.find('select').setValue('cmr')
    expect(wrapper.emitted('update:selectedProgram')).toBeTruthy()
    expect(wrapper.emitted('update:selectedProgram')![0]).toEqual(['cmr'])
  })

  it('emite update:inputValue al escribir en input', async () => {
    const wrapper = mount(InputCard, {
      props: {
        label: 'Conversión',
        programOptions,
        selectedProgram: 'clp',
        inputValue: ''
      }
    })
    await wrapper.find('input').setValue('1234')
    expect(wrapper.emitted('update:inputValue')).toBeTruthy()
    expect(wrapper.emitted('update:inputValue')![0]).toEqual(['1234'])
  })

  it('muestra mensaje de validación si se provee', () => {
    const wrapper = mount(InputCard, {
      props: {
        label: 'Conversión',
        programOptions,
        selectedProgram: 'clp',
        inputValue: '',
        validationMsg: 'Mínimo $1.000 pesos'
      }
    })
    expect(wrapper.text()).toContain('Mínimo $1.000 pesos')
  })

  it('formatea el valor con separador de miles', () => {
    const wrapper = mount(InputCard, {
      props: {
        label: 'Conversión',
        programOptions,
        selectedProgram: 'clp',
        inputValue: '5000'
      }
    })
    const input = wrapper.find('input').element as HTMLInputElement
    expect(input.value).toBe('5.000')
  })

  it('input vacío muestra valor vacío', () => {
    const wrapper = mount(InputCard, {
      props: {
        label: 'Conversión',
        programOptions,
        selectedProgram: 'clp',
        inputValue: ''
      }
    })
    const input = wrapper.find('input').element as HTMLInputElement
    expect(input.value).toBe('')
  })

  it('filtra no dígitos en desktop input', async () => {
    const wrapper = mount(InputCard, {
      props: {
        label: 'Conversión',
        programOptions,
        selectedProgram: 'clp',
        inputValue: ''
      }
    })
    const input = wrapper.find('input')
    await input.setValue('abc123def')
    const emitted = wrapper.emitted('update:inputValue')!
    expect(emitted[emitted.length - 1]).toEqual(['123'])
  })

  it('acorta a 8 dígitos máximo', async () => {
    const wrapper = mount(InputCard, {
      props: {
        label: 'Conversión',
        programOptions,
        selectedProgram: 'clp',
        inputValue: ''
      }
    })
    const input = wrapper.find('input')
    await input.setValue('1234567890')
    const emitted = wrapper.emitted('update:inputValue')!
    expect(emitted[emitted.length - 1]).toEqual(['12345678'])
  })

  it('muestra el tipo de cambio USD si se provee', () => {
    const wrapper = mount(InputCard, {
      props: {
        label: 'Conversión',
        programOptions,
        selectedProgram: 'clp',
        inputValue: '10000',
        usdRate: 940
      }
    })
    expect(wrapper.text()).toContain('940')
  })

  it('beforeinput con letra previene el ingreso', async () => {
    const wrapper = mount(InputCard, {
      props: {
        label: 'Conversión',
        programOptions,
        selectedProgram: 'clp',
        inputValue: ''
      }
    })
    const input = wrapper.find('input')
    const beforeInputEvent = new InputEvent('beforeinput', { data: 'a', inputType: 'insertText' })
    const preventDefaultSpy = vi.spyOn(beforeInputEvent, 'preventDefault')
    await input.element.dispatchEvent(beforeInputEvent)
    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('beforeinput con dígito no previene el ingreso', async () => {
    const wrapper = mount(InputCard, {
      props: {
        label: 'Conversión',
        programOptions,
        selectedProgram: 'clp',
        inputValue: ''
      }
    })
    const input = wrapper.find('input')
    const beforeInputEvent = new InputEvent('beforeinput', { data: '5', inputType: 'insertText' })
    const preventDefaultSpy = vi.spyOn(beforeInputEvent, 'preventDefault')
    await input.element.dispatchEvent(beforeInputEvent)
    expect(preventDefaultSpy).not.toHaveBeenCalled()
  })

  it('click en input no emite open-keyboard en desktop', async () => {
    const wrapper = mount(InputCard, {
      props: {
        label: 'Conversión',
        programOptions,
        selectedProgram: 'clp',
        inputValue: '10000'
      }
    })
    await wrapper.find('input').trigger('click')
    expect(wrapper.emitted('open-keyboard')).toBeFalsy()
  })
})
