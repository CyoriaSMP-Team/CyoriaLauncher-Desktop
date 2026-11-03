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

import { useState, useEffect, useRef } from 'react';
import { useLang } from '../../i18n/LangProvider';
import adoptiumIcon from '../../assets/java-icon/adoptium.png';
import azulIcon from '../../assets/java-icon/azul.png';
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

const SERVER_TYPES = [
{ id: 'vanilla', label: 'Vanilla', icon: vanillaIcon, desc: 'Official Mojang server' },
{ id: 'paper', label: 'Paper', icon: paperIcon, desc: 'High performance fork' },
{ id: 'purpur', label: 'Purpur', icon: purpurIcon, desc: 'Paper fork with extras' },
{ id: 'folia', label: 'Folia', icon: foliaIcon, desc: 'Regionized multithreading' },
{ id: 'fabric', label: 'Fabric', icon: fabricIcon, desc: 'Lightweight mod loader' },
{ id: 'mohist', label: 'Mohist', icon: mohistIcon, desc: 'Forge + Bukkit hybrid' },
{ id: 'arclight', label: 'Arclight', icon: arclightIcon, desc: 'Forge + Paper hybrid' },
{ id: 'magma', label: 'Magma', icon: magmaIcon, desc: 'Forge + Bukkit/Spigot' },
{ id: 'sponge', label: 'Sponge', icon: spongeIcon, desc: 'Plugin API platform' }];



const JAVA_DISTROS = {
  adoptium: { id: 'adoptium', name: 'Temurin', icon: adoptiumIcon, color: '#f97316' },
  azul: { id: 'azul', name: 'Zulu', icon: azulIcon, color: '#3b82f6' },
  graalvm: { id: 'graalvm', name: 'GraalVM', icon: null, color: '#a855f7' }
};
const MC_JAVA_MAP = { 8: 'MC ≤ 1.16', 11: 'MC 1.17 (mod)', 17: 'MC 1.17–1.20', 21: 'MC 1.21+', 25: 'Tương lai' };

function JavaDropdown({ value, onChange }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [distros, setDistros] = useState({ adoptium: [], azul: [], graalvm: [] });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('distro');
  const [selDistro, setSelDistro] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open || Object.values(distros).every((a) => a.length > 0)) return;
    if (!isElectron) return;
    setLoading(true);
    window.electronAPI.javaFetchDistros(null).
    then((r) => {if (r?.ok) setDistros(r.distros || {});}).
    catch(() => {}).
    finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function h(e) {if (ref.current && !ref.current.contains(e.target)) {setOpen(false);setStep('distro');setSelDistro(null);}}
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const currentVersions = selDistro ? distros[selDistro] || [] : [];

  return (
    <div ref={ref} className="relative">
      {}
      <div role="button" tabIndex={0}
      onClick={() => setOpen((v) => !v)}
      onKeyDown={(e) => {if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v);}}
      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm flex items-center gap-2.5 cursor-pointer hover:border-white/20 transition-all text-left select-none">
        {value ?
        <>
            <div className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-xs font-black"
          style={{ background: `${JAVA_DISTROS[value.distro]?.color || '#888'}20`, color: JAVA_DISTROS[value.distro]?.color || '#888' }}>
              {value.javaVersion}
            </div>
            <span className="text-white/80 flex-1"><LocalizedText id="auto.3d0169de3f89" />{value.javaVersion} — {JAVA_DISTROS[value.distro]?.name || value.distro}</span>
            <span className="text-[10px] text-white/30">{t('server.create.javaDownloadLater')}</span>
            <div role="button" tabIndex={0}
          onClick={(e) => {e.stopPropagation();onChange(null);}}
          onKeyDown={(e) => {if (e.key === 'Enter' || e.key === ' ') {e.stopPropagation();onChange(null);}}}
          className="text-white/25 hover:text-white/60 transition-colors flex-shrink-0 cursor-pointer">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </div>
          </> :

        <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-white/25 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-white/35 flex-1">{t('server.create.javaPlaceholder')}</span>
            <svg viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 text-white/25 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </>
        }
      </div>

      {}
      {open &&
      <div className="absolute z-[500] left-0 right-0 mt-1 rounded-xl border border-white/10 overflow-hidden"
      style={{ background: 'rgba(14,14,14,0.99)', boxShadow: '0 12px 40px rgba(0,0,0,0.7)', maxHeight: 300, overflowY: 'auto', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>

          {}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
            {step === 'versions' &&
          <button type="button" onClick={() => {setStep('distro');setSelDistro(null);}}
          className="text-white/30 hover:text-white/70 transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
              </button>
          }
            <span className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">
              {step === 'distro' ? t('server.create.javaSelectDistro') : t('server.create.javaSelectVersion', { name: JAVA_DISTROS[selDistro]?.name })}
            </span>
            {loading &&
          <svg className="animate-spin w-3 h-3 text-green-400/50 ml-auto" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
          }
          </div>

          {}
          {step === 'distro' ?

        Object.values(JAVA_DISTROS).map((d) =>
        <button key={d.id} type="button"
        onClick={() => {setSelDistro(d.id);setStep('versions');}}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-all group">
                <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{ background: `${d.color}15`, border: `1px solid ${d.color}30` }}>
                  {d.icon ?
            <img src={d.icon} alt={d.name} className="w-5 h-5 object-contain" /> :
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="6" fill="#7c3aed" fillOpacity="0.3" /><path d="M8 24L16 8l8 16H8z" fill="#a855f7" fillOpacity="0.8" /></svg>
            }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/80">{d.name}</p>
                  <p className="text-[10px] text-white/30">{t('server.create.javaVersions', { count: (distros[d.id] || []).length })}</p>
                </div>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </button>
        ) :


        currentVersions.length === 0 ?
        <div className="px-3 py-4 text-xs text-white/25 text-center">{t('server.create.javaNoVersions')}</div> :
        currentVersions.map((pkg) => {
          const d = JAVA_DISTROS[pkg.distro];
          const mcNote = MC_JAVA_MAP[pkg.javaVersion] || '';
          return (
            <button key={`${pkg.distro}-${pkg.javaVersion}`} type="button"
            onClick={() => {onChange(pkg);setOpen(false);setStep('distro');setSelDistro(null);}}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-green-500/8 transition-all group">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0"
              style={{ background: `${d?.color || '#888'}20`, color: d?.color || '#888' }}>
                        {pkg.javaVersion}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white/80"><LocalizedText id="auto.3d0169de3f89" />{pkg.javaVersion}</p>
                        {mcNote && <p className="text-[10px] text-green-400/70">{mcNote}</p>}
                      </div>
                      <span className="text-[10px] text-white/20 group-hover:text-green-400/60 transition-colors">{t('server.create.javaSelect')}</span>
                    </button>);

        })
        }
        </div>
      }
    </div>);

}

