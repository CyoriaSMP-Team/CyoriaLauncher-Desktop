/**
* VoxelXLauncher — Account Settings Panel
* Hiển thị cài đặt tài khoản cho offline/discord accounts
* Kết nối với web API để đồng bộ dữ liệu
*/

import { useState, useEffect } from 'react';
import { useLang } from '../../i18n/LangProvider';
import { useAccounts } from '../../hooks/useAccounts';
import { useToast } from '../../hooks/useToast';
import PlayerHead from '../ui/PlayerHead';import LocalizedText from "../../i18n/LocalizedText.jsx";
const WEB_API = 'https://www.voxelx.io.vn/api/auth';
const TOKEN_KEY = 'vxc_auth_token';

function getWebToken() {
  try {return localStorage.getItem(TOKEN_KEY);} catch {return null;}
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, icon, children }) {
  return (
    <div className="rounded-xl border border-white/6">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5"
      style={{ background: 'rgba(255,255,255,0.02)' }}>
        {icon && <span className="text-white/40">{icon}</span>}
        <span className="text-xs font-semibold uppercase tracking-wider text-white/40">{title}</span>
      </div>
      <div className="px-4 py-4 flex flex-col gap-3" style={{ background: 'rgba(255,255,255,0.01)' }}>
        {children}
      </div>
    </div>);

}

// ── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/35">{label}</span>
      <span className={`text-xs ${mono ? 'font-mono text-white/50' : 'text-white/65'}`}>{value || '—'}</span>
    </div>);

}

// ── Input field ───────────────────────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, placeholder, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-green-500/40 transition-all" />
      
      {hint && <p className="text-[10px] text-white/25">{hint}</p>}
    </div>);

}

