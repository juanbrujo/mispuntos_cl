import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ProgramResultCard from '@@/components/program-result-card/ProgramResultCard.vue'

describe('ProgramResultCard', () => {
  it('renders program name and points', () => {
    const wrapper = mount(ProgramResultCard, {
      props: { programName: 'CMR Puntos', points: 15000 }
    })
    expect(wrapper.text()).toContain('CMR Puntos')
    expect(wrapper.text()).toContain('15,000')
  })

  it('renders chip label', () => {
    const wrapper = mount(ProgramResultCard, {
      props: {
        programName: 'Latam Pass',
        points: 8000,
        chipLabel: 'Best Value',
        chipVariant: 'success'
      }
    })
    expect(wrapper.text()).toContain('Best Value')
  })

  it('renders program icon', () => {
    const wrapper = mount(ProgramResultCard, {
      props: { programName: 'Test', points: 100, programIcon: 'i-star' }
    })
    expect(wrapper.find('i').exists()).toBe(true)
    expect(wrapper.find('i').classes()).toContain('i-star')
  })

  it('renders value label', () => {
    const wrapper = mount(ProgramResultCard, {
      props: { programName: 'Test', points: 500, valueLabel: '≈ $2.500 CLP' }
    })
    expect(wrapper.text()).toContain('≈ $2.500 CLP')
  })
})
