import { afterEach, expect, it, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { createBackup, parseBackup, restoreBackup } from '../lib/backup'
import { DEFAULT_PREFERENCES, PREFERENCES_KEY } from '../lib/constants'

afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks() })
it('exports only preferences and tithis, and restores without changing consent', () => {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(DEFAULT_PREFERENCES))
  localStorage.setItem('gajaa-adsterra-consent-v1', 'denied')
  localStorage.setItem('sankalpa-name', 'Never export')
  const backup = createBackup()
  expect(JSON.stringify(backup)).not.toContain('Never export')
  expect(JSON.stringify(backup)).not.toContain('denied')
  restoreBackup(parseBackup(JSON.stringify(backup)))
  expect(localStorage.getItem('gajaa-adsterra-consent-v1')).toBe('denied')
})
it('rejects corrupt, wrong-version and malformed personal records before writing', () => {
  expect(() => parseBackup('{}')).toThrow()
  expect(() => parseBackup(JSON.stringify({ ...createBackup(), version: 9 }))).toThrow()
  expect(() => parseBackup(JSON.stringify({ ...createBackup(), tithis: [{ id: 'broken' }] }))).toThrow()
  expect(() => parseBackup(JSON.stringify({ ...createBackup(), preferences: { ...DEFAULT_PREFERENCES, location: { lat: 1000 } } }))).toThrow()
})
it('merges records without duplicates and retains the existing version of a matching id', () => {
  const item = { id: 'family-1', name: 'Family day', date: '2026-05-11', calendar: 'purnimanta', lat: 28.6, lng: 77.2, tz: 'Asia/Kolkata', rule: { month: 3, tithi: 24, adhika: false, calendar: 'purnimanta' }, month_names: { en: 'Jyeshtha' }, tithi_names: { en: 'Krishna Navami' } }
  localStorage.setItem('gajaa-personal-tithis-v1', JSON.stringify([item]))
  const backup = parseBackup(JSON.stringify({ ...createBackup(), tithis: [{ ...item, name: 'Older name' }, { ...item, id: 'family-2' }] }))
  restoreBackup(backup)
  const restored = JSON.parse(localStorage.getItem('gajaa-personal-tithis-v1')!)
  expect(restored).toHaveLength(2)
  expect(restored[0].name).toBe('Family day')
  restoreBackup(backup)
  expect(JSON.parse(localStorage.getItem('gajaa-personal-tithis-v1')!)).toHaveLength(2)
})
it('reports storage failure and does not claim a successful restore', () => {
  const backup = createBackup()
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Quota', 'QuotaExceededError') })
  expect(() => restoreBackup(backup)).toThrow()
})
