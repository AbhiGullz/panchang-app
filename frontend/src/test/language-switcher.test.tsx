import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'
import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { renderWithProviders } from './render'
import i18n from '../locales/i18n'
import { SUPPORTED_LANGUAGES } from '../types/api'

afterEach(() => cleanup())
beforeEach(() => i18n.changeLanguage('en'))

describe('language switcher', () => {
  it('uses a translated Settings field label where it is available', () => {
    expect(i18n.t('language', { lng: 'en' })).toBe('Language')
    expect(i18n.t('language', { lng: 'hi' })).toBe('भाषा')
    expect(i18n.t('language', { lng: 'mr' })).toBe('भाषा')

    for (const language of SUPPORTED_LANGUAGES) {
      expect(i18n.t('language', { lng: language })).not.toBe('language')
    }
  })
  it('changes visible strings', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)

    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Language'), 'hi')
    expect(await screen.findByRole('button', { name: 'आगे बढ़ें' })).toBeInTheDocument()
    expect(screen.queryByText(/ऑफ़लाइन कैश/)).not.toBeInTheDocument()
  })

  it('shows native language names and switches using their internal codes', async () => {
    const user = userEvent.setup()
    const changeLanguage = vi.spyOn(i18n, 'changeLanguage')
    renderWithProviders(<App />)

    const selector = screen.getByRole('combobox', { name: /Language|भाषा/ })
    expect(selector).toHaveTextContent('English')
    expect(selector).toHaveTextContent('हिंदी')
    expect(selector).toHaveTextContent('मराठी')
    expect(selector).not.toHaveTextContent('HI')
    expect(selector).not.toHaveTextContent('MR')

    await user.selectOptions(selector, 'mr')
    expect(changeLanguage).toHaveBeenCalledWith('mr')
  })

  it('changes the interface without adding a language subtitle below the location', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    const selector = screen.getByRole('combobox', { name: /Language|भाषा/ })
    await user.selectOptions(selector, 'mr')
    expect(await screen.findByRole('button', { name: 'पुढे जा' })).toBeInTheDocument()
    expect(screen.getByRole('banner')).not.toHaveTextContent('मराठी')
    await user.selectOptions(selector, 'kn')
    expect(await screen.findByRole('button', { name: 'ಮುಂದುವರಿಸಿ' })).toBeInTheDocument()
    expect(screen.getByRole('banner')).not.toHaveTextContent('ಕನ್ನಡ')
    await user.selectOptions(selector, 'pa')
    expect(await screen.findByRole('button', { name: 'ਜਾਰੀ ਰੱਖੋ' })).toBeInTheDocument()
    expect(screen.getByRole('banner')).not.toHaveTextContent('ਪੰਜਾਬੀ')
  })
})
