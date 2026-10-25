import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { AppPreferences, LanguageCode } from '../types/api'
import { loadPersonalTithis, personalCopy, personalPreview, personalRuleLabel, savePersonalTithis, personalId, personalName, todayAt } from '../lib/personal-tithis'
import { formatDisplayDate } from '../lib/utils'
import { LocationPicker } from './LocationPicker'
import { sankalpaScript } from '../lib/sankalpa-script'
import { DatePicker } from './DatePicker'

export function PersonalTithis({ preferences }: { preferences: AppPreferences }) {
  const { t, i18n } = useTranslation()
  const copy = personalCopy(i18n.language)
  const [items, setItems] = useState(loadPersonalTithis)
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState(preferences.location)
  const [editingPlace, setEditingPlace] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const calendar = preferences.calendar
  const supported = calendar === 'amanta' || calendar === 'purnimanta'
  const reference = { date, calendar: supported ? calendar : 'amanta' as const, lat: location.lat, lng: location.lng, tz: location.tz }
  const today = todayAt(location.tz)
  const year = Number(today.slice(0, 4))
  const preview = useQuery({
    queryKey: ['personal-preview', reference, today],
    enabled: supported && /^\d{4}-\d{2}-\d{2}$/.test(date),
    queryFn: async () => {
      const results = await Promise.all([year, year + 1, year + 2].map(nextYear => personalPreview(reference, nextYear)))
      return { ...results[0]!, dates: results.flatMap(result => result.dates).filter(day => day >= today).sort() }
    },
    retry: false,
    staleTime: Infinity,
  })
  function persist(next: typeof items) {
    try { savePersonalTithis(next); setItems(next); setSaveError(false); return true }
    catch { setSaveError(true); return false }
  }
  function save() {
    if (!name.trim() || !preview.data || !supported) return
    const { dates: _dates, ...details } = preview.data
    if (persist([...items, { ...reference, ...details, place: location.city, name: name.trim(), id: personalId() }])) { setName(''); setDate('') }
  }
  const fieldClass = 'mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2'
  return <section className="space-y-3 rounded-2xl border border-sky-100 bg-sky-50 p-4">
    <h3 className="font-semibold">{copy[0]}</h3>
    <p className="text-sm text-slate-600">{copy[1]}</p>
    <p className="text-xs text-slate-500">{copy[7]}</p>
    {!supported ? <p className="text-sm text-amber-800">{copy[8]}</p> : <>
      <label className="block text-sm">{copy[2]}<input className={fieldClass} maxLength={120} value={editingName ? name : personalName(name, i18n.language)} onFocus={() => setEditingName(true)} onBlur={() => setEditingName(false)} onChange={event => setName(event.target.value)} /></label>
      <div className="text-sm"><span className="font-medium">{t('location')}: </span>{sankalpaScript(location.city, i18n.language as LanguageCode)}<button type="button" className="ml-2 cursor-pointer text-sky-800 underline" onClick={() => setEditingPlace(!editingPlace)}>{t('changeLocationTitle')}</button></div>
      {editingPlace ? <LocationPicker location={location} language={i18n.language as LanguageCode} onLocationChange={next => { setLocation(next); setEditingPlace(false) }} /> : null}
      <div className="text-sm"><p className="mb-1">{copy[3]}</p><DatePicker value={date} onChange={setDate} language={i18n.language} label={copy[3] ?? ''} /></div>
      {preview.isFetching ? <p role="status">…</p> : null}
      {preview.data && date ? <div className="rounded-xl bg-white p-3 text-sm">
        <p className="font-medium">{personalRuleLabel({ ...reference, ...preview.data }, i18n.language)}</p>
        <p className="mt-1">{copy[11]}: {preview.data.dates.length ? preview.data.dates.map(day => formatDisplayDate(day, i18n.language)).join(' · ') : copy[10]}</p>
      </div> : null}
      <button type="button" className="cursor-pointer rounded-xl bg-sky-800 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40" disabled={!name.trim() || !date || !preview.data || preview.isFetching || preview.isError} onClick={save}>{copy[5]}</button>
    </>}
    {preview.isError || saveError ? <p role="alert" className="text-sm text-red-700">{copy[9]}</p> : null}
    <ul className="space-y-2">{items.map(item => <li key={item.id} className="rounded-xl bg-white p-3 text-sm">
      <p className="font-semibold">{personalName(item.name, i18n.language)}</p>
      {item.place ? <p>{sankalpaScript(item.place, i18n.language as LanguageCode)}</p> : null}
      <p>{personalRuleLabel(item, i18n.language)}</p>
      <button type="button" className="mt-2 cursor-pointer text-red-700 underline" onClick={() => persist(items.filter(row => row.id !== item.id))}>{copy[6]}</button>
    </li>)}</ul>
  </section>
}
