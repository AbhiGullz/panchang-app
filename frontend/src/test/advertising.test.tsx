import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { AdvertisementSlot } from '../components/AdvertisementSlot'
import { AdvertisingPreferences } from '../components/AdvertisingPreferences'
import { renderWithProviders } from './render'
import i18n from '../locales/i18n'
import { chooseAdvertisingConsent } from '../lib/advertising-consent'

afterEach(() => { cleanup(); vi.restoreAllMocks(); chooseAdvertisingConsent('denied'); localStorage.removeItem('gajaa-adsterra-consent-v1'); vi.unstubAllEnvs() })

it('visibly switches both settings buttons even when browser storage is blocked', async () => {
  await i18n.changeLanguage('en')
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Storage blocked', 'SecurityError') })
  renderWithProviders(<AdvertisingPreferences />)
  const allow = screen.getByRole('button', { name: 'Allow ads' })
  const decline = screen.getByRole('button', { name: 'No thanks' })
  fireEvent.click(allow)
  expect(allow).toHaveAttribute('aria-pressed', 'true')
  expect(allow).toHaveClass('bg-sky-800')
  expect(decline).not.toHaveClass('bg-sky-800')
  fireEvent.click(decline)
  expect(decline).toHaveAttribute('aria-pressed', 'true')
  expect(decline).toHaveClass('bg-sky-800')
  expect(allow).toHaveAttribute('aria-pressed', 'false')
})

it('does not create an ad frame until consent and removes it immediately on withdrawal', async () => {
  vi.stubEnv('PROD', true)
  await i18n.changeLanguage('en')
  const view = renderWithProviders(<AdvertisementSlot />)
  expect(view.container.querySelector('iframe')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Allow ads' }))
  const frame = view.container.querySelector('iframe')!
  expect(frame).not.toBeNull()
  expect(frame.getAttribute('src')).toBe('/advertising/banner.html')
  expect(frame.hasAttribute('srcdoc')).toBe(false)
  expect(frame.getAttribute('sandbox')).not.toContain('allow-same-origin')
  expect(frame.getAttribute('sandbox')).not.toContain('allow-top-navigation')
  renderWithProviders(<AdvertisingPreferences />)
  fireEvent.click(screen.getByRole('button', { name: 'No thanks' }))
  expect(view.container.querySelector('iframe')).toBeNull()
  expect(localStorage.getItem('gajaa-adsterra-consent-v1')).toBe('denied')
})

it('keeps live advertising disabled during development even with stored permission', () => {
  vi.stubEnv('PROD', false)
  localStorage.setItem('gajaa-adsterra-consent-v1', 'granted')
  const view = renderWithProviders(<AdvertisementSlot />)
  expect(view.container).toBeEmptyDOMElement()
})

it('localizes the consent choice and lets a visitor decline without loading an ad', async () => {
  vi.stubEnv('PROD', true)
  await i18n.changeLanguage('hi')
  const view = renderWithProviders(<AdvertisementSlot />)
  fireEvent.click(screen.getByRole('button', { name: 'नहीं, धन्यवाद' }))
  expect(view.container).toBeEmptyDOMElement()
  await i18n.changeLanguage('en')
})
