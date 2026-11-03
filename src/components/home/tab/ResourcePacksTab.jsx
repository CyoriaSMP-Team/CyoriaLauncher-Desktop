import { useState, useCallback, useEffect, useRef } from 'react';
import { isElectron, Icons, formatBytes, LoadingState, EmptyState, ViewToggle, DropZoneWrapper, SearchBar } from './shared';
import { useLang } from '../../../i18n/LangProvider';import LocalizedText from "../../../i18n/LocalizedText.jsx";

export default function ResourcePacksTab({ profile, accountId }) {
  const { t } = useLang();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [metaCache, setMetaCache] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [installing, setInstalling] = useState([]);
  const [query, setQuery] = useState('');
  const fetchingMeta = useRef(new Set());

  const q = query.trim().toLowerCase();
  const filteredPacks = q ?
  packs.filter((p) => (metaCache[p.fileName]?.name || p.displayName || p.fileName || '').toLowerCase().includes(q)) :
  packs;

  const load = useCallback(async () => {
    if (!isElectron || !profile?.id) {setLoading(false);return;}
    setLoading(true);
    try {
      const r = await window.electronAPI.profileListResourcePacks(profile.id, accountId);
      if (r?.ok) setPacks(r.packs || []);
    } catch {}
    setLoading(false);
  }, [profile?.id, accountId]);

  useEffect(() => {load();}, [load]);

  useEffect(() => {
    if (!isElectron || packs.length === 0) return;
    for (const p of packs) {
      if (metaCache[p.fileName] !== undefined) continue;
      if (fetchingMeta.current.has(p.fileName)) continue;
      fetchingMeta.current.add(p.fileName);
      window.electronAPI.profileGetResourcePackMeta(profile.id, p.fileName, accountId).
      then((r) => setMetaCache((prev) => ({ ...prev, [p.fileName]: r?.meta || null }))).
      catch(() => setMetaCache((prev) => ({ ...prev, [p.fileName]: null }))).
      finally(() => fetchingMeta.current.delete(p.fileName));
    }
  }, [packs, profile?.id, accountId]);

  async function handleDelete(fileName) {
    if (!isElectron) return;
    setDeleting(fileName);
    try {
      await window.electronAPI.profileDeleteResourcePack(profile.id, fileName, accountId);
      setPacks((prev) => prev.filter((p) => p.fileName !== fileName));
      setMetaCache((prev) => {const n = { ...prev };delete n[fileName];return n;});
    } catch {}
    setDeleting(null);
    setConfirmDelete(null);
  }

  async function handleDropFiles(files) {
    if (!isElectron || !profile?.id) return;
    // Resource pack nhận .zip và .rar, không nhận .jar
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
        const r = await window.electronAPI.profileInstallFile(profile.id, 'resourcepack', srcPath, accountId);
        if (r?.ok && !r.skipped) {
          setPacks((prev) => [...prev, { fileName: r.fileName, displayName: r.fileName, size: r.size, mtime: r.mtime }]);
        }
      } catch {}
    }
    setInstalling([]);
  }

  if (loading) return <LoadingState text={t('profileSettings.resourcepacks.loading')} />;

  if (packs.length === 0) return (
    <DropZoneWrapper onDrop={handleDropFiles} accept={['.zip', '.rar']} color="purple">
      <EmptyState
        icon={Icons.resourcepack}
        title={t('profileSettings.resourcepacks.emptyTitle')}
        desc={t('profileSettings.resourcepacks.emptyDesc')} />
      
    </DropZoneWrapper>);


  return (
    <DropZoneWrapper onDrop={handleDropFiles} accept={['.zip', '.rar']} color="purple">
      <div className="flex flex-col h-full">
        {installing.length > 0 &&
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border-b border-purple-500/20 text-xs text-purple-400">
            {Icons.spin}
            <span>{t('profileSettings.resourcepacks.installing', { count: installing.length })}</span>
          </div>
        }
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
          <SearchBar value={query} onChange={setQuery} placeholder={t('profileSettings.resourcepacks.search')} />
          <span className="text-xs text-white/30 whitespace-nowrap">{q ? `${filteredPacks.length}/${packs.length}` : packs.length}<LocalizedText id="auto.00ae155a96d5" /></span>
          <ViewToggle view={view} onChange={setView} />
        </div>

        <div className="flex-1 overflow-y-auto" style={{ scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
          {filteredPacks.length === 0 ?
          <EmptyState icon={Icons.search} title={t('profileSettings.resourcepacks.noResults')} /> :
          view === 'list' ?
          <div className="flex flex-col gap-1 p-2.5">
              {filteredPacks.map((pack) => {
              const meta = metaCache[pack.fileName];
              const iconUrl = meta?.iconUrl || null;
              return (
                <div key={pack.fileName} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-white/8 transition-all group">
                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-purple-500/8 border border-purple-500/15 flex items-center justify-center">
                      {iconUrl ? <img src={iconUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-purple-400/40 scale-90">{Icons.resourcepack}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/80 truncate">{meta?.name || pack.displayName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-white/25">{formatBytes(pack.size)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {confirmDelete === pack.fileName ?
                    <>
                          <span className="text-[10px] text-red-400/70">{t('profileSettings.resourcepacks.deleteConfirm')}</span>
                          <button onClick={() => handleDelete(pack.fileName)} disabled={deleting === pack.fileName} className="px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400 text-[10px] font-bold hover:bg-red-500/25 transition-all disabled:opacity-50">
                            {deleting === pack.fileName ? '...' : t('profileSettings.resourcepacks.delete')}
                          </button>
                          <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 rounded-lg bg-white/5 border border-white/8 text-white/40 text-[10px] hover:bg-white/10 transition-all">{t('profileSettings.resourcepacks.cancel')}</button>
                        </> :

                    <button onClick={() => setConfirmDelete(pack.fileName)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all" title={t('profileSettings.resourcepacks.deletePack')}>
                          {Icons.trash}
                        </button>
                    }
                    </div>
                  </div>);

            })}
            </div> :

          <div className="grid grid-cols-3 gap-2 p-2.5">
              {filteredPacks.map((pack) => {
              const meta = metaCache[pack.fileName];
              const iconUrl = meta?.iconUrl || null;
              return (
                <div key={pack.fileName} className="relative rounded-xl border border-white/8 bg-white/3 overflow-hidden transition-all group hover:border-white/15">
                    <div className="relative w-full overflow-hidden" style={{ paddingBottom: '55%' }}>
                      {iconUrl && <img src={iconUrl} alt="" className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-30" />}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-lg">
                          {iconUrl ? <img src={iconUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-purple-400/50">{Icons.resourcepack}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="px-2 py-1.5">
                      <p className="text-[10px] font-medium text-white/70 truncate leading-tight">{meta?.name || pack.displayName}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] text-white/25">{formatBytes(pack.size)}</span>
                        {confirmDelete === pack.fileName ?
                      <div className="flex gap-1">
                            <button onClick={() => handleDelete(pack.fileName)} disabled={deleting === pack.fileName} className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50">
                              {deleting === pack.fileName ? '...' : t('profileSettings.resourcepacks.delete')}
                            </button>
                            <button onClick={() => setConfirmDelete(null)} className="text-[9px] px-1.5 py-0.5 rounded bg-white/8 text-white/40 hover:bg-white/12 transition-all">{t('profileSettings.resourcepacks.cancel')}</button>
                          </div> :

                      <button onClick={() => setConfirmDelete(pack.fileName)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
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