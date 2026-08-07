import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { renderWithProviders } from './render'

describe('school selector persistence', () => {
  it('persists selected school to localStorage', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)

    await user.selectOptions(screen.getByTestId('school-selector'), 'gujarati')

    const stored = window.localStorage.getItem('panchang-pwa-preferences')
    expect(stored).toContain('gujarati')
  })
})
