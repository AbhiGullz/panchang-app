import type { ReactNode } from 'react'

interface Props {
  label: string
  explanation: string
  inverse?: boolean
  children: ReactNode
}

export function FieldHelp({ label, explanation, inverse = false, children }: Props) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        aria-label={`${label}: ${explanation}`}
        className={`inline cursor-help rounded-sm bg-transparent p-0 text-inherit underline decoration-dotted decoration-1 underline-offset-4 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1 ${inverse ? 'focus:ring-offset-[#0F2747]' : ''}`}
        title={explanation}
        type="button"
      >
        {children}
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
