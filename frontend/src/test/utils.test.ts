import { describe, expect, it } from 'vitest'
import { addDaysDateInput, formatDateInput, formatDisplayDate, formatTimeWithTimezone, humanizeAyanamsa, humanizeCalendar, humanizeLanguage } from '../lib/utils'
import { cacheKey } from '../hooks/use-panchang'

describe('date and offline cache helpers', () => {
  it('formats local calendar dates without UTC day shifts', () => {
    const value = new Date(2027, 2, 14, 23, 30)
    expect(formatDateInput(value)).toBe('2027-03-14')
    expect(addDaysDateInput(value, 1)).toBe('2027-03-15')
    expect(formatDisplayDate('2027-03-14', 'en-US')).toMatch(/March 14, 2027/)
  })

  it('keeps nearby coordinates and timezones in separate offline keys', () => {
    const first = cacheKey('2026-08-03', 28.611, 77.209, 'Asia/Kolkata', 'amanta', 'en')
    const second = cacheKey('2026-08-03', 28.619, 77.209, 'America/New_York', 'amanta', 'en')
    expect(first).not.toBe(second)
  })

  it('formats times with the stored timezone and daylight-aware abbreviation', () => {
    expect(formatTimeWithTimezone('06:15', 'Asia/Kolkata', '2026-08-04')).toBe('06:15 IST')
    expect(formatTimeWithTimezone('09:27', 'America/New_York', '2026-08-04')).toBe('09:27 EDT')
  })
})

describe('metadata labels', () => {
  it('localizes calendar schools without changing their stable values', () => {
    expect(humanizeCalendar('marathi', 'kn')).toBe('ಮರಾಠಿ')
    expect(humanizeCalendar('marathi', 'pa')).toBe('ਮਰਾਠੀ')
    expect(humanizeCalendar('marathi', 'mr')).toBe('मराठी')
  })

  it('returns native selected-language labels', () => {
    expect(humanizeLanguage('kn')).toBe('ಕನ್ನಡ')
    expect(humanizeLanguage('pa')).toBe('ਪੰਜਾਬੀ')
  })

  it('localizes the Lahiri ayanamsa label', () => {
    expect(humanizeAyanamsa('Lahiri', 'hi')).toBe('लाहिरी')
    expect(humanizeAyanamsa('Lahiri', 'en')).toBe('Lahiri')
  })
})
