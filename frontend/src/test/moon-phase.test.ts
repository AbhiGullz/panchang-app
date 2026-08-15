import { describe, expect, it } from 'vitest'
import { moonPhaseState } from '../lib/moon-phase'

describe('moon phase state mapping', () => {
  it('maps new moon, full moon, and both Ekadashi states', () => {
    expect(moonPhaseState(0)).toBe(0)
    expect(moonPhaseState(180)).toBe(15)
    expect(moonPhaseState(132)).toBe(11)
    expect(moonPhaseState(312)).toBe(26)
  })

  it('wraps boundary elongations deterministically', () => {
    expect(moonPhaseState(359.9)).toBe(0)
    expect(moonPhaseState(6.1)).toBe(1)
    expect(moonPhaseState(-12)).toBe(29)
  })
})
