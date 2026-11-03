import { useState } from 'react'
import { useAccounts } from '../../hooks/useAccounts'
import { useLang } from '../../i18n/LangProvider'
import CyoriaIdentityPanel from './CyoriaIdentityPanel'

/** Local Minecraft account information; Cyoria identity remains independent. */
export default function AccountSettingsPanel({ account, onBack }) {
  const { t } = useLang()
  const { updateAccount } = useAccounts()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const isElectron = typeof window !== 'undefined' && window.electronAPI
  async function linkDiscord() {
    if (!isElectron) return
    setBusy(true); setError('')
    try {
      // Verified Discord identity must come from CyoriaSMP Auth; never from VoxelX.
      const result = await window.electronAPI.discordStartLink()
      if (!result?.ok || !result.profile?.discordId) throw new Error(result?.error || t('cyoria.discordNotVerified'))
      const profile = result.profile
      const saved = await updateAccount(account.id, {
        discordId: profile.discordId, discordUsername: profile.discordUsername,
        discordGlobalName: profile.discordGlobalName, discordAvatarUrl: profile.discordAvatarUrl,
        discordDiscriminator: null, linkedAt: new Date().toISOString()
      })
      if (saved?.error) throw new Error(saved.error)
    } catch (e) {setError(e.message || t('cyoria.discordNotVerified'))}
    finally {setBusy(false)}
  }
  async function unlinkDiscord() {
    setBusy(true);setError('')
    try {const saved = await updateAccount(account.id, {discordId:null,discordUsername:null,discordGlobalName:null,discordAvatarUrl:null,discordDiscriminator:null,linkedAt:null}); if (saved?.error) throw new Error(saved.error)}
    catch (e) {setError(e.message)}finally {setBusy(false)}
  }
  return <div className="h-full overflow-y-auto bg-[#070b10] text-white p-6">
    <button type="button" onClick={onBack} className="text-sm text-sky-300 hover:text-sky-200">← {t('cyoria.back')}</button>
    <div className="mt-7 rounded-3xl border border-sky-500/20 bg-[#0c0e11] p-6 shadow-2xl">
      <div className="text-[11px] font-semibold text-sky-400 tracking-[.2em] uppercase">CYORIA LAUNCHER</div>
      <h2 className="mt-2 text-2xl font-bold">{t('cyoria.profileSettings')}</h2>
      <p className="text-white/45 text-sm mt-2">{t('cyoria.minecraftIndependent')}</p>
      <div className="mt-5 grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
        <div><span className="text-white/40">{t('cyoria.username')}:</span> <strong className="ml-2">{account.username}</strong></div>
        <div><span className="text-white/40">{t('cyoria.accountType')}:</span> <span className="ml-2 capitalize">{account.type}</span></div>
        <div><span className="text-white/40">UUID:</span> <span className="ml-2 font-mono text-xs break-all">{account.uuid}</span></div>
      </div>
    </div>
    <div className="mt-4 rounded-3xl border border-sky-500/15 bg-[#0c0e11] p-5">
      <h3 className="font-semibold text-lg">{t('cyoria.optionalTitle')}</h3>
      <CyoriaIdentityPanel />
      <p className="text-white/45 text-xs mt-3">{t('cyoria.optionalDescription')}</p>
    </div>
    <div className="mt-4 rounded-3xl border border-white/10 bg-[#0c0e11] p-5">
      <h3 className="font-semibold text-lg">Discord</h3>
      <p className="text-white/45 text-xs mt-2">{t('cyoria.discordViaAuth')}</p>
      {account.discordId ? <div className="text-sky-300 text-sm mt-3">{account.discordUsername || account.discordId}</div> : null}
      <button type="button" disabled={busy || !isElectron} onClick={account.discordId ? unlinkDiscord : linkDiscord} className="mt-4 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2.5 text-sm font-semibold disabled:opacity-50">
        {busy ? t('cyoria.working') : account.discordId ? t('cyoria.unlinkDiscord') : t('cyoria.linkDiscord')}
      </button>
      {error && <p role="alert" className="text-red-300 text-xs mt-3">{error}</p>}
    </div>
  </div>
}
