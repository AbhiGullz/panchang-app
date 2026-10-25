import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { PersonalTithis } from '../components/PersonalTithis'
import { DEFAULT_PREFERENCES } from '../lib/constants'
import { loadPersonalTithis, personalEvents, personalId, personalName, todayAt } from '../lib/personal-tithis'
import { renderWithProviders } from './render'
import i18n from '../locales/i18n'
import { sankalpaScript } from '../lib/sankalpa-script'

it('renders saved Indic names and locations when switching back to English', () => {
  expect(personalName('मातोश्री कल्पना गुलवाड़े की पुण्यतिथि', 'en-US')).toBe("Matoshri Kalpana Gulwade's Punyatithi")
  expect(sankalpaScript('ಇಂದೋರ್, ಮಧ್ಯ ಪ್ರದೇಶ, ಭಾರತ', 'en')).toBe('Indore, Madhya Pradesh, India')
  expect(sankalpaScript('इन्दौर, मध्य प्रदेश, भारत', 'en')).toBe('Indore, Madhya Pradesh, India')
})

afterEach(() => { cleanup(); localStorage.removeItem('gajaa-personal-tithis-v1'); vi.unstubAllGlobals() })

it('previews, saves privately, preserves the captured setting, and deletes', async () => {
  await i18n.changeLanguage('en')
  const mock = vi.fn(async () => new Response(JSON.stringify({ rule: { month: 7, tithi: 18, adhika: false, calendar: 'amanta' }, month_names: { en: 'Ashwin', mr: 'आश्विन' }, tithi_names: { en: 'Krishna Tritiya', mr: 'कृष्ण तृतीया' }, dates: ['2027-10-17'] }), { headers: { 'Content-Type': 'application/json' } }))
  vi.stubGlobal('fetch', mock)
  const view = renderWithProviders(<PersonalTithis preferences={{ ...DEFAULT_PREFERENCES, calendar: 'amanta' }} />)
  fireEvent.change(screen.getByLabelText('Name of observance'), { target: { value: "Mother's Punyatithi" } })
  fireEvent.click(screen.getByRole('button', { name: 'Gregorian date' }))
  fireEvent.change(screen.getByRole('combobox', { name: 'Year' }), { target: { value: '2026' } })
  fireEvent.change(screen.getByRole('combobox', { name: 'Month' }), { target: { value: '9' } })
  fireEvent.click(screen.getByRole('button', { name: '2026-10-28' }))
  await screen.findByText(/Ashwin · Krishna Tritiya/)
  fireEvent.click(screen.getByRole('button', { name: 'Save tithi' }))
  expect(loadPersonalTithis()[0]?.calendar).toBe('amanta')
  expect(loadPersonalTithis()[0]?.place).toBe(DEFAULT_PREFERENCES.location.city)
  view.unmount()
  renderWithProviders(<PersonalTithis preferences={{ ...DEFAULT_PREFERENCES, calendar: 'purnimanta' }} />)
  expect(screen.getByText("Mother's Punyatithi")).toBeInTheDocument()
  expect(loadPersonalTithis()[0]?.calendar).toBe('amanta')
  await personalEvents(loadPersonalTithis(), 2028)
  expect(mock.mock.calls.every(call => !String(call).includes('Mother'))).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
  expect(loadPersonalTithis()).toEqual([])
})

it('supports HTTP preview IDs and local dates across timezones', () => {
  vi.stubGlobal('crypto', { getRandomValues: (bytes: Uint8Array) => { bytes.fill(12); return bytes } })
  expect(personalId()).toHaveLength(32)
  expect(todayAt('America/New_York', new Date('2026-10-25T01:00:00Z'))).toBe('2026-10-24')
  expect(todayAt('Asia/Kolkata', new Date('2026-10-25T01:00:00Z'))).toBe('2026-10-25')
  expect(personalName("Mother's Punyatithi", 'hi')).toBe('माता की पुण्यतिथि')
})

it('filters past dates out of upcoming previews', async () => {
  await i18n.changeLanguage('en')
  const year = new Date().getFullYear()
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ rule: { month: 7, tithi: 18, adhika: false, calendar: 'amanta' }, month_names: { en: 'Ashwin' }, tithi_names: { en: 'Krishna Tritiya' }, dates: ['1900-01-01', `${year + 1}-10-17`] }))))
  renderWithProviders(<PersonalTithis preferences={{ ...DEFAULT_PREFERENCES, calendar: 'amanta' }} />)
  fireEvent.click(screen.getByRole('button', { name: 'Gregorian date' }))
  fireEvent.change(screen.getByRole('combobox', { name: 'Year' }), { target: { value: '2026' } })
  fireEvent.change(screen.getByRole('combobox', { name: 'Month' }), { target: { value: '4' } })
  fireEvent.click(screen.getByRole('button', { name: '2026-05-11' }))
  const upcoming = await screen.findByText(/Upcoming dates:/)
  expect(upcoming).not.toHaveTextContent('1900')
  expect(upcoming).toHaveTextContent(String(year + 1))
})

it('requires a lunar calendar setting', async () => {
  await i18n.changeLanguage('en')
  renderWithProviders(<PersonalTithis preferences={{ ...DEFAULT_PREFERENCES, calendar: 'tamil' }} />)
  expect(screen.getByText('Select Amanta or Purnimanta in Settings first.')).toBeInTheDocument()
  expect(screen.queryByLabelText('Gregorian date')).not.toBeInTheDocument()
})