// ── Password strength ─────────────────────────────────────────────────────────
function pwdStrength(p) {
  if (!p) return { score: 0, label: '', color: '' };
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  const map = [
  { label: 'Rất yếu', color: '#f87171' },
  { label: 'Rất yếu', color: '#f87171' },
  { label: 'Yếu', color: '#fb923c' },
  { label: 'Trung bình', color: '#fbbf24' },
  { label: 'Mạnh', color: '#4ade80' },
  { label: 'Rất mạnh', color: '#22c55e' }];

  return { score: s, ...map[s] };
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AccountSettingsPanel({ account, onBack }) {
  const { t } = useLang();
  const { updateAccount } = useAccounts();
  const toast = useToast();

  // Web account data (synced from API)
  const [webUser, setWebUser] = useState(null);
  const [webLoading, setWebLoading] = useState(false);
  const [webError, setWebError] = useState(null);
  // true chỉ khi token trong localStorage thuộc về account đang xem
  const [tokenBelongsToThis, setTokenBelongsToThis] = useState(false);

  // Change password
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);

  // Link email (for app accounts without email)
  const [linkEmail, setLinkEmail] = useState('');
  const [linkPwd, setLinkPwd] = useState('');
  const [linkPwd2, setLinkPwd2] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkMsg, setLinkMsg] = useState(null);

  // Discord
  const [discordLoading, setDiscordLoading] = useState(false);

  const strength = pwdStrength(newPwd);
  const isElectron = typeof window !== 'undefined' && window.electronAPI;

  // Fetch web account info
  useEffect(() => {
    const token = getWebToken();

    // Luôn thử lookup-by-uuid trước để lấy email/verified của đúng account này
    if (account.uuid) {
      setWebLoading(true);
      fetch(`${WEB_API}?action=lookup-by-uuid&uuid=${encodeURIComponent(account.uuid)}`).
      then((r) => r.json()).
      then((data) => {
        if (data.ok) {
          // Nếu account này có email thật → hiển thị
          if (data.email) {
            setWebUser({
              uuid: data.uuid,
              username: data.username,
              email: data.email,
              verified: data.verified,
              hasPassword: data.hasPassword
            });
          } else {
            // Không có email thật → account chưa liên kết
            setWebUser(null);
          }
        } else {
          // Không tìm thấy trên web → account chỉ tồn tại local
          setWebUser(null);
        }
      }).
      catch(() => setWebUser(null)).
      finally(() => setWebLoading(false));
    }

    // Kiểm tra token có thuộc về account này không (để hiện section đổi mật khẩu)
    if (token) {
      fetch(`${WEB_API}?action=me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).
      then((r) => r.json()).
      then((data) => {
        if (data.ok) {
          const webUuid = data.user?.uuid;
          const webUsername = data.user?.username;
          const belongs = webUuid === account.uuid || webUsername === account.username;
          setTokenBelongsToThis(belongs);
        } else {
          setTokenBelongsToThis(false);
        }
      }).
      catch(() => setTokenBelongsToThis(false));
    } else {
      setTokenBelongsToThis(false);
    }
  }, [account.uuid, account.username]);

  // Link email handler
  async function handleLinkEmail(e) {
    e.preventDefault();
    setLinkMsg(null);
    if (linkPwd !== linkPwd2) return setLinkMsg({ type: 'err', text: 'Mật khẩu không khớp' });
    if (linkPwd.length < 8) return setLinkMsg({ type: 'err', text: 'Mật khẩu phải ít nhất 8 ký tự' });
    setLinkLoading(true);
    try {
      const res = await fetch(`${WEB_API}?action=link-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: account.uuid, email: linkEmail, password: linkPwd })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Liên kết thất bại');
      setLinkMsg({ type: 'ok', text: 'Đã liên kết! Kiểm tra email để xác nhận.' });
      setLinkEmail('');setLinkPwd('');setLinkPwd2('');
      toast({ type: 'success', title: 'Liên kết email thành công' });
    } catch (err) {
      setLinkMsg({ type: 'err', text: err.message });
    } finally {
      setLinkLoading(false);
    }
  }

  // Change password handler
  async function handleChangePassword(e) {
    e.preventDefault();
    setPwdMsg(null);
    if (newPwd !== confirmPwd) return setPwdMsg({ type: 'err', text: 'Mật khẩu mới không khớp' });
    if (newPwd.length < 8) return setPwdMsg({ type: 'err', text: 'Mật khẩu phải ít nhất 8 ký tự' });
    const token = getWebToken();
    if (!token) return setPwdMsg({ type: 'err', text: 'Chưa đăng nhập web account' });
    setPwdLoading(true);
    try {
      const res = await fetch(`${WEB_API}?action=change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đổi mật khẩu thất bại');
      setPwdMsg({ type: 'ok', text: 'Mật khẩu đã được cập nhật!' });
      setOldPwd('');setNewPwd('');setConfirmPwd('');
      toast({ type: 'success', title: 'Đổi mật khẩu thành công' });
    } catch (err) {
      setPwdMsg({ type: 'err', text: err.message });
    } finally {
      setPwdLoading(false);
    }
  }

  // Link Discord
  async function handleLinkDiscord() {
    if (!isElectron) return;
    setDiscordLoading(true);
    try {
      const result = await window.electronAPI.discordStartLink();
      if (result?.error) throw new Error(result.error);
      const profile = result?.profile;
      if (!profile?.discordId) throw new Error('Không nhận được dữ liệu Discord');
      await updateAccount(account.id, {
        discordId: profile.discordId,
        discordUsername: profile.discordUsername,
        discordGlobalName: profile.discordGlobalName,
        discordDiscriminator: profile.discordDiscriminator,
        discordAvatarUrl: profile.discordAvatarUrl,
        linkedAt: new Date().toISOString()
      });
      toast({ type: 'success', title: 'Đã liên kết Discord', message: profile.discordUsername });
    } catch (err) {
      toast({ type: 'error', title: 'Liên kết Discord thất bại', message: err.message });
    } finally {
      setDiscordLoading(false);
    }
  }

  // Unlink Discord
  async function handleUnlinkDiscord() {
    await updateAccount(account.id, {
      discordId: null, discordUsername: null, discordGlobalName: null,
      discordDiscriminator: null, discordAvatarUrl: null, linkedAt: null
    });
    toast({ type: 'info', title: 'Đã hủy liên kết Discord' });
  }

  const hasDiscord = !!account.discordId;
  const createdAt = account.createdAt ?
  new Date(account.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) :
  '—';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/5">
        <button
          onClick={onBack}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all flex-shrink-0"
          title={t("auto.4188054297c2")}>
          
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="rounded-lg overflow-hidden flex-shrink-0">
            <PlayerHead uuid={account.uuid} username={account.username} size={28} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{account.username}</p>
            <p className="text-[10px] text-white/30"><LocalizedText id="auto.f67aac22be99" /></p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4"
      style={{ scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        <div className="flex flex-col gap-4">

        {/* ── Thông tin tài khoản ── */}
        <Section title={t("auto.ac3e49481958")} icon={
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          }>
          <InfoRow label={t("auto.0c42e9749ee4")} value={account.username} />
          <InfoRow label={t("auto.d3fa0c8bba5e")} value={account.uuid.slice(0, 8) + '···'} mono />
          <InfoRow label={t("auto.d4340d1ccb22")} value={account.type === 'discord' ? 'Discord' : 'Offline'} />
          <InfoRow label={t("auto.685c2375c889")} value={createdAt} />
          {webLoading &&
            <div className="flex items-center gap-2 text-[10px] text-white/30">
              <div className="w-3 h-3 rounded-full border border-white/20 border-t-transparent animate-spin" /><LocalizedText id="auto.5b69f8638019" />

            </div>
            }
          {webUser &&
            <>
              <div className="h-px bg-white/5 my-1" />
              <p className="text-[10px] text-green-400/60 font-semibold uppercase tracking-wider"><LocalizedText id="auto.bf8f0d249944" /></p>
              <InfoRow label={t("auto.2e66a87e5030")} value={webUser.email} />
              <InfoRow label={t("auto.fabb62efca74")} value={webUser.verified ? '✓ Đã xác nhận' : '⚠ Chưa xác nhận'} />
            </>
            }
        </Section>

        {/* ── Liên kết Email (cho tài khoản app chưa có email) ── */}
        {!webUser && !tokenBelongsToThis &&
          <Section title={t("auto.6a2cef32d49c")} icon={
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          }>
            <p className="text-[11px] text-white/35 leading-relaxed"><LocalizedText id="auto.72ef0e5125a0" />

            </p>
            <form onSubmit={handleLinkEmail} className="flex flex-col gap-2.5 mt-1">
              <Field label={t("auto.2e66a87e5030")} type="email" value={linkEmail} onChange={setLinkEmail} placeholder={t("auto.02e6bd2629b7")} />
              <Field label={t("auto.6da8de944bc8")} type="password" value={linkPwd} onChange={setLinkPwd} placeholder="••••••••" />
              <Field label={t("auto.11eebc54e066")} type="password" value={linkPwd2} onChange={setLinkPwd2} placeholder="••••••••" />
              {linkMsg &&
              <p className={`text-[10px] ${linkMsg.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                  {linkMsg.type === 'ok' ? '✓ ' : '✗ '}{linkMsg.text}
                </p>
              }
              <button type="submit" disabled={linkLoading || !linkEmail || !linkPwd || !linkPwd2}
              className="w-full py-2 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
                {linkLoading ? 'Đang liên kết...' : 'Liên kết Email'}
              </button>
            </form>
          </Section>
          }

        {/* ── Đổi mật khẩu ── */}
        {tokenBelongsToThis &&
          <Section title={t("auto.50722152509d")} icon={
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
          }>
            <form onSubmit={handleChangePassword} className="flex flex-col gap-2.5">
              <Field label={t("auto.499096feb595")} type="password" value={oldPwd} onChange={setOldPwd} placeholder="••••••••" />
              <Field label={t("auto.634be91adafb")} type="password" value={newPwd} onChange={setNewPwd} placeholder="••••••••" />
              {newPwd &&
              <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) =>
                <div key={i} className="h-0.5 flex-1 rounded-full transition-all"
                style={{ background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.1)' }} />
                )}
                </div>
              }
              <Field label={t("auto.079dc60f7b04")} type="password" value={confirmPwd} onChange={setConfirmPwd} placeholder="••••••••" />
              {pwdMsg &&
              <p className={`text-[10px] ${pwdMsg.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                  {pwdMsg.type === 'ok' ? '✓ ' : '✗ '}{pwdMsg.text}
                </p>
              }
              <button type="submit" disabled={pwdLoading || !oldPwd || !newPwd || !confirmPwd}
              className="w-full py-2 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
                {pwdLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>
            </form>
          </Section>
          }

        {/* ── Discord ── */}
        <Section title={t("auto.fc94377733f6")} icon={
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M20.317 4.369A19.791 19.791 0 0015.885 3c-.191.34-.404.798-.553 1.165a18.27 18.27 0 00-5.327 0A12.04 12.04 0 009.45 3a19.736 19.736 0 00-4.434 1.371C2.21 8.622 1.449 12.77 1.822 16.863A19.923 19.923 0 007.245 19.5c.438-.6.83-1.235 1.165-1.905-.63-.238-1.23-.53-1.793-.867.149-.107.294-.221.434-.339 3.46 1.623 7.214 1.623 10.633 0 .142.118.287.232.434.339-.565.339-1.167.63-1.795.867.336.67.728 1.307 1.167 1.905a19.874 19.874 0 005.422-2.638c.438-4.745-.75-8.855-3.595-12.494z" />
          </svg>
          }>
          {hasDiscord ?
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg"
              style={{ background: 'rgba(88,101,242,0.1)', border: '1px solid rgba(88,101,242,0.2)' }}>
                {account.discordAvatarUrl ?
                <img src={account.discordAvatarUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" /> :

                <div className="w-8 h-8 rounded-lg bg-[#5865F2]/20 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#8b9cf4]">
                      <path d="M20.317 4.369A19.791 19.791 0 0015.885 3c-.191.34-.404.798-.553 1.165a18.27 18.27 0 00-5.327 0A12.04 12.04 0 009.45 3a19.736 19.736 0 00-4.434 1.371C2.21 8.622 1.449 12.77 1.822 16.863A19.923 19.923 0 007.245 19.5c.438-.6.83-1.235 1.165-1.905-.63-.238-1.23-.53-1.793-.867.149-.107.294-.221.434-.339 3.46 1.623 7.214 1.623 10.633 0 .142.118.287.232.434.339-.565.339-1.167.63-1.795.867.336.67.728 1.307 1.167 1.905a19.874 19.874 0 005.422-2.638c.438-4.745-.75-8.855-3.595-12.494z" />
                    </svg>
                  </div>
                }
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">
                    {account.discordGlobalName || account.discordUsername}
                  </p>
                  <p className="text-[10px] text-white/40">@{account.discordUsername}</p>
                </div>
                <span className="flex-shrink-0 text-[9px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-full"><LocalizedText id="auto.1021fb509315" />

                </span>
              </div>
              <button onClick={handleUnlinkDiscord}
              className="w-full py-2 rounded-lg text-xs font-semibold text-red-400 transition-all hover:bg-red-500/10"
              style={{ border: '1px solid rgba(248,113,113,0.2)' }}><LocalizedText id="auto.5b8c225a7321" />

              </button>
            </div> :

            <div className="flex flex-col gap-2.5">
              <p className="text-[11px] text-white/30 leading-relaxed"><LocalizedText id="auto.8ab2c6c5d8be" />

              </p>
              <button onClick={handleLinkDiscord} disabled={discordLoading || !isElectron}
              className="w-full py-2 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: '#5865F2' }}>
                {discordLoading ?
                <><div className="w-3 h-3 rounded-full border border-white border-t-transparent animate-spin" /><LocalizedText id="auto.c09478bb5ae8" /></> :
                <>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M20.317 4.369A19.791 19.791 0 0015.885 3c-.191.34-.404.798-.553 1.165a18.27 18.27 0 00-5.327 0A12.04 12.04 0 009.45 3a19.736 19.736 0 00-4.434 1.371C2.21 8.622 1.449 12.77 1.822 16.863A19.923 19.923 0 007.245 19.5c.438-.6.83-1.235 1.165-1.905-.63-.238-1.23-.53-1.793-.867.149-.107.294-.221.434-.339 3.46 1.623 7.214 1.623 10.633 0 .142.118.287.232.434.339-.565.339-1.167.63-1.795.867.336.67.728 1.307 1.167 1.905a19.874 19.874 0 005.422-2.638c.438-4.745-.75-8.855-3.595-12.494z" />
                      </svg><LocalizedText id="auto.f08371fa7e24" />

                </>
                }
              </button>
            </div>
            }
        </Section>

        </div>{/* end inner flex col */}
      </div>{/* end scroll */}
    </div>);

}