interface Props {
  className?: string
}

export function PanchangLogo({ className = 'h-12 w-12 shrink-0' }: Props) {
  return (
    <img aria-hidden="true" className={`${className} rounded-full object-cover`} src={`${import.meta.env.BASE_URL}logo.svg`} alt="" />
  )
}
