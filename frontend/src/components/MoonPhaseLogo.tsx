import { moonPhaseLabel, moonPhaseState, moonTerminatorPath } from '../lib/moon-phase'

interface Props {
  elongationDegrees?: number
  label: string
  className?: string
}

export function MoonPhaseLogo({ elongationDegrees = 0, label, className = 'h-10 w-10' }: Props) {
  const state = moonPhaseState(elongationDegrees)
  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-label={`Moon phase: ${moonPhaseLabel(state, label)}`}>
      <title>{`Moon phase: ${moonPhaseLabel(state, label)}`}</title>
      <rect width="64" height="64" rx="16" fill="#ea580c" />
      <circle cx="32" cy="32" r="24" fill="#7c2d12" opacity="0.28" />
      <circle cx="32" cy="32" r="22" fill="#fff7ed" />
      <path d={moonTerminatorPath(state)} fill="#fbbf24" />
      <path d="M16 51h32v2H16zM21 48V43h22v5" fill="none" stroke="#fff7ed" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  )
}
