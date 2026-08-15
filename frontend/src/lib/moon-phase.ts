export const MOON_PHASE_STATES = 30

export function moonPhaseState(elongationDegrees: number) {
  const normalized = ((elongationDegrees % 360) + 360) % 360
  return Math.round(normalized / (360 / MOON_PHASE_STATES)) % MOON_PHASE_STATES
}

export function moonPhaseLabel(state: number, localizedTithi: string) {
  if (/^(Shukla|Krishna)\s/.test(localizedTithi)) return localizedTithi
  const phase = state < 15 ? 'Shukla' : 'Krishna'
  return `${phase} ${localizedTithi}`
}

export function moonTerminatorPath(state: number) {
  const normalized = Math.max(0, Math.min(29, state))
  const illumination = normalized <= 15 ? normalized / 15 : (30 - normalized) / 15
  const waxing = normalized < 15
  const rx = Math.max(0.02, Math.abs(1 - 2 * illumination))
  const sweep = waxing ? 1 : 0
  return `M 32 10 A 22 22 0 1 1 32 54 A 22 22 0 1 1 32 10 A 22 ${22 * rx} 0 1 ${sweep} 32 54 A 22 22 0 1 0 32 10 Z`
}
