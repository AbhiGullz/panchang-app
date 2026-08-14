import { describe, expect, it, vi, afterEach } from 'vitest'
import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { renderWithProviders } from './render'
import i18n from '../locales/i18n'
import { SUPPORTED_LANGUAGES } from '../types/api'

afterEach(() => cleanup())

describe('language switcher', () => {
  it('keeps the Settings field label in English for every supported locale', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      expect(i18n.t('language', { lng: language })).toBe('Language')
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

  it('updates the header language subtitle and metadata immediately', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    const selector = screen.getAllByRole('combobox', { name: 'Language' })[0]!
    await user.selectOptions(selector, 'mr')
    expect(await screen.findByRole('banner')).toHaveTextContent('मराठी')
    await user.selectOptions(selector, 'kn')
    expect(await screen.findByRole('banner')).toHaveTextContent('ಕನ್ನಡ')
    expect(screen.getByRole('banner')).not.toHaveTextContent('मराठी')
    await user.selectOptions(selector, 'pa')
    expect(await screen.findByRole('banner')).toHaveTextContent('ਪੰਜਾਬੀ')
    expect(screen.getByRole('banner')).not.toHaveTextContent('ಕನ್ನಡ')
  })
})
