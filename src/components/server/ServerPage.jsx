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

import { useState, useEffect, useCallback, useRef } from 'react';
import CreateServerModal from './CreateServerModal';
import ServerConsole from './ServerConsole';
import { useLang } from '../../i18n/LangProvider';

import vanillaIcon from '../../assets/server-icon/vanilla-server.png';
import paperIcon from '../../assets/server-icon/paper-server.png';
import purpurIcon from '../../assets/server-icon/purpur-server.png';
import foliaIcon from '../../assets/server-icon/Folia-server.png';
import fabricIcon from '../../assets/server-icon/fabric-server.png';
import mohistIcon from '../../assets/server-icon/mohist-server.png';
import spongeIcon from '../../assets/server-icon/sponge-server.png';
import arclightIcon from '../../assets/server-icon/Arclight.png';
import magmaIcon from '../../assets/server-icon/Magma.png';import LocalizedText from "../../i18n/LocalizedText.jsx";

const isElectron = typeof window !== 'undefined' && window.electronAPI;

const SERVER_ICONS = {
  vanilla: vanillaIcon, paper: paperIcon, purpur: purpurIcon,
  folia: foliaIcon, fabric: fabricIcon, mohist: mohistIcon,
  sponge: spongeIcon, arclight: arclightIcon, magma: magmaIcon
};

function getGridCols(count) {
  if (count <= 2) return 'grid-cols-2';
  if (count <= 6) return 'grid-cols-3';
  return 'grid-cols-4';
}

function pingColor(ms) {
  if (ms === null) return 'text-white/20';
  if (ms < 50) return 'text-green-400';
  if (ms < 120) return 'text-yellow-400';
  return 'text-red-400';
}

function PingBars({ ms }) {
  const bars = [1, 2, 3, 4];
  const active = ms === null ? 0 : ms < 50 ? 4 : ms < 100 ? 3 : ms < 200 ? 2 : 1;
  const col = ms === null ? 'bg-white/15' : ms < 50 ? 'bg-green-400' : ms < 120 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div className="flex items-end gap-[2px]">
      {bars.map((b, i) =>
      <div key={b} className={`w-[3px] rounded-sm transition-all ${i < active ? col : 'bg-white/15'}`}
      style={{ height: `${5 + i * 3}px` }} />
      )}
    </div>);

}

function StatusBadge({ status }) {
  const cfg = {
    online: { dot: 'bg-green-400 animate-pulse', text: 'text-green-400', label: 'Online' },
    starting: { dot: 'bg-yellow-400 animate-pulse', text: 'text-yellow-400', label: 'Starting' },
    offline: { dot: 'bg-white/20', text: 'text-white/30', label: 'Offline' }
  }[status] || { dot: 'bg-white/20', text: 'text-white/30', label: 'Offline' };
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      <span className={`text-[10px] font-semibold ${cfg.text}`}>{cfg.label}</span>
    </div>);

}

