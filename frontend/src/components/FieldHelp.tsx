import { CircleHelp } from 'lucide-react'

interface Props {
  label: string
  explanation: string
  inverse?: boolean
}

export function FieldHelp({ label, explanation, inverse = false }: Props) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        aria-label={`${label}: ${explanation}`}
        className={`ml-1 inline-flex rounded-full focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1 ${inverse ? 'text-[#B7DDF4]' : 'text-slate-400'}`}
        title={explanation}
        type="button"
      >
        <CircleHelp aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 hidden w-56 -translate-x-1/2 rounded-xl bg-slate-950 px-3 py-2 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-white shadow-xl group-hover:block group-focus-within:block"
      >
        {explanation}
      </span>
    </span>
  )
}
