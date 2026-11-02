import { useEffect, useState } from 'react'

/** Optional Cyoria website identity, never a Minecraft account or server lock. */
export default function CyoriaIdentityPanel() {
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const api = typeof window !== 'undefined' ? window.electronAPI : null

  useEffect(() => {
    let active = true
    api?.cyoriaIdentityStatus?.().then(value => { if (active) setStatus(value) }).catch(() => {})
    return () => { active = false }
  }, [])

  async function act(method) {
    setBusy(true); setError('')
    try {
      const value = await api[method]()
      if (value?.error) setError(value.error)
      else setStatus(value)
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  if (!api?.cyoriaIdentityStatus) return null
  return (
    <section className="mx-5 mb-3 p-3 rounded-xl border border-sky-500/20 bg-sky-500/5">
      <div className="flex justify-between gap-3 items-center">
        <div>
          <h2 className="text-sm font-semibold text-white">Cyoria Account (optional)</h2>
          <p className="text-xs text-white/50">Central identity for Cyoria services. Minecraft sign-in and other servers remain independent.</p>
          {status?.connected && <p className="text-xs text-sky-300 mt-1">Connected: {status.identity?.preferred_username || status.identity?.name || status.identity?.sub}</p>}
        </div>
        {status?.configured
          ? <button disabled={busy} onClick={() => act(status?.connected ? 'cyoriaIdentityLogout' : 'cyoriaIdentityLogin')} className="px-3 py-2 rounded-lg bg-sky-600 disabled:opacity-40 text-white text-xs">{status?.connected ? 'Disconnect' : busy ? 'Signing in…' : 'Connect Cyoria'}</button>
          : <span className="text-xs text-white/50">Client registration required</span>}
      </div>
      {error && <p role="alert" className="text-xs text-red-400 mt-2">{error}</p>}
    </section>
  )
}
