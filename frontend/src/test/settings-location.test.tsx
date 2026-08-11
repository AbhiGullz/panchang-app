import { cleanup, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { SettingsTab } from '../components/SettingsTab'
import type { AppPreferences } from '../types/api'
import { renderWithProviders } from './render'
import { loadPreferences, savePreferences } from '../lib/storage'
import { cacheKey } from '../hooks/use-panchang'

const preferences: AppPreferences = { location: { city: 'Delhi', lat: 28.6, lng: 77.2, tz: 'Asia/Kolkata' }, language: 'en', calendar: 'purnimanta', notificationTime: '06:00', ayanamsa: 'lahiri', onboardingComplete: true }

afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('settings location change', () => {
  it('opens picker, selects a worldwide result, and returns the complete location', async () => {
    const user = userEvent.setup(); const onLocationChange = vi.fn()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify([{ display_name: 'London, England, United Kingdom', lat: 51.5, lng: -0.12, tz: 'Europe/London' }]), { status: 200 }))
    renderWithProviders(<SettingsTab preferences={preferences} onLocationChange={onLocationChange} onLanguageChange={vi.fn()} onCalendarChange={vi.fn()} onNotificationTimeChange={vi.fn()} onAyanamsaChange={vi.fn()} onSubscribePush={vi.fn(async () => undefined)} pushReady={false} />)
    expect(screen.getByText('Delhi')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Change location' }))
    const input = screen.getByRole('combobox', { name: /Search worldwide locations/ })
    await user.clear(input); await user.type(input, 'London')
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1), { timeout: 1000 })
    await user.click(await screen.findByRole('button', { name: /London/ }))
    expect(onLocationChange).toHaveBeenCalledWith({ city: 'London, England, United Kingdom', lat: 51.5, lng: -0.12, tz: 'Europe/London' })
  })

  it('cancels without changing the saved location', async () => {
    const user = userEvent.setup(); const onLocationChange = vi.fn()
    renderWithProviders(<SettingsTab preferences={preferences} onLocationChange={onLocationChange} onLanguageChange={vi.fn()} onCalendarChange={vi.fn()} onNotificationTimeChange={vi.fn()} onAyanamsaChange={vi.fn()} onSubscribePush={vi.fn(async () => undefined)} pushReady={false} />)
    await user.click(screen.getByRole('button', { name: 'Change location' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onLocationChange).not.toHaveBeenCalled(); expect(screen.getByText('Delhi')).toBeInTheDocument()
  })
  it('persists the selected location and changes the panchang cache key', () => {
    const next = { ...preferences, location: { city: 'London', lat: 51.5, lng: -0.12, tz: 'Europe/London' } }
    savePreferences(next)
    expect(loadPreferences().location).toEqual(next.location)
    expect(cacheKey('2026-01-01', preferences.location.lat, preferences.location.lng, preferences.location.tz, 'purnimanta', 'en'))
      .not.toBe(cacheKey('2026-01-01', next.location.lat, next.location.lng, next.location.tz, 'purnimanta', 'en'))
  })
})
