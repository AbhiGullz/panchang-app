import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { PujaMuhurta } from '../components/PujaMuhurta'
import i18n from '../locales/i18n'
import { renderWithProviders } from './render'

afterEach(cleanup)

it('shows local puja timings, the date after midnight, and explicit missing windows', async () => {
  await i18n.changeLanguage('en')
  renderWithProviders(<PujaMuhurta timezone="America/New_York" festivals={[
    { id: 'diwali', name: 'Diwali', date: '2026-11-08', ritual_window: 'pradosha', observance_start: '2026-11-08T23:30:00-05:00', observance_end: '2026-11-09T00:30:00-05:00' },
    { id: 'naraka', name: 'Narak Chaturdashi', date: '2026-11-07', ritual_window: 'arunodaya', calculation_basis: 'civil-day-fallback' },
    { name: 'Unrelated festival', date: '2026-11-11' },
  ]} />)
  expect(screen.getByText('Diwali Lakshmi Puja')).toBeInTheDocument()
  expect(screen.getByText('23:30 EST')).toBeInTheDocument()
  expect(screen.getByText(/November 9, 2026, .*:30 EST/)).toBeInTheDocument()
  expect(screen.getByText(/Roop \/ Narak Chaturdashi/)).toBeInTheDocument()
  expect(screen.getByText('No matching local ritual window was found.')).toBeInTheDocument()
  expect(screen.queryByText('Unrelated festival')).not.toBeInTheDocument()
})
