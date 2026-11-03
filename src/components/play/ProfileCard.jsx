import { useState } from 'react';
import vanillaIcon from '../../assets/loader/vanilla.png';
import fabricIcon from '../../assets/loader/fabric.png';
import forgeIcon from '../../assets/loader/forge.png';
import neoforgeIcon from '../../assets/loader/neoforge.png';
import curseforgeIcon from '../../assets/loader/curseforge.png';
import modrinthIcon from '../../assets/loader/modrinth.png';
import defaultBg from '../../assets/minecraft-versions/default.png';

import v112 from '../../assets/minecraft-versions/1.12.png';
import v115 from '../../assets/minecraft-versions/1.15.png';
import v116 from '../../assets/minecraft-versions/1.16.png';
import v117 from '../../assets/minecraft-versions/1.17.png';
import v118 from '../../assets/minecraft-versions/1.18.png';
import v119 from '../../assets/minecraft-versions/1.19.png';
import v120 from '../../assets/minecraft-versions/1.20.png';
import v121 from '../../assets/minecraft-versions/1.21.png';
import v26 from '../../assets/minecraft-versions/26.png';

import { useLang } from '../../i18n/LangProvider';import LocalizedText from "../../i18n/LocalizedText.jsx";

const VERSION_IMAGES = {
  '1.12': v112, '1.15': v115, '1.16': v116, '1.17': v117,
  '1.18': v118, '1.19': v119, '1.20': v120, '1.21': v121,
  '26': v26
};

const LOADER_ICONS = {
  vanilla: vanillaIcon,
  fabric: fabricIcon,
  forge: forgeIcon,
  neoforge: neoforgeIcon
};

const LOADER_COLORS = {
  vanilla: 'text-green-400',
  fabric: 'text-purple-400',
  forge: 'text-orange-400',
  neoforge: 'text-rose-400'
};

const IMPORT_SOURCE_CONFIG = {
  curseforge: { label: 'CurseForge', icon: curseforgeIcon, color: '#f97316', bg: 'rgba(249,115,22,0.18)', border: 'rgba(249,115,22,0.35)' },
  modrinth: { label: 'Modrinth', icon: modrinthIcon, color: '#22c55e', bg: 'rgba(34,197,94,0.18)', border: 'rgba(34,197,94,0.35)' }
};

function getMajorVersion(gameVersion) {
  if (!gameVersion) return null;
  const parts = gameVersion.split('.');
  if (parseInt(parts[0], 10) >= 20 && parts[0].length <= 2) return parts[0];
  if (parts.length >= 2) return `${parts[0]}.${parts[1]}`;
  return gameVersion;
}

function getVersionImage(gameVersion) {
  if (!gameVersion) return defaultBg;
  const major = getMajorVersion(gameVersion);
  return VERSION_IMAGES[major] || defaultBg;
}

