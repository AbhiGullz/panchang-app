import { describe, expect, it, vi, afterEach } from 'vitest'
import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { renderWithProviders } from './render'
import i18n from '../locales/i18n'

afterEach(() => cleanup())

describe('language switcher', () => {
  it('changes visible strings', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)

    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Language'), 'hi')
    expect(await screen.findByRole('button', { name: 'आगे बढ़ें' })).toBeInTheDocument()
    expect(await screen.findByText('पिछले 7 दिनों के लिए ऑफ़लाइन कैश तैयार है।')).toBeInTheDocument()
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
})
