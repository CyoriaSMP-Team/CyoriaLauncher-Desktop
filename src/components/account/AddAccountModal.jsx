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
import { useLang } from '../../i18n/LangProvider';import LocalizedText from "../../i18n/LocalizedText.jsx";

const isElectron = typeof window !== 'undefined' && window.electronAPI;

const TABS = [
{ id: 'offline', label: 'Offline' },
{ id: 'online', label: 'Microsoft' },
{ id: 'discord', label: 'Discord' }];


function validatePlayerName(name) {
  const trimmed = name.trim();
  if (!trimmed) return 'account.addModal.usernameError';
  if (trimmed.length < 3 || trimmed.length > 16) return 'account.addModal.usernameLengthError';
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) return 'account.addModal.usernameCharError';
  return null;
}

function normalizeDiscordProfile(profile) {
  if (!profile || typeof profile !== 'object') return null;

  const discordId = String(
    profile.discordId ??
    profile.id ??
    profile.userId ??
    ''
  ).trim();

  const discordUsername = String(
    profile.discordUsername ??
    profile.username ??
    profile.login ??
    ''
  ).trim();

  const discordGlobalName = String(
    profile.discordGlobalName ??
    profile.globalName ??
    profile.global_name ??
    profile.displayName ??
    ''
  ).trim();

  const discriminatorValue =
  profile.discordDiscriminator ??
  profile.discriminator ??
  profile.tagSuffix ??
  null;

  const discordDiscriminator = discriminatorValue == null ?
  null :
  String(discriminatorValue).trim() || null;

  const discordAvatarUrl = String(
    profile.discordAvatarUrl ??
    profile.avatarUrl ??
    profile.avatar_url ??
    profile.avatar ??
    ''
  ).trim() || null;

  if (!discordId || !discordUsername) return null;

  return {
    discordId,
    discordUsername,
    discordGlobalName: discordGlobalName || null,
    discordDiscriminator,
    discordAvatarUrl
  };
}

