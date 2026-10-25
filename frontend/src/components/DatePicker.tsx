import { useEffect, useId, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCompactDate, formatDateInput } from '../lib/utils'

const ACTIONS: Record<string, string[]> = {
  en: ['Today', 'Clear', 'Month', 'Year'], hi: ['आज', 'साफ़ करें', 'महीना', 'वर्ष'], mr: ['आज', 'पुसा', 'महिना', 'वर्ष'],
  ta: ['இன்று', 'அழி', 'மாதம்', 'ஆண்டு'], te: ['ఈరోజు', 'తొలగించు', 'నెల', 'సంవత్సరం'], kn: ['ಇಂದು', 'ತೆರವುಗೊಳಿಸಿ', 'ತಿಂಗಳು', 'ವರ್ಷ'],
  ml: ['ഇന്ന്', 'മായ്ക്കുക', 'മാസം', 'വർഷം'], gu: ['આજે', 'સાફ કરો', 'મહિનો', 'વર્ષ'], bn: ['আজ', 'মুছুন', 'মাস', 'বছর'], pa: ['ਅੱਜ', 'ਸਾਫ਼ ਕਰੋ', 'ਮਹੀਨਾ', 'ਸਾਲ'],
}

export function DatePicker({ value, onChange, language, label }: { value: string; onChange: (value: string) => void; language: string; label: string }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => new Date(`${value || formatDateInput(new Date())}T12:00:00`))
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const id = useId()
  const baseLanguage = language.split('-')[0] ?? 'en'
  const words = ACTIONS[baseLanguage] ?? ACTIONS.en!
  const digits: Record<string, string> = { hi: 'deva', mr: 'deva', ta: 'tamldec', te: 'telu', kn: 'knda', ml: 'mlym', gu: 'gujr', bn: 'beng', pa: 'guru' }
  const locale = `${baseLanguage}-IN-u-nu-${digits[baseLanguage] ?? 'latn'}`
  const number = new Intl.NumberFormat(locale, { useGrouping: false })
  const month = view.getMonth(), year = view.getFullYear()
  const first = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  function close() { setOpen(false); trigger.current?.focus() }
  function select(date: string) { onChange(date); close() }
  useEffect(() => {
    if (!open) return
    dialog.current?.focus()
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])
  function move(amount: number) {
    const next = new Date(year, month + amount, 1)
    if (next.getFullYear() >= 1900 && next.getFullYear() <= 2100) setView(next)
  }
  return <div ref={root} className="relative">
    <button ref={trigger} type="button" aria-label={label} aria-haspopup="dialog" aria-expanded={open} aria-controls={id} className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#D7E7F0] bg-[#F5FAFD] px-4 py-3 text-sm" onClick={() => { setView(new Date(`${value || formatDateInput(new Date())}T12:00:00`)); setOpen(!open) }}>
      <span>{value ? formatCompactDate(value, language) : '—'}</span><CalendarDays className="h-5 w-5" />
    </button>
    {open ? <div ref={dialog} id={id} role="dialog" aria-label={label} tabIndex={-1} className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-3rem))] rounded-2xl border border-sky-200 bg-white p-4 text-[#12233A] shadow-xl" onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); close() }
      if (event.key === 'Tab') {
        const controls = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),select')
        const firstControl = controls?.[0], lastControl = controls?.[controls.length - 1]
        if (event.shiftKey && (document.activeElement === firstControl || document.activeElement === dialog.current)) { event.preventDefault(); lastControl?.focus() }
        else if (!event.shiftKey && document.activeElement === lastControl) { event.preventDefault(); firstControl?.focus() }
      }
    }}>
      <div className="mb-4 flex items-center gap-2">
        <button type="button" aria-label={`${words[2]} −`} className="cursor-pointer p-2" onClick={() => move(-1)}><ChevronLeft className="h-5 w-5" /></button>
        <select aria-label={words[2]} className="min-w-0 flex-1 rounded-lg border p-2" value={month} onChange={event => setView(new Date(year, Number(event.target.value), 1))}>{Array.from({ length: 12 }, (_, index) => <option key={index} value={index}>{new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2026, index, 1))}</option>)}</select>
        <select aria-label={words[3]} className="rounded-lg border p-2" value={year} onChange={event => setView(new Date(Number(event.target.value), month, 1))}>{Array.from({ length: 201 }, (_, index) => <option key={index} value={1900 + index}>{number.format(1900 + index)}</option>)}</select>
        <button type="button" aria-label={`${words[2]} +`} className="cursor-pointer p-2" onClick={() => move(1)}><ChevronRight className="h-5 w-5" /></button>
      </div>
      <div className="grid grid-cols-7 text-center">{Array.from({ length: 7 }, (_, index) => <span key={index} className="py-2 text-xs text-slate-500">{new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(new Date(2026, 0, 4 + index))}</span>)}</div>
      <div className="grid grid-cols-7 gap-1">{Array.from({ length: first }, (_, index) => <span key={`blank-${index}`} />)}{Array.from({ length: days }, (_, index) => {
        const day = formatDateInput(new Date(year, month, index + 1))
        return <button type="button" key={day} aria-label={day} aria-pressed={day === value} className={`min-h-11 cursor-pointer rounded-lg text-base hover:bg-sky-100 focus-visible:ring-2 focus-visible:ring-sky-500 ${day === value ? 'bg-sky-800 text-white hover:bg-sky-700' : ''}`} onClick={() => select(day)}>{number.format(index + 1)}</button>
      })}</div>
      <div className="mt-4 flex justify-between border-t border-sky-100 pt-3"><button type="button" className="cursor-pointer rounded-lg px-3 py-2 text-sky-800" onClick={() => select('')}>{words[1]}</button><button type="button" className="cursor-pointer rounded-lg px-3 py-2 font-semibold text-sky-800" onClick={() => select(formatDateInput(new Date()))}>{words[0]}</button></div>
    </div> : null}
  </div>
}
