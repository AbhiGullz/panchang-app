interface Props {
  className?: string
}

export function PanchangLogo({ className = 'h-12 w-12 shrink-0' }: Props) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="29" fill="#E5F5FC" stroke="#163B63" strokeWidth="2" />
      <circle cx="32" cy="32" r="17" fill="#163B63" />
      <path d="M32 18v5M32 41v5M18 32h5M41 32h5M22.1 22.1l3.5 3.5M38.4 38.4l3.5 3.5M41.9 22.1l-3.5 3.5M25.6 38.4l-3.5 3.5" stroke="#DDF3FC" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M35.5 24.5a10 10 0 1 0 0 15.1 11.5 11.5 0 1 1 0-15.1Z" fill="#F7C75F" />
    </svg>
  )
}
