interface Props {
  illumination?: number
  elongationDegrees?: number
}

export function MoonPhase({ illumination = 0, elongationDegrees = 0 }: Props) {
  const lit = Math.max(0, Math.min(1, illumination))
  const waxing = elongationDegrees <= 180
  const shadowCenter = waxing ? 50 - (lit * 100) : 50 + (lit * 100)

  return (
    <svg aria-label={`Moon phase, ${Math.round(lit * 100)}% illuminated`} className="h-14 w-14 shrink-0 drop-shadow-lg sm:h-16 sm:w-16" viewBox="0 0 100 100" role="img">
      <defs>
        <clipPath id="moon-disc"><circle cx="50" cy="50" r="42" /></clipPath>
        <radialGradient id="moon-glow" cx="35%" cy="30%">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#CBD5E1" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="url(#moon-glow)" />
      <circle clipPath="url(#moon-disc)" cx={shadowCenter} cy="50" r="42" fill="#0F2747" />
    </svg>
  )
}
