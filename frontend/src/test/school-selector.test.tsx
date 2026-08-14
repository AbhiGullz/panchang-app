import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { renderWithProviders } from './render'

afterEach(() => { cleanup(); window.localStorage.clear() })

describe('school selector persistence', () => {
  it('persists selected school to localStorage', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)

    await user.selectOptions(screen.getByTestId('school-selector'), 'gujarati')

    const stored = window.localStorage.getItem('panchang-pwa-preferences')
    expect(stored).toContain('gujarati')
  })

  it('renders the stable calendar value with a localized label', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    const language = screen.getAllByRole('combobox', { name: 'Language' })[0]!
    await user.selectOptions(language, 'kn')
    const school = screen.getAllByTestId('school-selector')[0]!
    await user.selectOptions(school, 'marathi')
    expect(school).toHaveValue('marathi')
    expect(school).toHaveTextContent('ಮರಾಠಿ')
    expect(school).not.toHaveTextContent('Marathi')
  })
})