function ServerCardGrid({ server, onClick, onDelete, javaProgress }) {
  const { t } = useLang();
  const icon = SERVER_ICONS[server.type] || vanillaIcon;
  const isDownloadingJava = !!javaProgress;
  const [ping, setPing] = useState(null);
  const pingRef = useRef(null);

  useEffect(() => {
    if (!isElectron || server.status !== 'online') {setPing(null);return;}
    const doPing = async () => {
      try {
        const r = await window.electronAPI.serverPing(server.id);
        setPing(r?.ok ? r.ms : null);
      } catch {setPing(null);}
    };
    doPing();
    pingRef.current = setInterval(doPing, 5000);
    return () => clearInterval(pingRef.current);
  }, [server.id, server.status]);

  const isOnline = server.status === 'online';

  return (
    <div className="relative group">
      <div
        onClick={() => !isDownloadingJava && onClick?.(server)}
        className={`relative rounded-2xl overflow-hidden transition-all duration-200 ${isDownloadingJava ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        onMouseEnter={(e) => {if (!isDownloadingJava) e.currentTarget.style.borderColor = 'rgba(74,222,128,0.35)';}}
        onMouseLeave={(e) => {e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';}}>
        
        {}
        <div className="absolute inset-0">
          <img src={icon} alt="" className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(20px)', opacity: 0.3, transform: 'scale(1.4)' }} />
          <div className="absolute inset-0 bg-[#0a0a0a]/75" />
        </div>

        <div className="relative z-10 p-5 flex flex-col gap-4">
          {}
          <div className="flex items-start justify-between">
            <img src={icon} alt={server.type}
            className="w-16 h-16 rounded-2xl object-contain bg-black/40 ring-1 ring-white/10 p-1.5" />
            <div className="flex flex-col items-end gap-1.5">
              <StatusBadge status={server.status || 'offline'} />
              {isOnline &&
              <div className="flex items-center gap-1.5">
                  <PingBars ms={ping} />
                  <span className={`text-[10px] font-mono font-bold ${pingColor(ping)}`}>
                    {ping !== null ? `${ping}ms` : '—'}
                  </span>
                </div>
              }
            </div>
          </div>

          {}
          <div>
            <p className="text-base font-black text-white/95 truncate leading-tight">{server.name}</p>
            <p className="text-xs text-white/40 capitalize mt-0.5 font-medium">{server.type} · {server.gameVersion}</p>
          </div>

          {}
          {isDownloadingJava ?
          <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-blue-400/80 flex items-center gap-1">
                  <svg className="animate-spin w-2.5 h-2.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {javaProgress.phase === 'extracting' ? t('server.card.extractingJava') : t('server.card.downloadingJava')}
                </span>
                <span className="text-[10px] font-mono text-white/40">{javaProgress.percent ?? 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full transition-all duration-300"
              style={{ width: `${javaProgress.percent ?? 0}%` }} />
              </div>
            </div> :


          <div className="grid grid-cols-3 gap-2">
              <StatChip icon={
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M15 9H9v6h6V9zm-2 4h-2v-2h2v2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7C5.9 5 5 5.9 5 7v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2zm-4 6H7V7h10v10z" /></svg>
            } label={t("auto.591f775411ce")} value={`${server.ramGb}GB`} />
              <StatChip icon={
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" /></svg>
            } label={t("auto.59b266c5934a")} value={`${server.cores ?? 2}`} />
              <StatChip icon={
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
            } label={t("auto.587babcbc554")}
            value={isOnline ? `${server.playerCount ?? 0}/${server.maxPlayers ?? 20}` : '—'}
            highlight={isOnline && (server.playerCount ?? 0) > 0} />
            
            </div>
          }
        </div>
      </div>

      {}
      {!isDownloadingJava &&
      <button
        onClick={(e) => {e.stopPropagation();onDelete(server);}}
        className="absolute bottom-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 text-white/40 hover:text-red-400 hover:bg-red-500/20 transition-all z-20">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
      }
    </div>);

}

function StatChip({ icon, label, value, highlight }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl py-2 px-1"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className={`${highlight ? 'text-green-400' : 'text-white/30'}`}>{icon}</div>
      <span className={`text-[11px] font-bold font-mono ${highlight ? 'text-green-400' : 'text-white/70'}`}>{value}</span>
      <span className="text-[9px] text-white/25 uppercase tracking-wider">{label}</span>
    </div>);

}

function ServerCardList({ server, onClick, onDelete, javaProgress }) {
  const { t } = useLang();
  const icon = SERVER_ICONS[server.type] || vanillaIcon;
  const isDownloadingJava = !!javaProgress;
  const [ping, setPing] = useState(null);
  const pingRef = useRef(null);
  const isOnline = server.status === 'online';

  useEffect(() => {
    if (!isElectron || !isOnline) {setPing(null);return;}
    const doPing = async () => {
      try {
        const r = await window.electronAPI.serverPing(server.id);
        setPing(r?.ok ? r.ms : null);
      } catch {setPing(null);}
    };
    doPing();
    pingRef.current = setInterval(doPing, 5000);
    return () => clearInterval(pingRef.current);
  }, [server.id, isOnline]);

  return (
    <div
      onClick={() => !isDownloadingJava && onClick?.(server)}
      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isDownloadingJava ? 'cursor-not-allowed opacity-80' : 'cursor-pointer group'}`}
      style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
      onMouseEnter={(e) => {if (!isDownloadingJava) {e.currentTarget.style.borderColor = 'rgba(74,222,128,0.25)';e.currentTarget.style.background = 'rgba(74,222,128,0.04)';}}}
      onMouseLeave={(e) => {e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';e.currentTarget.style.background = 'rgba(255,255,255,0.02)';}}>
      
      <img src={icon} alt={server.type} className="w-12 h-12 rounded-xl object-contain bg-black/30 ring-1 ring-white/10 p-1.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white/90 truncate">{server.name}</p>
        {isDownloadingJava ?
        <div className="mt-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-blue-400/80">
                {javaProgress.phase === 'extracting' ? t('server.card.extractingJava') : t('server.card.downloadingJava')}
              </span>
              <span className="text-[10px] font-mono text-white/40">{javaProgress.percent ?? 0}%</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full transition-all duration-300"
            style={{ width: `${javaProgress.percent ?? 0}%` }} />
            </div>
          </div> :

        <p className="text-[11px] text-white/35 capitalize mt-0.5">
            {server.type} · {server.gameVersion} · {server.ramGb}<LocalizedText id="auto.c14b1fb1689d" />{server.cores ?? 2}<LocalizedText id="auto.6349a5002fb6" />
        </p>
        }
      </div>
      {!isDownloadingJava &&
      <div className="flex items-center gap-4 flex-shrink-0">
          {isOnline &&
        <>
              <div className="text-center">
                <p className="text-xs font-bold text-white/70">{server.playerCount ?? 0}<span className="text-white/30">/{server.maxPlayers ?? 20}</span></p>
                <p className="text-[9px] text-white/25 uppercase tracking-wider"><LocalizedText id="auto.182ccc94b70c" /></p>
              </div>
              <div className="flex items-center gap-1.5">
                <PingBars ms={ping} />
                <span className={`text-[10px] font-mono font-bold ${pingColor(ping)}`}>
                  {ping !== null ? `${ping}ms` : '—'}
                </span>
              </div>
            </>
        }
          <StatusBadge status={server.status || 'offline'} />
          <button
          onClick={(e) => {e.stopPropagation();onDelete(server);}}
          className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
          </button>
        </div>
      }
    </div>);

}

export default function ServerPage({ serverJavaProgress = {}, onServerJavaProgress }) {
  const { t } = useLang();
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [showCreate, setShowCreate] = useState(false);
  const [activeServer, setActiveServer] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const javaProgress = serverJavaProgress;
  const setJavaProgress = onServerJavaProgress || (() => {});

  const load = useCallback(async () => {
    if (!isElectron) {setLoading(false);return;}
    setLoading(true);
    try {
      const r = await window.electronAPI.serverList();
      if (r?.ok) setServers(r.servers);
    } catch {} finally
    {setLoading(false);}
  }, []);

  useEffect(() => {load();}, [load]);

  useEffect(() => {
    if (!isElectron) return;
    const unsubStatus = window.electronAPI.onServerStatus((data) => {
      setServers((prev) => prev.map((s) =>
      s.id === data.serverId ? { ...s, status: data.status, running: data.status !== 'offline' } : s
      ));
    });
    const unsubPlayers = window.electronAPI.onServerPlayerCount?.((data) => {
      setServers((prev) => prev.map((s) =>
      s.id === data.serverId ? { ...s, playerCount: data.playerCount, maxPlayers: data.maxPlayers } : s
      ));
    });

    const unsubJava = window.electronAPI.onServerJavaProgress((data) => {
      const { serverId, phase, percent } = data;
      if (phase === 'done' || phase === 'already_installed') {
        setJavaProgress((prev) => {const n = { ...prev };delete n[serverId];return n;});
        load();
      } else {
        setJavaProgress((prev) => ({ ...prev, [serverId]: { phase, percent: percent ?? 0 } }));
      }
    });
    return () => {unsubStatus?.();unsubPlayers?.();unsubJava?.();};
  }, [load]);

  function handleCreate(server, javaPkg) {
    setServers((prev) => [...prev, { ...server, status: 'offline' }]);

    if (javaPkg && isElectron && server?.id) {
      setJavaProgress((prev) => ({ ...prev, [server.id]: { phase: 'starting', percent: 0 } }));

      window.electronAPI.serverInstallJava(javaPkg, server.id).
      then((r) => {
        if (r?.error) {
          setJavaProgress((prev) => {const n = { ...prev };delete n[server.id];return n;});
        }
      }).
      catch(() => {
        setJavaProgress((prev) => {const n = { ...prev };delete n[server.id];return n;});
      });
    }
  }

  async function handleDelete(server) {
    if (confirmDel !== server.id) {
      setConfirmDel(server.id);
      setTimeout(() => setConfirmDel((c) => c === server.id ? null : c), 3000);
      return;
    }
    if (!isElectron) return;
    await window.electronAPI.serverDelete(server.id);
    setServers((prev) => prev.filter((s) => s.id !== server.id));
    setConfirmDel(null);
  }

  if (activeServer) {
    const current = servers.find((s) => s.id === activeServer.id) || activeServer;
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <ServerConsole
          server={current}
          onBack={() => setActiveServer(null)} />
        
      </div>);

  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {}
      <div className="flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-4">
        <div>
          <h1 className="text-lg font-bold text-white">{t('server.page.title')}</h1>
          <p className="text-xs text-white/30 mt-0.5">{t('server.page.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5 border border-white/8">
            <button onClick={() => setView('list')}
            className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${view === 'list' ? 'bg-white/15 text-white' : 'text-white/30 hover:text-white/60'}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path strokeLinecap="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button onClick={() => setView('grid')}
            className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${view === 'grid' ? 'bg-white/15 text-white' : 'text-white/30 hover:text-white/60'}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
          </div>
          <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-white text-xs font-bold transition-all active:scale-95 shadow-lg shadow-green-500/20">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            {t('server.page.createBtn')}
          </button>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-y-auto px-6 pb-6" style={{ scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        {loading ?
        <div className="flex items-center justify-center h-32 gap-2 text-white/30">
            <svg className="animate-spin w-5 h-5 text-green-400/50" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">{t('server.page.loading')}</span>
          </div> :
        servers.length === 0 ?
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8 text-white/15">
                <rect x="2" y="3" width="20" height="14" rx="2" /><path strokeLinecap="round" d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white/40">{t('server.page.empty')}</p>
              <p className="text-xs text-white/20 mt-1">{t('server.page.emptyHint')}</p>
            </div>
            <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-xl bg-green-500/15 text-green-400 text-xs font-semibold border border-green-500/20 hover:bg-green-500/25 transition-all">
              {t('server.page.createFirst')}
            </button>
          </div> :
        view === 'grid' ?
        <div className={`grid ${getGridCols(servers.length)} gap-3`}>
            {servers.map((s) => {
            const jp = javaProgress[s.id];
            return (
              <div key={s.id} className="relative">
                  <ServerCardGrid
                  server={s}
                  onClick={jp ? null : setActiveServer}
                  onDelete={handleDelete}
                  javaProgress={jp} />
                
                  {confirmDel === s.id &&
                <div className="absolute inset-0 rounded-2xl bg-[#0a0a0a]/95 border border-red-500/25 flex items-center justify-center gap-2 z-10 px-3">
                      <span className="text-xs text-white/60 flex-1">{t('server.page.deleteConfirm')}</span>
                      <button onClick={() => handleDelete(s)}
                  className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition-all">{t('server.page.delete')}</button>
                      <button onClick={() => setConfirmDel(null)}
                  className="px-2.5 py-1 rounded-lg bg-white/8 text-white/50 text-xs transition-all">{t('server.page.cancel')}</button>
                    </div>
                }
                </div>);

          })}
          </div> :

        <div className="flex flex-col gap-2">
            {servers.map((s) => {
            const jp = javaProgress[s.id];
            return (
              <div key={s.id} className="relative">
                  <ServerCardList
                  server={s}
                  onClick={jp ? null : setActiveServer}
                  onDelete={handleDelete}
                  javaProgress={jp} />
                
                  {confirmDel === s.id &&
                <div className="absolute inset-0 rounded-xl bg-[#0a0a0a]/95 border border-red-500/25 flex items-center justify-center gap-2 z-10 px-3">
                      <span className="text-xs text-white/60 flex-1">{t('server.page.deleteConfirm')}</span>
                      <button onClick={() => handleDelete(s)}
                  className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition-all">{t('server.page.delete')}</button>
                      <button onClick={() => setConfirmDel(null)}
                  className="px-2.5 py-1 rounded-lg bg-white/8 text-white/50 text-xs transition-all">{t('server.page.cancel')}</button>
                    </div>
                }
                </div>);

          })}
          </div>
        }
      </div>

      {}
      {showCreate &&
      <CreateServerModal
        onClose={() => setShowCreate(false)}
        onCreate={(server, javaPkg) => handleCreate(server, javaPkg)} />

      }
    </div>);

}