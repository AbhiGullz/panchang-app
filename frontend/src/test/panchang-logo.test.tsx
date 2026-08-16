import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PanchangLogo } from '../components/PanchangLogo'

const publicDir = resolve(process.cwd(), 'public')

describe('static Panchang branding', () => {
  it('renders the approved logo as an accessible image without phase state', () => {
    render(<PanchangLogo />)

    expect(screen.getByRole('img', { name: 'Panchang logo' })).toHaveAttribute('src', '/logo.svg')
  })

  it.each(['logo.svg', 'favicon.svg', 'pwa-192x192.svg', 'pwa-512x512.svg', 'logo-monochrome.svg'])(
    'ships a static SVG asset for %s',
    (asset) => {
      const source = readFileSync(resolve(publicDir, asset), 'utf8')
      expect(source).toContain('<svg')
      expect(source).not.toMatch(/moon|earth|phase/i)
    },
  )
})