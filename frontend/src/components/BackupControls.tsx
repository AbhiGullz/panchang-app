import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createBackup, parseBackup, restoreBackup, type Backup } from '../lib/backup'
import { featureCopy } from '../lib/new-feature-copy'
import { personalCopy } from '../lib/personal-tithis'

export function BackupControls() {
  const { i18n, t } = useTranslation()
  const c = featureCopy(i18n.language)
  const [pending, setPending] = useState<Backup | null>(null)
  const [error, setError] = useState(false)
  const download = () => {
    try {
      const url = URL.createObjectURL(new Blob([JSON.stringify(createBackup(), null, 2)], { type: 'application/json' }))
      const link = document.createElement('a'); link.href = url; link.download = `gajaa-backup-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(link); link.click(); link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 10000)
      setError(false)
    } catch { setError(true) }
  }
  return <section className="space-y-3 rounded-2xl bg-sky-50 p-4">
    <h3 className="font-semibold">{c[0]}</h3><p className="text-sm text-slate-600">{c[3]}</p>
    <div className="flex flex-wrap gap-3"><button type="button" className="rounded-xl border border-sky-400 px-3 py-2" onClick={download}>{c[1]}</button>
      <label className="cursor-pointer rounded-xl border border-sky-400 px-3 py-2">{c[2]}<input className="sr-only" type="file" accept="application/json,.json" onChange={async event => {
        const file = event.target.files?.[0]; event.target.value = ''; setPending(null); setError(false)
        if (!file) return
        try { if (file.size > 2_000_000) throw new Error('Size'); setPending(parseBackup(await file.text())) } catch { setError(true) }
      }} /></label></div>
    {pending ? <div className="space-y-2 rounded-xl border border-sky-200 p-3"><p>{c[4]}</p><p>{new Intl.NumberFormat(i18n.language).format(pending.tithis.length)} · {personalCopy(i18n.language)[0]}</p><button type="button" className="rounded-xl bg-sky-800 px-3 py-2 text-white" onClick={() => { try { restoreBackup(pending); window.location.reload() } catch { setError(true) } }}>{c[2]}</button><button type="button" className="ml-3 underline" onClick={() => setPending(null)}>{t('cancel')}</button></div> : null}
    {error ? <p role="alert" className="text-sm text-red-700">{c[5]}</p> : null}
  </section>
}
