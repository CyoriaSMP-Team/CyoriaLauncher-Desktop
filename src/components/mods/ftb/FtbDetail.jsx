import { useLang } from "../../../i18n/LangProvider.jsx"; /**
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

import { useState, useMemo } from 'react';
import { DownloadSimple, Heart, CalendarBlank, ArrowLeft, ArrowSquareOut } from '@phosphor-icons/react';
import { useFtbProject, useFtbVersions } from './useFtb';
import { useModpackInstall } from '../shared/ModpackInstallContext';import LocalizedText from "../../../i18n/LocalizedText.jsx";

function SplashLogoInline({ size = 64, label }) {
  const s = size / 4.5;
  const d1 = size * 0.14;
  const d2 = size * 0.30;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-orange-500/15 rounded-full blur-2xl" style={{ width: size * 0.8, height: size * 0.8, animation: 'ftb-logo-glow 3s ease-in-out infinite' }} />
        </div>
        <div className="absolute rounded-lg" style={{ width: s, height: s, background: '#f97316', boxShadow: '0 0 10px #f9731699', animation: 'ftb-logo-tl 3s ease-in-out 0s infinite' }} />
        <div className="absolute rounded-lg" style={{ width: s, height: s, background: '#ea580c', boxShadow: '0 0 10px #ea580c99', animation: 'ftb-logo-tr 3s ease-in-out 0.06s infinite' }} />
        <div className="absolute rounded-lg" style={{ width: s, height: s, background: '#c2410c', boxShadow: '0 0 10px #c2410c99', animation: 'ftb-logo-bl 3s ease-in-out 0.12s infinite' }} />
        <div className="absolute rounded-lg" style={{ width: s, height: s, background: '#f97316', boxShadow: '0 0 10px #f9731699', animation: 'ftb-logo-br 3s ease-in-out 0.18s infinite' }} />
      </div>
      {label && <p className="text-[11px] text-white/30 font-medium">{label}</p>}
      <style>{`
        @keyframes ftb-logo-tl { 0%,100%{transform:translate(-${d1}px,-${d1}px) rotate(0deg) scale(1);opacity:.9} 15%{transform:translate(-${d2}px,-${d2}px) rotate(0deg) scale(1.1);opacity:1} 50%{transform:translate(-${d2}px,-${d2}px) rotate(360deg) scale(1.1);opacity:1} 65%{transform:translate(-${d1}px,-${d1}px) rotate(360deg) scale(1);opacity:.9} }
        @keyframes ftb-logo-tr { 0%,100%{transform:translate(${d1}px,-${d1}px) rotate(0deg) scale(1);opacity:.9} 15%{transform:translate(${d2}px,-${d2}px) rotate(0deg) scale(1.1);opacity:1} 50%{transform:translate(${d2}px,-${d2}px) rotate(360deg) scale(1.1);opacity:1} 65%{transform:translate(${d1}px,-${d1}px) rotate(360deg) scale(1);opacity:.9} }
        @keyframes ftb-logo-bl { 0%,100%{transform:translate(-${d1}px,${d1}px) rotate(0deg) scale(1);opacity:.9} 15%{transform:translate(-${d2}px,${d2}px) rotate(0deg) scale(1.1);opacity:1} 50%{transform:translate(-${d2}px,${d2}px) rotate(360deg) scale(1.1);opacity:1} 65%{transform:translate(-${d1}px,${d1}px) rotate(360deg) scale(1);opacity:.9} }
        @keyframes ftb-logo-br { 0%,100%{transform:translate(${d1}px,${d1}px) rotate(0deg) scale(1);opacity:.9} 15%{transform:translate(${d2}px,${d2}px) rotate(0deg) scale(1.1);opacity:1} 50%{transform:translate(${d2}px,${d2}px) rotate(360deg) scale(1.1);opacity:1} 65%{transform:translate(${d1}px,${d1}px) rotate(360deg) scale(1);opacity:.9} }
        @keyframes ftb-logo-glow { 0%,100%{opacity:0.2;transform:scale(1)} 15%{opacity:0.6;transform:scale(1.5)} 50%{opacity:0.6;transform:scale(1.5)} 65%{opacity:0.2;transform:scale(1)} }
      `}</style>
    </div>);

}

function formatNum(n) {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const VERSION_TYPE_STYLE = {
  release: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  beta: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  alpha: 'bg-red-500/15 text-red-400 border-red-500/25'
};

const TAG_COLORS = {
  Tech: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  Magic: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  Adventure: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
  Exploration: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  Questing: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
  Skyblock: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25'
};

const DETAIL_TABS = [
{ id: 'description', label: 'Description' },
{ id: 'versions', label: 'Versions' },
{ id: 'gallery', label: 'Gallery' }];


const isElectron = typeof window !== 'undefined' && window.electronAPI;

export default function FtbDetail({ projectId, onBack }) {const { t } = useLang();
  const { project, loading, error } = useFtbProject(projectId);
  const { versions, loading: vLoading } = useFtbVersions(projectId);

  const [activeTab, setActiveTab] = useState('versions');
  const { openModpackInstall } = useModpackInstall();

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <SplashLogoInline size={72} label={t("auto.ff0812fb1807")} />
      </div>);

  }

  if (error || !project) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3">
        <p className="text-red-400/70 text-sm">{error || 'Project not found'}</p>
        <button onClick={onBack} className="text-xs text-white/40 hover:text-white transition-colors"><LocalizedText id="auto.f63fe07f6a3a" /></button>
      </div>);

  }

  const tags = (project.categories || []).filter((c) => !c.match(/^\d/));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {}
      <div className="flex-shrink-0 px-4 pt-3 pb-0">
        <button onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors mb-3">
          <ArrowLeft size={14} weight="duotone" /><LocalizedText id="auto.f441d596b8ee" />

        </button>

        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-white/5 flex items-center justify-center">
            {project.icon_url ?
            <img src={project.icon_url} alt="" className="w-full h-full object-cover" /> :
            <svg className="w-8 h-8 text-white/20" fill="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-white font-bold text-base leading-tight">{project.title}</h2>
                <p className="text-white/40 text-xs mt-0.5"><LocalizedText id="auto.27f78bd95cb6" /><span className="text-white/60">{project.author}</span></p>
              </div>
              {isElectron &&
              <button
                onClick={() => window.electronAPI.openExternal(`https://www.feed-the-beast.com/modpacks/${project.project_id}`)}
                className="flex-shrink-0 p-1.5 rounded-lg text-white/25 hover:text-white transition-all hover:bg-white/5"
                title={t("auto.9075878cd361")}>
                  <ArrowSquareOut size={14} weight="duotone" />
                </button>
              }
            </div>
            <p className="text-white/45 text-xs leading-relaxed line-clamp-2 mt-1.5">{project.description}</p>
          </div>
        </div>

        {}
        <div className="flex items-center gap-4 mb-3 text-sm">
          <span className="flex items-center gap-1.5 text-sky-400/80">
            <DownloadSimple size={15} weight="duotone" />
            <span className="font-semibold">{formatNum(project.downloads)}</span>
            <span className="text-white/30 text-xs font-normal"><LocalizedText id="auto.d363377c75cd" /></span>
          </span>
          <span className="flex items-center gap-1.5 text-pink-400/70">
            <Heart size={15} weight="duotone" />
            <span className="font-semibold">{formatNum(project.follows)}</span>
            <span className="text-white/30 text-xs font-normal"><LocalizedText id="auto.3b6bf88d2510" /></span>
          </span>
          <span className="flex items-center gap-1.5 text-white/35 text-xs ml-auto">
            <CalendarBlank size={13} weight="duotone" />
            {formatDate(project.updated)}
          </span>
        </div>

        {}
        {tags.length > 0 &&
        <div className="flex flex-wrap gap-1 mb-3">
            {tags.map((t) =>
          <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border capitalize ${TAG_COLORS[t] || 'bg-white/8 text-white/50 border-white/10'}`}>
                {t}
              </span>
          )}
            {(project.game_versions || []).slice(0, 3).map((v) =>
          <span key={v} className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/8 text-orange-400/60 border border-orange-500/15">{v}</span>
          )}
          </div>
        }

        {}
        <div className="flex gap-0 border-b border-white/5 mt-2">
          {DETAIL_TABS.map((tab) =>
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all -mb-px ${activeTab === tab.id ?
          'border-orange-500 text-orange-400' :
          'border-transparent text-white/30 hover:text-white/60'}`
          }>
              {tab.label}
              {tab.id === 'versions' && versions.length > 0 &&
            <span className="ml-1.5 text-[10px] text-white/25">({versions.length})</span>
            }
            </button>
          )}
        </div>
      </div>

      {}
      <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarColor: 'rgba(255,255,255,0.10) transparent' }}>

        {}
        {activeTab === 'description' &&
        <div className="flex flex-col gap-4">
            {project.background_url &&
          <div className="rounded-xl overflow-hidden w-full" style={{ aspectRatio: '16/5' }}>
                <img src={project.background_url} alt="" className="w-full h-full object-cover"
            onError={(e) => {e.currentTarget.parentElement.style.display = 'none';}} />
              </div>
          }
            {project.description &&
          <div className="px-4 py-3 rounded-xl text-sm text-white/70 leading-relaxed italic"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                "{project.description}"
              </div>
          }
            {project.body && project.body !== project.description &&
          <div className="text-sm text-white/60 leading-relaxed whitespace-pre-line">
                {project.body}
              </div>
          }
            <div className="grid grid-cols-2 gap-2 text-xs">
              {project.author &&
            <div className="px-3 py-2.5 rounded-xl flex flex-col gap-0.5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-white/30 uppercase tracking-widest text-[9px]"><LocalizedText id="auto.c859964fce5d" /></span>
                  <span className="text-white/80 font-semibold">{project.author}</span>
                </div>
            }
              {project.game_versions?.[0] &&
            <div className="px-3 py-2.5 rounded-xl flex flex-col gap-0.5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-white/30 uppercase tracking-widest text-[9px]"><LocalizedText id="auto.fd677072c530" /></span>
                  <span className="text-white/80 font-semibold">{project.game_versions[0]}</span>
                </div>
            }
              <div className="px-3 py-2.5 rounded-xl flex flex-col gap-0.5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-white/30 uppercase tracking-widest text-[9px]"><LocalizedText id="auto.e66872b0e26a" /></span>
                <span className="text-sky-400 font-semibold">{formatNum(project.downloads)}</span>
              </div>
              <div className="px-3 py-2.5 rounded-xl flex flex-col gap-0.5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-white/30 uppercase tracking-widest text-[9px]"><LocalizedText id="auto.a9ce5fe0b4e1" /></span>
                <span className="text-pink-400 font-semibold">{formatNum(project.follows)}</span>
              </div>
            </div>
          </div>
        }

        {}
        {activeTab === 'versions' &&
        <div className="flex flex-col gap-3">
            {vLoading &&
          <div className="flex items-center justify-center py-10">
                <SplashLogoInline size={56} label={t("auto.25ad15f3d4e4")} />
              </div>
          }
            {!vLoading && versions.length === 0 &&
          <p className="text-white/25 text-xs py-4 text-center"><LocalizedText id="auto.ffc4b91363b6" /></p>
          }
            {versions.map((v) =>
          <div key={v.id}
          className="flex items-center gap-3 px-3.5 py-3 rounded-xl cursor-pointer transition-all"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          onMouseEnter={(e) => {e.currentTarget.style.borderColor = 'rgba(249,115,22,0.2)';e.currentTarget.style.background = 'rgba(249,115,22,0.03)';}}
          onMouseLeave={(e) => {e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';e.currentTarget.style.background = 'rgba(255,255,255,0.03)';}}>
            
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white text-sm font-semibold">{v.version_number}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${VERSION_TYPE_STYLE[v.version_type] || 'bg-white/8 text-white/40 border-white/10'}`}>
                      {v.version_type}
                    </span>
                    {(v.loaders || []).map((l) =>
                <span key={l} className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize bg-orange-500/15 text-orange-300 border border-orange-500/25">
                        {l}
                      </span>
                )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/30 flex-wrap">
                    <span>{v.game_versions?.slice(0, 3).join(', ')}</span>
                    <span>·</span>
                    <span>{formatDate(v.date_published)}</span>
                    {v._specs?.recommended &&
                <>
                        <span>·</span>
                        <span className="text-orange-400/60">{Math.round(v._specs.recommended / 1024)}<LocalizedText id="auto.b63006ab45a0" /></span>
                      </>
                }
                  </div>
                </div>
                <button
              onClick={(e) => {
                e.stopPropagation();
                openModpackInstall({ project, version: v, source: 'ftb' });
              }}
              className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 2px 12px rgba(249,115,22,0.2)' }}>
              
                  <DownloadSimple size={13} weight="duotone" /><LocalizedText id="auto.e62aae281d89" />

            </button>
              </div>
          )}
          </div>
        }

        {}
        {activeTab === 'gallery' &&
        <div>
            {!project.gallery || project.gallery.length === 0 ?
          <p className="text-white/25 text-xs text-center py-8"><LocalizedText id="auto.1ea62ee20f30" /></p> :

          <div className="grid grid-cols-2 gap-2">
                {project.gallery.map((img, i) =>
            <div key={i} className="rounded-xl overflow-hidden aspect-video bg-white/5">
                    <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
            )}
              </div>
          }
          </div>
        }
      </div>
    </div>);

}