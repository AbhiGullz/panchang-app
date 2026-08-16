interface Props {
  className?: string
}

export function PanchangLogo({ className = 'h-12 w-12 shrink-0' }: Props) {
  return <img className={className} src="/logo.svg" alt="Panchang logo" />
}
