import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { renderWithProviders } from './render'

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
})
