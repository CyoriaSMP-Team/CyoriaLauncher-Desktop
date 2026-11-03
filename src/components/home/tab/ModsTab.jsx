import { useState, useCallback, useEffect, useRef } from 'react';
import { isElectron, Icons, formatBytes, LoadingState, EmptyState, ViewToggle, DropZoneWrapper, SearchBar } from './shared';
import { useLang } from '../../../i18n/LangProvider';import LocalizedText from "../../../i18n/LocalizedText.jsx";

export default function ModsTab({ profile, accountId }) {
  const { t } = useLang();
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [metaCache, setMetaCache] = useState({});
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [installing, setInstalling] = useState([]);
  const [query, setQuery] = useState('');
  const fetchingMeta = useRef(new Set());

  const q = query.trim().toLowerCase();
  const filteredMods = q ?
  mods.filter((m) => (metaCache[m.fileName]?.name || m.displayName || m.fileName || '').toLowerCase().includes(q)) :
  mods;

  const load = useCallback(async () => {
    if (!isElectron || !profile?.id) {setLoading(false);return;}
    setLoading(true);
    try {
      const r = await window.electronAPI.profileListMods(profile.id, accountId);
      if (r?.ok) setMods(r.mods || []);
    } catch {}
    setLoading(false);
  }, [profile?.id, accountId]);

  useEffect(() => {load();}, [load]);

  useEffect(() => {
    if (!isElectron || mods.length === 0) return;
    for (const mod of mods) {
      if (metaCache[mod.fileName] !== undefined) continue;
      if (fetchingMeta.current.has(mod.fileName)) continue;
      fetchingMeta.current.add(mod.fileName);
      window.electronAPI.profileGetModMeta(profile.id, mod.fileName, accountId).
      then((r) => setMetaCache((prev) => ({ ...prev, [mod.fileName]: r?.meta || null }))).
      catch(() => setMetaCache((prev) => ({ ...prev, [mod.fileName]: null }))).
      finally(() => fetchingMeta.current.delete(mod.fileName));
    }
  }, [mods, profile?.id, accountId]);

  async function handleToggle(mod) {
    if (!isElectron) return;
    setToggling(mod.fileName);
    try {
      const r = await window.electronAPI.profileToggleMod(profile.id, mod.fileName, accountId);
      if (r?.ok) {
        const newFileName = r.newFileName || mod.fileName;
        setMods((prev) => prev.map((m) =>
        m.fileName === mod.fileName ?
        { ...m, fileName: newFileName, enabled: r.enabled } :
        m
        ));
        if (newFileName !== mod.fileName) {
          setMetaCache((prev) => {
            const next = { ...prev };
            next[newFileName] = next[mod.fileName];
            delete next[mod.fileName];
            return next;
          });
        }
      }
    } catch {}
    setToggling(null);
  }

  async function handleDelete(fileName) {
    if (!isElectron) return;
    setDeleting(fileName);
    try {
      await window.electronAPI.profileDeleteMod(profile.id, fileName, accountId);
      setMods((prev) => prev.filter((m) => m.fileName !== fileName));
      setMetaCache((prev) => {const n = { ...prev };delete n[fileName];return n;});
    } catch {}
    setDeleting(null);
    setConfirmDelete(null);
  }

  async function handleDropFiles(files) {
    if (!isElectron || !profile?.id) return;
    // Chỉ nhận file .jar cho mods
    const valid = files.filter((f) => f.name.toLowerCase().endsWith('.jar'));
    if (!valid.length) return;
    setInstalling(valid.map((f) => f.name));
    for (const file of valid) {
      try {
        // Lấy path thật từ webUtils (Electron)
        const srcPath = window.electronAPI.getFilePath(file);
        if (!srcPath) continue;
        const r = await window.electronAPI.profileInstallFile(profile.id, 'mod', srcPath, accountId);
        if (r?.ok && !r.skipped) {
          setMods((prev) => [...prev, { fileName: r.fileName, displayName: r.fileName, size: r.size, mtime: r.mtime, enabled: true }]);
        }
      } catch {}
    }
    setInstalling([]);
  }

  if (loading) return <LoadingState text={t('profileSettings.mods.loading')} />;

  if (mods.length === 0) return (
    <DropZoneWrapper onDrop={handleDropFiles} accept={['.jar']} color="green">
      <EmptyState
        icon={Icons.mod}
        title={t('profileSettings.mods.emptyTitle')}
        desc={t('profileSettings.mods.emptyDesc')} />
      
    </DropZoneWrapper>);


  return (
    <DropZoneWrapper onDrop={handleDropFiles} accept={['.jar']} color="green">
      <div className="flex flex-col h-full">
        {installing.length > 0 &&
        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border-b border-green-500/20 text-xs text-green-400">
            {Icons.spin}
            <span>{t('profileSettings.mods.installing', { count: installing.length })}</span>
          </div>
        }
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
          <SearchBar value={query} onChange={setQuery} placeholder={t('profileSettings.mods.search')} />
          <span className="text-xs text-white/30 whitespace-nowrap">{q ? `${filteredMods.length}/${mods.length}` : mods.length}<LocalizedText id="auto.ca3c363a9ee6" /></span>
          <ViewToggle view={view} onChange={setView} />
        </div>

        <div className="flex-1 overflow-y-auto" style={{ scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
          {filteredMods.length === 0 ?
          <EmptyState icon={Icons.search} title={t('profileSettings.mods.noResults')} /> :
          view === 'list' ?
          <div className="flex flex-col gap-1 p-2.5">
              {filteredMods.map((mod) => {
              const meta = metaCache[mod.fileName];
              const iconUrl = meta?.iconUrl || null;
              return (
                <div
                  key={mod.fileName}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all group ${mod.enabled ? 'bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/8' : 'bg-white/1 border-white/3 opacity-50 hover:opacity-70'}`}>
                  
                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-white/8 flex items-center justify-center">
                      {iconUrl ? <img src={iconUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-white/20 scale-90">{Icons.mod}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/80 truncate">{meta?.name || mod.displayName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-white/25">{formatBytes(mod.size)}</span>
                        {!mod.enabled && <span className="text-[10px] text-orange-400/60">{t('profileSettings.mods.disabled')}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {confirmDelete === mod.fileName ?
                    <>
                          <span className="text-[10px] text-red-400/70">{t('profileSettings.mods.deleteConfirm')}</span>
                          <button onClick={() => handleDelete(mod.fileName)} disabled={deleting === mod.fileName} className="px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400 text-[10px] font-bold hover:bg-red-500/25 transition-all disabled:opacity-50">
                            {deleting === mod.fileName ? '...' : t('profileSettings.mods.delete')}
                          </button>
                          <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 rounded-lg bg-white/5 border border-white/8 text-white/40 text-[10px] hover:bg-white/10 transition-all">{t('profileSettings.mods.cancel')}</button>
                        </> :

                    <>
                          <button
                        onClick={() => handleToggle(mod)}
                        disabled={toggling === mod.fileName}
                        className={`relative w-9 h-5 rounded-full transition-all flex-shrink-0 ${mod.enabled ? 'bg-green-500' : 'bg-white/10'} disabled:opacity-50`}
                        title={mod.enabled ? t('profileSettings.mods.disableMod') : t('profileSettings.mods.enableMod')}>
                        
                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${mod.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                          </button>
                          <button onClick={() => setConfirmDelete(mod.fileName)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all" title={t('profileSettings.mods.deleteMod')}>
                            {Icons.trash}
                          </button>
                        </>
                    }
                    </div>
                  </div>);

            })}
            </div> :

          <div className="grid grid-cols-3 gap-2 p-2.5">
              {filteredMods.map((mod) => {
              const meta = metaCache[mod.fileName];
              const iconUrl = meta?.iconUrl || null;
              return (
                <div key={mod.fileName} className={`relative rounded-xl border overflow-hidden transition-all group ${mod.enabled ? 'bg-white/3 border-white/8 hover:border-white/15' : 'bg-white/1 border-white/4 opacity-50 hover:opacity-70'}`}>
                    <div className="relative w-full overflow-hidden" style={{ paddingBottom: '55%' }}>
                      {iconUrl && <img src={iconUrl} alt="" className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-30" />}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/8 border border-white/10 flex items-center justify-center shadow-lg">
                          {iconUrl ? <img src={iconUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-white/30">{Icons.mod}</span>}
                        </div>
                      </div>
                      <button
                      onClick={() => handleToggle(mod)}
                      disabled={toggling === mod.fileName}
                      className={`absolute top-1.5 right-1.5 w-6 h-3.5 rounded-full transition-all ${mod.enabled ? 'bg-green-500' : 'bg-white/15'} disabled:opacity-50`}
                      title={mod.enabled ? t('profileSettings.mods.disable') : t('profileSettings.mods.enable')}>
                      
                        <span className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow transition-all ${mod.enabled ? 'left-[10px]' : 'left-0.5'}`} />
                      </button>
                    </div>
                    <div className="px-2 py-1.5">
                      <p className="text-[10px] font-medium text-white/70 truncate leading-tight">{meta?.name || mod.displayName}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] text-white/25">{formatBytes(mod.size)}</span>
                        {confirmDelete === mod.fileName ?
                      <div className="flex gap-1">
                            <button onClick={() => handleDelete(mod.fileName)} disabled={deleting === mod.fileName} className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50">
                              {deleting === mod.fileName ? '...' : t('profileSettings.mods.delete')}
                            </button>
                            <button onClick={() => setConfirmDelete(null)} className="text-[9px] px-1.5 py-0.5 rounded bg-white/8 text-white/40 hover:bg-white/12 transition-all">{t('profileSettings.mods.cancel')}</button>
                          </div> :

                      <button onClick={() => setConfirmDelete(mod.fileName)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            {Icons.trash}
                          </button>
                      }
                      </div>
                    </div>
                  </div>);

            })}
            </div>
          }
        </div>
      </div>
    </DropZoneWrapper>);

}