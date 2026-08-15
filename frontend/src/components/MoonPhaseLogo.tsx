interface Props {
  elongationDegrees?: number
  label: string
  className?: string
}

export function MoonPhaseLogo({ label, className = 'h-10 w-10' }: Props) {
  return (
    <svg className={className} viewBox="0 0 128 128" role="img" aria-label={label || 'Panchang'}>

      <path d="M46 10c40-8 72 20 72 58 0 31-23 55-54 55-29 0-52-20-57-46 14 18 32 26 48 22 20-5 32-23 32-43 0-20-15-38-41-46Z" fill="#0F2747" />
      <circle cx="55" cy="58" r="18" fill="#63B7E6" />
      <path d="M55 25 58 40h-6l3-15ZM34 30l9 13-5 3-4-16ZM76 30l-4 16-5-3 9-13ZM23 47l15 6-2 5-13-11ZM87 47 74 58l-2-5 15-6ZM24 68h17v5H24ZM70 68h17v5H70Z" fill="#63B7E6" />
      <path d="M25 73c18-8 42-8 61 0-16-2-45-2-61 0Z" fill="#0F2747" />
      <rect x="31" y="76" width="50" height="38" rx="9" fill="#0F2747" />
      <rect x="34" y="85" width="44" height="27" rx="6" fill="white" />
      <path d="M42 75v10M70 75v10" stroke="#0F2747" strokeWidth="5" strokeLinecap="round" />
      <path d="M42 92h5v5h-5ZM54 92h5v5h-5ZM66 92h5v5h-5ZM42 101h5v5h-5ZM54 101h5v5h-5ZM66 101h5v5h-5Z" fill="#B7DDF4" />
      <path d="M54 101h5v5h-5Z" fill="#64748B" />
    </svg>
  )
}
