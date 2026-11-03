import { useState, useEffect, useRef, useCallback } from 'react';
import JavaManagerModal from '../JavaManagerModal';
import { isElectron, Icons } from './shared';
import { useLang } from '../../../i18n/LangProvider';

// ── Loader version picker ────────────────────────────────────────────────────
import LocalizedText from "../../../i18n/LocalizedText.jsx";function LoaderVersionPicker({ loader, gameVersion, value, onChange }) {const { t } = useLang();
  const [versions, setVersions] = useState([]);
  const [promos, setPromos] = useState({ recommended: null, latest: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState('');

  const fetchVersions = useCallback(async () => {
    if (!gameVersion || !loader || loader === 'vanilla') return;
    setLoading(true);
    setError(null);
    setVersions([]);
    try {
      if (loader === 'fabric') {
        const result = await window.electronAPI.fabricGetLoaderVersions(gameVersion);
        if (result?.error) throw new Error(result.error);
        setVersions(result.data || []);
      } else if (loader === 'forge') {
        const result = await window.electronAPI.forgeGetVersions(gameVersion);
        if (result?.error) throw new Error(result.error);
        setVersions(result.data?.versions || []);
        setPromos({ recommended: result.data?.recommended || null, latest: result.data?.latest || null });
      } else if (loader === 'neoforge') {
        const result = await window.electronAPI.neoforgeGetVersions(gameVersion);
        if (result?.error) throw new Error(result.error);
        setVersions(result.data?.versions || []);
        setPromos({ recommended: null, latest: result.data?.latest || null });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loader, gameVersion]);

  useEffect(() => {
    setVersions([]);
    setPromos({ recommended: null, latest: null });
    setFilter('');
    setExpanded(false);
    fetchVersions();
  }, [fetchVersions]);

  if (!loader || loader === 'vanilla') return null;

  // Hiển thị tên version hiện tại (fabric dùng object {version, stable})
  const displayValue = value || '';

  // Danh sách đã lọc
  const listItems = loader === 'fabric' ?
  versions.filter((v) => !filter || v.version.includes(filter)) :
  versions.filter((v) => !filter || v.includes(filter));

  const loaderColor = {
    fabric: 'text-purple-400',
    forge: 'text-orange-400',
    neoforge: 'text-rose-400'
  }[loader] || 'text-white/70';

  const loaderBorder = {
    fabric: 'border-purple-500/30 ring-purple-500/20',
    forge: 'border-orange-500/30 ring-orange-500/20',
    neoforge: 'border-rose-500/30 ring-rose-500/20'
  }[loader] || 'border-white/20';

  return (
    <div className="flex flex-col gap-1.5">
      {/* Nút mở/đóng dropdown */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 border transition-all text-left
          ${expanded ? `${loaderBorder} ring-1` : 'border-white/8 hover:border-white/15'}`}>
        
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-white/35 mb-0.5"><LocalizedText id="auto.3d87701aa4fe" /></span>
          <span className={`text-xs font-mono font-semibold truncate ${displayValue ? loaderColor : 'text-white/25'}`}>
            {displayValue || 'Chưa chọn'}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {loading &&
          <svg className="animate-spin w-3.5 h-3.5 text-white/30" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          }
          <svg viewBox="0 0 24 24" fill="currentColor"
          className={`w-3.5 h-3.5 text-white/30 transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </div>
      </button>

      {/* Dropdown */}
      {expanded &&
      <div className="rounded-xl border border-white/8 overflow-hidden bg-[#111]">
          {/* Search */}
          <div className="px-3 py-2 border-b border-white/5">
            <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={t("auto.de8d1fc51665")}
            className="w-full bg-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white/70 placeholder-white/20 outline-none border border-white/8 focus:border-white/20 transition-all"
            autoFocus />
          
          </div>

          {/* List */}
          <div className="max-h-52 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
            {loading ?
          <div className="flex items-center justify-center py-8 gap-2">
                <svg className={`animate-spin w-4 h-4 ${loaderColor}`} viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-xs text-white/30"><LocalizedText id="auto.75c101c52de6" /></span>
              </div> :
          error ?
          <div className="flex flex-col items-center py-6 gap-2">
                <p className="text-xs text-red-400/70 text-center px-3">{error}</p>
                <button onClick={fetchVersions}
            className="px-3 py-1 rounded-lg bg-white/8 text-xs text-white/50 hover:text-white/80 transition-all"><LocalizedText id="auto.a938a54fd6e4" />

            </button>
              </div> :
          listItems.length === 0 ?
          <div className="py-6 text-center text-xs text-white/20"><LocalizedText id="auto.93503b8d0e47" /></div> :

          listItems.map((item) => {
            const v = loader === 'fabric' ? item.version : item;
            const isSelected = value === v;
            const isRec = v === promos.recommended;
            const isLatest = v === promos.latest;
            const isFabricStable = loader === 'fabric' && item.stable;
            return (
              <button
                key={v}
                type="button"
                onClick={() => {onChange(v);setExpanded(false);setFilter('');}}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono transition-all
                      ${isSelected ? `bg-white/8 ${loaderColor}` : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}>
                
                    <span>{v}</span>
                    <div className="flex items-center gap-1.5">
                      {isFabricStable && <span className="text-[9px] px-1 py-0.5 rounded bg-green-500/15 text-green-400"><LocalizedText id="auto.9c7091c51bd1" /></span>}
                      {isRec && <span className="text-[9px] px-1 py-0.5 rounded bg-green-500/15 text-green-400"><LocalizedText id="auto.064cb5d3122e" /></span>}
                      {isLatest && !isRec && <span className="text-[9px] px-1 py-0.5 rounded bg-orange-500/15 text-orange-400"><LocalizedText id="auto.13984ce56662" /></span>}
                      {isSelected &&
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 flex-shrink-0">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                  }
                    </div>
                  </button>);

          })
          }
          </div>
        </div>
      }
    </div>);

}

// ─────────────────────────────────────────────────────────────────────────────

export default function GeneralTab({ profile, onProfileUpdated }) {
  const { t } = useLang();
  const [name, setName] = useState(profile?.name || '');
  const [ram, setRam] = useState(profile?.ramGb || 2);
  const [winWidth, setWinWidth] = useState(profile?.windowWidth || 854);
  const [winHeight, setWinHeight] = useState(profile?.windowHeight || 480);
  const [jvmArgs, setJvmArgs] = useState(profile?.jvmArgs || '');
  const [javaRuntime, setJavaRuntime] = useState(profile?.javaRuntime || '');
  const [loaderVersion, setLoaderVersion] = useState(profile?.loaderVersion || '');
  const [autoPerformanceMods, setAutoPerformanceMods] = useState(profile?.autoPerformanceMods === true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showJavaModal, setShowJavaModal] = useState(false);
  const [javaList, setJavaList] = useState([]);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    setName(profile?.name || '');
    setRam(profile?.ramGb || 2);
    setWinWidth(profile?.windowWidth || 854);
    setWinHeight(profile?.windowHeight || 480);
    setJvmArgs(profile?.jvmArgs || '');
    setJavaRuntime(profile?.javaRuntime || '');
    setLoaderVersion(profile?.loaderVersion || '');
    setAutoPerformanceMods(profile?.autoPerformanceMods === true);
  }, [profile?.id]);

  useEffect(() => {
    if (!isElectron) return;
    window.electronAPI.profileListJavas?.().
    then((r) => {if (r?.ok) setJavaList(r.javas || []);}).
    catch(() => {});
  }, []);

  async function handleSave() {
    if (!isElectron || !profile?.id) return;
    setSaving(true);
    try {
      const patch = {
        name: name.trim() || profile.name,
        ramGb: ram,
        windowWidth: Number(winWidth) || 854,
        windowHeight: Number(winHeight) || 480,
        jvmArgs: jvmArgs.trim(),
        javaRuntime: javaRuntime.trim(),
        autoPerformanceMods,
        loaderVersion: loaderVersion.trim()
      };
      await window.electronAPI.profileUpdate(profile.id, patch);
      setSaved(true);
      onProfileUpdated?.({ ...profile, ...patch });
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  }

  function handleJavaSelected(javaExe) {
    setJavaRuntime(javaExe);
    setShowJavaModal(false);
  }

  const ramMarks = [1, 2, 4, 6, 8, 12, 16, 24, 32];

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Tên profile */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-white/50">{t('profileSettings.general.nameLabel')}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={profile?.name}
          className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white/85 placeholder-white/20 outline-none focus:border-white/20 focus:bg-white/8 transition-all" />
        
      </div>

      {/* Loader Version — chỉ hiện với profile có loader */}
      {profile?.loader && profile.loader !== 'vanilla' &&
      <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-white/50"><LocalizedText id="auto.77ea3e99402a" /></label>
            <span className="text-[10px] text-white/25 font-mono">{profile.gameVersion}</span>
          </div>
          {/* Info bar hiển thị loader type */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/3 border border-white/6">
            <span className={{
            fabric: 'text-purple-400',
            forge: 'text-orange-400',
            neoforge: 'text-rose-400'
          }[profile.loader] || 'text-white/50'}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
            </span>
            <span className="text-xs text-white/40">
              <span className={{
              fabric: 'text-purple-400',
              forge: 'text-orange-400',
              neoforge: 'text-rose-400'
            }[profile.loader] || 'text-white/60'}>
                {profile.loader.charAt(0).toUpperCase() + profile.loader.slice(1)}
              </span>
              {' '}<LocalizedText id="auto.d331d2a5f34d" />
          </span>
          </div>
          <LoaderVersionPicker
          loader={profile.loader}
          gameVersion={profile.gameVersion}
          value={loaderVersion}
          onChange={setLoaderVersion} />
        
        </div>
      }

      {/* RAM */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-white/50">{t('profileSettings.general.ramLabel')}</label>
          <span className="text-xs font-bold text-green-400">{ram}<LocalizedText id="auto.e484517c3ae6" /></span>
        </div>
        <div className="relative flex items-center gap-0 h-6">
          {ramMarks.map((m, i) => {
            const isActive = m <= ram;
            const isCurrent = m === ram;
            const isLast = i === ramMarks.length - 1;
            return (
              <button
                key={m}
                onClick={() => setRam(m)}
                className="relative flex-1 flex flex-col items-center gap-1 group"
                title={`${m} GB`}>
                
                <div className={`w-full h-1.5 transition-all ${
                isLast ? 'rounded-r-full' : i === 0 ? 'rounded-l-full' : ''} ${
                isActive ? 'bg-green-500' : 'bg-white/10 group-hover:bg-white/20'}`} />
                {isCurrent &&
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-green-400 shadow-lg shadow-green-500/40 ring-2 ring-green-400/30 z-10" />
                }
              </button>);

          })}
        </div>
        <div className="flex">
          {ramMarks.map((m) =>
          <button
            key={m}
            onClick={() => setRam(m)}
            className={`flex-1 text-center text-[9px] py-0.5 rounded transition-all ${
            m === ram ? 'text-green-400 font-bold' : 'text-white/20 hover:text-white/50'}`
            }>
            
              {m}G
            </button>
          )}
        </div>
      </div>

      {/* Kích thước cửa sổ */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-white/50">{t('profileSettings.general.windowSize')}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={winWidth}
            onChange={(e) => setWinWidth(e.target.value)}
            placeholder="854"
            className="flex-1 bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white/85 placeholder-white/20 outline-none focus:border-white/20 transition-all text-center" />
          
          <span className="text-white/20 text-xs">×</span>
          <input
            type="number"
            value={winHeight}
            onChange={(e) => setWinHeight(e.target.value)}
            placeholder="480"
            className="flex-1 bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white/85 placeholder-white/20 outline-none focus:border-white/20 transition-all text-center" />
          
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[['854×480', 854, 480], ['1280×720', 1280, 720], ['1920×1080', 1920, 1080]].map(([label, w, h]) =>
          <button
            key={label}
            onClick={() => {setWinWidth(w);setWinHeight(h);}}
            className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${winWidth === w && winHeight === h ? 'border-green-500/40 bg-green-500/10 text-green-400' : 'border-white/8 bg-white/3 text-white/30 hover:text-white/60 hover:border-white/15'}`}>
            
              {label}
            </button>
          )}
        </div>
      </div>

      {/* JVM Args */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-white/50">{t('profileSettings.general.jvmArgs')}</label>
        <textarea
          value={jvmArgs}
          onChange={(e) => setJvmArgs(e.target.value)}
          placeholder={t("auto.822f129c9f08")}
          rows={3}
          className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-xs text-white/85 placeholder-white/20 outline-none focus:border-white/20 focus:bg-white/8 transition-all font-mono resize-none" />
        
      </div>

      {/* Java Runtime */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-white/50">{t('profileSettings.general.javaRuntime')}</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-xs text-white/60 font-mono truncate min-w-0">
            {javaRuntime || <span className="text-white/20">{t('profileSettings.general.javaAuto')}</span>}
          </div>
          <button
            onClick={() => setShowJavaModal(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white/50 hover:text-white/80 hover:border-white/15 transition-all text-xs">
            
            {Icons.java}
            <span>{t('profileSettings.general.javaSelect')}</span>
          </button>
          {javaRuntime &&
          <button
            onClick={() => setJavaRuntime('')}
            className="flex-shrink-0 p-2.5 rounded-xl bg-white/5 border border-white/8 text-white/30 hover:text-red-400 hover:border-red-500/20 transition-all"
            title={t("auto.c8c01305af3e")}>
            
              {Icons.trash}
            </button>
          }
        </div>
        {javaList.length > 0 &&
        <div className="flex flex-col gap-1 mt-1">
            {javaList.map((j, i) =>
          <button
            key={i}
            onClick={() => setJavaRuntime(j.path)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${javaRuntime === j.path ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-white/3 border border-white/5 text-white/50 hover:bg-white/6 hover:text-white/70'}`}>
            
                <span className="text-[10px] font-mono truncate flex-1">{j.path}</span>
                {j.version && <span className="text-[9px] text-white/25 flex-shrink-0"><LocalizedText id="auto.04a73ebd92fe" />{j.version}</span>}
                {javaRuntime === j.path && <span className="flex-shrink-0 text-green-400">{Icons.check}</span>}
              </button>
          )}
          </div>
        }
      </div>

      {/* Auto Performance Mods — chỉ hiện với Fabric */}
      {profile?.loader === 'fabric' &&
      <div className="flex items-start justify-between gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white/70">{t('profileSettings.general.autoPerformanceMods')}</p>
            <p className="text-[10px] text-white/35 mt-0.5 leading-relaxed">{t('profileSettings.general.autoPerformanceModsDesc')}</p>
          </div>
          <button
          onClick={() => setAutoPerformanceMods((v) => !v)}
          className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-all mt-0.5 ${autoPerformanceMods ? 'bg-green-500' : 'bg-white/10'}`}
          title={autoPerformanceMods ? t('profileSettings.general.autoPerformanceModsOn') : t('profileSettings.general.autoPerformanceModsOff')}>
          
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${autoPerformanceMods ? 'left-[18px]' : 'left-0.5'}`} />
          </button>
        </div>
      }

      {/* Lưu */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${saved ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-white/8 border border-white/10 text-white/70 hover:bg-white/12 hover:text-white/90'} disabled:opacity-50`}>
        
        {saving ? Icons.spin : saved ? Icons.check : null}
        {saving ? t('profileSettings.general.saving') : saved ? t('profileSettings.general.saved') : t('profileSettings.general.save')}
      </button>

      {showJavaModal &&
      <JavaManagerModal
        profile={profile}
        onClose={() => setShowJavaModal(false)}
        onJavaSelected={handleJavaSelected} />

      }
    </div>);

}