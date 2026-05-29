import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Button from '@@/components/ui/button/Button.vue'

describe('Button', () => {
  it('renders slot content', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click me' }
    })
    expect(wrapper.text()).toBe('Click me')
  })

  it('applies variant and size classes', () => {
    const wrapper = mount(Button, {
      props: { variant: 'secondary', size: 'lg' }
    })
    expect(wrapper.classes()).toContain('bg-secondary')
    expect(wrapper.classes()).toContain('h-11')
  })

  it('is disabled when disabled prop is set', () => {
    const wrapper = mount(Button, {
      attrs: { disabled: true }
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})