const JVM_PRESET_IDS = [
{
  id: 'default',
  badge: null,
  args: (ram) => `-Xmx${ram}G -Xms${Math.min(1, ram)}G -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200`
},
{
  id: 'aikar',
  badge: 'Recommended',
  badgeColor: 'bg-green-500/20 text-green-400',
  args: (ram) =>
  `-Xmx${ram}G -Xms${ram}G -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 ` +
  `-XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch ` +
  `-XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M ` +
  `-XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 ` +
  `-XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 ` +
  `-XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem ` +
  `-XX:MaxTenuringThreshold=1 -Dusing.aikars.flags=https://mcflags.emc.gs -Daikars.new.flags=true`
},
{
  id: 'graalvm',
  badge: 'Best Perf',
  badgeColor: 'bg-purple-500/20 text-purple-400',
  args: (ram) =>
  `-Xmx${ram}G -Xms${ram}G -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 ` +
  `-XX:+UnlockExperimentalVMOptions -XX:+UnlockDiagnosticVMOptions ` +
  `-XX:+AlwaysActAsServerClassMachine -XX:+AlwaysPreTouch ` +
  `-XX:+DisableExplicitGC -XX:NmethodSweepActivity=1 -XX:ReservedCodeCacheSize=400M ` +
  `-XX:NonNMethodCodeHeapSize=12M -XX:ProfiledCodeHeapSize=194M -XX:NonProfiledCodeHeapSize=194M ` +
  `-XX:+PerfDisableSharedMem -XX:G1NewSizePercent=40 -XX:G1MaxNewSizePercent=50 ` +
  `-XX:G1HeapRegionSize=16M -XX:G1ReservePercent=15 -XX:InitiatingHeapOccupancyPercent=20`
},
{
  id: 'zgc',
  badge: 'Low Latency',
  badgeColor: 'bg-blue-500/20 text-blue-400',
  args: (ram) =>
  `-Xmx${ram}G -Xms${Math.min(1, ram)}G -XX:+UseZGC -XX:+ZGenerational ` +
  `-XX:+AlwaysPreTouch -XX:+DisableExplicitGC -XX:+ParallelRefProcEnabled`
},
{
  id: 'minimal',
  badge: 'Lightweight',
  badgeColor: 'bg-yellow-500/20 text-yellow-400',
  args: (ram) => `-Xmx${ram}G -Xms256M -XX:+UseSerialGC`
},
{
  id: 'custom',
  badge: null,
  args: () => ''
}];


