import { describe, it, expect } from 'vitest'
import { programs, CATEGORY_LABELS } from '@/app/data/programs'

describe('programs', () => {
  it('todos los programas tienen campos requeridos', () => {
    for (const p of programs) {
      expect(p.id).toBeTruthy()
      expect(p.name).toBeTruthy()
      expect(p.icon).toBeTruthy()
      expect(typeof p.rate).toBe('number')
      expect(p.color).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(p.unit).toBeTruthy()
    }
  })

  it('getRate devuelve un número para los programas que lo usan', () => {
    const usdRate = 940
    for (const p of programs) {
      if (p.getRate) {
        const rate = p.getRate(usdRate)
        expect(typeof rate).toBe('number')
        expect(rate).toBeGreaterThan(0)
      }
    }
  })

  it('latam getRate es correcto con USD 940', () => {
    const latam = programs.find(p => p.id === 'latam')
    expect(latam?.getRate).toBeDefined()
    expect(latam!.getRate!(940)).toBeCloseTo(1 / (0.032 * 940), 10)
  })

  it('bchile rate es ~1/903 según canje real', () => {
    const bchile = programs.find(p => p.id === 'bchile')
    expect(bchile?.rate).toBeCloseTo(1 / 903, 6)
  })

  it('sky getRate es correcto con USD 940', () => {
    const sky = programs.find(p => p.id === 'sky')
    expect(sky?.getRate).toBeDefined()
    expect(sky!.getRate!(940)).toBeCloseTo(2.5 / 940, 10)
  })

  it('CATEGORY_LABELS tiene todas las categorías', () => {
    const categories = new Set(programs.map(p => p.category).filter(Boolean))
    for (const cat of categories) {
      expect(CATEGORY_LABELS[cat!]).toBeTruthy()
    }
  })
})
