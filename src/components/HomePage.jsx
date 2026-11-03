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

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAccounts } from '../hooks/useAccounts';
import PlayerHead from './ui/PlayerHead';
import ProfileSettingsPanel from './home/ProfileSettingsPanel';
import vanillaIcon from '../assets/loader/vanilla.png';
import fabricIcon from '../assets/loader/fabric.png';
import forgeIcon from '../assets/loader/forge.png';
import neoforgeIcon from '../assets/loader/neoforge.png';
import curseforgeIcon from '../assets/loader/curseforge.png';
import modrinthIcon from '../assets/loader/modrinth.png';
import defaultBg from '../assets/minecraft-versions/default.png';
import v112 from '../assets/minecraft-versions/1.12.png';
import v115 from '../assets/minecraft-versions/1.15.png';
import v116 from '../assets/minecraft-versions/1.16.png';
import v117 from '../assets/minecraft-versions/1.17.png';
import v118 from '../assets/minecraft-versions/1.18.png';
import v119 from '../assets/minecraft-versions/1.19.png';
import v120 from '../assets/minecraft-versions/1.20.png';
import v121 from '../assets/minecraft-versions/1.21.png';
import { useLang } from '../i18n/LangProvider';
import FriendsPanel from './friends/FriendsPanel';import LocalizedText from "../i18n/LocalizedText.jsx";

function markdownToHtml(text) {
  if (!text) return '';
  let html = String(text);

  html = html.replace(/<img[^>]*shields\.io[^>]*>/gi, '');
  html = html.replace(/!\[[^\]]*\]\(https?:\/\/img\.shields\.io[^)]*\)/g, '');

  html = html.replace(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g,
  '<img src="$2" alt="$1" style="max-width:72px;max-height:72px;border-radius:12px;margin:6px auto;display:block;" />');

  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
  '<span class="md-link" data-href="$2">$1 â†—</span>');

  html = html.replace(/^#{4,6}\s+(.+)$/gm, '<h4 class="md-h4">$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="md-h3">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="md-h2">$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="md-h1">$1</h1>');

  html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code class="md-code">$1</code>');

  html = html.replace(/^>\s+(.+)$/gm, '<blockquote class="md-blockquote">$1</blockquote>');

  html = html.replace(/^---+$/gm, '<hr class="md-hr" />');

  html = html.replace(/^[-*]\s+(.+)$/gm, '<li class="md-li">$1</li>');
  html = html.replace(/(<li class="md-li">[\s\S]*?<\/li>\n?)+/g, (m) => `<ul class="md-ul">${m}</ul>`);

  html = html.replace(/^(?!<[a-zA-Z/]|$)(.+)$/gm, '<p class="md-p">$1</p>');

  return html;
}

