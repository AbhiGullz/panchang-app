import { cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { TodayView } from '../components/TodayView'
import { renderWithProviders } from './render'
const sample = {
  date: '2026-08-04',
  location: { name: 'Delhi', lat: 28.61, lng: 77.21, tz: 'Asia/Kolkata' },
  sun: { rise: '05:47', set: '19:09' },
  tithi: { index: 20, name: { en: 'Krishna Panchami', hi: 'कृष्ण पंचमी', pa: 'ਕ੍ਰਿਸ਼ਨ ਪੰਚਮੀ', ta: 'கிருஷ்ண பஞ்சமி', te: 'కృష్ణ పంచమి', kn: 'ಕೃಷ್ಣ ಪಂಚಮಿ', ml: 'കൃഷ്ണ പഞ്ചമി', mr: 'कृष्ण पंचमी', gu: 'કૃષ્ણ પંચમી', bn: 'কৃষ্ণ পঞ্চমী' }, ends_at: '06:32' },
  nakshatra: { index: 5, name: { en: 'Rohini', hi: 'रोहिणी', pa: 'ਰੋਹਿਣੀ', ta: 'ரோகிணி', te: 'రోహిణి', kn: 'ರೋಹಿಣಿ', ml: 'രോഹിണി', mr: 'रोहिणी', gu: 'રોહિણી', bn: 'রোহিণী' }, pada: 2 },
  yoga: { index: 8, name: { en: 'Siddha', hi: 'सिद्ध', pa: 'ਸਿੱਧ', ta: 'சித்த', te: 'సిద్ధ', kn: 'ಸಿದ್ಧ', ml: 'സിദ്ധ', mr: 'सिद्ध', gu: 'સિદ્ધ', bn: 'সিদ্ধ' } },
  karana: { index: 1, name: { en: 'Bava', hi: 'बव', pa: 'ਬਵ', ta: 'பவ', te: 'బవ', kn: 'ಬವ', ml: 'ബവ', mr: 'बव', gu: 'બવ', bn: 'বব' } },
  moon_sign: { en: 'Vrishabha', hi: 'वृषभ', pa: 'ਵ੍ਰਿਸ਼ਭ', ta: 'ரிஷபம்', te: 'వృషభం', kn: 'ವೃಷಭ', ml: 'വൃശഭം', mr: 'वृषभ', gu: 'વૃષભ', bn: 'বৃষভ' },
  month_name: { en: 'Shravana', hi: 'श्रावण', pa: 'ਸਾਵਣ', ta: 'ஆவணி', te: 'శ్రావణం', kn: 'ಶ್ರಾವಣ', ml: 'ചിങ്ങം', mr: 'श्रावण', gu: 'શ્રાવણ', bn: 'শ্রাবণ' },
  era_year: 2083,
  paksha: 'krishna',
  rahu_kaal: { start: '12:15', end: '13:50' },
  muhurta: { abhijit: { start: '11:45', end: '12:30' }, yamagandam: { start: '09:00', end: '10:30' }, gulika: { start: '07:30', end: '09:00' }, amrit_kala: { start: '18:00', end: '19:00' }, disha_shool: 'North' },
  names_version: 'v1',
  lang_names: { tithi: 'Krishna Panchami' },
  source: 'swiss-ephemeris',
} as const

afterEach(() => cleanup())

describe('TodayView', () => {
  it('renders tithi details', () => {
    renderWithProviders(<TodayView data={sample} />)
    expect(screen.getByText('Krishna Panchami')).toBeInTheDocument()
    expect(screen.getAllByText(/Rohini/).length).toBeGreaterThan(0)
    expect(screen.queryByText(/Next:.*\(/)).not.toBeInTheDocument()
  })

  it('shows daily timings and complete end dates on the home screen', () => {
    renderWithProviders(<TodayView data={sample} />)
    expect(screen.getByText('05:47 IST')).toBeInTheDocument()
    expect(screen.getByText('19:09 IST')).toBeInTheDocument()
    expect(screen.getByText('12:15 IST — 13:50 IST')).toBeInTheDocument()
    expect(screen.getByText('Ends: August 4, 2026, 06:32 IST')).toBeInTheDocument()
    expect(screen.queryByText('Tradition')).not.toBeInTheDocument()
  })
})