function JvmPresetDropdown({ value, onChange, ramGb }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('default');
  const [customValue, setCustomValue] = useState('');
  const ref = useRef(null);

  const JVM_PRESETS = JVM_PRESET_IDS.map((p) => ({
    ...p,
    label: t(`server.jvmPreset.${p.id}`),
    desc: t(`server.jvmPreset.${p.id}Desc`)
  }));

  useEffect(() => {
    const preset = JVM_PRESETS.find((p) => p.id === 'default');
    if (preset && !value) {
      const generated = preset.args(ramGb || 2);
      onChange(generated);
    }
  }, []);

  useEffect(() => {
    if (selectedId === 'custom') return;
    const preset = JVM_PRESETS.find((p) => p.id === selectedId);
    if (preset) onChange(preset.args(ramGb || 2));
  }, [ramGb, selectedId]);

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function selectPreset(preset) {
    setSelectedId(preset.id);
    setOpen(false);
    if (preset.id === 'custom') {
      onChange(customValue);
    } else {
      onChange(preset.args(ramGb || 2));
    }
  }

  const selected = JVM_PRESETS.find((p) => p.id === selectedId) || JVM_PRESETS[0];

  return (
    <div className="flex flex-col gap-2">
      {}
      <div ref={ref} className="relative">
        <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none transition-all flex items-center justify-between gap-2 cursor-pointer hover:border-white/20">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-white/80 font-semibold text-sm">{selected.label}</span>
            {selected.badge &&
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${selected.badgeColor}`}>
                {selected.badge}
              </span>
            }
            <span className="text-white/30 text-xs truncate hidden sm:block">— {selected.desc}</span>
          </div>
          <svg viewBox="0 0 24 24" fill="currentColor"
          className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>

        {open &&
        <div className="absolute z-50 left-0 right-0 mt-1 rounded-xl border border-white/10 overflow-hidden"
        style={{ background: 'rgba(18,18,18,0.98)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', maxHeight: 280, overflowY: 'auto', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            {JVM_PRESETS.map((p) =>
          <button key={p.id} type="button" onClick={() => selectPreset(p)}
          className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-all ${
          selectedId === p.id ? 'bg-green-500/10' : 'hover:bg-white/5'}`
          }>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${selectedId === p.id ? 'text-green-400' : 'text-white/80'}`}>
                      {p.label}
                    </span>
                    {p.badge &&
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${p.badgeColor}`}>{p.badge}</span>
                }
                  </div>
                  <p className="text-[10px] text-white/35 mt-0.5">{p.desc}</p>
                </div>
                {selectedId === p.id &&
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-1">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
            }
              </button>
          )}
          </div>
        }
      </div>

      {}
      <textarea
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (selectedId !== 'custom') setSelectedId('custom');
          setCustomValue(e.target.value);
        }}
        rows={3}
        className="w-full bg-white/3 border border-white/8 rounded-lg px-3 py-2 text-[11px] text-white/55 font-mono focus:outline-none focus:border-white/20 transition-all resize-none"
        style={{ scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
        placeholder={t('server.create.jvmFlagsPlaceholder')} />
      
      <p className="text-[10px] text-white/20">{t('server.create.jvmFlagsHint')}</p>
    </div>);

}

