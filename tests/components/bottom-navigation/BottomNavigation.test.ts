import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import BottomNavigation from '@@/components/bottom-navigation/BottomNavigation.vue'

describe('BottomNavigation', () => {
  const items = [
    { label: 'Inicio', icon: 'i-home', active: true },
    { label: 'Perfil', icon: 'i-user' }
  ]

  it('renders all nav items', () => {
    const wrapper = mount(BottomNavigation, { props: { items } })
    expect(wrapper.findAll('button').length).toBe(2)
    expect(wrapper.text()).toContain('Inicio')
    expect(wrapper.text()).toContain('Perfil')
  })

  it('applies active class to selected item', () => {
    const wrapper = mount(BottomNavigation, { props: { items } })
    const btns = wrapper.findAll('button')
    expect(btns[0].classes()).toContain('text-primary')
    expect(btns[1].classes()).toContain('text-muted-foreground')
  })

  it('emits select event on click', async () => {
    const wrapper = mount(BottomNavigation, { props: { items } })
    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')![0]).toEqual([1])
  })
})