function renderInlineMarkdown(text) {
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s]+)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));

    const token = match[0];
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      parts.push(
        <button
          key={`${match.index}-link`}
          onClick={() => window.electronAPI?.openExternal?.(link[2])}
          className="text-sky-400 hover:text-sky-300 underline underline-offset-2">
          
          {link[1]}
        </button>
      );
    } else if (token.startsWith('http')) {
      parts.push(
        <button
          key={`${match.index}-url`}
          onClick={() => window.electronAPI?.openExternal?.(token)}
          className="text-sky-400 hover:text-sky-300 underline underline-offset-2 break-all">
          
          {token}
        </button>
      );
    } else if (token.startsWith('**')) {
      parts.push(<strong key={`${match.index}-bold`} className="text-white/90 font-bold">{token.slice(2, -2)}</strong>);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function renderPatchNotesBody(body, t) {
  const html = markdownToHtml(body);
  if (!html.trim()) return <p className="text-white/40">{t('homepage.patchnote.nopatchnote')}</p>;

  return (
    <>
      <style>{`
        .md-h1 { font-size:1.25rem; font-weight:800; color:rgba(255,255,255,0.95); margin:16px 0 8px; }
        .md-h2 { font-size:1.1rem; font-weight:700; color:rgba(255,255,255,0.9); margin:14px 0 6px; }
        .md-h3 { font-size:0.95rem; font-weight:700; color:rgba(255,255,255,0.85); margin:12px 0 5px; display:flex; align-items:center; gap:6px; }
        .md-h4 { font-size:0.875rem; font-weight:600; color:rgba(255,255,255,0.75); margin:10px 0 4px; }
        .md-p  { color:rgba(255,255,255,0.65); margin:4px 0; line-height:1.6; font-size:0.875rem; }
        .md-ul { list-style:none; padding:0; margin:4px 0 8px; }
        .md-li { color:rgba(255,255,255,0.65); font-size:0.875rem; line-height:1.6; padding:2px 0 2px 16px; position:relative; }
        .md-li::before { content:"â€¢"; color:#38bdf8; position:absolute; left:0; }
        .md-code { background:rgba(255,255,255,0.08); color:#7dd3fc; padding:1px 5px; border-radius:4px; font-family:monospace; font-size:0.8rem; }
        .md-blockquote { border-left:3px solid rgba(74,222,128,0.4); padding:4px 12px; margin:8px 0; color:rgba(255,255,255,0.5); font-style:italic; font-size:0.875rem; }
        .md-hr { border:none; border-top:1px solid rgba(255,255,255,0.08); margin:12px 0; }
        .md-link { color:#38bdf8; cursor:pointer; text-decoration:underline; text-underline-offset:2px; font-size:0.875rem; }
        .md-link:hover { color:#7dd3fc; }
        strong { color:rgba(255,255,255,0.9); font-weight:700; }
        em { color:rgba(255,255,255,0.7); font-style:italic; }
      `}</style>
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={(e) => {
          const el = e.target.closest('.md-link');
          if (el) {
            const href = el.getAttribute('data-href');
            if (href) window.electronAPI?.openExternal?.(href);
          }
        }} />
      
    </>);

}

function PatchNotesModal({ patchNotes, onClose }) {
  const { t } = useLang();
  if (!patchNotes) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-[#0a0c0f] border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex-shrink-0 flex items-start justify-between px-6 py-4 border-b border-white/5">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white mb-1">{patchNotes.title}</h2>
            <p className="text-xs text-white/40">
              {t('homepage.patchnote.version')} {patchNotes.version}
              {patchNotes.publishedAt &&
              <>
                  {' '} Â· {new Date(patchNotes.publishedAt).toLocaleDateString('vi-VN')}
                </>
              }
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-none text-sm break-words font-sans">
            {renderPatchNotesBody(patchNotes.body, t)}
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-t border-white/5 bg-black/20">
          {patchNotes.htmlUrl &&
          <button
            onClick={() => window.electronAPI?.openExternal?.(patchNotes.htmlUrl)}
            className="text-xs text-sky-400 hover:text-sky-300 transition-colors underline underline-offset-2">
            
              {t('homepage.patchnote.viewongithub')}
            </button>
          }
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded-lg bg-sky-500/15 border border-sky-500/25 text-sky-400 text-xs font-semibold hover:bg-sky-500/25 transition-all">
            
            {t('homepage.patchnote.close')}
          </button>
        </div>
      </div>
    </div>);

}

function getAccountTypeLabel(account, t) {
  let label = account?.type === 'microsoft' ? 'Microsoft' : account?.type === 'discord' ? 'Discord Linked' : 'Offline Mode';
  if (account?.cyoriaAccountUuid) label += ` · ${t('cyoria.gameAccountTag')}`;
  return label;
}

function AccountDropdown({ accounts, selectedAccount, selectAccount, onNavigate }) {
  const { t } = useLang();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  if (!selectedAccount && accounts.length === 0) {
    return (
      <button
        onClick={() => onNavigate?.('account')}
        className="w-full flex items-center gap-2 bg-white/3 border border-dashed border-white/10 rounded-xl px-3 py-2.5 text-white/30 hover:text-white/60 hover:border-white/20 transition-all text-xs">
        
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
        {t('homepage.acccount.addacccount')}
      </button>);

  }

  return (
    <div className="relative pb-2" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen((v) => !v)}
        className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2 cursor-pointer hover:bg-white/8 hover:border-white/20 transition-all">
        
        {selectedAccount &&
        <>
            <div className="rounded-md overflow-hidden flex-shrink-0">
              <PlayerHead uuid={selectedAccount.uuid} username={selectedAccount.username} size={28} />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="text-sm text-white/80 font-medium truncate">{selectedAccount.username}</div>
              <div className="text-[10px] text-white/30">{getAccountTypeLabel(selectedAccount, t)}</div>
            </div>
          </>
        }
        <svg viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {dropdownOpen &&
      <div className="absolute left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto bg-[#0a0c0f] border border-white/10 rounded-xl shadow-2xl z-50">
          <div className="px-3 py-2 border-b border-white/5">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t("homepage.acccount.selectedaccount")}</p>
          </div>
          {accounts.length === 0 ?
        <div className="px-3 py-3 text-[11px] text-white/25 text-center">{t("homepage.acccount.noacccount")}</div> :

        <>
              {accounts.map((account) =>
          <button
            key={account.id}
            onClick={() => {
              selectAccount(account.id);
              setDropdownOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-all ${selectedAccount?.id === account.id ? 'bg-white/5' : ''}`}>
            
                  <div className="rounded-md overflow-hidden flex-shrink-0">
                    <PlayerHead uuid={account.uuid} username={account.username} size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white/80 font-semibold truncate">{account.username}</p>
                    <p className="text-[10px] text-white/30">{getAccountTypeLabel(account, t)}</p>
                  </div>
                  {selectedAccount?.id === account.id &&
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-sky-400 flex-shrink-0">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
            }
                </button>
          )}
              <div className="border-t border-white/5" />
              <button
            onClick={() => {
              onNavigate?.('account');
              setDropdownOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-all text-white/30 hover:text-white/60 text-xs">
            
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                <span>{t('homepage.acccount.addacccount')}</span>
              </button>
            </>
        }
        </div>
      }
    </div>);

}

const VERSION_IMAGES = { '1.12': v112, '1.15': v115, '1.16': v116, '1.17': v117, '1.18': v118, '1.19': v119, '1.20': v120, '1.21': v121 };
const LOADER_ICONS = { vanilla: vanillaIcon, fabric: fabricIcon, forge: forgeIcon, neoforge: neoforgeIcon };
const LOADER_COLORS = { vanilla: 'text-sky-400', fabric: 'text-purple-400', forge: 'text-orange-400', neoforge: 'text-rose-400' };
const LOADER_BG = {
  vanilla: 'bg-sky-500/15 border-sky-500/25',
  fabric: 'bg-purple-500/15 border-purple-500/25',
  forge: 'bg-orange-500/15 border-orange-500/25',
  neoforge: 'bg-rose-500/15 border-rose-500/25'
};
const IMPORT_SOURCE = {
  curseforge: { label: 'CurseForge', icon: curseforgeIcon, color: '#f97316' },
  modrinth: { label: 'Modrinth', icon: modrinthIcon, color: '#0284c7' }
};

function getMajorVersion(v) {
  if (!v) return null;
  const parts = v.split('.');
  return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : v;
}
function getVersionImage(v) {
  return VERSION_IMAGES[getMajorVersion(v)] || defaultBg;
}

const isElectron = typeof window !== 'undefined' && window.electronAPI;

function formatRelativeTime(isoString, t) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return t('homepage.relativetime.daysago', { count: d });
  if (h > 0) return t('homepage.relativetime.hoursago', { count: h });
  if (m > 0) return t('homepage.relativetime.minutesago', { count: m });
  return t('homepage.relativetime.justnow');
}

const NEWS = [
{
  id: 1,
  tag: 'UPDATE',
  tagColor: 'bg-sky-500/20 text-sky-400',
  title: 'Minecraft 1.21.5 â€“ Spring to Life',
  desc: 'Leaf litter, fireflies, and new biome updates arrive in the latest snapshot.',
  date: 'May 7, 2026',
  img: null,
  gradient: 'from-sky-900/60 to-cyan-800/30'
},
{
  id: 2,
  tag: 'EVENT',
  tagColor: 'bg-blue-500/20 text-blue-400',
  title: 'Community Build Challenge',
  desc: 'Show off your best medieval builds and win exclusive in-game rewards.',
  date: 'May 3, 2026',
  img: null,
  gradient: 'from-blue-900/60 to-indigo-800/30'
},
{
  id: 3,
  tag: 'MODS',
  tagColor: 'bg-purple-500/20 text-purple-400',
  title: 'Top 10 Mods This Month',
  desc: 'From performance boosts to new dimensions â€” the best mods of April 2026.',
  date: 'Apr 30, 2026',
  img: null,
  gradient: 'from-purple-900/60 to-violet-800/30'
}];


function NewsPanel() {
  const { t } = useLang();
  return (
    <div className="overflow-y-auto px-6 py-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">{t('homepage.news.latestnews')}</h2>
        <button className="text-xs text-sky-400/60 hover:text-sky-400 transition-colors">{t('homepage.news.viewall')}</button>
      </div>
      <div className="flex flex-col gap-3">
        {NEWS.map((item) =>
        <article key={item.id}
        className={`relative rounded-xl overflow-hidden border border-white/5 bg-gradient-to-r ${item.gradient} hover:border-white/10 transition-all duration-200 cursor-pointer group`}>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.tagColor}`}>{item.tag}</span>
                    <span className="text-[10px] text-white/25">{item.date}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors leading-snug">{item.title}</h3>
                  <p className="text-xs text-white/40 mt-1 leading-relaxed line-clamp-2">{item.desc}</p>
                </div>
                <div className="w-16 h-14 rounded-lg bg-white/5 flex-shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white/10">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                </div>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>);

}

function InstanceLogPanel({ instance, onKill }) {
  const { t } = useLang();
  const logEndRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [copiedLine, setCopiedLine] = useState(null);

  const logs = instance.logs || [];
  const progress = instance.progress;

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  function parseLevel(line) {
    if (/\/(INFO)\]/.test(line)) return 'INFO';
    if (/\/(WARN)\]/.test(line)) return 'WARN';
    if (/\/(ERROR)\]/.test(line)) return 'ERROR';
    if (/\/(DEBUG)\]/.test(line)) return 'DEBUG';
    if (/\/(FATAL)\]/.test(line)) return 'FATAL';
    if (line.startsWith('[ERR]')) return 'ERROR';
    if (line.startsWith('[Launcher]')) return 'DEBUG';
    return 'OTHER';
  }

  const levelColor = {
    INFO: 'text-sky-400',
    WARN: 'text-yellow-400',
    ERROR: 'text-red-400',
    DEBUG: 'text-blue-400',
    FATAL: 'text-pink-400',
    OTHER: 'text-white/35'
  };

  const filteredLogs = filter === 'ALL' ? logs : logs.filter((l) => parseLevel(l) === filter);

  const errorLines = logs.filter((l) => {const lv = parseLevel(l);return lv === 'ERROR' || lv === 'FATAL';});

  const FILTERS = ['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'];

  const [copiedFilter, setCopiedFilter] = useState(false);

  function copyFilteredLogs() {
    if (filteredLogs.length === 0) return;
    navigator.clipboard.writeText(filteredLogs.join('\n')).then(() => {
      setCopiedFilter(true);
      setTimeout(() => setCopiedFilter(false), 1500);
    });
  }

  function copyLine(line, idx) {
    navigator.clipboard.writeText(line).then(() => {
      setCopiedLine(idx);
      setTimeout(() => setCopiedLine(null), 1500);
    });
  }

  function copyAllErrors() {
    navigator.clipboard.writeText(errorLines.join('\n'));
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0a0a0a]/50">
      {}
      {instance.state === 'downloading' && progress &&
      <div className="flex-shrink-0 px-4 py-2 border-b border-white/5 bg-black/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-white/50">
              {progress.phase === 'java' ? t('homepage.logconsole.installjava') :
            progress.phase === 'assets' ? t('homepage.logconsole.downloadassest') :
            progress.phase === 'launching' ? t('homepage.logconsole.launching') : t('homepage.logconsole.preparing')}
            </span>
            <div className="flex items-center gap-3 text-[10px] text-white/30">
              {progress.speed > 0 && <span>{(progress.speed / 1024 / 1024).toFixed(1)}<LocalizedText id="auto.d9c2843bda6c" /></span>}
              {progress.totalFiles > 0 && <span>{progress.doneFiles ?? 0}/{progress.totalFiles}</span>}
              {progress.percent > 0 && <span className="font-mono font-bold text-white/50">{progress.percent}%</span>}
            </div>
          </div>
          <div className="w-full h-1 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full bg-sky-400 rounded-full transition-all duration-500"
          style={{ width: `${progress.percent ?? 0}%` }} />
          </div>
        </div>
      }

      {}
      {errorLines.length > 0 &&
      <div className="flex-shrink-0 flex items-start gap-2 px-3 py-2 bg-red-500/8 border-b border-red-500/20">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-red-400">{t('homepage.logconsole.errorsdetected', { count: errorLines.length })}</p>
            <p className="text-[10px] text-red-400/60 truncate mt-0.5">{errorLines[errorLines.length - 1]}</p>
          </div>
          <button
          onClick={copyAllErrors}
          className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded bg-red-500/15 border border-red-500/25 text-red-400 text-[10px] font-semibold hover:bg-red-500/25 transition-all">
          
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
            {t('homepage.logconsole.copyerror')}
          </button>
        </div>
      }

      {}
      <div className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 border-b border-white/5 bg-black/10">
        {FILTERS.map((f) => {
          const errCount = f === 'ERROR' ? errorLines.length : 0;
          return (
            <button key={f} onClick={() => setFilter(f)}
            className={`relative px-2 py-0.5 rounded text-[10px] font-bold transition-all
                ${filter === f ? 'bg-white/10 text-white/70' : 'text-white/25 hover:text-white/50'}`}>
              {f}
              {errCount > 0 &&
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold">
                  {errCount > 9 ? '9+' : errCount}
                </span>
              }
            </button>);

        })}
        <span className="ml-auto text-[10px] text-white/20">{filteredLogs.length} {t('homepage.logconsole.lines')}</span>
        <button
          onClick={copyFilteredLogs}
          title={`Copy ${filter === 'ALL' ? 'all' : filter} logs`}
          className={`ml-2 flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition-all
            ${copiedFilter ? 'bg-sky-500/15 text-sky-400' : 'text-white/25 hover:text-white/60 hover:bg-white/5'}`}>
          
          {copiedFilter ?
          <>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
              {t('homepage.logconsole.copyed')}
            </> :

          <>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" /></svg>
              {t('homepage.logconsole.copy')}
            </>
          }
        </button>
        <button
          onClick={() => setAutoScroll((v) => !v)}
          className={`ml-1 text-[10px] px-2 py-0.5 rounded transition-all
            ${autoScroll ? 'bg-sky-500/15 text-sky-400' : 'text-white/25 hover:text-white/50'}`}>
          â†“</button>
      </div>

      {}
      <div className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[11px] leading-relaxed"
      onScroll={(e) => {
        const el = e.currentTarget;
        setAutoScroll(el.scrollTop + el.clientHeight >= el.scrollHeight - 30);
      }}>
        {filteredLogs.length === 0 ?
        <p className="text-white/20 text-center py-8">
            {instance.state === 'downloading' ?
          <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-3 h-3 text-sky-400/50" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('HomePage.logconsole.launch')}
              </span> :
          t('homepage.logconsole.nolog')
          }
          </p> :

        filteredLogs.map((line, i) => {
          const level = parseLevel(line);
          const isError = level === 'ERROR' || level === 'FATAL';
          return (
            <div
              key={i}
              className={`group flex gap-2 py-0.5 rounded px-1 cursor-pointer
                  ${isError ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-white/3'}
                `}
              onClick={() => copyLine(line, i)}
              title={t("auto.ff63c083304c")}>
              
                <span className={`flex-shrink-0 font-bold min-w-[36px] text-right ${levelColor[level] ?? 'text-white/30'}`}>
                  {level === 'OTHER' ? '' : level}
                </span>
                <span className={`flex-1 break-all ${isError ? 'text-red-300/90' :
              level === 'WARN' ? 'text-yellow-200/70' :
              level === 'DEBUG' ? 'text-blue-300/60' :
              'text-white/55'}`
              }>{line}</span>
                {}
                <span className={`flex-shrink-0 text-[9px] transition-all duration-150
                  ${copiedLine === i ? 'text-sky-400 opacity-100' : 'text-white/20 opacity-0 group-hover:opacity-100'}`}>
                  {copiedLine === i ? 'âœ“' : 'â™¿'}
                </span>
              </div>);

        })
        }
        <div ref={logEndRef} />
      </div>

      {}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-1 border-t border-white/5 bg-black/20 text-[10px]">
        <span className={
        instance.state === 'running' ? 'text-sky-400' :
        instance.state === 'stopped' ? 'text-white/30' :
        instance.state === 'error' ? 'text-red-400' :
        instance.state === 'downloading' ? 'text-yellow-400' : 'text-white/30'
        }>
          {instance.state === 'running' ? t('homepage.state.running') :
          instance.state === 'stopped' ? t('homepage.state.stopped') :
          instance.state === 'error' ? t('homepage.state.error') :
          instance.state === 'downloading' ? t('homepage.state.loading') : ''}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-white/20">{instance.profileName} @ {instance.accountName}</span>
          {(instance.state === 'running' || instance.state === 'downloading') &&
          <button
            onClick={() => onKill?.(instance.key)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/15 border border-red-500/20 text-red-400 text-[10px] font-semibold hover:bg-red-500/25 transition-all">
            
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
              {t('homepage.launch.kill')}
            </button>
          }
        </div>
      </div>
    </div>);

}

