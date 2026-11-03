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

import { useState, useEffect } from 'react';
import { useAccounts } from '../../hooks/useAccounts';
import { useToast } from '../../hooks/useToast';
import { useLang } from '../../i18n/LangProvider';
import AddAccountModal from './AddAccountModal';
import CyoriaIdentityPanel from './CyoriaIdentityPanel';
import SkinCustomizeModal from './SkinCustomizeModal';
import AccountSettingsPanel from './AccountSettingsPanel';
import PlayerHead from '../ui/PlayerHead';
import PlayerModel3D from '../ui/PlayerModel3D';import LocalizedText from "../../i18n/LocalizedText.jsx";

function AccountTypeTag({ type }) {
  const { t } = useLang();
  if (type === 'offline') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/8 text-white/35">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 flex-shrink-0">
          <path d="M20 18h-2V7c0-2.76-2.24-5-5-5S8 4.24 8 7v11H6v2h14v-2zM10 7c0-1.66 1.34-3 3-3s3 1.34 3 3v11h-6V7zm3 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
        </svg><LocalizedText id="auto.a16ca65cbaae" />

      </span>);

  }
  if (type === 'discord') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 flex-shrink-0">
          <path d="M20.317 4.369A19.791 19.791 0 0015.885 3c-.191.34-.404.798-.553 1.165a18.27 18.27 0 00-5.327 0A12.04 12.04 0 009.45 3a19.736 19.736 0 00-4.434 1.371C2.21 8.622 1.449 12.77 1.822 16.863A19.923 19.923 0 007.245 19.5c.438-.6.83-1.235 1.165-1.905-.63-.238-1.23-.53-1.793-.867.149-.107.294-.221.434-.339 3.46 1.623 7.214 1.623 10.633 0 .142.118.287.232.434.339-.565.339-1.167.63-1.795.867.336.67.728 1.307 1.167 1.905a19.874 19.874 0 005.422-2.638c.438-4.745-.75-8.855-3.595-12.494zM9.16 14.555c-1.036 0-1.886-.95-1.886-2.115 0-1.165.832-2.115 1.886-2.115 1.062 0 1.904.96 1.886 2.115 0 1.165-.832 2.115-1.886 2.115zm5.693 0c-1.036 0-1.886-.95-1.886-2.115 0-1.165.832-2.115 1.886-2.115 1.062 0 1.904.96 1.886 2.115 0 1.165-.824 2.115-1.886 2.115z" />
        </svg><LocalizedText id="auto.abd181beb628" />

      </span>);

  }

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
      <svg viewBox="0 0 21 21" className="w-2.5 h-2.5 flex-shrink-0">
        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
      </svg><LocalizedText id="auto.0530ec12626c" />

      <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 flex-shrink-0 text-blue-300">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5z" />
      </svg>
    </span>);

}

