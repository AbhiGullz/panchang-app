import { cleanup, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { MuhurtaTab } from '../components/MuhurtaTab'
import i18n from '../locales/i18n'
import { resources } from '../locales/i18n'
import { SUPPORTED_LANGUAGES } from '../types/api'

const requiredPanchangKeys = [
  'language', 'selectDate', 'moonrise', 'moonset', 'panchangDetails',
  'endsAt', 'endTimeUnavailable', 'next', 'paksha', 'month',
  'advertisement', 'advertisementEmpty',
  'dailyTimings', 'abhijitMuhurta', 'amritKala', 'yamagandam', 'gulikaKaal', 'dishaShool',
  'directionNorth', 'directionSouth', 'directionEast', 'directionWest',
] as const

afterEach(() => cleanup())

describe('Panchang localization completeness', () => {
  it('defines core home-screen labels in every supported language', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const translation = resources[language].translation as Record<string, string>
      for (const key of requiredPanchangKeys) {
        expect(translation[key], `${language}.${key}`).toBeTruthy()
        if (language !== 'en') expect(translation[key], `${language}.${key}`).not.toBe((resources.en.translation as Record<string, string>)[key])
      }
    }
  })

  it('renders Kannada Muhurta labels, directions, and native digits', async () => {
    await i18n.changeLanguage('kn')
    render(createElement(MuhurtaTab, { data: {
      date: '2026-09-19', location: { name: 'Flemington', lat: 40.5, lng: -74.8, tz: 'America/New_York' },
      muhurta: {
        abhijit: { start: '2026-09-19T11:10:00-04:00', end: '2026-09-19T11:56:00-04:00' }, amrit_kala: { start: '2026-09-19T08:08:00-04:00', end: '2026-09-19T09:34:00-04:00' },
        yamagandam: { start: '2026-09-19T09:15:00-04:00', end: '2026-09-19T10:32:00-04:00' }, gulika: { start: '2026-09-19T06:44:00-04:00', end: '2026-09-19T08:01:00-04:00' }, disha_shool: 'East',
      }, rahu_kaal: { start: '2026-09-19T18:10:00-04:00', end: '2026-09-19T19:26:00-04:00' },
    } as any }))
    expect(screen.getByText('ದಿನದ ಸಮಯಗಳು')).toBeInTheDocument()
    expect(screen.getByText('ಅಭಿಜಿತ್ ಮುಹೂರ್ತ')).toBeInTheDocument()
    expect(screen.getByText('ಅಮೃತ ಕಾಲ')).toBeInTheDocument()
    expect(screen.getByText('ದಿಶಾ ಶೂಲ:')).toBeInTheDocument()
    expect(screen.getByText('ಪೂರ್ವ')).toBeInTheDocument()
    expect(screen.getByText(/೧೧:೧೦ EDT/)).toBeInTheDocument()
    await i18n.changeLanguage('en')
  })
})
