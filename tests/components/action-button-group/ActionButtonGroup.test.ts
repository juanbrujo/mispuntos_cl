import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ActionButtonGroup from '@@/components/action-button-group/ActionButtonGroup.vue'

describe('ActionButtonGroup', () => {
  it('renders all buttons', () => {
    const buttons = [
      { label: 'A' },
      { label: 'B', disabled: true }
    ]
    const wrapper = mount(ActionButtonGroup, { props: { buttons } })
    expect(wrapper.findAll('button').length).toBe(2)
    expect(wrapper.text()).toContain('A')
    expect(wrapper.text()).toContain('B')
  })

  it('applies vertical orientation', () => {
    const buttons = [{ label: 'A' }]
    const wrapper = mount(ActionButtonGroup, { props: { buttons, orientation: 'vertical' } })
    expect(wrapper.classes()).toContain('flex-col')
  })

  it('disables button if prop set', () => {
    const buttons = [{ label: 'A', disabled: true }]
    const wrapper = mount(ActionButtonGroup, { props: { buttons } })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })
})