export default function CreateServerModal({ onClose, onCreate }) {
  const { t } = useLang();
  const [step, setStep] = useState(1);
  const [selectedType, setType] = useState(null);
  const [versions, setVersions] = useState([]);
  const [versionBuildStatus, setVersionBuildStatus] = useState({});
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const versionRef = useRef(null);
  const [showJavaModal, setShowJavaModal] = useState(false);
  const [selectedJavaPkg, setSelectedJavaPkg] = useState(null);
  const [form, setForm] = useState({
    name: '',
    gameVersion: '',
    ramGb: 2,
    jvmArgs: '',
    cores: 2,
    javaPath: '',
    serverPath: '',
    acceptEula: false,
    onlineMode: true,
    maxPlayers: 20
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isElectron || !selectedType) return;
    let cancelled = false;
    setVersions([]);
    setVersionBuildStatus({});
    setVersionsLoading(true);
    set('gameVersion', '');
    const api = window.electronAPI.serverGetVersionsForType ?
    window.electronAPI.serverGetVersionsForType(selectedType.id) :
    window.electronAPI.serverGetVersions();
    api.then(async (r) => {
      if (!r?.ok || cancelled) return;
      const nextVersions = r.versions || [];
      setVersions(nextVersions);

      if (!window.electronAPI.serverCheckBuildAvailable || nextVersions.length === 0) return;

      const checks = await Promise.all(
        nextVersions.map(async (version) => {
          try {
            const result = await window.electronAPI.serverCheckBuildAvailable(selectedType.id, version);
            return [version, !!result?.available];
          } catch {
            return [version, true];
          }
        })
      );

      if (!cancelled) {
        setVersionBuildStatus(Object.fromEntries(checks));
      }
    }).catch(() => {}).finally(() => {
      if (!cancelled) setVersionsLoading(false);
    });

    return () => {cancelled = true;};
  }, [selectedType?.id]);

  useEffect(() => {
    if (!versionOpen) return;
    function handler(e) {
      if (versionRef.current && !versionRef.current.contains(e.target)) setVersionOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [versionOpen]);

  useEffect(() => {
    const handler = (e) => {if (e.key === 'Escape') onClose();};
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function set(k, v) {setForm((f) => ({ ...f, [k]: v }));}

  async function handleBrowse() {
    if (!isElectron) return;
    const r = await window.electronAPI.serverBrowse();
    if (r?.ok) set('serverPath', r.path);
  }

  async function handleCreate() {
    if (!form.name.trim()) {setError(t('server.create.errorName'));return;}
    if (!form.gameVersion) {setError(t('server.create.errorVersion'));return;}
    if (!selectedJavaPkg) {setError(t('server.create.errorJava'));return;}
    if (!form.acceptEula) {setError(t('server.create.errorEula'));return;}

    setCreating(true);
    setError('');
    try {
      const r = isElectron ?
      await window.electronAPI.serverCreate({
        name: form.name.trim(),
        type: selectedType.id,
        gameVersion: form.gameVersion,
        ramGb: form.ramGb,
        jvmArgs: form.jvmArgs,
        cores: form.cores,
        javaPath: '',
        serverPath: form.serverPath,
        acceptEula: form.acceptEula,
        onlineMode: form.onlineMode,
        maxPlayers: form.maxPlayers
      }) :
      { ok: true, server: { id: 'demo', name: form.name, type: selectedType.id, gameVersion: form.gameVersion, ramGb: form.ramGb, status: 'offline' } };

      if (r?.error) {setError(r.error);return;}

      onClose();
      onCreate?.(r.server, selectedJavaPkg || null);
    } finally {
      setCreating(false);
    }
  }

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-green-500/50 transition-all placeholder-white/20';
  const labelCls = 'text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5 block';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-4"
    onClick={(e) => {if (e.target === e.currentTarget) onClose();}}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col"
      onClick={(e) => e.stopPropagation()}
      style={{ background: 'rgba(12,12,12,0.98)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 80px rgba(0,0,0,0.8)', maxHeight: '88vh' }}>

        {}
        <div className="flex-shrink-0 border-b border-white/5">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h3 className="text-white font-bold text-sm">{t('server.create.title')}</h3>
              <p className="text-white/30 text-xs mt-0.5">
                {step === 1 ?
                t('server.create.step1') :
                t('server.create.step2', { type: selectedType?.label || '' })}
              </p>
            </div>
            <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {}
          {step === 2 && !form.acceptEula &&
          <div className="mx-5 mb-3 flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <p className="text-xs text-yellow-300/80 leading-relaxed">{t('server.create.eulaWarning')}</p>
            </div>
          }
        </div>

        {}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
           {step === 1 ?

          <div className="p-5">
               <div className="grid grid-cols-3 gap-3">
                 {SERVER_TYPES.map((t) =>
              <button key={t.id} onClick={() => {setType(t);setStep(2);}}
              className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all text-left hover:-translate-y-0.5"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
              onMouseEnter={(e) => {e.currentTarget.style.borderColor = 'rgba(74,222,128,0.35)';e.currentTarget.style.background = 'rgba(74,222,128,0.05)';}}
              onMouseLeave={(e) => {e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';e.currentTarget.style.background = 'rgba(255,255,255,0.03)';}}>
                
                     <img src={t.icon} alt={t.label} className="w-12 h-12 rounded-xl object-contain" />
                     <div className="text-center">
                       <p className="text-sm font-bold text-white/90">{t.label}</p>
                       <p className="text-[10px] text-white/35 mt-0.5">{t.desc}</p>
                     </div>
                   </button>
              )}
               </div>
             </div> :


          <div className="p-5 flex flex-col gap-4">
               {}
               <div className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-white/3">
                 <img src={selectedType.icon} alt={selectedType.label} className="w-10 h-10 rounded-lg object-contain" />
                 <div>
                   <p className="text-sm font-bold text-white/90">{selectedType.label}</p>
                   <p className="text-xs text-white/35">{selectedType.desc}</p>
                 </div>
                 <button onClick={() => setStep(1)}
              className="ml-auto text-xs text-white/30 hover:text-white/60 transition-colors">
                   {t('server.create.changeType')}
                 </button>
               </div>

               {}
               {form.gameVersion && versions.length === 0 && !versionsLoading &&
            <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl border border-red-500/30 bg-red-500/8">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5">
                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                   </svg>
                   <p className="text-xs text-red-300/80 leading-relaxed">
                     {t('server.create.unsupportedVersion', { type: selectedType.label, version: form.gameVersion })}
                   </p>
                 </div>
            }

              {}
              <div>
                <label className={labelCls}>{t('server.create.nameLabel')}</label>
                <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={t("auto.daee75ab4a46")} />
              </div>

              {}
              <div>
                <label className={labelCls}>{t('server.create.versionLabel')}</label>
                <div ref={versionRef} className="relative">
                  <button
                  type="button"
                  onClick={() => setVersionOpen((v) => !v)}
                  className={`${inputCls} flex items-center justify-between text-left cursor-pointer ${!form.gameVersion ? 'text-white/30' : ''}`}>
                  
                    <span>{form.gameVersion || t('server.create.versionPlaceholder')}</span>
                    <svg viewBox="0 0 24 24" fill="currentColor"
                  className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform duration-150 ${versionOpen ? 'rotate-180' : ''}`}>
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </button>

                  {versionOpen &&
                <div className="absolute z-50 left-0 right-0 mt-1 rounded-xl border border-white/10 overflow-hidden"
                style={{ background: 'rgba(18,18,18,0.98)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', maxHeight: 220, overflowY: 'auto', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                      {versionsLoading ?
                  <div className="flex items-center justify-center gap-2 px-3 py-4">
                          <svg className="animate-spin w-3.5 h-3.5 text-green-400/50" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span className="text-xs text-white/30">{t('server.create.versionLoading', { type: selectedType?.label || '' })}</span>
                        </div> :
                  versions.length === 0 ?
                  <div className="px-3 py-3 text-xs text-white/30 text-center">{t('server.create.noVersions')}</div> :

                  versions.map((v) => {
                    const hasBuild = versionBuildStatus[v] !== false;
                    const isSelected = form.gameVersion === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {set('gameVersion', v);setVersionOpen(false);}}
                        className={`w-full text-left px-3 py-2 text-sm transition-all flex items-center justify-between gap-3 ${
                        isSelected ?
                        'bg-green-500/15 text-green-400 font-semibold' :
                        'text-white/70 hover:bg-white/6 hover:text-white'}`
                        }>
                        
                              <span>{v}</span>
                              {!hasBuild &&
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-orange-500/15 text-orange-300 border border-orange-500/25 flex-shrink-0">
                                  {t('server.create.versionNoBuilds')}
                                </span>
                        }
                            </button>);

                  })
                  }
                    </div>
                }
                </div>
              </div>

              {}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t('server.create.ramLabel')}: <span className="text-green-400 normal-case font-bold">{form.ramGb}<LocalizedText id="auto.daff8d2475d8" /></span></label>
                  <input type="range" min="1" max="32" step="1" value={form.ramGb}
                onChange={(e) => set('ramGb', Number(e.target.value))}
                className="w-full accent-green-500 cursor-pointer" />
                  <div className="flex justify-between text-[10px] text-white/20 mt-1"><span><LocalizedText id="auto.d8e93ac77e42" /></span><span><LocalizedText id="auto.e6cd89e70b77" /></span></div>
                </div>
                <div>
                  <label className={labelCls}>{t('server.create.coresLabel')}: <span className="text-green-400 normal-case font-bold">{form.cores}</span></label>
                  <input type="range" min="1" max="16" step="1" value={form.cores}
                onChange={(e) => set('cores', Number(e.target.value))}
                className="w-full accent-green-500 cursor-pointer" />
                  <div className="flex justify-between text-[10px] text-white/20 mt-1"><span>1</span><span>16</span></div>
                </div>
              </div>

              {}
              <div className="grid grid-cols-2 gap-3">
                {}
                <div className="flex flex-col gap-2">
                  <label className={labelCls}>{t('server.create.onlineModeLabel')}</label>
                  <button type="button"
                onClick={() => set('onlineMode', !form.onlineMode)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                form.onlineMode ?
                'border-green-500/30 bg-green-500/8' :
                'border-white/10 bg-white/3'}`
                }>
                    <div className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${form.onlineMode ? 'text-green-400' : 'text-white/25'}`}>
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5z" />
                      </svg>
                      <span className={`text-xs font-semibold ${form.onlineMode ? 'text-green-400' : 'text-white/40'}`}>
                        {form.onlineMode ? t('server.create.toggleOn') : t('server.create.toggleOff')}
                      </span>
                    </div>
                    {}
                    <div className={`w-9 h-5 rounded-full transition-all relative flex-shrink-0 ${form.onlineMode ? 'bg-green-500' : 'bg-white/15'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.onlineMode ? 'left-4' : 'left-0.5'}`} />
                    </div>
                  </button>
                  <p className="text-[10px] text-white/25 leading-relaxed">
                    {form.onlineMode ?
                  t('server.create.onlineModeDesc') :
                  t('server.create.onlineModeOffDesc')}
                  </p>
                </div>

                {}
                <div className="flex flex-col gap-2">
                  <label className={labelCls}>{t('server.create.maxPlayersLabel')}</label>
                  <input
                  type="number" min="1" max="1000" step="1"
                  value={form.maxPlayers}
                  onChange={(e) => set('maxPlayers', Math.max(1, Math.min(1000, parseInt(e.target.value) || 20)))}
                  className={`${inputCls} font-mono`}
                  placeholder={t('server.create.maxPlayersPlaceholder')} />
                
                  <p className="text-[10px] text-white/25">{t('server.create.maxPlayersHint')}</p>
                </div>
              </div>

              {}
              <div>
                <label className={labelCls}>{t('server.create.jvmLabel')}</label>
                <JvmPresetDropdown
                value={form.jvmArgs}
                onChange={(v) => set('jvmArgs', v)}
                ramGb={form.ramGb} />
              
              </div>

              {}
              <div>
                <label className={labelCls}>{t('server.create.javaLabel')}</label>
                <JavaDropdown value={selectedJavaPkg} onChange={setSelectedJavaPkg} />
                <p className="text-[10px] text-white/20 mt-1">
                  {t('server.create.javaHint')}
                </p>
              </div>

              {}
              <div>
                <label className={labelCls}>{t('server.create.serverPathLabel')}</label>
                <div className="flex gap-2">
                  <input className={`${inputCls} flex-1 font-mono text-xs`} value={form.serverPath}
                onChange={(e) => set('serverPath', e.target.value)}
                placeholder={t('server.create.serverPathPlaceholder')} />
                  <button onClick={handleBrowse}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/8 transition-all text-xs flex-shrink-0">
                    {t('server.create.serverPathBrowse')}
                  </button>
                </div>
              </div>

              {}
              <div className="flex items-start gap-3 p-3 rounded-xl border border-white/8 bg-white/3">
                <button onClick={() => set('acceptEula', !form.acceptEula)}
              className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
              form.acceptEula ? 'bg-green-500 border-green-500' : 'bg-white/5 border border-white/20'}`
              }>
                  {form.acceptEula &&
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                }
                </button>
                <div>
                  <p className="text-xs font-semibold text-white/70">{t('server.create.eulaLabel')}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">
                    {t('server.create.eulaDesc')}{' '}
                    <span className="text-green-400/70">{t('server.create.eulaFullName')}</span>.
                  </p>
                </div>
              </div>

              {error &&
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            }
            </div>
          }
        </div>

        {}
        {step === 2 &&
        <div className="flex gap-2 px-5 py-4 border-t border-white/5 flex-shrink-0">
            <button onClick={() => setStep(1)}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white border border-white/8 hover:bg-white/5 transition-all">
              {t('server.create.backBtn')}
            </button>
            <button onClick={handleCreate} disabled={creating || !form.acceptEula}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 4px 16px rgba(34,197,94,0.25)' }}
          title={!form.acceptEula ? t('server.create.errorEula') : ''}>
              {creating ?
            <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('server.create.creating')}
                </> :
            t('server.create.createBtn')}
            </button>
          </div>
        }
      </div>
    </div>);

}