function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {return '—';}
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0,val = bytes;
  while (val >= 1024 && i < units.length - 1) {val /= 1024;i++;}
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function ProfileCard({ profile, isSelected, confirmDelete, onSelect, onDelete, onCancelDelete }) {
  const { t } = useLang();
  const bgImage = profile.importBgUrl || getVersionImage(profile.gameVersion);
  const loaderIcon = profile.importIconUrl || LOADER_ICONS[profile.loader] || vanillaIcon;
  const loaderColor = LOADER_COLORS[profile.loader] || 'text-green-400';
  const importSrc = profile.importSource ? IMPORT_SOURCE_CONFIG[profile.importSource] : null;
  const isElectron = typeof window !== 'undefined' && window.electronAPI;

  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  async function handleOpenFolder() {
    if (!isElectron) return;
    await window.electronAPI.openProfileFolder(profile.id);
  }

  async function handleOpenLogs() {
    if (!isElectron) return;
    setLogsLoading(true);
    setShowLogs(true);
    try {
      const list = await window.electronAPI.invoke('launcher:listLogs', { profileId: profile.id });
      setLogs(Array.isArray(list) ? list : []);
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }

  async function handleOpenLogFile(filename) {
    if (!isElectron) return;
    try {
      const result = await window.electronAPI.invoke('launcher:getLatestLog', { profileId: profile.id });
      if (result?.lines) {
        const w = window.open('', '_blank');
        if (w) w.document.write(`<pre style="background:#111;color:#eee;padding:16px;font-size:12px;white-space:pre-wrap;font-family:monospace">${result.lines.map((l) => l.replace(/</g, '&lt;')).join('\n')}</pre>`);
      }
    } catch {}
  }

  function formatLogDate(iso) {
    try {return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });}
    catch {return iso;}
  }

  return (
    <>
      <div className={`flex flex-col rounded-2xl overflow-hidden border transition-all duration-200 ${isSelected ? 'border-green-500/40 shadow-lg shadow-green-500/10' : 'border-white/5 hover:border-white/10'} bg-[#141414]`}>

        <div className="relative h-28 overflow-hidden">
          <img src={bgImage} alt={profile.gameVersion} className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-110" draggable={false} onError={(e) => {e.currentTarget.src = getVersionImage(profile.gameVersion);}} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none" />

          {isSelected &&
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/90 text-white text-[10px] font-bold">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
              {t ? t('playpage.card.selected') : 'Selected'}
            </div>
          }

          <div className="absolute bottom-2 left-3 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-white/80 bg-black/45 backdrop-blur-sm px-1.5 py-0.5 rounded border border-white/10">{profile.gameVersion}</span>
            {importSrc &&
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.45)', border: `1px solid ${importSrc.border}`, color: importSrc.color }}>
                <img src={importSrc.icon} alt={importSrc.label} className="w-2.5 h-2.5 object-contain" />
                {importSrc.label}
              </span>
            }
            {importSrc &&
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold backdrop-blur-sm bg-black/45 border border-white/20 text-white/70">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5"><path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18s-.41-.06-.57-.18l-7.9-4.44A1 1 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18s.41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9M12 4.15L6.04 7.5 12 10.85l5.96-3.35L12 4.15M5 15.91l6 3.38v-6.71L5 9.21v6.7m14 0v-6.7l-6 3.37v6.71l6-3.38z" /></svg>
                {t ? t('playpage.card.modpack') : 'Modpack'}
              </span>
            }
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden bg-white/5 border border-white/5 flex items-center justify-center">
            <img src={loaderIcon} alt={profile.loader} className="w-6 h-6 object-contain" draggable={false} onError={(e) => {e.currentTarget.src = LOADER_ICONS[profile.loader] || vanillaIcon;}} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-white truncate">{profile.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-semibold capitalize ${loaderColor}`}>{profile.loader}{profile.loaderVersion ? ` ${profile.loaderVersion}` : ''}</span>
              <span className="text-[10px] text-white/25">·</span>
              <span className="text-[10px] text-white/40">{formatDate(profile.createdAt)}</span>
            </div>
            <p className="text-[10px] text-white/25 mt-0.5">{formatBytes(profile.sizeBytes)}</p>
          </div>
        </div>

        <div className="border-t border-white/5" />

        <div className="relative px-3 py-2.5 flex gap-2 items-center justify-center">
          {confirmDelete &&
          <div className="absolute inset-0 rounded-b-2xl bg-[#141414]/97 border-t border-red-500/20 flex items-center justify-center gap-2 px-3 z-10">
              <span className="text-xs text-white/50 flex-1">{t ? t('playpage.card.deleteConfirm') : 'Delete this profile?'}</span>
              <button onClick={() => onDelete(profile.id)} className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition-all">
                {t ? t('playpage.card.delete') : 'Delete'}
              </button>
              <button onClick={onCancelDelete} className="px-2.5 py-1 rounded-lg bg-white/8 hover:bg-white/12 text-white/50 text-xs transition-all">
                {t ? t('playpage.card.cancel') : 'Cancel'}
              </button>
            </div>
          }

          <button
            onClick={() => onSelect(profile.id)}
            disabled={isSelected}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 ${isSelected ? 'bg-green-500/15 text-green-400 border border-green-500/20 cursor-default' : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/15 hover:border-green-500/30'}`}>
            
            {isSelected ? `✓ ${t ? t('playpage.card.selected') : 'Selected'}` : t ? t('playpage.card.select') : 'Select'}
          </button>

          {isElectron &&
          <button onClick={handleOpenLogs}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-white/25 hover:text-yellow-400 hover:bg-yellow-500/10 border border-transparent hover:border-yellow-500/15 transition-all duration-150"
          title={t("auto.1b2cea153b49")}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
              </svg>
            </button>
          }

          {isElectron &&
          <button onClick={handleOpenFolder}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-white/25 hover:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/15 transition-all duration-150"
          title={t ? t('playpage.card.openFolder', { path: profile.instancePath }) : `Open folder: ${profile.instancePath}`}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
              </svg>
            </button>
          }

          <button onClick={() => onDelete(profile.id)}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-white/25 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/15 transition-all duration-150"
          title={t ? t('playpage.card.deleteProfile') : 'Delete profile'}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
          </button>
        </div>
      </div>

      {showLogs &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} onClick={(e) => {if (e.target === e.currentTarget) setShowLogs(false);}}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/6">
              <div>
                <h2 className="text-sm font-bold text-white"><LocalizedText id="auto.b0ef8768a2e7" /></h2>
                <p className="text-[10px] text-white/35 mt-0.5">{profile.name}</p>
              </div>
              <button onClick={() => setShowLogs(false)} className="w-8 h-8 flex items-center justify-center rounded-xl text-white/30 hover:text-white hover:bg-white/8 transition-all">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {logsLoading ?
            <div className="flex items-center justify-center py-10 text-white/30 text-xs"><LocalizedText id="auto.402999a554f1" /></div> :
            logs.length === 0 ?
            <div className="flex items-center justify-center py-10 text-white/25 text-xs"><LocalizedText id="auto.6bda7f266d87" /></div> :

            <div className="flex flex-col divide-y divide-white/5">
                  {logs.map((log) =>
              <button key={log.filename} onClick={() => handleOpenLogFile(log.filename)} className="flex items-center gap-3 px-5 py-3 hover:bg-white/4 transition-all text-left w-full">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white/25 flex-shrink-0"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/70 truncate font-mono">{log.filename}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{formatLogDate(log.mtime)} · {formatBytes(log.size)}</p>
                      </div>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white/20 flex-shrink-0"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" /></svg>
                    </button>
              )}
                </div>
            }
            </div>
          </div>
        </div>
      }
    </>);

}