export default function AddAccountModal({ onClose, onAdd, onLinkDiscord, existingAccounts = [] }) {
  const { t } = useLang();
  const [tab, setTab] = useState('offline');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [msState, setMsState] = useState('idle');
  const [msAccount, setMsAccount] = useState(null);

  // OTP flow
  const [otpState, setOtpState] = useState('idle'); // 'idle' | 'sending' | 'waiting' | 'verifying'
  const [otpCode, setOtpCode] = useState('');
  const [otpPendingName, setOtpPendingName] = useState('');
  const [otpError, setOtpError] = useState('');

  const WEB_API = 'https://www.voxelx.io.vn/api/auth';

  const [discordState, setDiscordState] = useState('idle');
  const [discordProfile, setDiscordProfile] = useState(null);
  const [discordPlayerName, setDiscordPlayerName] = useState('');
  // 'new' = tạo tài khoản mới, 'link' = liên kết với account đã có
  const [discordMode, setDiscordMode] = useState('new');
  const [linkTargetId, setLinkTargetId] = useState('');

  function resetTab(nextTab) {
    setTab(nextTab);
    setError('');
    setLoading(false);
    setMsState('idle');
    setDiscordState('idle');
    setDiscordProfile(null);
    setDiscordPlayerName('');
    setDiscordMode('new');
    setLinkTargetId('');
  }

  async function handleOfflineSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const name = username.trim();
    const validationError = validatePlayerName(name);
    if (validationError) {
      setError(t(validationError));
      setLoading(false);
      return;
    }

    // Kiểm tra xem tên này có trên web và có email không
    try {
      const lookupRes = await fetch(`${WEB_API}?action=lookup&username=${encodeURIComponent(name)}`);
      if (lookupRes.ok) {
        const data = await lookupRes.json();
        // Tài khoản có trên web và có email thực (không phải app_account)
        if (data.ok && data.uuid && !data.email?.includes('@offline.local')) {
          // Gửi OTP về mail
          setOtpPendingName(name);
          setOtpState('sending');
          setLoading(false);
          const otpRes = await fetch(`${WEB_API}?action=send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uuid: data.uuid })
          });
          const otpData = await otpRes.json();
          if (otpRes.ok) {
            setOtpState('waiting');
          } else {
            // Không gửi được OTP (chưa verify email, v.v.) → cho đăng nhập bình thường
            setOtpState('idle');
            await doAddAccount(name);
          }
          return;
        }
      }
    } catch {


      // Lỗi mạng → cho đăng nhập bình thường
    }await doAddAccount(name);
  }

  async function doAddAccount(name) {
    setLoading(true);
    const result = await onAdd({ type: 'offline', username: name });
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    onClose();
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    setOtpError('');
    setOtpState('verifying');

    try {
      // Lấy UUID từ lookup
      const lookupRes = await fetch(`${WEB_API}?action=lookup&username=${encodeURIComponent(otpPendingName)}`);
      const lookupData = await lookupRes.json();
      if (!lookupData.ok) throw new Error('Không tìm thấy tài khoản');

      const verifyRes = await fetch(`${WEB_API}?action=verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: lookupData.uuid, otp: otpCode })
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || 'Mã OTP không đúng');

      // OTP đúng → lưu web token và thêm tài khoản
      if (verifyData.token) {
        try {localStorage.setItem('vxc_auth_token', verifyData.token);} catch {}
      }
      setOtpState('idle');
      await doAddAccount(otpPendingName);
    } catch (err) {
      setOtpError(err.message);
      setOtpState('waiting');
    }
  }

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

  async function startDiscordLink() {
    if (!isElectron) {
      setError(t('account.addModal.discordOnlyElectron'));
      return;
    }

    setError('');
    setDiscordState('waiting');

    try {
      const result = await window.electronAPI.discordStartLink();
      if (result?.error) {
        setError(result.error);
        setDiscordState('idle');
        return;
      }

      const normalizedProfile = normalizeDiscordProfile(result?.profile);
      if (!normalizedProfile) {
        setError(t('account.addModal.discordInvalidData'));
        setDiscordState('idle');
        return;
      }

      setDiscordProfile(normalizedProfile);
      setDiscordState('linked');
    } catch (err) {
      setError(err?.message || t('account.addModal.discordOnlyElectron'));
      setDiscordState('idle');
    }
  }

  async function handleDiscordSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!discordProfile?.discordId) {
      setError(t('account.addModal.discordNeedAuth'));
      setLoading(false);
      return;
    }

    if (discordMode === 'link') {
      // Liên kết Discord vào account đã có
      if (!linkTargetId) {
        setError(t('account.addModal.discordSelectAccount'));
        setLoading(false);
        return;
      }
      const result = await onLinkDiscord?.(linkTargetId, discordProfile);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      onClose();
      return;
    }

    // Tạo tài khoản mới
    const name = discordPlayerName.trim();
    const validationError = validatePlayerName(name);
    if (validationError) {
      setError(t(validationError));
      setLoading(false);
      return;
    }

    const result = await onAdd({
      type: 'discord',
      username: name,
      discordId: discordProfile.discordId,
      discordUsername: discordProfile.discordUsername,
      discordGlobalName: discordProfile.discordGlobalName,
      discordDiscriminator: discordProfile.discordDiscriminator,
      discordAvatarUrl: discordProfile.discordAvatarUrl,
      linkedAt: new Date().toISOString()
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    onClose();
  }

  const offlinePreviewUuid = username.trim().length >= 3 ? offlineUUID(username.trim()) : null;
  const discordPreviewUuid = discordPlayerName.trim().length >= 3 ? offlineUUID(discordPlayerName.trim()) : null;
  const discordDisplayName = discordProfile?.discordGlobalName || discordProfile?.discordUsername || 'Discord user';
  const discordTag = discordProfile?.discordUsername ?
  `@${discordProfile.discordUsername}${discordProfile.discordDiscriminator && discordProfile.discordDiscriminator !== '0' ?
  `#${discordProfile.discordDiscriminator}` :
  ''}` :
  null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      
      <div className="w-[460px] bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-base font-bold text-white">{t('account.addModal.title')}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
            
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex gap-1 px-6 pt-4">
          {TABS.map((item) =>
          <button
            key={item.id}
            onClick={() => resetTab(item.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === item.id ?
            'bg-green-500/20 text-green-400 border border-green-500/30' :
            'text-white/40 hover:text-white/70 hover:bg-white/5'}`
            }>
            
              {item.label}
            </button>
          )}
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {tab === 'offline' &&
          <>
            {/* OTP verification screen */}
            {otpState === 'sending' || otpState === 'waiting' || otpState === 'verifying' ?
            <div className="flex flex-col gap-4">
                {otpState === 'sending' ?
              <div className="flex flex-col items-center gap-4 py-6">
                    <svg className="animate-spin w-7 h-7 text-green-400" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-sm text-white/60"><LocalizedText id="auto.83d00e280a7a" /></p>
                  </div> :

              <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col items-center gap-3 py-2">
                      <div className="w-12 h-12 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-green-400">
                          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-white/80"><LocalizedText id="auto.8170792eadc6" /></p>
                        <p className="text-xs text-white/35 mt-1 leading-relaxed"><LocalizedText id="auto.db73bbf4379d" />
                      <strong className="text-white/60">{otpPendingName}</strong>
                        </p>
                      </div>
                    </div>

                    <TextField
                  label={t("auto.2378f2490009")}
                  value={otpCode}
                  onChange={setOtpCode}
                  placeholder="000000"
                  autoFocus />
                

                    {otpError && <ErrorBanner message={otpError} />}

                    <div className="flex gap-2">
                      <SecondaryButton type="button" onClick={() => {setOtpState('idle');setOtpCode('');setOtpError('');}}><LocalizedText id="auto.19ddb5379406" />

                  </SecondaryButton>
                      <PrimaryButton type="submit" disabled={otpState === 'verifying' || otpCode.length < 6}>
                        {otpState === 'verifying' ? 'Đang xác nhận...' : 'Xác nhận'}
                      </PrimaryButton>
                    </div>
                  </form>
              }
              </div> :

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
                <SecondaryButton type="button" onClick={onClose}>{t('account.addModal.cancel')}</SecondaryButton>
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
                    <SecondaryButton onClick={onClose}>{t('account.addModal.cancel')}</SecondaryButton>
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
              onAction={onClose} />

            }
            </div>
          }

          {tab === 'discord' &&
          <form onSubmit={handleDiscordSubmit} className="flex flex-col gap-4">
              {discordState === 'idle' &&
            <>
                  {/* Icon + mô tả */}
                  <div className="flex flex-col items-center gap-3 py-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#5865F2]/15 border border-[#5865F2]/25 flex items-center justify-center">
                      <DiscordGlyph className="w-8 h-8 text-[#5865F2]" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-white/80">{t('account.addModal.discordTitle')}</p>
                      <p className="text-xs text-white/35 mt-1 leading-relaxed">
                        {t('account.addModal.discordDesc')}
                      </p>
                    </div>
                  </div>

                  {/* Chọn mode */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                  type="button"
                  onClick={() => setDiscordMode('new')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-left transition-all ${
                  discordMode === 'new' ?
                  'border-[#5865F2]/50 bg-[#5865F2]/10 text-white' :
                  'border-white/8 bg-white/3 text-white/40 hover:border-white/15 hover:text-white/60'}`
                  }>
                  
                      <svg viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${discordMode === 'new' ? 'text-[#8b9cf4]' : 'text-white/25'}`}>
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                      </svg>
                      <span className="text-xs font-semibold">{t('account.addModal.discordModeNew')}</span>
                      <span className="text-[10px] text-white/30 text-center leading-tight">{t('account.addModal.discordModeNewHint')}</span>
                    </button>
                    <button
                  type="button"
                  onClick={() => setDiscordMode('link')}
                  disabled={existingAccounts.length === 0}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  discordMode === 'link' ?
                  'border-[#5865F2]/50 bg-[#5865F2]/10 text-white' :
                  'border-white/8 bg-white/3 text-white/40 hover:border-white/15 hover:text-white/60'}`
                  }>
                  
                      <svg viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${discordMode === 'link' ? 'text-[#8b9cf4]' : 'text-white/25'}`}>
                        <path d="M17 7H13V9H17C18.65 9 20 10.35 20 12C20 13.65 18.65 15 17 15H13V17H17C19.76 17 22 14.76 22 12C22 9.24 19.76 7 17 7ZM11 15H7C5.35 15 4 13.65 4 12C4 10.35 5.35 9 7 9H11V7H7C4.24 7 2 9.24 2 12C2 14.76 4.24 17 7 17H11V15ZM8 13H16V11H8V13Z" />
                      </svg>
                      <span className="text-xs font-semibold">{t('account.addModal.discordModeLink')}</span>
                      <span className="text-[10px] text-white/30 text-center leading-tight">{t('account.addModal.discordModeLinkHint')}</span>
                    </button>
                  </div>

                  {error && <ErrorBanner message={error} />}

                  <div className="flex gap-2">
                    <SecondaryButton type="button" onClick={onClose}>{t('account.addModal.cancel')}</SecondaryButton>
                    <button
                  type="button"
                  onClick={startDiscordLink}
                  disabled={!isElectron}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#5865F2] hover:bg-[#4752c4] text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  
                      <DiscordGlyph className="w-4 h-4" />
                      {t('account.addModal.discordAuthBtn')}
                    </button>
                  </div>
                </>
            }

              {discordState === 'waiting' &&
            <WaitingState
              title={t('account.addModal.discordWaiting')}
              description={t('account.addModal.discordWaitingDesc')}
              colorClass="text-[#5865F2]" />

            }

              {discordState === 'linked' && discordProfile &&
            <>
                  {/* Discord profile card */}
                  <div className="rounded-2xl border border-[#5865F2]/25 bg-[#5865F2]/8 p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/20 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {discordProfile.discordAvatarUrl ?
                  <img src={discordProfile.discordAvatarUrl} alt={discordDisplayName} className="w-full h-full object-cover" /> :

                  <DiscordGlyph className="w-5 h-5 text-[#c8ccff]" />
                  }
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{discordDisplayName}</p>
                      <p className="text-xs text-white/45 truncate">{discordTag || 'Discord'}</p>
                    </div>
                    <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                      {t('account.addModal.discordVerified')}
                    </span>
                  </div>

                  {/* Mode: tạo mới */}
                  {discordMode === 'new' &&
              <>
                      <TextField
                  label={t('account.addModal.discordPlayerLabel')}
                  value={discordPlayerName}
                  onChange={setDiscordPlayerName}
                  placeholder={t('account.addModal.usernamePlaceholder')}
                  autoFocus />
                
                      <p className="text-[11px] text-white/25 -mt-2">
                        {t('account.addModal.discordPlayerHint')}
                      </p>
                      <AccountPreview
                  type="discord"
                  uuid={discordPreviewUuid}
                  username={discordPlayerName.trim() || t('account.addModal.noNameYet')}
                  subtitle={`Discord · ${discordPreviewUuid || '—'}`} />
                
                    </>
              }

                  {/* Mode: liên kết với account đã có */}
                  {discordMode === 'link' &&
              <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                          {t('account.addModal.discordLinkLabel')}
                        </label>
                        <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                          {existingAccounts.map((acc) =>
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setLinkTargetId(acc.id)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all ${
                      linkTargetId === acc.id ?
                      'border-[#5865F2]/50 bg-[#5865F2]/10' :
                      'border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5'}`
                      }>
                      
                              <PlayerHead uuid={acc.uuid} username={acc.username} size={28} />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-white/80 truncate">{acc.username}</p>
                                <p className="text-[10px] text-white/30 truncate">
                                  {acc.type === 'microsoft' ? 'Microsoft' : acc.type === 'discord' ? 'Discord' : 'Offline'}
                                  {acc.discordId ? ` · ${t('account.addModal.discordLinked')}` : ''}
                                </p>
                              </div>
                              {linkTargetId === acc.id &&
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#8b9cf4] flex-shrink-0">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                      }
                            </button>
                    )}
                        </div>
                      </div>
                      {linkTargetId &&
                <p className="text-[11px] text-white/30 -mt-1">
                          {t('account.addModal.discordLinkHint', { username: discordProfile.discordUsername })}
                        </p>
                }
                    </>
              }

                  {error && <ErrorBanner message={error} />}

                  <div className="flex gap-2">
                    <SecondaryButton
                  type="button"
                  onClick={() => {
                    setDiscordState('idle');
                    setDiscordProfile(null);
                    setDiscordPlayerName('');
                    setLinkTargetId('');
                    setError('');
                  }}>
                  
                      {t('account.addModal.discordReauth')}
                    </SecondaryButton>
                    <PrimaryButton type="submit" disabled={loading}>
                      {loading ?
                  t('account.addModal.processing') :
                  discordMode === 'link' ? t('account.addModal.discordLinkBtn') : t('account.addModal.discordCreateBtn')
                  }
                    </PrimaryButton>
                  </div>
                </>
            }
            </form>
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
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-green-500/50 focus:bg-white/8 transition-all" />
      
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
      <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-green-400">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="text-xs text-white/35 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onAction}
        className="w-full py-2.5 rounded-xl text-sm font-bold bg-green-500 hover:bg-green-400 text-white transition-all">
        
        {actionLabel}
      </button>
    </div>);

}

function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-green-500 hover:bg-green-400 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed">
      
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

function DiscordGlyph({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.317 4.369A19.791 19.791 0 0015.885 3c-.191.34-.404.798-.553 1.165a18.27 18.27 0 00-5.327 0A12.04 12.04 0 009.45 3a19.736 19.736 0 00-4.434 1.371C2.21 8.622 1.449 12.77 1.822 16.863A19.923 19.923 0 007.245 19.5c.438-.6.83-1.235 1.165-1.905-.63-.238-1.23-.53-1.793-.867.149-.107.294-.221.434-.339 3.46 1.623 7.214 1.623 10.633 0 .142.118.287.232.434.339-.565.339-1.167.63-1.795.867.336.67.728 1.307 1.167 1.905a19.874 19.874 0 005.422-2.638c.438-4.745-.75-8.855-3.595-12.494zM9.16 14.555c-1.036 0-1.886-.95-1.886-2.115 0-1.165.832-2.115 1.886-2.115 1.062 0 1.904.96 1.886 2.115 0 1.165-.832 2.115-1.886 2.115zm5.693 0c-1.036 0-1.886-.95-1.886-2.115 0-1.165.832-2.115 1.886-2.115 1.062 0 1.904.96 1.886 2.115 0 1.165-.824 2.115-1.886 2.115z" />
    </svg>);

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