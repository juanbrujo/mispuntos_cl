import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import SiteFooter from '@@/components/site-footer/SiteFooter.vue'

describe('SiteFooter', () => {
  it('renders brand name', () => {
    const wrapper = mount(SiteFooter)
    expect(wrapper.text()).toContain('Mis Puntos CL')
  })

  it('renders links', () => {
    const links = [
      { label: 'Privacidad', href: '/privacy' },
      { label: 'Términos', href: '/terms' }
    ]
    const wrapper = mount(SiteFooter, { props: { links } })
    expect(wrapper.findAll('a').length).toBe(2)
    expect(wrapper.text()).toContain('Privacidad')
    expect(wrapper.text()).toContain('Términos')
  })

  it('renders slot content', () => {
    const wrapper = mount(SiteFooter, {
      slots: { default: '<span class="extra">Extra</span>' }
    })
    expect(wrapper.find('.extra').exists()).toBe(true)
  })
})
