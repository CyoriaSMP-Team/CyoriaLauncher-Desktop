import { useState, useCallback, useEffect, useRef } from 'react';
import { isElectron, Icons, formatBytes, LoadingState, EmptyState, ViewToggle, DropZoneWrapper, SearchBar } from './shared';
import { useLang } from '../../../i18n/LangProvider';import LocalizedText from "../../../i18n/LocalizedText.jsx";

export default function ShadersTab({ profile, accountId }) {
  const { t } = useLang();
  const [shaders, setShaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [metaCache, setMetaCache] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [installing, setInstalling] = useState([]);
  const [query, setQuery] = useState('');
  const fetchingMeta = useRef(new Set());

  const q = query.trim().toLowerCase();
  const filteredShaders = q ?
  shaders.filter((s) => (metaCache[s.fileName]?.name || s.displayName || s.fileName || '').toLowerCase().includes(q)) :
  shaders;

  const load = useCallback(async () => {
    if (!isElectron || !profile?.id) {setLoading(false);return;}
    setLoading(true);
    try {
      const r = await window.electronAPI.profileListShaders(profile.id, accountId);
      if (r?.ok) setShaders(r.shaders || []);
    } catch {}
    setLoading(false);
  }, [profile?.id, accountId]);

  useEffect(() => {load();}, [load]);

  useEffect(() => {
    if (!isElectron || shaders.length === 0) return;
    for (const s of shaders) {
      if (metaCache[s.fileName] !== undefined) continue;
      if (fetchingMeta.current.has(s.fileName)) continue;
      fetchingMeta.current.add(s.fileName);
      window.electronAPI.profileGetShaderMeta(profile.id, s.fileName, accountId).
      then((r) => setMetaCache((prev) => ({ ...prev, [s.fileName]: r?.meta || null }))).
      catch(() => setMetaCache((prev) => ({ ...prev, [s.fileName]: null }))).
      finally(() => fetchingMeta.current.delete(s.fileName));
    }
  }, [shaders, profile?.id, accountId]);

  async function handleDelete(shader) {
    if (!isElectron) return;
    setDeleting(shader.fileName);
    try {
      await window.electronAPI.profileDeleteShader(profile.id, shader.fileName, shader.subDir, accountId);
      setShaders((prev) => prev.filter((s) => s.fileName !== shader.fileName));
      setMetaCache((prev) => {const n = { ...prev };delete n[shader.fileName];return n;});
    } catch {}
    setDeleting(null);
    setConfirmDelete(null);
  }

  async function handleDropFiles(files) {
    if (!isElectron || !profile?.id) return;
    // Shader nhận .zip và .rar, không nhận .jar
    const valid = files.filter((f) => {
      const n = f.name.toLowerCase();
      return n.endsWith('.zip') || n.endsWith('.rar');
    });
    if (!valid.length) return;
    setInstalling(valid.map((f) => f.name));
    for (const file of valid) {
      try {
        const srcPath = window.electronAPI.getFilePath(file);
        if (!srcPath) continue;
        const r = await window.electronAPI.profileInstallFile(profile.id, 'shader', srcPath, accountId);
        if (r?.ok && !r.skipped) {
          setShaders((prev) => [...prev, { fileName: r.fileName, displayName: r.fileName, size: r.size, mtime: r.mtime }]);
        }
      } catch {}
    }
    setInstalling([]);
  }

  if (loading) return <LoadingState text={t('profileSettings.shaders.loading')} />;

  if (shaders.length === 0) return (
    <DropZoneWrapper onDrop={handleDropFiles} accept={['.zip', '.rar']} color="yellow">
      <EmptyState
        icon={Icons.shader}
        title={t('profileSettings.shaders.emptyTitle')}
        desc={t('profileSettings.shaders.emptyDesc')} />
      
    </DropZoneWrapper>);


  return (
    <DropZoneWrapper onDrop={handleDropFiles} accept={['.zip', '.rar']} color="yellow">
      <div className="flex flex-col h-full">
        {installing.length > 0 &&
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border-b border-yellow-500/20 text-xs text-yellow-400">
            {Icons.spin}
            <span><LocalizedText id="auto.a123139eb82f" />{installing.length}<LocalizedText id="auto.78a93530bc92" /></span>
          </div>
        }
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
          <SearchBar value={query} onChange={setQuery} placeholder={t('profileSettings.shaders.search')} />
          <span className="text-xs text-white/30 whitespace-nowrap">{q ? `${filteredShaders.length}/${shaders.length}` : shaders.length}<LocalizedText id="auto.7601ae016b85" /></span>
          <ViewToggle view={view} onChange={setView} />
        </div>

        <div className="flex-1 overflow-y-auto" style={{ scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
          {filteredShaders.length === 0 ?
          <EmptyState icon={Icons.search} title={t('profileSettings.shaders.noResults')} /> :
          view === 'list' ?
          <div className="flex flex-col gap-1 p-2.5">
              {filteredShaders.map((shader) => {
              const meta = metaCache[shader.fileName];
              const iconUrl = meta?.iconUrl || null;
              return (
                <div key={shader.fileName} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-white/8 transition-all group">
                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-yellow-500/8 border border-yellow-500/15 flex items-center justify-center">
                      {iconUrl ? <img src={iconUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-yellow-500/40 scale-90">{Icons.shader}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/80 truncate">{meta?.name || shader.displayName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-white/25">{formatBytes(shader.size)}</span>
                        {shader.subDir && <span className="text-[10px] text-white/20">{shader.subDir}/</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {confirmDelete === shader.fileName ?
                    <>
                          <span className="text-[10px] text-red-400/70">{t('profileSettings.shaders.deleteConfirm')}</span>
                          <button onClick={() => handleDelete(shader)} disabled={deleting === shader.fileName} className="px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400 text-[10px] font-bold hover:bg-red-500/25 transition-all disabled:opacity-50">
                            {deleting === shader.fileName ? '...' : t('profileSettings.shaders.delete')}
                          </button>
                          <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 rounded-lg bg-white/5 border border-white/8 text-white/40 text-[10px] hover:bg-white/10 transition-all">{t('profileSettings.shaders.cancel')}</button>
                        </> :

                    <button onClick={() => setConfirmDelete(shader.fileName)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all" title={t("auto.6d22e6125393")}>
                          {Icons.trash}
                        </button>
                    }
                    </div>
                  </div>);

            })}
            </div> :

          <div className="grid grid-cols-3 gap-2 p-2.5">
              {filteredShaders.map((shader) => {
              const meta = metaCache[shader.fileName];
              const iconUrl = meta?.iconUrl || null;
              return (
                <div key={shader.fileName} className="relative rounded-xl border border-white/8 bg-white/3 overflow-hidden transition-all group hover:border-white/15">
                    <div className="relative w-full overflow-hidden" style={{ paddingBottom: '55%' }}>
                      {iconUrl && <img src={iconUrl} alt="" className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-30" />}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shadow-lg">
                          {iconUrl ? <img src={iconUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-yellow-500/50">{Icons.shader}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="px-2 py-1.5">
                      <p className="text-[10px] font-medium text-white/70 truncate leading-tight">{meta?.name || shader.displayName}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] text-white/25">{formatBytes(shader.size)}</span>
                        {confirmDelete === shader.fileName ?
                      <div className="flex gap-1">
                            <button onClick={() => handleDelete(shader)} disabled={deleting === shader.fileName} className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50">
                              {deleting === shader.fileName ? '...' : t('profileSettings.shaders.delete')}
                            </button>
                            <button onClick={() => setConfirmDelete(null)} className="text-[9px] px-1.5 py-0.5 rounded bg-white/8 text-white/40 hover:bg-white/12 transition-all">{t('profileSettings.shaders.cancel')}</button>
                          </div> :

                      <button onClick={() => setConfirmDelete(shader.fileName)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
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