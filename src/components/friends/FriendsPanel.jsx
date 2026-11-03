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

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccounts } from '../../hooks/useAccounts';
import { useLang } from '../../i18n/LangProvider';
import PlayerHead from '../ui/PlayerHead';import LocalizedText from "../../i18n/LocalizedText.jsx";

const API_BASE = 'https://www.voxelx.io.vn/api/friends';

async function apiFetch(action, params = {}) {
  const qs = new URLSearchParams({ action, ...params }).toString();
  return fetch(`${API_BASE}?${qs}`).then((r) => r.json());
}

async function apiPost(action, body) {
  return fetch(`${API_BASE}?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then((r) => r.json());
}

// ── Shared components ─────────────────────────────────────────────────────────
function OnlineDot({ online, playing }) {
  if (playing) return <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px] shadow-sky-400/50 flex-shrink-0" />;
  if (online) return <span className="w-2 h-2 rounded-full bg-sky-400/60 flex-shrink-0" />;
  return <span className="w-2 h-2 rounded-full bg-white/15 flex-shrink-0" />;
}

function EmptyState({ icon, text, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
      {icon}
      <p className="text-[11px] text-white/25">{text}</p>
      {sub && <p className="text-[10px] text-white/15">{sub}</p>}
    </div>);

}

// ── Tab: Bạn bè ──────────────────────────────────────────────────────────────
function FriendsTab({ myUuid }) {
  const { t } = useLang();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef(null);

  const loadFriends = useCallback(async () => {
    if (!myUuid) {setLoading(false);return;}
    try {
      const r = await apiFetch('list', { uuid: myUuid });
      if (r.ok) setFriends(r.friends || []);
    } catch {} finally {setLoading(false);}
  }, [myUuid]);

  useEffect(() => {loadFriends();}, [loadFriends]);
  useEffect(() => {
    if (!myUuid) return;
    const iv = setInterval(loadFriends, 30000);
    return () => clearInterval(iv);
  }, [myUuid, loadFriends]);

  // Search debounce
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!searchQuery.trim() || searchQuery.length < 2) {setSearchResults(null);return;}
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const r = await apiPost('search', { query: searchQuery.trim() });
        if (r.ok) setSearchResults(r.users || []);
      } catch {} finally {setSearching(false);}
    }, 400);
  }, [searchQuery]);

  async function handleRemove(friendUuid) {
    await apiPost('remove', { uuid: myUuid, friendUuid });
    setFriends((f) => f.filter((fr) => fr.uuid !== friendUuid));
  }

  async function handleRequest(toUuid) {
    await apiPost('request', { fromUuid: myUuid, toUuid });
  }

  const friendUuids = new Set(friends.map((f) => f.uuid));
  const onlineCount = friends.filter((f) => f.isOnline).length;

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="flex-shrink-0 px-3 pb-3">
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white/25 absolute left-2.5 top-1/2 -translate-y-1/2">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input value={searchQuery} onChange={(e) => setSearch(e.target.value)} placeholder={t('friends.search')}
          className="w-full bg-white/5 border border-white/8 rounded-lg pl-8 pr-8 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-sky-500/40 transition-all" />
          {searchQuery &&
          <button onClick={() => {setSearch('');setSearchResults(null);}} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
            </button>
          }
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 pb-3" style={{ scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
        {/* Search results */}
        {searchResults !== null ?
        <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold px-2 mb-2">{t('friends.searchResults')} {searching && '...'}</p>
            {searchResults.length === 0 ?
          <p className="text-[11px] text-white/20 text-center py-3">{t('friends.notFound')}</p> :
          searchResults.map((u) =>
          <div key={u.uuid} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/3 transition-all">
                <PlayerHead uuid={u.uuid} username={u.username} size={28} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-white/70 truncate">{u.username}</p>
                    <OnlineDot online={u.isOnline} />
                  </div>
                </div>
                {u.uuid === myUuid ?
            <span className="text-[9px] text-white/20">{t('friends.you')}</span> :
            friendUuids.has(u.uuid) ?
            <span className="text-[9px] text-sky-400/60">{t('friends.alreadyFriend')}</span> :

            <SendRequestBtn uuid={u.uuid} myUuid={myUuid} onRequest={handleRequest} />
            }
              </div>
          )}
          </div> :
        loading ?
        <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-sky-500/30 border-t-sky-400 rounded-full animate-spin" />
          </div> :
        friends.length === 0 ?
        <EmptyState
          icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white/8"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>}
          text={t('friends.noFriends')}
          sub={t('friends.noFriendsHint')} /> :


        <>
            {friends.filter((f) => f.isOnline).length > 0 &&
          <div className="mb-3">
                <p className="text-[10px] text-sky-400/60 uppercase tracking-wider font-semibold px-2 mb-1"><LocalizedText id="auto.429105dd4ddc" />{onlineCount}</p>
                {friends.filter((f) => f.isOnline).map((f) =>
            <FriendRow key={f.uuid} friend={f} onRemove={handleRemove} />
            )}
              </div>
          }
            {friends.filter((f) => !f.isOnline).length > 0 &&
          <div>
                <p className="text-[10px] text-white/25 uppercase tracking-wider font-semibold px-2 mb-1"><LocalizedText id="auto.ee3a2c2d3458" />{friends.length - onlineCount}</p>
                {friends.filter((f) => !f.isOnline).map((f) =>
            <FriendRow key={f.uuid} friend={f} onRemove={handleRemove} />
            )}
              </div>
          }
          </>
        }
      </div>
    </div>);

}

function SendRequestBtn({ uuid, myUuid, onRequest }) {
  const { t } = useLang();
  const [sent, setSent] = useState(false);
  return sent ?
  <span className="text-[9px] text-white/30">{t('friends.sent')}</span> :

  <button onClick={() => {onRequest(uuid);setSent(true);}}
  className="text-[10px] px-2 py-1 rounded-lg bg-sky-500/15 text-sky-400 font-semibold hover:bg-sky-500/25 border border-sky-500/20 transition-all"><LocalizedText id="auto.582679894d9a" />

  </button>;

}

function FriendRow({ friend, onRemove }) {
  const { t } = useLang();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/4 transition-all group">
      <PlayerHead uuid={friend.uuid} username={friend.username} size={30} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-semibold text-white/80 truncate">{friend.username}</p>
          <OnlineDot online={friend.isOnline} playing={friend.isPlaying} />
        </div>
        <p className="text-[10px] text-white/25 truncate">
          {friend.isPlaying ? friend.gameInfo || 'Đang chơi' : friend.isOnline ? 'Online' : 'Offline'}
        </p>
      </div>
      {confirm ?
      <div className="flex items-center gap-1">
          <button onClick={() => {onRemove(friend.uuid);setConfirm(false);}} className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">{t('friends.remove')}</button>
          <button onClick={() => setConfirm(false)} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">{t('friends.cancel')}</button>
        </div> :

      <button onClick={() => setConfirm(true)}
      className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
        </button>
      }
    </div>);

}

// ── Tab: Yêu cầu ─────────────────────────────────────────────────────────────
function RequestsTab({ myUuid }) {
  const { t } = useLang();
  const [pending, setPending] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!myUuid) {setLoading(false);return;}
    try {
      const r = await apiFetch('pending', { uuid: myUuid });
      if (r.ok) setPending(r.pending || []);
    } catch {} finally {setLoading(false);}
  }, [myUuid]);

  useEffect(() => {load();}, [load]);

  async function handleAccept(fromUuid) {
    await apiPost('accept', { uuid: myUuid, fromUuid });
    setPending((p) => p.filter((r) => r.fromUuid !== fromUuid));
  }
  async function handleReject(fromUuid) {
    await apiPost('reject', { uuid: myUuid, fromUuid });
    setPending((p) => p.filter((r) => r.fromUuid !== fromUuid));
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 pb-3" style={{ scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
      {loading ?
      <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-sky-500/30 border-t-sky-400 rounded-full animate-spin" />
        </div> :
      pending.length === 0 ?
      <EmptyState
        icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white/8"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>}
        text={t('friends.noRequests')}
        sub={t('friends.noRequestsHint')} /> :


      <div className="flex flex-col gap-1.5">
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold px-2 mb-1">{t('friends.pending')} ({pending.length})</p>
          {pending.map((req) =>
        <div key={req.fromUuid} className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-white/3 border border-white/5">
              <PlayerHead uuid={req.fromUuid} username={req.username} size={30} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/70 truncate">{req.username}</p>
                <p className="text-[10px] text-white/25">{t('friends.wantsToBeFriend')}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => handleAccept(req.fromUuid)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-500/15 text-sky-400 hover:bg-sky-500/30 transition-all">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                </button>
                <button onClick={() => handleReject(req.fromUuid)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-white/30 hover:bg-red-500/15 hover:text-red-400 transition-all">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                </button>
              </div>
            </div>
        )}
        </div>
      }
    </div>);

}

// ── Tab: Chặn ─────────────────────────────────────────────────────────────────
function BlockedTab({ myUuid }) {
  const { t } = useLang();
  // TODO: implement block list khi có API
  return (
    <div className="flex-1 overflow-y-auto px-3 pb-3">
      <EmptyState
        icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white/8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z" /></svg>}
        text={t('friends.blocked')}
        sub={t('friends.blockedHint')} />
      
    </div>);

}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function FriendsPanel() {
  const { selectedAccount } = useAccounts();
  const { t } = useLang();
  const myUuid = selectedAccount?.uuid;
  const [tab, setTab] = useState('friends'); // friends | requests | blocked

  if (!myUuid) return (
    <div className="flex flex-col items-center justify-center h-full px-4 gap-3 text-center">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white/10">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
      <p className="text-xs text-white/30">{t('friends.loginRequired')}</p>
    </div>);


  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header + Tabs */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        <h3 className="text-sm font-bold text-white mb-3">{t('friends.title')}</h3>
        <div className="flex rounded-lg bg-white/4 border border-white/6 p-0.5 relative">
          {/* Sliding indicator */}
          <div
            className="absolute top-0.5 bottom-0.5 rounded-md bg-white/10 border border-white/10 transition-all duration-300 ease-out"
            style={{
              width: 'calc(33.333% - 2px)',
              left: tab === 'friends' ? '2px' : tab === 'requests' ? 'calc(33.333% + 1px)' : 'calc(66.666% + 0px)'
            }} />
          
          {[
          { id: 'friends', label: t('friends.tabs.friends') },
          { id: 'requests', label: t('friends.tabs.requests') },
          { id: 'blocked', label: t('friends.tabs.blocked') }].
          map((t) =>
          <button key={t.id} onClick={() => setTab(t.id)}
          className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold transition-colors duration-200 relative z-10 ${
          tab === t.id ?
          'text-white' :
          'text-white/35 hover:text-white/60'}`
          }>
              {t.label}
            </button>
          )}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden flex flex-col pt-2">
        {tab === 'friends' && <FriendsTab myUuid={myUuid} />}
        {tab === 'requests' && <RequestsTab myUuid={myUuid} />}
        {tab === 'blocked' && <BlockedTab myUuid={myUuid} />}
      </div>
    </div>);

}