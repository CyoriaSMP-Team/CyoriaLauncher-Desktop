/**
* VoxelXLauncher — Minecraft Launcher
* Created by FoxStudio. AI-assisted development.
*
* Source code : https://github.com/foxstudio-201/VoxelXLauncher
* Website     : https://voxxelxclient.vercel.app
*
* NOTICE:
*   - This software is provided as-is without warranty of any kind.
*   - Do not redistribute or resell without explicit permission from FoxStudio.
*   - If you use or reference this code, please credit FoxStudio.
*   - Minecraft is a trademark of Mojang Studios / Microsoft. This project is not affiliated with Mojang.
*/

/**
* VoxelXLauncher — Minecraft Launcher
* Created by FoxStudio. AI-assisted development.
*
* Source code : https://github.com/foxstudio-201/VoxelXLauncher
* Website     : https://voxxelxclient.vercel.app
*
* NOTICE:
*   - Dành cho mấy cháu cứ thích phỉ báng.
*   - Launcher sử dụng ai đi kèm trong việc tạo, bản thân người tạo không tự nhận là code toàn bộ do có sự hỗ trợ của ai.
*   - Giỏi giang thì tự code bằng năng lực của mình đang video làm toàn bộ từ đầu đến cuối, còn không làm được đừng có kích đểu ảnh hưởng đến người sử dụng.
*   - Bạn chẳng phải là anh hùng mặc áo choàng đỏ mặc quần xịt như thằng trẻ trâu rồi lên mạng ra vẻ ta đây là người tốt, là anh hùng, là người bảo vệ công lý gì đâu :).
*   - Vậy nên bớt ảo tưởng đi.
*   - Nếu có sử dụng hoặc tham khảo code này, hãy ghi công cho FoxStudio.
*   - Minecraft là một thương hiệu của Mojang Studios / Microsoft. Dự án này không liên kết với Mojang.
*/

import { useState } from 'react';
import PlayerHead from '../ui/PlayerHead';
import { offlineUUID } from '../../utils/offlineUUID';
import { useLang } from '../../i18n/LangProvider';
import CyoriaIdentityPanel from './CyoriaIdentityPanel';

const isElectron = typeof window !== 'undefined' && window.electronAPI;

const TABS = [
{ id: 'offline', labelKey: 'cyoria.offlineTab' },
{ id: 'online', labelKey: 'cyoria.microsoftTab' },
{ id: 'cyoria', labelKey: 'cyoria.cyoriaTab' }];


function validatePlayerName(name) {
  const trimmed = name.trim();
  if (!trimmed) return 'account.addModal.usernameError';
  if (trimmed.length < 3 || trimmed.length > 16) return 'account.addModal.usernameLengthError';
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) return 'account.addModal.usernameCharError';
  return null;
}























































