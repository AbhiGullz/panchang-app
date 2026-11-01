import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { loadPreferences, savePreferences, readStoredValue, validStoredDate } from '../lib/storage'
import { DEFAULT_PREFERENCES, PREFERENCES_KEY } from '../lib/constants'
import { AppRecovery } from '../components/AppRecovery'
import i18n from '../locales/i18n'

afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.removeItem(PREFERENCES_KEY) })

it('starts with defaults and updates in memory when browser storage is unavailable', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError') })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Quota', 'QuotaExceededError') })
  expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES)
  expect(readStoredValue('gajaa-selected-date')).toBeNull()
  expect(() => savePreferences(DEFAULT_PREFERENCES)).not.toThrow()
  const { useAppStore } = await import('../store/app-store')
  expect(() => useAppStore.getState().setActiveTab('settings')).not.toThrow()
  expect(useAppStore.getState().activeTab).toBe('settings')
})

it('does not use broken legacy settings as render inputs or erase saved data', () => {
  const damaged = JSON.stringify({ location: null, language: 'bad_locale', calendar: null })
  localStorage.setItem(PREFERENCES_KEY, damaged)
  expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES)
  expect(localStorage.getItem(PREFERENCES_KEY)).toBe(damaged)
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ location: { lat: '40.5', lng: '-74.8', city: 'Flemington', tz: 'broken' } }))
  expect(loadPreferences().location).toEqual(DEFAULT_PREFERENCES.location)
  expect(validStoredDate('2026-02-30')).toBe(false)
  expect(validStoredDate('')).toBe(false)
  expect(validStoredDate('2026-11-01')).toBe(true)
})

it('shows a recovery screen rather than an empty page on render failure', async () => {
  await i18n.changeLanguage('en')
  vi.spyOn(console, 'error').mockImplementation(() => {})
  function Broken(): never { throw new Error('Simulated mobile render failure') }
  render(<AppRecovery><Broken /></AppRecovery>)
  expect(screen.getByRole('alert')).toHaveTextContent('Your saved tithis have not been deleted')
  expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
})
