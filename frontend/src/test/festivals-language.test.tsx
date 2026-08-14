import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { FestivalsTab } from '../components/FestivalsTab'
import { fetchFestivals } from '../lib/api'
import i18n from '../locales/i18n'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('festival language requests', () => {
  it('refetches with the selected language and renders the returned localized festival', async () => {
    const fetchMock = vi.fn(async (input: string) => {
      const language = new URL(input, 'http://localhost').searchParams.get('lang')
      return new Response(JSON.stringify({
        year: 2026,
        calendar: 'amanta',
        lang: language,
        festivals: [{ name: 'Diwali', localized_name: language === 'hi' ? 'दीवाली' : 'Diwali', date: '2026-11-08' }],
        source: 'test',
      }), { headers: { 'Content-Type': 'application/json' } })
    })
    vi.stubGlobal('fetch', fetchMock)

    await fetchFestivals({ year: 2026, calendar: 'amanta', lang: 'en' })
    const hindiFestivals = await fetchFestivals({ year: 2026, calendar: 'amanta', lang: 'hi' })
    await i18n.changeLanguage('hi')
    render(<FestivalsTab data={hindiFestivals} />)

    expect(fetchMock).toHaveBeenLastCalledWith('/api/v1/festivals?year=2026&calendar=amanta&lang=hi')
    expect(screen.getByText('दीवाली')).toBeInTheDocument()
    expect(screen.queryByText('Diwali')).not.toBeInTheDocument()
  })
})