function AccountRow({ account, isSelected, onSelect, onRemove, confirmId, onOpenSettings }) {const { t } = useLang();
  return (
    <div
      onClick={() => onSelect(account.id)}
      className={`
        group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
        transition-all duration-150
        ${isSelected ?
      'bg-sky-500/12 border border-sky-500/25' :
      'border border-transparent hover:bg-white/4 hover:border-white/8'}
      `
      }>
      
      {}
      <div className={`rounded-lg overflow-hidden flex-shrink-0 ${isSelected ? 'ring-1 ring-sky-500/50' : ''}`}>
        <PlayerHead uuid={account.uuid} username={account.username} size={36} />
      </div>

      {}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-white/65'}`}>
            {account.username}
          </span>
          <AccountTypeTag type={account.type} />
          {/* Badge Discord liên kết — hiển thị khi account offline/discord đã có discordId */}
          {account.discordId && account.type !== 'discord' &&
          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[#5865F2]/20 text-[#8b9cf4] border border-[#5865F2]/25 flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-2 h-2">
                <path d="M20.317 4.369A19.791 19.791 0 0015.885 3c-.191.34-.404.798-.553 1.165a18.27 18.27 0 00-5.327 0A12.04 12.04 0 009.45 3a19.736 19.736 0 00-4.434 1.371C2.21 8.622 1.449 12.77 1.822 16.863A19.923 19.923 0 007.245 19.5c.438-.6.83-1.235 1.165-1.905-.63-.238-1.23-.53-1.793-.867.149-.107.294-.221.434-.339 3.46 1.623 7.214 1.623 10.633 0 .142.118.287.232.434.339-.565.339-1.167.63-1.795.867.336.67.728 1.307 1.167 1.905a19.874 19.874 0 005.422-2.638c.438-4.745-.75-8.855-3.595-12.494zM9.16 14.555c-1.036 0-1.886-.95-1.886-2.115 0-1.165.832-2.115 1.886-2.115 1.062 0 1.904.96 1.886 2.115 0 1.165-.832 2.115-1.886 2.115zm5.693 0c-1.036 0-1.886-.95-1.886-2.115 0-1.165.832-2.115 1.886-2.115 1.062 0 1.904.96 1.886 2.115 0 1.165-.824 2.115-1.886 2.115z" />
              </svg><LocalizedText id="auto.e5a3cbc1d7bc" />

          </span>
          }
        </div>
        <p className="text-[10px] text-white/25 truncate font-mono">
          {account.uuid.slice(0, 8)}···
        </p>
      </div>

      {}
      {isSelected &&
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-sky-400 flex-shrink-0">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      }

      {/* Nút settings — chỉ offline/discord, hiện khi hover */}
      {account.type !== 'microsoft' && confirmId !== account.id &&
      <button
        onClick={(e) => {e.stopPropagation();onOpenSettings(account);}}
        className="
            absolute right-8 top-1/2 -translate-y-1/2
            w-6 h-6 flex items-center justify-center rounded-md
            opacity-0 group-hover:opacity-100
            text-white/25 hover:text-sky-400 hover:bg-sky-500/10
            transition-all duration-150
          "












        title={t("auto.e479c449bfd0")}>
        
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      }

      {}
      {confirmId !== account.id &&
      <button
        onClick={(e) => {e.stopPropagation();onRemove(account.id);}}
        className="
            absolute right-2 top-1/2 -translate-y-1/2
            w-6 h-6 flex items-center justify-center rounded-md
            opacity-0 group-hover:opacity-100
            text-white/25 hover:text-red-400 hover:bg-red-500/10
            transition-all duration-150
          "












        title={t("auto.3ef63397bffa")}>
        
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
      }
    </div>);

}

export default function AccountPage() {
  const { accounts, selectedId, loading, addAccount, updateAccount, removeAccount, selectAccount } = useAccounts();
  const toast = useToast();
  const { t } = useLang();
  const [showModal, setShowModal] = useState(false);
  const [showSkinModal, setShowSkinModal] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(null);
  const [slim, setSlim] = useState(false);
  const [showUuid, setShowUuid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [skinSubTab, setSkinSubTab] = useState('skin');
  const [appliedSkinUrl, setAppliedSkinUrl] = useState(null);
  const [settingsAccount, setSettingsAccount] = useState(null); // account đang mở settings
  const isElectronCtx = typeof window !== 'undefined' && window.electronAPI;

  const selected = accounts.find((a) => a.id === selectedId) ?? accounts[0] ?? null;

  const isElectron = typeof window !== 'undefined' && window.electronAPI;
  useEffect(() => {
    if (!selected?.uuid) {setAppliedSkinUrl(null);return;}
    const load = async () => {
      try {
        // Prefer account skin and local preferences without querying another launcher's account API.
        const webSkin = selected.webSkinUrl || null;
        const prefs = isElectron ?
        await window.electronAPI.getSkinPrefs({ uuid: selected.uuid }) :
        JSON.parse(localStorage.getItem(`vxc_skin_prefs_${selected.uuid}`) || 'null');
        const localSkin = prefs?.skinUrl;
        const finalSkin = webSkin || (localSkin && !localSkin.startsWith('blob:') ? localSkin : null);
        setAppliedSkinUrl(finalSkin || null);
      } catch {setAppliedSkinUrl(null);}
    };
    load();
  }, [selected?.uuid]);

  useEffect(() => { setShowUuid(false) }, [selectedId])

  function handleCopyUuid() {
    if (!selected?.uuid) return;
    navigator.clipboard.writeText(selected.uuid).then(() => {
      setCopied(true);
      toast({ type: 'success', title: t('account.page.copiedUuid'), message: selected.uuid.slice(0, 18) + '...' });
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleRemove(id) {
    if (removeConfirm === id) {
      const acc = accounts.find((a) => a.id === id);
      await removeAccount(id);
      setRemoveConfirm(null);
      toast({ type: 'info', title: t('account.page.toastRemoved'), message: acc?.username });
    } else {
      setRemoveConfirm(id);
      setTimeout(() => setRemoveConfirm((prev) => prev === id ? null : prev), 3000);
    }
  }

  async function handleSelect(id) {
    if (id === selectedId) return;
    await selectAccount(id);
    const acc = accounts.find((a) => a.id === id);
    toast({ type: 'success', title: t('account.page.toastSelected'), message: acc?.username });
  }

  async function handleAdd(account) {
    const result = await addAccount(account);
    if (!result?.error) {
      toast({ type: 'success', title: t('account.page.toastAdded'), message: account.username });
    }
    return result;
  }

  async function handleLinkDiscord(accountId, discordProfile) {
    const result = await updateAccount(accountId, {
      discordId: discordProfile.discordId,
      discordUsername: discordProfile.discordUsername,
      discordGlobalName: discordProfile.discordGlobalName,
      discordDiscriminator: discordProfile.discordDiscriminator,
      discordAvatarUrl: discordProfile.discordAvatarUrl,
      linkedAt: new Date().toISOString()
    });
    if (!result?.error) {
      toast({ type: 'success', title: t('account.page.toastLinkedDiscord'), message: discordProfile.discordUsername });
    }
    return result;
  }

  async function handleSelectSkinFromGrid(item) {
    if (item.isDefault) {

      const newPrefs = {
        uuid: selected?.uuid,
        skinUrl: null,
        capeUrl: null,
        elytraUrl: null
      };
      try {
        if (isElectronCtx) {
          await window.electronAPI.saveSkinPrefs(newPrefs);
        } else {
          localStorage.setItem(`vxc_skin_prefs_${selected?.uuid}`, JSON.stringify(newPrefs));
        }
      } catch {}
      setAppliedSkinUrl(null);
      setSlim(false);
      toast({ type: 'success', title: t('account.page.toastApplied'), message: t('account.page.skinDefault') });
    } else {

      setAppliedSkinUrl(item.url);
      toast({ type: 'success', title: t('account.page.toastApplied'), message: t('account.page.skinCustom') });
    }
  }

  return (
    <div className="flex w-full min-h-0 flex-1 overflow-hidden">

      {/* Cyoria identity never replaces the selected Minecraft account. */}
      <div className="hidden" aria-hidden="true" />
      {/* Nếu đang mở settings — hiển thị AccountSettingsPanel thay thế toàn bộ left panel */}
      {settingsAccount ?
      <div className="relative flex-1 min-w-0 border-r border-white/5">
          <div className="absolute inset-0 flex flex-col overflow-hidden">
            <AccountSettingsPanel
            account={accounts.find(a => a.id === settingsAccount.id) || settingsAccount}
            onBack={() => setSettingsAccount(null)} />
          
          </div>
        </div> :

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden border-r border-white/5">
        <CyoriaIdentityPanel />

        {}
        <div className="flex flex-col" style={{ maxHeight: '55%', minHeight: 180 }}>
          {}
          <div className="flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-4">
            <div>
              <h1 className="text-lg font-bold text-white">{t('account.page.title')}</h1>
              <p className="text-xs text-white/30 mt-0.5">{t('account.page.subtitle')}</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="
                flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold
                transition-all duration-150 active:scale-95 shadow-lg shadow-sky-500/20
              ">



              




              
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              {t('account.page.addAccount')}
            </button>
          </div>

          {}
          <div className="flex-1 overflow-y-auto px-4 pb-3" style={{ scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            {loading ?
            <div className="flex items-center justify-center h-24">
                <svg className="animate-spin w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div> :
            accounts.length === 0 ?
            <div className="flex flex-col items-center justify-center h-32 text-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white/15">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-white/30 font-medium">{t('account.page.noAccounts')}</p>
                  <p className="text-xs text-white/15 mt-0.5">{t('account.page.noAccountsHint')}</p>
                </div>
                <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-xl bg-sky-500/15 text-sky-400 text-xs font-semibold border border-sky-500/20 hover:bg-sky-500/25 transition-all">
                
                  {t('account.page.addFirst')}
                </button>
              </div> :

            <div className="flex flex-col gap-1">
                {accounts.map((account) =>
              <div key={account.id} className="relative">
                    <AccountRow
                  account={account}
                  isSelected={account.id === selectedId}
                  onSelect={handleSelect}
                  onRemove={handleRemove}
                  confirmId={removeConfirm}
                  onOpenSettings={setSettingsAccount} />
                
                    {removeConfirm === account.id &&
                <div className="absolute inset-0 rounded-xl bg-[#0a0c0f]/95 border border-red-500/25 flex items-center justify-center gap-2 z-10 px-3">
                        <span className="text-xs text-white/60 flex-1">{t('account.page.deleteConfirm')}</span>
                        <button onClick={() => handleRemove(account.id)}
                  className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition-all">{t('account.page.delete')}</button>
                        <button onClick={() => setRemoveConfirm(null)}
                  className="px-2.5 py-1 rounded-lg bg-white/8 hover:bg-white/12 text-white/50 text-xs transition-all">{t('account.page.cancel')}</button>
                      </div>
                }
                  </div>
              )}
                <p className="text-[10px] text-white/15 mt-2 px-1">
                  {t('account.page.accountCount', { count: accounts.length })}
                </p>
              </div>
            }
          </div>
        </div>

        {}
        <div className="flex-shrink-0 h-px bg-white/5 mx-4" />

        {}
        <div className="flex flex-col flex-1 overflow-hidden">
          {}
          <div className="flex-shrink-0 flex items-center justify-between px-4 pt-3 pb-2">
            <div className="flex gap-0 border-b border-white/5 flex-1">
              {[
              { id: 'skin', label: 'Skin' },
              { id: 'cape', label: 'Cape' },
              { id: 'elytra', label: 'Elytra' }].
              map((tab) =>
              <button key={tab.id} onClick={() => setSkinSubTab(tab.id)}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all -mb-px ${
              skinSubTab === tab.id ?
              'border-sky-500 text-sky-400' :
              'border-transparent text-white/30 hover:text-white/60'}`
              }>
                  {tab.label}
                </button>
              )}
            </div>
            {}
            <button
              onClick={() => setShowSkinModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/50 hover:text-white hover:bg-white/8 border border-white/8 transition-all ml-2 flex-shrink-0">
              
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t('account.page.customize')}
            </button>
          </div>

          {}
          <div className="flex-1 overflow-y-auto px-4 pb-4" style={{ scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
              {(() => {

              const defaultSkinUrl = selected?.username ? `https://minotar.net/skin/${selected.username}` : null;

              const savedItems = [];

              if (skinSubTab === 'skin' && defaultSkinUrl) {
                savedItems.push({
                  url: defaultSkinUrl,
                  label: t('account.page.skinDefault'),
                  active: !appliedSkinUrl,
                  isDefault: true
                });
              }

              if (skinSubTab === 'skin' && appliedSkinUrl) {
                savedItems.push({ url: appliedSkinUrl, label: t('account.page.skinCustom'), active: true, isDefault: false });
              }

              if (savedItems.length === 0) {
                const noneKey = skinSubTab === 'skin' ? 'account.page.skinNone' :
                skinSubTab === 'cape' ? 'account.page.capeNone' :
                'account.page.elytraNone';
                const chooseKey = skinSubTab === 'skin' ? 'account.page.chooseSkin' :
                skinSubTab === 'cape' ? 'account.page.chooseCape' :
                'account.page.chooseElytra';
                return (
                  <div className="flex flex-col items-center justify-center h-24 gap-2">
                      <p className="text-xs text-white/20">
                        {t(noneKey)}
                      </p>
                      <button onClick={() => setShowSkinModal(true)}
                    className="text-xs text-sky-400/60 hover:text-sky-400 transition-colors">
                        {t(chooseKey)}
                      </button>
                    </div>);

              }
              return (
                <div className="grid grid-cols-3 gap-2">
                    {savedItems.map((item, i) =>
                  <div key={i}
                  onClick={() => handleSelectSkinFromGrid(item)}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all cursor-pointer group relative"
                  style={{
                    background: item.active ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${item.active ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.07)'}`
                  }}>
                    
                        {item.active &&
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-sky-400" />
                    }
                        <img src={item.url} alt={item.label}
                    className="w-10 h-10 rounded-lg object-contain"
                    style={{ imageRendering: 'pixelated', background: 'rgba(255,255,255,0.05)' }}
                    onError={(e) => {e.currentTarget.style.display = 'none';}} />
                        <span className="text-[9px] text-white/40 truncate w-full text-center">{item.label}</span>
                        {!item.active &&
                    <span className="text-[9px] text-sky-400/50 group-hover:text-sky-400 transition-colors opacity-0 group-hover:opacity-100">
                            {t('account.page.skinApply')}
                          </span>
                    }
                        {item.active &&
                    <span className="text-[9px] text-sky-400/60">{t('account.page.skinActive')}</span>
                    }
                      </div>
                  )}
                  </div>);

            })()}
            </div>
        </div>
      </div>
      }

      {/* Right: 3D model panel */}
      <div
        className="flex-shrink-0 flex flex-col relative overflow-hidden"
        style={{ width: 240, minWidth: 200, maxWidth: 260 }}>
        
        {}
        <div className="absolute inset-0 bg-gradient-to-br from-[#090d11] via-[#0b0f12] to-[#05080c]">
          {}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(74,222,128,0.4) 1px, transparent 1px),
                linear-gradient(90deg, rgba(74,222,128,0.4) 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px'
            }} />
          
          {}
          <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {selected ?
        <>
            {}
            <div className="relative z-10 w-full flex-1 min-h-0">
              <PlayerModel3D
              uuid={selected.uuid}
              username={selected.username}
              slim={slim}
              customSkinUrl={appliedSkinUrl} />
            
            </div>

            {}
            <div className="relative z-10 text-center px-4 py-3 flex-shrink-0 border-t border-white/5">
              <p className="text-sm font-bold text-white truncate">{selected.username}</p>

              {}
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <p className="text-[10px] text-white/30 font-mono truncate max-w-[120px]">
                  {showUuid ?
                selected.uuid :
                selected.uuid.slice(0, 8) + '···'
                }
                </p>
                {}
                <button
                onClick={() => setShowUuid((v) => !v)}
                className="text-white/20 hover:text-white/60 transition-colors flex-shrink-0"
                title={showUuid ? t('account.page.hideUuid') : t('account.page.showUuid')}>
                
                  {showUuid ?
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                    </svg> :

                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                }
                </button>
                {}
                <button
                onClick={handleCopyUuid}
                className="text-white/20 hover:text-white/60 transition-colors flex-shrink-0"
                title={t('account.page.copyUuid')}>
                
                  {copied ?
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-sky-400">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg> :

                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                    </svg>
                }
                </button>
              </div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <AccountTypeTag type={selected.type} />
                {}
                <button
                onClick={() => setSlim((v) => !v)}
                className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/30 hover:text-white/60 hover:border-white/20 transition-all">
                
                  {slim ? t('account.page.slim') : t('account.page.wide')}
                </button>
              </div>
            </div>
          </> :

        <div className="relative z-10 flex flex-col items-center justify-center flex-1 gap-3 text-center px-6">
            <div className="w-16 h-28 rounded-xl bg-white/4 border border-white/5 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white/10">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <p className="text-xs text-white/20">{t('account.page.selectToViewSkin')}</p>
          </div>
        }
      </div>

      {}
      {showModal &&
      <AddAccountModal
        onClose={() => setShowModal(false)}
        onAdd={handleAdd}
        onLinkDiscord={handleLinkDiscord}
        existingAccounts={accounts} />

      }

      {}
      {showSkinModal &&
      <SkinCustomizeModal
        account={selected}
        onClose={() => setShowSkinModal(false)}
        onApply={({ type, url, skinType }) => {
          if (type === 'skin') {
            setAppliedSkinUrl(url);
            setSlim(skinType === 'slim');
          }
          toast({ type: 'success', title: t('account.page.toastApplied'), message: t('account.page.toastAppliedNew', { type }) });
        }} />

      }
    </div>);

}