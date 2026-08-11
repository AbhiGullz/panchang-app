import { cleanup, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { OnboardingCard } from '../components/OnboardingCard'
import type { CalendarSchool, LanguageCode, LocationPreference } from '../types/api'
import { renderWithProviders } from './render'

const location: LocationPreference = { city: 'Delhi', lat: 28.6139, lng: 77.209, tz: 'Asia/Kolkata' }

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function renderPicker(onLocationChange = vi.fn()) {
  return renderWithProviders(
    <OnboardingCard
      location={location}
      language={'en' as LanguageCode}
      calendar={'purnimanta' as CalendarSchool}
      onLocationChange={onLocationChange}
      onLanguageChange={vi.fn()}
      onCalendarChange={vi.fn()}
      onUseCurrentLocation={vi.fn(async () => undefined)}
      onContinue={vi.fn()}
    />,
  )
}

describe('location picker', () => {
  it('debounces a query and selecting a result updates the precise location', async () => {
    const user = userEvent.setup()
    const onLocationChange = vi.fn()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ display_name: 'London, England, United Kingdom', lat: 51.5, lng: -0.12, tz: 'Europe/London' }]), { status: 200 }),
    )
    renderPicker(onLocationChange)
    const input = screen.getByRole('combobox', { name: /Search worldwide locations/ })

    await user.clear(input)
    await user.type(input, 'L')
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(globalThis.fetch).not.toHaveBeenCalled()
    await user.type(input, 'ondon')
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1), { timeout: 1000 })
    await user.click(await screen.findByRole('button', { name: /London/ }))
    expect(onLocationChange).toHaveBeenCalledWith({ city: 'London, England, United Kingdom', lat: 51.5, lng: -0.12, tz: 'Europe/London' })
  })

  it('shows empty and error states', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }))
    renderPicker()
    const input = screen.getByRole('combobox', { name: /Search worldwide locations/ })
    await user.clear(input)
    await user.type(input, 'Mars')
    expect(await screen.findByText(/No locations found/i)).toBeInTheDocument()

    vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('offline'))
    await user.clear(screen.getByRole('combobox', { name: /Search worldwide locations/ }))
    await user.type(screen.getByRole('combobox', { name: /Search worldwide locations/ }), 'Moon')
    expect(await screen.findByText(/Location search is unavailable/i)).toBeInTheDocument()
  })
})