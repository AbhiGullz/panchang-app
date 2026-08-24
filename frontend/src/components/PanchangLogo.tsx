interface Props {
  className?: string
}

export function PanchangLogo({ className = 'h-12 w-12 shrink-0' }: Props) {
  return (
    <img aria-hidden="true" className={className} src={`${import.meta.env.BASE_URL}logo-reference.jpg`} alt="" />
  )
}
