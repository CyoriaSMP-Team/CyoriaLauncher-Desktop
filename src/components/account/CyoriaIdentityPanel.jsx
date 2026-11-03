import { useEffect, useState } from 'react'
import { useLang } from '../../i18n/LangProvider'

// Optional Cyoria identity: browser-based PKCE; no Minecraft account is created.
export default function CyoriaIdentityPanel() {
  const { t } = useLang()
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const api = typeof window !== 'undefined' ? window.electronAPI : null
  useEffect(() => {
    let mounted = true
    api?.cyoriaIdentityStatus?.().then(value => {if (mounted) setStatus(value)}).catch(err => {if (mounted) setError(err?.message || 'Unable to load CyoriaSMP Auth status')})
    return () => {mounted = false}
  }, [api])
  async function action() {
    setBusy(true)
    setError('')
    try {
      const value = await (status?.connected ? api.cyoriaIdentityLogout() : api.cyoriaIdentityLogin())
      if (value?.error) throw new Error(value.error)
      setStatus(value)
    } catch (err) {setError(err?.message || t('cyoria.statusError'))}
    finally {setBusy(false)}
  }
  if (!api?.cyoriaIdentityStatus) return <p className="text-xs text-white/40">{t('cyoria.desktopOnly')}</p>
  return <section className="rounded-2xl border border-sky-400/20 bg-black/30 p-4">
    <div className="flex items-start gap-3">
      <div className="shrink-0 grid place-items-center w-11 h-11 rounded-xl bg-sky-400/10 border border-sky-400/20 text-sky-300">
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-4Z"/><path d="m9 12 2 2 4-4"/></svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">CyoriaSMP Auth</p>
        <p className="mt-1 text-xs leading-5 text-white/50">{t('cyoria.optionalDescription')}</p>
        {status?.connected && <p className="mt-2 text-xs text-sky-300 break-words">{t('cyoria.connectedAs')} {status.identity?.preferred_username || status.identity?.name || status.identity?.sub}</p>}
      </div>
    </div>
    <button type="button" onClick={action} disabled={busy || !status?.configured} className="mt-4 w-full rounded-xl bg-sky-500 hover:bg-sky-400 text-black disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed px-4 py-3 font-bold text-sm transition-colors">
      {busy ? t('cyoria.signingIn') : status?.connected ? t('cyoria.disconnect') : t('cyoria.connect')}
    </button>
    {status && !status.configured && <p className="mt-3 text-xs text-amber-300" role="status">{t('cyoria.clientNotConfigured')}</p>}
    {error && <p className="mt-3 text-xs text-red-300" role="alert">{error}</p>}
    <p className="mt-3 text-[11px] text-white/35">{t('cyoria.minecraftIndependent')}</p>
  </section>
}
