// Default-on launch regions. All other/unknown regions retain prior consent.
export function advertisingDecision(consent: string | null, country: string | null, globalPrivacyControl = false) {
  if (globalPrivacyControl || consent === 'denied') return 'blocked'
  if (consent === 'granted' || country === 'US' || country === 'IN') return 'allowed'
  return 'ask'
}

export async function advertisingCountry(): Promise<string | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    // AbortSignal.timeout is unavailable in older Safari versions.
    const response = await fetch('/cdn-cgi/trace', { cache: 'no-store', signal: controller.signal })
    if (!response.ok) return null
    // Read only Cloudflare's country code; never store the trace/IP address.
    return /^loc=([A-Z]{2})$/m.exec(await response.text())?.[1] ?? null
  } catch { return null } finally { clearTimeout(timeout) }
}
