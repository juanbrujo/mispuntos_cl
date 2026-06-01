import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultCard from '@/components/ui/result-card/ResultCard.vue'

describe('ResultCard', () => {
  it('renderiza nombre, puntos y unidad', () => {
    const wrapper = mount(ResultCard, {
      props: {
        programName: 'CMR Puntos',
        programColor: '#003dc7',
        points: '12345',
        unit: 'pts'
      }
    })
    expect(wrapper.text()).toContain('CMR Puntos')
    expect(wrapper.text()).toContain('12345')
    expect(wrapper.text()).toContain('pts')
  })

  it('muestra el icono del programa cuando no está checked', () => {
    const wrapper = mount(ResultCard, {
      props: {
        programName: 'CMR',
        programColor: '#003dc7',
        points: '1000',
        programIcon: 'credit_card'
      }
    })
    expect(wrapper.text()).toContain('credit_card')
  })

  it('muestra check cuando está checked', () => {
    const wrapper = mount(ResultCard, {
      props: {
        programName: 'CMR',
        programColor: '#003dc7',
        points: '1000',
        programIcon: 'credit_card',
        checked: true
      }
    })
    expect(wrapper.text()).toContain('check')
    expect(wrapper.text()).not.toContain('credit_card')
  })

  it('emite toggle al hacer click en el checkbox', async () => {
    const wrapper = mount(ResultCard, {
      props: {
        programName: 'CMR',
        programColor: '#003dc7',
        points: '1000'
      }
    })
    const circle = wrapper.find('.rounded-full')
    await circle.trigger('click')
    expect(wrapper.emitted('toggle')).toBeTruthy()
  })

  it('muestra el chip si se provee', () => {
    const wrapper = mount(ResultCard, {
      props: {
        programName: 'CMR',
        programColor: '#003dc7',
        points: '1000',
        chipLabel: 'Best Value',
        chipColor: '#e0e0e0',
        chipTextColor: '#003dc7'
      }
    })
    expect(wrapper.text()).toContain('Best Value')
    const chip = wrapper.find('span.rounded-full')
    expect(chip.exists()).toBe(true)
    expect(chip.text()).toBe('Best Value')
  })
})
