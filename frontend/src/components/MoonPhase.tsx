interface Props {
  illumination?: number
  elongationDegrees?: number
}

export function MoonPhase({ illumination = 0, elongationDegrees = 0 }: Props) {
  const lit = Math.max(0, Math.min(1, illumination))
  const waxing = elongationDegrees <= 180
  const shadowCenter = waxing ? 50 - (lit * 100) : 50 + (lit * 100)

  return (
    <svg aria-label={`Moon phase, ${Math.round(lit * 100)}% illuminated`} className="h-24 w-24 shrink-0 drop-shadow-lg sm:h-28 sm:w-28" viewBox="0 0 100 100" role="img">
      <defs>
        <clipPath id="moon-disc"><circle cx="50" cy="50" r="42" /></clipPath>
        <radialGradient id="moon-glow" cx="35%" cy="30%">
          <stop offset="0" stopColor="#FFF6C7" />
          <stop offset="1" stopColor="#F3C969" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="url(#moon-glow)" />
      <circle clipPath="url(#moon-disc)" cx={shadowCenter} cy="50" r="42" fill="#0F2747" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="#DDF3FC" strokeOpacity="0.35" strokeWidth="1.5" />
    </svg>
  )
}
