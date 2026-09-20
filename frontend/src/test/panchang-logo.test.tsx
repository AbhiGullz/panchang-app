import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PanchangLogo } from '../components/PanchangLogo'

const publicDir = resolve(process.cwd(), 'public')

describe('static Panchang branding', () => {
  it('renders the approved static logo asset', () => {
    render(<PanchangLogo />)

    const logo = document.querySelector('img')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', expect.stringContaining('logo.svg'))
    expect(logo).toHaveAttribute('alt', '')
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
