import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const assets = ['favicon.svg', 'logo-monochrome.svg', 'pwa-192x192.svg', 'pwa-512x512.svg']
for (const asset of assets) {
  const path = resolve(root, 'public', asset)
  if (!existsSync(path) || !readFileSync(path, 'utf8').includes('<svg')) {
    throw new Error(`Missing or invalid logo asset: ${path}`)
  }
}
const config = readFileSync(resolve(root, 'vite.config.ts'), 'utf8')
for (const asset of assets) {
  if (!config.includes(asset)) throw new Error(`PWA config does not reference ${asset}`)
}
console.log(`Verified ${assets.length} SVG logo assets and PWA references.`)
