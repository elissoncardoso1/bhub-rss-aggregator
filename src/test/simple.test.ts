import { describe, it, expect } from 'vitest'

describe('Teste Simples', () => {
  it('deve funcionar', () => {
    expect(1 + 1).toBe(2)
  })

  it('deve fazer operações básicas', () => {
    expect(2 * 3).toBe(6)
    expect(10 / 2).toBe(5)
    expect(7 - 3).toBe(4)
  })
})
