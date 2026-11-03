import { useEffect, useRef, useState } from 'react'
import { useAccounts } from '../../hooks/useAccounts'
import { useLang } from '../../i18n/LangProvider'

const MINECRAFT_NAME_RE = /^[a-zA-Z0-9_]{3,16}$/
const MINECRAFT_UUID_RE = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i

function normalizeUuid(value) {
  return typeof value === 'string' && MINECRAFT_UUID_RE.test(value) ? value.toLowerCase() : null
}

function getOfflineName(identity) {
  const linkedName = typeof identity?.minecraftName === 'string' ? identity.minecraftName.trim() : ''
  if (MINECRAFT_NAME_RE.test(linkedName)) return linkedName
  const websiteName = identity?.preferred_username || identity?.name || ''
  return typeof websiteName === 'string' && MINECRAFT_NAME_RE.test(websiteName.trim()) ? websiteName.trim() : null
}

// Cyoria proves whether the linked Minecraft UUID is premium; the Launcher
// then uses Microsoft authentication for verified Java accounts and Offline otherwise.
export default function CyoriaIdentityPanel() {
  const { t } = useLang()
  const { accounts, addAccount, updateAccount, selectAccount } = useAccounts()
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)
  const [managing, setManaging] = useState(false)
  const [error, setError] = useState('')
  const [accountNotice, setAccountNotice] = useState(null)
  const tRef = useRef(t)
  tRef.current = t
  const api = typeof window !== 'undefined' ? window.electronAPI : null

  useEffect(() => {
    let mounted = true
    api?.cyoriaIdentityStatus?.().then(value => { if (mounted) setStatus(value) }).catch(err => {
      if (mounted) setError(err?.message || tRef.current('cyoria.statusError'))
    })
    return () => { mounted = false }
  }, [api])

  async function attachMicrosoft(identity) {
    const expectedUuid = normalizeUuid(identity?.minecraftUuid)
    if (!expectedUuid) throw new Error(t('cyoria.invalidMinecraftVerification'))

    const existing = accounts.find(account => account.type === 'microsoft' && normalizeUuid(account.uuid) === expectedUuid)
    if (existing) {
      if (existing.cyoriaAccountUuid !== identity.sub) {
        const linked = await updateAccount(existing.id, { cyoriaAccountUuid: identity.sub })
        if (linked?.error) throw new Error(linked.error)
      }
      await selectAccount(existing.id)
      setAccountNotice({ kind: 'success', text: t('cyoria.premiumAccountLinked', { username: existing.username }) })
      return
    }

    const result = await api.msStartLogin({ expectedUuid })
    if (result?.error === 'MICROSOFT_ACCOUNT_UUID_MISMATCH') throw new Error(t('cyoria.microsoftUuidMismatch'))
    if (result?.error) throw new Error(result.error)
    if (!result?.account) throw new Error(t('cyoria.microsoftSignInFailed'))

    const refreshed = await addAccount({ _msAlreadySaved: true, ...result.account })
    if (refreshed?.error) throw new Error(refreshed.error)
    const account = refreshed.data.accounts.find(item => item.type === 'microsoft' && normalizeUuid(item.uuid) === expectedUuid)
    if (!account) throw new Error(t('cyoria.microsoftUuidMismatch'))

    const linked = await updateAccount(account.id, { cyoriaAccountUuid: identity.sub })
    if (linked?.error) throw new Error(linked.error)
    await selectAccount(account.id)
    setAccountNotice({ kind: 'success', text: t('cyoria.premiumAccountLinked', { username: account.username }) })
  }

  async function useOfflineAccount(identity) {
    if (identity?.minecraftPremium !== false || identity?.minecraftUuid) {
      throw new Error(t('cyoria.invalidMinecraftVerification'))
    }
    const username = getOfflineName(identity)
    if (!username) {
      setAccountNotice({ kind: 'error', text: t('cyoria.invalidLinkedMinecraftName') })
      return
    }

    let account = accounts.find(item => item.type === 'offline' && item.username.toLowerCase() === username.toLowerCase())
    if (!account) {
      const added = await addAccount({ type: 'offline', username, cyoriaAccountUuid: identity.sub })
      if (added?.error) throw new Error(added.error)
      account = added.data.accounts.find(item => item.type === 'offline' && item.username.toLowerCase() === username.toLowerCase())
    } else if (account.cyoriaAccountUuid !== identity.sub) {
      const linked = await updateAccount(account.id, { cyoriaAccountUuid: identity.sub })
      if (linked?.error) throw new Error(linked.error)
    }

    if (!account) throw new Error(t('cyoria.offlineProfileFailed'))
    await selectAccount(account.id)
    setAccountNotice({ kind: 'success', text: t('cyoria.offlineProfileLinked', { username: account.username }) })
  }

  async function syncAccount(identity, promptForMicrosoft) {
    if (identity?.minecraftPremium === true) {
      if (!normalizeUuid(identity.minecraftUuid)) throw new Error(t('cyoria.invalidMinecraftVerification'))
      const exists = accounts.some(account => account.type === 'microsoft' && normalizeUuid(account.uuid) === normalizeUuid(identity.minecraftUuid))
      if (!exists && !promptForMicrosoft) {
        setAccountNotice({ kind: 'warning', text: t('cyoria.microsoftAccountRequired', { username: identity.minecraftName || identity.minecraftUuid }) })
        return
      }
      await attachMicrosoft(identity)
      return
    }
    await useOfflineAccount(identity)
  }

  async function action() {
    setBusy(true)
    setError('')
    setAccountNotice(null)
    try {
      const value = await (status?.connected ? api.cyoriaIdentityLogout() : api.cyoriaIdentityLogin())
      if (value?.error) throw new Error(value.error)
      setStatus(value)
      if (!value?.connected) return
      await syncAccount(value.identity, true)
    } catch (err) {
      setError(err?.message || t('cyoria.statusError'))
    } finally {
      setBusy(false)
    }
  }

  async function retryMicrosoftSignIn() {
    setBusy(true)
    setError('')
    setAccountNotice(null)
    try {
      await attachMicrosoft(status.identity)
    } catch (err) {
      setError(err?.message || t('cyoria.microsoftSignInFailed'))
    } finally {
      setBusy(false)
    }
  }

  async function manageAccount() {
    setManaging(true)
    setError('')
    try {
      const result = await api.openExternal('https://www.cyoriasmp.com/profile/')
      if (result?.error || result?.ok === false) throw new Error(result?.error || t('cyoria.manageError'))
    } catch (err) {
      setError(err?.message || t('cyoria.manageError'))
    } finally {
      setManaging(false)
    }
  }

  const identity = status?.identity
  const hasPremiumAccount = identity?.minecraftPremium === true
    && accounts.some(account => account.type === 'microsoft' && normalizeUuid(account.uuid) === normalizeUuid(identity.minecraftUuid))

  if (!api?.cyoriaIdentityStatus) return <p className="text-xs text-white/40">{t('cyoria.desktopOnly')}</p>
  return <section className="rounded-2xl border border-sky-400/20 bg-black/30 p-4">
    <div className="flex items-start gap-3">
      <div className="shrink-0 grid place-items-center w-11 h-11 rounded-xl bg-sky-400/10 border border-sky-400/20 text-sky-300">
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-4Z"/><path d="m9 12 2 2 4-4"/></svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">CyoriaSMP Auth</p>
        <p className="mt-1 text-xs leading-5 text-white/50">{t('cyoria.optionalDescription')}</p>
        {status?.connected && <div className="mt-2 space-y-1 text-xs">
          <p className="text-sky-300 break-words">{t('cyoria.connectedAs')} {identity?.preferred_username || identity?.name || identity?.sub}</p>
          <p className="text-white/45"><span>{t('cyoria.accountUuid')}:</span> <span className="font-mono break-all text-white/65">{identity?.sub}</span></p>
          <p className="text-white/45"><span>{t('cyoria.linkedMinecraftName')}:</span> <span className="text-white/65">{identity?.minecraftName || t('cyoria.noLinkedMinecraftName')}</span></p>
          <p className="text-white/45"><span>{t('cyoria.minecraftUuid')}:</span> <span className="font-mono break-all text-white/65">{identity?.minecraftUuid || t('cyoria.noVerifiedMinecraftUuid')}</span></p>
          <p className={identity?.minecraftPremium ? 'text-emerald-300' : 'text-amber-300'}>{identity?.minecraftPremium ? t('cyoria.javaVerified') : t('cyoria.offlineSelected')}</p>
        </div>}
      </div>
    </div>
    {status?.connected && api?.openExternal && <button type="button" onClick={manageAccount} disabled={managing || busy} className="mt-4 w-full rounded-xl border border-sky-400/20 bg-white/5 hover:bg-sky-400/10 text-sky-200 disabled:opacity-50 px-4 py-3 font-bold text-sm transition-colors">
      {managing ? t('cyoria.openingManage') : t('cyoria.manageAccount')}
    </button>}
    {accountNotice && <p className={`mt-3 text-xs ${accountNotice.kind === 'success' ? 'text-emerald-300' : accountNotice.kind === 'warning' ? 'text-amber-300' : 'text-red-300'}`} role="status">{accountNotice.text}</p>}
    {status?.connected && identity?.minecraftPremium && !hasPremiumAccount && <button type="button" onClick={retryMicrosoftSignIn} disabled={busy} className="mt-3 w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black disabled:opacity-50 px-4 py-3 font-bold text-sm transition-colors">
      {busy ? t('cyoria.microsoftSigningIn') : t('cyoria.connectMicrosoft')}
    </button>}
    <button type="button" onClick={action} disabled={busy || !status?.configured} className="mt-2 w-full rounded-xl bg-sky-500 hover:bg-sky-400 text-black disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed px-4 py-3 font-bold text-sm transition-colors">
      {busy ? t('cyoria.signingIn') : status?.connected ? t('cyoria.disconnect') : t('cyoria.connect')}
    </button>
    {status && !status.configured && <p className="mt-3 text-xs text-amber-300" role="status">{t('cyoria.clientNotConfigured')}</p>}
    {error && <p className="mt-3 text-xs text-red-300" role="alert">{error}</p>}
    <p className="mt-3 text-[11px] text-white/35">{t('cyoria.minecraftIndependent')}</p>
  </section>
}
