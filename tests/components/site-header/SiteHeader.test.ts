import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import SiteHeader from '@@/components/site-header/SiteHeader.vue'

describe('SiteHeader', () => {
  it('renders default title', () => {
    const wrapper = mount(SiteHeader)
    expect(wrapper.text()).toContain('Mis Puntos CL')
  })

  it('renders custom title and subtitle', () => {
    const wrapper = mount(SiteHeader, {
      props: { title: 'Convertir', subtitle: 'Latam Pass' }
    })
    expect(wrapper.text()).toContain('Convertir')
    expect(wrapper.text()).toContain('Latam Pass')
  })

  it('shows back button when showBack is true', () => {
    const wrapper = mount(SiteHeader, { props: { showBack: true } })
    expect(wrapper.find('button[aria-label="Volver"]').exists()).toBe(true)
  })

  it('emits back event when back button is clicked', async () => {
    const wrapper = mount(SiteHeader, { props: { showBack: true } })
    await wrapper.find('button[aria-label="Volver"]').trigger('click')
    expect(wrapper.emitted('back')).toBeTruthy()
  })

  it('renders actions slot', () => {
    const wrapper = mount(SiteHeader, {
      slots: { actions: '<button class="action-btn">Action</button>' }
    })
    expect(wrapper.find('.action-btn').exists()).toBe(true)
  })
})
