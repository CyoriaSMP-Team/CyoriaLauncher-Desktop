import { useState, useCallback, useEffect } from 'react';
import { isElectron, Icons, formatBytes, formatDate, LoadingState, EmptyState, SearchBar } from './shared';
import { useLang } from '../../../i18n/LangProvider';import LocalizedText from "../../../i18n/LocalizedText.jsx";

export default function WorldsTab({ profile, accountId }) {
  const { t } = useLang();
  const [worlds, setWorlds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filteredWorlds = q ?
  worlds.filter((w) => (w.displayName || w.name || w.folderName || '').toLowerCase().includes(q)) :
  worlds;

  const load = useCallback(async () => {
    if (!isElectron || !profile?.id) {setLoading(false);return;}
    setLoading(true);
    try {
      const r = await window.electronAPI.profileListWorlds(profile.id, accountId);
      if (r?.ok) setWorlds(r.worlds || []);
    } catch {}
    setLoading(false);
  }, [profile?.id, accountId]);

  useEffect(() => {load();}, [load]);

  async function handleDelete(folder) {
    if (!isElectron) return;
    setDeleting(folder);
    try {
      await window.electronAPI.profileDeleteWorld(profile.id, folder, accountId);
      setWorlds((prev) => prev.filter((w) => w.folder !== folder));
    } catch {}
    setDeleting(null);
    setConfirmDelete(null);
  }

  if (loading) return <LoadingState text={t('profileSettings.worlds.loading')} />;

  if (worlds.length === 0) return (
    <EmptyState
      icon={Icons.world}
      title={t('profileSettings.worlds.emptyTitle')}
      desc={t('profileSettings.worlds.emptyDesc')} />);



  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <SearchBar value={query} onChange={setQuery} placeholder={t('profileSettings.worlds.search')} />
        <span className="text-xs text-white/30 whitespace-nowrap">{q ? `${filteredWorlds.length}/${worlds.length}` : worlds.length}<LocalizedText id="auto.be78222367b7" /></span>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
        {filteredWorlds.length === 0 ?
        <EmptyState icon={Icons.search} title={t('profileSettings.worlds.noResults')} /> :

        <div className="flex flex-col gap-1 p-2.5">
      {filteredWorlds.map((w) =>
          <div
            key={w.folderName || w.folder || w.name}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-white/8 transition-all group">
            
          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-white/8 flex items-center justify-center">
            {w.iconBase64 ?
              <img src={w.iconBase64} alt={w.name || w.folderName} className="w-full h-full object-cover" /> :

              <span className="text-white/20">{Icons.world}</span>
              }
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/80 truncate">{w.displayName || w.name || w.folderName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {w.gameMode && <span className="text-[10px] text-white/30">{w.gameMode}</span>}
              {w.lastPlayed && <span className="text-[10px] text-white/20">{formatDate(w.lastPlayed)}</span>}
              {w.size > 0 && <span className="text-[10px] text-white/20">{formatBytes(w.size)}</span>}
            </div>
          </div>

          {confirmDelete === (w.folderName || w.folder) ?
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] text-red-400/70">{t('profileSettings.worlds.deleteConfirm')}</span>
              <button
                onClick={() => handleDelete(w.folderName || w.folder)}
                disabled={deleting === (w.folderName || w.folder)}
                className="px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400 text-[10px] font-bold hover:bg-red-500/25 transition-all disabled:opacity-50">
                
                {deleting === (w.folderName || w.folder) ? '...' : t('profileSettings.worlds.delete')}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-2 py-1 rounded-lg bg-white/5 border border-white/8 text-white/40 text-[10px] hover:bg-white/10 transition-all">
                
                {t('profileSettings.worlds.cancel')}
              </button>
            </div> :

            <button
              onClick={() => setConfirmDelete(w.folderName || w.folder)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
              title={t('profileSettings.worlds.deleteWorld')}>
              
              {Icons.trash}
            </button>
            }
        </div>
          )}
        </div>
        }
      </div>
    </div>);

}