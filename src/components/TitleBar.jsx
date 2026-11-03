import { useLang } from "../i18n/LangProvider.jsx"; /**
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

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccounts } from '../hooks/useAccounts';
import PlayerHead from './ui/PlayerHead';
import coinIcon from '../assets/item/coin.png';import LocalizedText from "../i18n/LocalizedText.jsx";

const isElectron = typeof window !== 'undefined' && window.electronAPI;
// VoxelX friends/coin endpoints are disabled. Never send Cyoria UUIDs there.
const LEGACY_FRIENDS_ENABLED = false;

function InstanceModal({ instances, onKill, onClose }) {const { t } = useLang();
  const runningInstances = instances.filter((i) => i.state === 'running' || i.state === 'downloading');

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-12"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      
      {}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {}
      <div className="relative z-10 w-[420px] bg-[#0a0c0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white"><LocalizedText id="auto.d2bf46c83416" /></h3>
            <span className="text-xs text-white/30 bg-white/8 px-1.5 py-0.5 rounded-md font-mono">
              {runningInstances.length}
            </span>
          </div>
          <button onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-md text-white/30 hover:text-white/70 hover:bg-white/8 transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {}
        <div className="px-3 py-3 flex flex-col gap-2 max-h-80 overflow-y-auto">
          {instances.length === 0 ?
          <p className="text-xs text-white/25 text-center py-6"><LocalizedText id="auto.64afc688c4db" /></p> :

          instances.map((inst) => {
            const isRunning = inst.state === 'running';
            const isLoading = inst.state === 'downloading';
            const isStopped = inst.state === 'stopped';
            const isError = inst.state === 'error';

            return (
              <div key={inst.key}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/4 border border-white/5">
                  {}
                  <div className="flex-shrink-0">
                    {isRunning && <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse block" />}
                    {isLoading &&
                  <svg className="animate-spin w-2.5 h-2.5 text-yellow-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                  }
                    {isStopped && <span className="w-2.5 h-2.5 rounded-full bg-white/20 block" />}
                    {isError && <span className="w-2.5 h-2.5 rounded-full bg-red-400 block" />}
                  </div>

                  {}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{inst.profileName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-white/35">@{inst.accountName}</span>
                      <span className="text-[10px] text-white/20">·</span>
                      <span className={`text-[10px] font-semibold ${
                    isRunning ? 'text-sky-400' :
                    isLoading ? 'text-yellow-400' :
                    isStopped ? 'text-white/30' : 'text-red-400'}`
                    }>
                        {isRunning ? 'Running' : isLoading ? 'Loading...' : isStopped ? 'Stopped' : 'Error'}
                      </span>
                      {isLoading && inst.progress?.percent > 0 &&
                    <span className="text-[10px] text-white/25 font-mono">{inst.progress.percent}%</span>
                    }
                    </div>
                  </div>

                  {}
                  {(isRunning || isLoading) &&
                <button
                  onClick={() => onKill(inst.key)}
                  className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400 text-xs font-semibold hover:bg-red-500/25 transition-all active:scale-95"
                  title={t("auto.ce061c1abb57")}>
                  
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg><LocalizedText id="auto.948258c2c35a" />

                </button>
                }
                </div>);

          })
          }
        </div>
      </div>
    </div>);

}

export default function TitleBar({ instances = [], onKillInstance }) {const { t } = useLang();
  const [showModal, setShowModal] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pending, setPending] = useState([]);
  const [coins, setCoins] = useState(0);
  const notifRef = useRef(null);
  const { selectedAccount } = useAccounts();
  const myUuid = selectedAccount?.uuid;

  // Load pending friend requests
  const loadPending = useCallback(async () => {
    if (!myUuid || !LEGACY_FRIENDS_ENABLED) return;
    try {
      const r = await fetch(`/disabled-legacy-friends?action=pending&uuid=${myUuid}`).then((r) => r.json());
      if (r.ok) setPending(r.pending || []);
    } catch {}
  }, [myUuid]);

  // Load coins
  const loadCoins = useCallback(async () => {
    if (!myUuid || !LEGACY_FRIENDS_ENABLED) return;
    try {
      const r = await fetch(`/disabled-legacy-friends?action=get-coins&uuid=${myUuid}`).then((r) => r.json());
      if (r.ok) setCoins(r.coins ?? 0);
    } catch {}
  }, [myUuid]);

  useEffect(() => {loadPending();loadCoins();}, [loadPending, loadCoins]);
  useEffect(() => {
    if (!myUuid) return;
    const iv = setInterval(() => {loadPending();loadCoins();}, 15000);
    return () => clearInterval(iv);
  }, [myUuid, loadPending, loadCoins]);

  // Close notif on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    if (notifOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [notifOpen]);

  async function handleAccept(fromUuid) {
    if (!LEGACY_FRIENDS_ENABLED) return;
    await fetch(`/disabled-legacy-friends?action=accept`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uuid: myUuid, fromUuid }) });
    setPending((p) => p.filter((r) => r.fromUuid !== fromUuid));
  }
  async function handleReject(fromUuid) {
    if (!LEGACY_FRIENDS_ENABLED) return;
    await fetch(`/disabled-legacy-friends?action=reject`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uuid: myUuid, fromUuid }) });
    setPending((p) => p.filter((r) => r.fromUuid !== fromUuid));
  }

  const handleMinimize = () => isElectron && window.electronAPI.minimizeWindow();
  const handleMaximize = () => isElectron && window.electronAPI.maximizeWindow();
  const handleClose = () => isElectron && window.electronAPI.closeWindow();

  const runningCount = instances.filter((i) => i.state === 'running' || i.state === 'downloading').length;

  return (
    <>
      <div className="drag-region flex items-center justify-between h-9 px-4 bg-black/40 backdrop-blur-sm border-b border-white/5 absolute top-0 left-0 right-0 z-50">
        {}
        <div className="flex items-center gap-2 no-drag">
          <div className="w-5 h-5">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <rect x="2" y="2" width="9" height="9" fill="#38bdf8" rx="1" />
              <rect x="13" y="2" width="9" height="9" fill="#0284c7" rx="1" />
              <rect x="2" y="13" width="9" height="9" fill="#0284c7" rx="1" />
              <rect x="13" y="13" width="9" height="9" fill="#38bdf8" rx="1" />
            </svg>
          </div>
          <span className="text-ms font-black text-white tracking-tight"><LocalizedText id="auto.cc9158295047" />
            <span className="text-sky-400"><LocalizedText id="auto.af9ff7c85ae4" /></span>
          </span>
        </div>

        {}
        <div className="absolute left-1/2 -translate-x-1/2 no-drag">
          {runningCount > 0 ?
          <button
            onClick={() => setShowModal((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/25 text-sky-400 text-xs font-semibold hover:bg-sky-500/22 transition-all active:scale-95">
            
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              {runningCount}<LocalizedText id="auto.80cd0d64902f" />{runningCount > 1 ? 's' : ''}<LocalizedText id="auto.6eea89b31b78" />
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-sky-400/60">
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button> :
          instances.length > 0 ?
          <button
            onClick={() => setShowModal((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/30 text-xs hover:bg-white/8 transition-all">
            
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              {instances.length}<LocalizedText id="auto.80cd0d64902f" />{instances.length > 1 ? 's' : ''}
            </button> :
          null}
        </div>

        {}
        <div className="no-drag flex items-center gap-1">
          {/* Coin display */}
          {myUuid &&
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/15 mr-1">
              <img src={coinIcon} alt={t("auto.d1546d52e280")} className="w-4 h-4" style={{ imageRendering: 'pixelated' }} />
              <span className="text-xs font-bold text-yellow-400">{coins.toLocaleString()}</span>
            </div>
          }

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className={`w-8 h-7 flex items-center justify-center rounded transition-colors relative ${notifOpen ? 'bg-white/10 text-white/90' : 'hover:bg-white/10 text-white/50 hover:text-white/90'}`}
              title={t("auto.12217c97883c")}>
              
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
              {/* Badge dot */}
              {pending.length > 0 &&
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border border-black/50" />
              }
            </button>

            {/* Dropdown notifications */}
            {notifOpen &&
            <div className="absolute right-0 top-full mt-1 w-72 bg-[#0a0c0f] border border-white/10 rounded-xl shadow-2xl z-[999] overflow-hidden">
                <div className="px-3 py-2.5 border-b border-white/5 flex items-center justify-between">
                  <p className="text-xs font-bold text-white/60"><LocalizedText id="auto.06ab1e9005ba" /></p>
                  {pending.length > 0 &&
                <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold">{pending.length}</span>
                }
                </div>
                <div className="max-h-72 overflow-y-auto" style={{ scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
                  {pending.length === 0 ?
                <div className="px-4 py-6 text-center">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white/10 mx-auto mb-2">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                      </svg>
                      <p className="text-[11px] text-white/25"><LocalizedText id="auto.4edd2e2eb631" /></p>
                    </div> :

                pending.map((req) =>
                <div key={req.fromUuid} className="flex items-center gap-2.5 px-3 py-2.5 border-b border-white/5 last:border-b-0 hover:bg-white/3 transition-all">
                        <PlayerHead uuid={req.fromUuid} username={req.username} size={28} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white/70 truncate">{req.username}</p>
                          <p className="text-[10px] text-white/30"><LocalizedText id="auto.21be6555c6e6" /></p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => handleAccept(req.fromUuid)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg bg-sky-500/15 text-sky-400 hover:bg-sky-500/30 transition-all" title={t("auto.b07ec843a128")}>
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                          </button>
                          <button onClick={() => handleReject(req.fromUuid)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg bg-white/5 text-white/30 hover:bg-red-500/15 hover:text-red-400 transition-all" title={t("auto.a8ad8858b2f2")}>
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                          </button>
                        </div>
                      </div>
                )
                }
                </div>
              </div>
            }
          </div>

          <button onClick={handleMinimize}
          className="w-8 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-white/50 hover:text-white/90"
          title={t("auto.e40f1ae1ae55")}>
            <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor"><rect width="10" height="1" /></svg>
          </button>
          <button onClick={handleMaximize}
          className="w-8 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-white/50 hover:text-white/90"
          title={t("auto.a6e915f4b9ee")}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="0.5" y="0.5" width="9" height="9" />
            </svg>
          </button>
          <button onClick={handleClose}
          className="w-8 h-7 flex items-center justify-center rounded hover:bg-red-500/80 transition-colors text-white/50 hover:text-white"
          title={t("auto.b84fe7405e34")}>
            <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.5">
              <line x1="0" y1="0" x2="10" y2="10" />
              <line x1="10" y1="0" x2="0" y2="10" />
            </svg>
          </button>
        </div>
      </div>

      {}
      {showModal &&
      <InstanceModal
        instances={instances}
        onKill={(key) => {onKillInstance?.(key);}}
        onClose={() => setShowModal(false)} />

      }
    </>);

}