export default function HomePage({ onNavigate, launchState, progress, launchError, onLaunch, onLaunchReset, instances = [], onKillInstance }) {
  const { t } = useLang();
  const [ram, setRam] = useState(4);
  const [activeLogTab, setActiveLogTab] = useState(null);
  const [logPanelOpen, setLogPanelOpen] = useState(false);
  const [logDropdownOpen, setLogDropdownOpen] = useState(false);
  const [savedLog, setSavedLog] = useState(null);
  const [savedLogLoading, setSavedLogLoading] = useState(false);
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false);
  const [patchNotesModal, setPatchNotesModal] = useState(null);
  const logDropdownRef = useRef(null);
  const prevInstanceKeysRef = useRef(new Set());
  const ramSaveTimer = useRef(null);
  const patchNotesShownRef = useRef(new Set());

  useEffect(() => () => clearTimeout(ramSaveTimer.current), []);

  useEffect(() => {
    const loadPatchNotes = async () => {
      if (!isElectron) return;

      try {
        const result = await window.electronAPI.getCurrentPatchNotes();

        if (!result.ok) return;

        const versionKey = `patchnotes_${result.currentVersion}`;
        if (patchNotesShownRef.current.has(versionKey)) return;

        const timer = setTimeout(() => {
          setPatchNotesModal(result);
          patchNotesShownRef.current.add(versionKey);

          try {
            const shown = JSON.parse(localStorage.getItem('vxc_patchnotes_shown') || '[]');
            if (!shown.includes(versionKey)) {
              shown.push(versionKey);
              localStorage.setItem('vxc_patchnotes_shown', JSON.stringify(shown));
            }
          } catch {}
        }, 3000);

        return () => clearTimeout(timer);
      } catch {}
    };

    try {
      const shown = JSON.parse(localStorage.getItem('vxc_patchnotes_shown') || '[]');
      shown.forEach((v) => patchNotesShownRef.current.add(v));
    } catch {}

    loadPatchNotes();
  }, []);

  const particles = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    size: Math.random() * 3 + 1.5,
    left: Math.random() * 100,
    durationY: Math.random() * 5 + 4,
    durationX: Math.random() * 2 + 2,
    delay: Math.random() * 5,
    swayClass: `sway-${i % 3}`
  })), []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (logDropdownRef.current && !logDropdownRef.current.contains(e.target)) {
        setLogDropdownOpen(false);
      }
    }
    if (logDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [logDropdownOpen]);

  function handleRamChange(newRam) {
    setRam(newRam);

    if (ramSaveTimer.current) clearTimeout(ramSaveTimer.current);
    ramSaveTimer.current = setTimeout(() => {
      if (selectedProfile && isElectron) {
        window.electronAPI.updateProfileRam(selectedProfile.id, newRam).catch(() => {});
      }
    }, 500);
  }
  const { accounts, selectedAccount, selectAccount } = useAccounts();

  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileStats, setProfileStats] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [profileDropOpen, setProfileDropOpen] = useState(false);
  const profileDropRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (profileDropRef.current && !profileDropRef.current.contains(e.target)) setProfileDropOpen(false);
    }
    if (profileDropOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileDropOpen]);

  async function handleSelectProfile(id) {
    if (!isElectron) return;
    await window.electronAPI.selectProfile(id);
    const data = await window.electronAPI.getProfiles();
    setProfiles(data.profiles || []);
    const profile = data.profiles?.find((p) => p.id === data.selectedProfileId) ?? null;
    setSelectedProfile(profile);
    setProfileDropOpen(false);
    if (profile) {
      setRam(profile.ramGb ?? 4);
      const stats = await window.electronAPI.getProfileStats({ profileId: profile.id });
      setProfileStats(stats);
    }
  }

  useEffect(() => {
    const curKeys = instances.map((i) => i.key);
    const newKey = curKeys.find((k) => !prevInstanceKeysRef.current.has(k));
    prevInstanceKeysRef.current = new Set(curKeys);

    if (newKey) {
      setActiveLogTab(newKey);
      setSavedLog(null);
      setLogPanelOpen(true);
    }

    if (activeLogTab && instances.length > 0 && !instances.find((i) => i.key === activeLogTab)) {
      setActiveLogTab(instances[0]?.key ?? null);
    }
  }, [instances, activeLogTab]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = isElectron ?
        await window.electronAPI.getProfiles() :
        JSON.parse(localStorage.getItem('vxc_profiles') || '{"profiles":[],"selectedProfileId":null}');
        setProfiles(data.profiles || []);
        const profile = data.profiles?.find((p) => p.id === data.selectedProfileId) ?? null;
        setSelectedProfile(profile);

        setRam(profile?.ramGb ?? 4);

        if (profile && isElectron) {
          const stats = await window.electronAPI.getProfileStats({ profileId: profile.id });
          setProfileStats(stats);
        }
      } catch {
        setSelectedProfile(null);
      }
    }
    loadProfile();
  }, []);

  useEffect(() => {
    if (launchState === 'idle' && selectedProfile && isElectron) {
      window.electronAPI.getProfileStats({ profileId: selectedProfile.id }).
      then((stats) => setProfileStats(stats)).
      catch(() => {});
    }
  }, [launchState, selectedProfile]);

  const username = selectedAccount?.username ?? null;
  const accountType = getAccountTypeLabel(selectedAccount, t);

  function handleLaunch() {
    if (!selectedProfile || !isElectron) return;
    if (launchState === 'running' || launchState === 'downloading') return;
    onLaunch?.(selectedProfile.id, ram * 1024, selectedProfile.name, username || '');
  }

  const loaderKey = selectedProfile?.loader ?? 'vanilla';
  const launchColor = {
    vanilla: 'bg-sky-500 hover:bg-sky-400 shadow-sky-500/20',
    fabric: 'bg-purple-500 hover:bg-purple-400 shadow-purple-500/20',
    forge: 'bg-orange-500 hover:bg-orange-400 shadow-orange-500/20',
    neoforge: 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/20'
  }[loaderKey] ?? 'bg-sky-500 hover:bg-sky-400 shadow-sky-500/20';

  const isDownloading = launchState === 'downloading';
  const isRunning = launchState === 'running';
  const isError = launchState === 'error';

  const hoursPlayed = profileStats ? Math.floor((profileStats.playtimeSeconds || 0) / 3600) : 0;
  const worldCount = profileStats?.worldCount ?? 0;
  const modCount = profileStats?.modCount ?? 0;

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <PatchNotesModal patchNotes={patchNotesModal} onClose={() => setPatchNotesModal(null)} />

      {/* ── Launch Panel ── */}
      <div className="flex-shrink-0 border-b border-white/5 bg-black/20 p-4">
        <div className="flex gap-4 items-stretch">
          {/* Bên trái: Profile card + Play overlay */}
          <div className="flex-1 min-w-0">
            {selectedProfile ?
            <div className="relative rounded-xl overflow-hidden border border-white/8 cursor-pointer group" onClick={isError ? () => onLaunchReset?.() : handleLaunch}>
                <div className="relative h-48 overflow-hidden">
                  <img src={selectedProfile.importBgUrl || getVersionImage(selectedProfile.gameVersion)} alt={selectedProfile.gameVersion} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" draggable={false} onError={(e) => {e.currentTarget.src = getVersionImage(selectedProfile.gameVersion);}} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div className={`px-5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all shadow-lg group-hover:scale-105 ${isDownloading ? 'bg-black/60 border border-white/10' : isRunning ? 'bg-sky-500/30 border border-sky-500/40' : isError ? 'bg-red-500/30 border border-red-500/40' : `${launchColor} shadow-sky-500/30`}`}>
                      {isDownloading ?
                    <svg className="animate-spin w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> :
                    isRunning ?
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" /> :
                    isError ?
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-400"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg> :

                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white"><path d="M8 5v14l11-7z" /></svg>
                    }
                      <span className="text-sm font-bold text-white">{isDownloading ? `${progress?.percent ?? 0}%` : isRunning ? t('homepage.launch.playing') : isError ? t('homepage.launch.retry') : selectedProfile?.name}</span>
                    </div>
                    {/* Progress bar dưới nút play */}
                    {(isDownloading || isError) &&
                  <div className="w-48 flex flex-col gap-1">
                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm">
                          <div className={`h-full rounded-full transition-all duration-500 ${isError ? 'bg-red-500' : 'bg-sky-400'}`} style={{ width: `${isError ? 100 : progress?.percent ?? 0}%` }} />
                        </div>
                        <div className="flex items-center justify-between px-0.5">
                          <span className="text-[9px] text-white/40 font-medium">
                            {progress?.phase === 'java' ? t('homepage.progress.java') : progress?.phase === 'assets' ? t('homepage.progress.assets') : progress?.phase === 'launching' ? t('homepage.progress.launching') : progress?.phase === 'resolve' ? t('homepage.progress.resolve') : t('homepage.progress.preparing')}
                          </span>
                          <div className="flex items-center gap-2 text-[9px] text-white/30">
                            {progress?.speed > 0 && <span>{(progress.speed / 1024 / 1024).toFixed(1)}<LocalizedText id="auto.d9c2843bda6c" /></span>}
                            {progress?.totalFiles > 0 && <span>{progress.doneFiles ?? 0}/{progress.totalFiles}</span>}
                          </div>
                        </div>
                      </div>
                  }
                  </div>
                  {/* Info bottom */}
                  <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                    <div>
                      <p className="text-sm font-bold text-white truncate">{selectedProfile.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono text-white/70 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded border border-white/10">{selectedProfile.gameVersion}</span>
                        <span className={`text-[10px] font-bold capitalize ${LOADER_COLORS[selectedProfile.loader] || 'text-sky-400'}`}>{selectedProfile.loader}</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border backdrop-blur-sm ${LOADER_BG[selectedProfile.loader] || LOADER_BG.vanilla}`}>
                      <img src={selectedProfile.importIconUrl || LOADER_ICONS[selectedProfile.loader] || vanillaIcon} className="w-3 h-3 object-contain" draggable={false} onError={(e) => {e.currentTarget.src = vanillaIcon;}} />
                    </div>
                  </div>
                </div>
              </div> :

            <button onClick={() => onNavigate?.('play')} className="w-full h-48 flex items-center bg-white/3 border border-dashed border-white/10 rounded-xl px-3 text-white/30 hover:text-white/60 hover:border-white/20 transition-all text-xs justify-center flex-col gap-1.5">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-40"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                <span>{t('homepage.profile.createprofile')}</span>
              </button>
            }
          </div>

          {/* Bên phải: Account + Settings */}
          <div className="w-56 flex-shrink-0 flex flex-col gap-2.5">
            <AccountDropdown accounts={accounts} selectedAccount={selectedAccount} selectAccount={selectAccount} onNavigate={onNavigate} />
            {selectedProfile &&
            <button onClick={() => {setProfileSettingsOpen((v) => !v);if (logPanelOpen) setLogPanelOpen(false);}}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${profileSettingsOpen ? 'bg-sky-500/15 border-sky-500/25 text-sky-400' : 'bg-white/3 border-white/8 text-white/40 hover:text-white/70 hover:bg-white/6 hover:border-white/15'}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {profileSettingsOpen ? t('homepage.profile.closesettings') : t('homepage.profile.settings')}
                <span className="ml-auto text-[10px] text-white/20">{selectedProfile.ramGb ?? 4}<LocalizedText id="auto.6dd7c64b98b2" /></span>
              </button>
            }
            {(selectedProfile || instances.length > 0) &&
            <div className="relative" ref={logDropdownRef}>
                <button
                onClick={() => setLogDropdownOpen((v) => !v)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all
                    ${logPanelOpen ?
                'bg-sky-500/15 border-sky-500/25 text-sky-400' :
                'bg-white/3 border-white/8 text-white/40 hover:text-white/70 hover:bg-white/6 hover:border-white/15'}`
                }
                title={t("auto.ce580e0f085d")}>
                
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                  </svg>
                  {t('homepage.instance.logs')}
                  {instances.length > 0 &&
                <span className="ml-auto w-4 h-4 rounded-full bg-sky-500/30 text-sky-400 text-[9px] flex items-center justify-center font-bold">
                      {instances.length}
                    </span>
                }
                </button>

                {logDropdownOpen &&
              <div className="absolute right-0 top-full mt-1 w-52 bg-[#0a0c0f] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-3 py-2 border-b border-white/5">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t('homepage.instance.instancelogs')}</p>
                    </div>
                    {instances.length === 0 && !selectedProfile ?
                <div className="px-3 py-3 text-[11px] text-white/25 text-center">{t('homepage.instance.noinstancedropdown')}</div> :

                <>
                        {instances.map((inst) =>
                  <button
                    key={inst.key}
                    onClick={() => {
                      setActiveLogTab(inst.key);
                      setSavedLog(null);
                      setLogPanelOpen(true);
                      setLogDropdownOpen(false);
                      setProfileSettingsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-all
                              ${activeLogTab === inst.key && logPanelOpen && !savedLog ? 'bg-white/5' : ''}`}>
                    
                            {inst.state === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse flex-shrink-0" />}
                            {inst.state === 'downloading' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />}
                            {inst.state === 'stopped' && <span className="w-1.5 h-1.5 rounded-full bg-white/20 flex-shrink-0" />}
                            {inst.state === 'error' && <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-white/80 font-semibold truncate">{inst.profileName || 'Profile'}</p>
                              <p className="text-[10px] text-white/30 truncate">{t('homepage.instance.live')} · @{inst.accountName}</p>
                            </div>
                            {activeLogTab === inst.key && logPanelOpen && !savedLog &&
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-sky-400 flex-shrink-0">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                    }
                          </button>
                  )}

                        {selectedProfile &&
                  <>
                            {instances.length > 0 && <div className="border-t border-white/5 my-1" />}
                            <button
                      onClick={async () => {
                        setLogDropdownOpen(false);
                        setLogPanelOpen(true);
                        setActiveLogTab(null);
                        setSavedLog(null);
                        setSavedLogLoading(true);
                        setProfileSettingsOpen(false);
                        try {
                          const result = isElectron ?
                          await window.electronAPI.getLatestLog({ profileId: selectedProfile.id }) :
                          null;
                          setSavedLog(result);
                        } catch {
                          setSavedLog(null);
                        } finally {
                          setSavedLogLoading(false);
                        }
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-all
                                ${logPanelOpen && savedLog ? 'bg-white/5' : ''}`}>
                      
                              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white/30 flex-shrink-0">
                                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                              </svg>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-white/80 font-semibold truncate">{selectedProfile.name}</p>
                                <p className="text-[10px] text-white/30">{t('homepage.instance.lastlog')}</p>
                              </div>
                              {logPanelOpen && savedLog &&
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-sky-400 flex-shrink-0">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                      }
                            </button>
                          </>
                  }
                      </>
                }
                    {logPanelOpen &&
                <>
                        <div className="border-t border-white/5" />
                        <button
                    onClick={() => {setLogPanelOpen(false);setSavedLog(null);setLogDropdownOpen(false);}}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-all text-white/30 hover:text-white/60">
                    
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                          </svg>
                          <span className="text-[11px]">{t('homepage.instance.closelogpanel')}</span>
                        </button>
                      </>
                }
                  </div>
              }
              </div>
            }
            {/* Profile selector dropdown */}
            <div className="relative" ref={profileDropRef}>
              <button onClick={() => setProfileDropOpen((v) => !v)} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/30 hover:text-white/60 bg-white/3 border border-white/6 hover:border-white/12 transition-all">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 opacity-50"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" /></svg>
                <span className="flex-1 text-left truncate">{t('homepage.profile.label')}</span>
                <svg viewBox="0 0 24 24" fill="currentColor" className={`w-3 h-3 transition-transform duration-200 ${profileDropOpen ? 'rotate-180' : ''}`}><path d="M7 10l5 5 5-5z" /></svg>
              </button>
              {profileDropOpen &&
              <div className="absolute left-0 right-0 top-full mt-1 max-h-52 overflow-y-auto bg-[#0a0c0f] border border-white/10 rounded-xl shadow-2xl z-50" style={{ scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
                  {profiles.length === 0 ?
                <div className="px-3 py-3 text-[11px] text-white/25 text-center"><LocalizedText id="auto.f37eb795909c" /></div> :
                profiles.map((p) =>
                <button key={p.id} onClick={() => handleSelectProfile(p.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/5 transition-all ${p.id === selectedProfile?.id ? 'bg-white/5' : ''}`}>
                      <img src={p.importIconUrl || LOADER_ICONS[p.loader] || vanillaIcon} className="w-5 h-5 object-contain rounded flex-shrink-0" onError={(e) => {e.currentTarget.src = vanillaIcon;}} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/80 font-semibold truncate">{p.name}</p>
                        <p className="text-[10px] text-white/30 truncate">{p.gameVersion} · {p.loader}</p>
                      </div>
                      {p.id === selectedProfile?.id &&
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-sky-400 flex-shrink-0"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  }
                    </button>
                )}
                  <div className="border-t border-white/5">
                    <button onClick={() => {setProfileDropOpen(false);onNavigate?.('play');}}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-white/5 transition-all text-white/30 hover:text-white/60">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                      <span className="text-[11px]"><LocalizedText id="auto.bc6adc953b33" /></span>
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="flex flex-1 overflow-hidden gap-0">
        {}
        <div className="flex-1 flex flex-col overflow-hidden">
          {logPanelOpen && (instances.length > 0 || activeLogTab || savedLog || savedLogLoading) ?

          <div className="flex flex-col h-full overflow-hidden">
              {}
              <div className="flex-shrink-0 flex items-end border-b border-white/5">
                {}
                {instances.length > 1 &&
              <button
                onClick={() => {
                  const idx = instances.findIndex((i) => i.key === activeLogTab);
                  const prev = instances[(idx - 1 + instances.length) % instances.length];
                  setActiveLogTab(prev.key);
                  setSavedLog(null);
                }}
                className="flex-shrink-0 w-7 h-8 flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all ml-2"
                title={t("auto.5051b78e22fd")}>
                
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                  </button>
              }

                {}
                <div className="flex items-center gap-1 px-2 pt-4 pb-0 overflow-x-auto overflow-y-hidden flex-1 min-w-0 scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                
                  {}
                  {savedLog &&
                <button
                  className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-t-lg text-xs font-semibold border-t border-l border-r transition-all duration-150 relative bg-[#0a0c0f] border-white/8 text-white -mb-px z-10">
                  
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white/40 flex-shrink-0">
                        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
                      </svg>
                      <span className="truncate max-w-[120px]">{savedLog.profileName}</span>
                      <span className="text-[9px] text-white/30">{t('homepage.instance.saved')}</span>
                    </button>
                }

                  {}
                  {instances.map((inst) => {
                  const isActive = activeLogTab === inst.key && !savedLog;
                  return (
                    <button
                      key={inst.key}
                      onClick={() => {setActiveLogTab(inst.key);setSavedLog(null);}}
                      className={`
                          flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-t-lg text-xs font-semibold
                          border-t border-l border-r transition-all duration-150 relative
                          ${isActive ?
                      'bg-[#0a0c0f] border-white/8 text-white -mb-px z-10' :
                      'bg-white/3 border-transparent text-white/40 hover:text-white/60 hover:bg-white/5'}
                        `
                      }>
                      
                        {inst.state === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse flex-shrink-0" />}
                        {inst.state === 'downloading' &&
                      <svg className="animate-spin w-3 h-3 text-yellow-400 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                      }
                        {inst.state === 'stopped' && <span className="w-1.5 h-1.5 rounded-full bg-white/20 flex-shrink-0" />}
                        {inst.state === 'error' && <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />}
                        <span className="truncate max-w-[120px]">{inst.profileName || 'Profile'}</span>
                        {inst.accountName &&
                      <span className={`text-[9px] ${isActive ? 'text-white/40' : 'text-white/20'}`}>
                            @{inst.accountName}
                          </span>
                      }
                        {}
                        {isActive && (inst.state === 'running' || inst.state === 'downloading') &&
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {e.stopPropagation();onKillInstance?.(inst.key);}}
                        onKeyDown={(e) => {if (e.key === 'Enter' || e.key === ' ') {e.stopPropagation();onKillInstance?.(inst.key);}}}
                        className="ml-1 w-4 h-4 flex items-center justify-center rounded text-red-400/60 hover:text-red-400 hover:bg-red-500/15 transition-all flex-shrink-0 cursor-pointer"
                        title={t("auto.05d210a87d1e")}>
                        
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                          </div>
                      }
                      </button>);

                })}
                </div>

                {}
                {instances.length > 1 &&
              <button
                onClick={() => {
                  const idx = instances.findIndex((i) => i.key === activeLogTab);
                  const next = instances[(idx + 1) % instances.length];
                  setActiveLogTab(next.key);
                  setSavedLog(null);
                }}
                className="flex-shrink-0 w-7 h-8 flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all mr-2"
                title={t("auto.2161b1c8ed65")}>
                
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                  </button>
              }
                {}
                <button
                onClick={() => {setLogPanelOpen(false);setSavedLog(null);}}
                className="flex-shrink-0 w-7 h-8 flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/5 transition-all mr-1"
                title={t("auto.f837ed1782d8")}>
                
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>

              {}
              <div className="flex-1 overflow-hidden">
                {(() => {

                if (savedLog || savedLogLoading) {
                  if (savedLogLoading) return (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-white/20">
                        <svg className="animate-spin w-5 h-5 text-sky-400/50" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p className="text-xs">{t('homepage.instance.loadinglog')}</p>
                      </div>);

                  if (!savedLog) return (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-white/20">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 opacity-30">
                          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                        </svg>
                        <p className="text-xs">{t('homepage.instance.nolog')}</p>
                      </div>);


                  const fakeInstance = {
                    key: '__saved__',
                    state: 'stopped',
                    profileName: savedLog.profileName,
                    accountName: '',
                    logs: savedLog.lines,
                    progress: null
                  };
                  return <InstanceLogPanel instance={fakeInstance} onKill={null} />;
                }

                const inst = instances.find((i) => i.key === activeLogTab);
                if (!inst && instances.length === 0) return (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-white/20">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 opacity-30">
                        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                      </svg>
                      <p className="text-xs">{t('homepage.instance.noinstance')}</p>
                    </div>);

                if (!inst) return <InstanceLogPanel instance={instances[0]} onKill={onKillInstance} />;
                return <InstanceLogPanel instance={inst} onKill={onKillInstance} />;
              })()}
              </div>
            </div> :


          <div className="flex-1 overflow-hidden">
              {profileSettingsOpen && selectedProfile ?
            <ProfileSettingsPanel
              profile={selectedProfile}
              accountId={selectedAccount?.id}
              onClose={() => setProfileSettingsOpen(false)}
              onProfileUpdated={(p) => {
                setProfiles((prev) => prev.map((pr) => pr.id === p.id ? p : pr));
                setSelectedProfile(p);
              }} /> :


            <div className="overflow-y-auto h-full">
                  <NewsPanel />
                </div>
            }
            </div>
          }
        </div>

        {}
        <div className="w-80 flex-shrink-0 border-l border-white/5 bg-black/20 flex flex-col overflow-hidden">
          <FriendsPanel />
        </div>
      </div>
    </div>);

}
