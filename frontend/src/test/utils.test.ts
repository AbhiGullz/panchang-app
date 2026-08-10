import { describe, expect, it } from 'vitest'
import { addDaysDateInput, formatDateInput } from '../lib/utils'
import { cacheKey } from '../hooks/use-panchang'

describe('date and offline cache helpers', () => {
  it('formats local calendar dates without UTC day shifts', () => {
    const value = new Date(2027, 2, 14, 23, 30)
    expect(formatDateInput(value)).toBe('2027-03-14')
    expect(addDaysDateInput(value, 1)).toBe('2027-03-15')
  })

  it('keeps nearby coordinates and timezones in separate offline keys', () => {
    const first = cacheKey('2026-08-03', 28.611, 77.209, 'Asia/Kolkata', 'amanta', 'en')
    const second = cacheKey('2026-08-03', 28.619, 77.209, 'America/New_York', 'amanta', 'en')
    expect(first).not.toBe(second)
  })
})