export default function AddAccountModal({ onClose, onAdd }) {
  const { t } = useLang();
  const [tab, setTab] = useState('offline');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [msState, setMsState] = useState('idle');
  const [msAccount, setMsAccount] = useState(null);

  // OTP flow
  // 'idle' | 'sending' | 'waiting' | 'verifying'




  // Cyoria identity is optional and managed independently of game accounts.




  // 'new' = tạo tài khoản mới, 'link' = liên kết với account đã có



  function cancelPendingMicrosoft() {
    if (msState === 'waiting') void window.electronAPI?.msCancelLogin?.().catch(() => {})
  }

  function closeModal() {
    cancelPendingMicrosoft()
    onClose()
  }

  function resetTab(nextTab) {
    if (nextTab !== tab) cancelPendingMicrosoft()
    setTab(nextTab)
    setError('')
    setLoading(false)
    setMsState('idle')
  }

  // Offline accounts are local Minecraft profiles. Never send usernames to the VoxelX API.
  async function handleOfflineSubmit(e) {
    e.preventDefault();
    setError('');
    const name = username.trim();
    const validationError = validatePlayerName(name);
    if (validationError) return setError(t(validationError));
    await doAddAccount(name);
  }

  async function doAddAccount(name) {
    if (loading) return;
    setLoading(true);
    try {
      const result = await onAdd({ type: 'offline', username: name });
      if (result?.error) {
        setError(result.error);
        return;
      }
      onClose();
    } catch (err) {
      setError(err?.message || 'Unable to add Minecraft account');
    } finally {
      setLoading(false);
    }
  }

  // Legacy web OTP was tied to VoxelX and is intentionally disabled.






  async function startMsLogin() {
    if (!isElectron) {
      setError(t('account.addModal.msOnlyElectron'));
      return;
    }

    setError('');
    setMsState('waiting');

    try {
      const result = await window.electronAPI.msStartLogin();
      if (result?.error) {
        setError(result.error);
        setMsState('idle');
        return;
      }

      setMsAccount(result.account);
      setMsState('success');
      if (onAdd) await onAdd({ _msAlreadySaved: true, ...result.account });
    } catch (err) {
      setError(err?.message || t('account.addModal.msOnlyElectron'));
      setMsState('idle');
    }
  }


























































































  const offlinePreviewUuid = username.trim().length >= 3 ? offlineUUID(username.trim()) : null;








  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && closeModal()}>
      
      <div className="w-[min(94vw,560px)] max-h-[90vh] overflow-y-auto bg-[#0a0c0f] border border-sky-500/20 rounded-3xl shadow-[0_22px_90px_rgba(0,0,0,.65)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.23em] text-sky-400">CYORIA LAUNCHER</p><h2 className="text-xl font-bold text-white mt-1">{t('account.addModal.title')}</h2><p className="text-xs text-white/40 mt-1">{t('cyoria.loginSubtitle')}</p></div>
          <button
            onClick={closeModal}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
            
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 px-6 pt-4">
          {TABS.map((item) =>
          <button
            key={item.id}
            onClick={() => resetTab(item.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === item.id ?
            'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
            'text-white/40 hover:text-white/70 hover:bg-white/5'}`
            }>
            
              {t(item.labelKey)}
            </button>
          )}
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {tab === 'offline' &&
          <>
            {/* OTP verification screen */}
            {















































            <form onSubmit={handleOfflineSubmit} className="flex flex-col gap-4">
              <TextField
                label={t('account.addModal.usernameLabel')}
                value={username}
                onChange={setUsername}
                placeholder={t('account.addModal.usernamePlaceholder')}
                autoFocus />
              
              <p className="text-[11px] text-white/25 -mt-2">
                {t('account.addModal.offlineHint')}
              </p>

              <AccountPreview
                type="offline"
                uuid={offlinePreviewUuid}
                username={username.trim() || t('account.addModal.noNameYet')}
                subtitle={`Offline · ${offlinePreviewUuid || '—'}`} />
              

              {error && <ErrorBanner message={error} />}

              <div className="flex gap-2 pt-1">
                <SecondaryButton type="button" onClick={closeModal}>{t('account.addModal.cancel')}</SecondaryButton>
                <PrimaryButton type="submit" disabled={loading}>
                  {loading ? t('account.addModal.processing') : t('account.addModal.addBtn')}
                </PrimaryButton>
              </div>
            </form>
            }
            </>
          }

          {tab === 'online' &&
          <div className="flex flex-col gap-4">
              {msState === 'idle' &&
            <>
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#0078d4]/15 border border-[#0078d4]/25 flex items-center justify-center">
                      <svg viewBox="0 0 21 21" className="w-8 h-8">
                        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-white/80">{t('account.addModal.msTitle')}</p>
                      <p className="text-xs text-white/35 mt-1 leading-relaxed">
                        {t('account.addModal.msDesc')}
                      </p>
                    </div>
                  </div>

                  {error && <ErrorBanner message={error} />}

                  <div className="flex gap-2">
                    <SecondaryButton onClick={closeModal}>{t('account.addModal.cancel')}</SecondaryButton>
                    <button
                  onClick={startMsLogin}
                  disabled={!isElectron}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#0078d4] hover:bg-[#106ebe] text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  
                      <svg viewBox="0 0 21 21" className="w-4 h-4 flex-shrink-0">
                        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                      </svg>
                      {t('account.addModal.msLoginBtn')}
                    </button>
                  </div>
                </>
            }

              {msState === 'waiting' &&
            <WaitingState
              title={t('account.addModal.msWaiting')}
              description={t('account.addModal.msWaitingDesc')}
              colorClass="text-[#0078d4]" />

            }

              {msState === 'success' && msAccount &&
            <SuccessState
              title={msAccount.username}
              description={t('account.addModal.msSuccess')}
              actionLabel={t('account.addModal.msDone')}
              onAction={closeModal} />

            }
            </div>
          }

          {tab === 'cyoria' &&
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 space-y-4">
              <div><p className="text-base font-semibold text-white">{t('cyoria.optionalTitle')}</p><p className="text-xs leading-relaxed text-white/55 mt-1">{t('cyoria.optionalDescription')}</p></div>
              <CyoriaIdentityPanel />
              <p className="text-[11px] text-white/40">{t('cyoria.minecraftIndependent')}</p>
            </div>
          }
        </div>
      </div>
    </div>);

}

function TextField({ label, value, onChange, placeholder, autoFocus = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={16}
        autoFocus={autoFocus}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-sky-500/50 focus:bg-white/8 transition-all" />
      
    </div>);

}

function AccountPreview({ uuid, username, subtitle, type = 'offline' }) {
  const badge = {
    offline: {
      icon:
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
        </svg>,

      color: 'text-white/50 bg-white/10 border-white/15',
      label: 'Offline'
    },
    online: {
      icon:
      <svg viewBox="0 0 21 21" className="w-2.5 h-2.5 flex-shrink-0">
          <rect x="1" y="1" width="9" height="9" fill="#f25022" />
          <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
          <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
          <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
        </svg>,

      color: 'text-[#0078d4] bg-[#0078d4]/15 border-[#0078d4]/25',
      label: 'Microsoft'
    },
    discord: {
      icon:
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
          <path d="M20.317 4.369A19.791 19.791 0 0015.885 3c-.191.34-.404.798-.553 1.165a18.27 18.27 0 00-5.327 0A12.04 12.04 0 009.45 3a19.736 19.736 0 00-4.434 1.371C2.21 8.622 1.449 12.77 1.822 16.863A19.923 19.923 0 007.245 19.5c.438-.6.83-1.235 1.165-1.905-.63-.238-1.23-.53-1.793-.867.149-.107.294-.221.434-.339 3.46 1.623 7.214 1.623 10.633 0 .142.118.287.232.434.339-.565.339-1.167.63-1.795.867.336.67.728 1.307 1.167 1.905a19.874 19.874 0 005.422-2.638c.438-4.745-.75-8.855-3.595-12.494zM9.16 14.555c-1.036 0-1.886-.95-1.886-2.115 0-1.165.832-2.115 1.886-2.115 1.062 0 1.904.96 1.886 2.115 0 1.165-.832 2.115-1.886 2.115zm5.693 0c-1.036 0-1.886-.95-1.886-2.115 0-1.165.832-2.115 1.886-2.115 1.062 0 1.904.96 1.886 2.115 0 1.165-.824 2.115-1.886 2.115z" />
        </svg>,

      color: 'text-[#5865F2] bg-[#5865F2]/15 border-[#5865F2]/25',
      label: 'Discord'
    }
  }[type] ?? {
    icon: null,
    color: 'text-white/50 bg-white/10 border-white/15',
    label: type
  };

  return (
    <div className="flex items-center gap-3 bg-white/3 rounded-xl p-3 border border-white/5">
      <div className="rounded-lg overflow-hidden flex-shrink-0">
        <PlayerHead uuid={uuid} username={username} size={40} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-white/80 truncate">{username}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${badge.color}`}>
            {badge.icon}
            {badge.label}
          </span>
          <span className="text-[11px] text-white/25 truncate">{subtitle.replace(/^[^·]*·\s*/, '')}</span>
        </div>
      </div>
    </div>);

}

function WaitingState({ title, description, colorClass }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <svg className={`animate-spin w-8 h-8 ${colorClass}`} viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <div className="text-center">
        <p className="text-sm font-semibold text-white/70">{title}</p>
        <p className="text-xs text-white/30 mt-1">{description}</p>
      </div>
    </div>);

}

function SuccessState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="w-12 h-12 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-sky-400">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="text-xs text-white/35 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onAction}
        className="w-full py-2.5 rounded-xl text-sm font-bold bg-sky-500 hover:bg-sky-400 text-white transition-all">
        
        {actionLabel}
      </button>
    </div>);

}

function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-sky-500 hover:bg-sky-400 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed">
      
      {children}
    </button>);

}

function SecondaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all border border-white/5">
      
      {children}
    </button>);

}









function ErrorBanner({ message }) {
  return (
    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
      <span className="text-xs text-red-400 leading-relaxed">{message}</span>
    </div>);

}