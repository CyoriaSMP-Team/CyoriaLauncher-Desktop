import { useLang } from "../i18n/LangProvider.jsx"; /**
* VoxelXLauncher — LAN Share Window
* Thay thế cửa sổ LAN bore cũ bằng VoxelX P2P LAN (WireGuard-based)
* Mở bằng F10 khi đang trong game
*/

import { useState, useEffect, useRef, useCallback } from 'react';
import PlayerHead from './ui/PlayerHead';import LocalizedText from "../i18n/LocalizedText.jsx";

const isElectron = typeof window !== 'undefined' && window.electronAPI;

// ─── Utils ────────────────────────────────────────────────────────────────────
function CopyBtn({ text, className = '', label = 'Copy' }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button onClick={handle} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
      ${copied ?
    'bg-green-500/20 text-green-400 border border-green-500/30' :
    'bg-white/8 text-white/50 hover:bg-white/14 hover:text-white border border-white/10'} ${
    className}`}>
      {copied ?
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg> :
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" /></svg>
      }
      {copied ? 'Đã copy!' : label}
    </button>);

}

function StatusDot({ status }) {
  const cls = {
    connected: 'bg-green-400 shadow-green-400/50',
    connecting: 'bg-yellow-400 shadow-yellow-400/50 animate-pulse',
    idle: 'bg-white/20',
    error: 'bg-red-400 shadow-red-400/50',
    installing: 'bg-blue-400 shadow-blue-400/50 animate-pulse'
  }[status] || 'bg-white/20';
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 shadow-[0_0_6px] ${cls}`} />;
}

// Avatar chữ cái
function Avatar({ name, isHost }) {
  const colors = ['bg-green-500/30', 'bg-blue-500/30', 'bg-purple-500/30', 'bg-orange-500/30', 'bg-pink-500/30'];
  const idx = (name?.charCodeAt(0) || 0) % colors.length;
  return (
    <div className={`w-8 h-8 rounded-xl ${colors[idx]} border border-white/10 flex items-center justify-center flex-shrink-0 relative`}>
      <span className="text-xs font-bold text-white/80">{(name || '?')[0].toUpperCase()}</span>
      {isHost &&
      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-400 rounded-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-2 h-2 text-yellow-900">
            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3H5v2h14v-2z" />
          </svg>
        </span>
      }
    </div>);

}

// ─── Tab: Tạo phòng (Host) ────────────────────────────────────────────────────
function HostTab({ nickname, uuid, skinUrl }) {const { t } = useLang();
  const [status, setStatus] = useState('idle'); // idle | creating | active | error | needAdmin
  const [roomCode, setRoomCode] = useState(null);
  const [virtualIp, setVirtIp] = useState(null);
  const [peers, setPeers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (!isElectron) return;
    const unsubs = [
    window.electronAPI.onVxlanLog?.((d) => {
      if (!d) return;
      setLogs((p) => [...p.slice(-199), d.msg]);
    }),
    window.electronAPI.onVxlanCreated?.((d) => {
      if (!d) return;
      setRoomCode(d.roomCode);
      setVirtIp(d.virtualIp);
      setStatus('active');
    }),
    window.electronAPI.onVxlanPeers?.((d) => {
      if (!d) return;
      setPeers(d.peers || []);
    }),
    window.electronAPI.onVxlanLeft?.(() => {
      setStatus('idle');
      setRoomCode(null);
      setVirtIp(null);
      setPeers([]);
    })].
    filter(Boolean);
    return () => unsubs.forEach((fn) => fn?.());
  }, []);

  useEffect(() => {logEndRef.current?.scrollIntoView({ behavior: 'smooth' });}, [logs]);

  const handleCreate = async () => {
    setStatus('creating');
    setError(null);
    setLogs([]);
    try {
      const r = await window.electronAPI.vxlanCreate?.({ nickname });
      if (r?.needAdmin) {setStatus('needAdmin');return;}
      if (r?.error) {setError(r.error);setStatus('error');}
    } catch (e) {setError(e.message);setStatus('error');}
  };

  const handleRelaunchAdmin = async () => {
    await window.electronAPI.vxlanRelaunchAsAdmin?.();
  };

  const handleStop = async () => {
    await window.electronAPI.vxlanLeave?.();
    setStatus('idle');
    setRoomCode(null);
    setVirtIp(null);
    setPeers([]);
  };

  if (status === 'idle' || status === 'error') return (
    <div className="space-y-4">
      {/* Info card */}
      <div className="rounded-2xl border border-white/6 bg-white/3 p-4 space-y-2">
        <p className="text-xs text-white/40 leading-relaxed"><LocalizedText id="auto.50f1963467c4" />
          <span className="text-white/70 font-mono"><LocalizedText id="auto.09bb6d9bd551" /></span><LocalizedText id="auto.482c2239fd8d" />

        </p>
        <div className="flex items-center gap-2 pt-1">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-green-400/70 flex-shrink-0">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <p className="text-[11px] text-white/30"><LocalizedText id="auto.3d060c4b32b1" /></p>
        </div>
      </div>

      {error &&
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      }

      <button
        onClick={handleCreate}
        className="w-full py-3 rounded-2xl bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 hover:border-green-500/50 text-green-400 font-bold text-sm transition-all flex items-center justify-center gap-2">
        
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
        </svg><LocalizedText id="auto.fc0ceeccc01f" />

      </button>
    </div>);


  if (status === 'needAdmin') return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/8 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400 flex-shrink-0">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <p className="text-sm font-bold text-yellow-400"><LocalizedText id="auto.7ef38cdee432" /></p>
        </div>
        <p className="text-xs text-white/50 leading-relaxed"><LocalizedText id="auto.14e05701ee95" />

        </p>
        <p className="text-[11px] text-white/30"><LocalizedText id="auto.4ec00c93da7a" /></p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setStatus('idle')}
          className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-white/50 text-xs font-semibold transition-all"><LocalizedText id="auto.a77beb7fb873" />


        </button>
        <button
          onClick={handleRelaunchAdmin}
          className="flex-1 py-2.5 rounded-xl bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-500/30 text-yellow-400 text-xs font-bold transition-all flex items-center justify-center gap-2">
          
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5z" />
          </svg><LocalizedText id="auto.8d839d79a580" />

        </button>
      </div>
    </div>);


  if (status === 'creating') return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="w-10 h-10 border-2 border-green-500/30 border-t-green-400 rounded-full animate-spin" />
      <p className="text-sm text-white/50"><LocalizedText id="auto.12fe6fa1bf29" /></p>
      {logs.length > 0 &&
      <p className="text-xs text-white/30 font-mono">{logs[logs.length - 1]}</p>
      }
    </div>);


  // Active
  return (
    <div className="space-y-3">
      {/* Room code */}
      <div className="rounded-2xl border border-green-500/25 bg-green-500/8 p-4">
        <p className="text-[10px] text-green-400/70 uppercase tracking-widest font-bold mb-2"><LocalizedText id="auto.fa0c571bcd7b" /></p>
        <div className="flex items-center gap-2">
          <span className="flex-1 text-3xl font-black font-mono text-green-400 tracking-[0.2em]">{roomCode}</span>
          <CopyBtn text={roomCode} label={t("auto.fef935416e61")} />
        </div>
      </div>

      {/* IP của host */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5"><LocalizedText id="auto.51d629bba617" /></p>
          <p className="text-sm font-mono font-bold text-white/80">{virtualIp}</p>
        </div>
        <CopyBtn text={virtualIp || ''} label={t("auto.d34cb0863a11")} />
      </div>

      {/* Hướng dẫn */}
      <div className="rounded-xl border border-white/5 bg-white/2 p-3 space-y-1.5">
        <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2"><LocalizedText id="auto.814420ea40d9" /></p>
        {[
        'Bạn bè mở launcher → F10 → Tham gia phòng',
        `Nhập Room Code: ${roomCode}`,
        'Minecraft → Multiplayer → Direct Connect',
        `Nhập IP: ${virtualIp} (IP host)`].
        map((s, i) =>
        <div key={i} className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-white/8 text-white/30 text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
            <p className="text-xs text-white/45">{s}</p>
          </div>
        )}
      </div>

      {/* Peers */}
      <div className="rounded-xl border border-white/6 bg-white/2 p-3">
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-2"><LocalizedText id="auto.4832924de491" />
          {peers.length + 1}<LocalizedText id="auto.23309765fad4" />
        </p>
        <div className="space-y-2">
          {/* Host (bản thân) */}
          <div className="flex items-center gap-2.5">
            <PlayerHead uuid={uuid} username={nickname} size={32} customSkinUrl={skinUrl} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/80 truncate">{nickname} <span className="text-white/30 font-normal"><LocalizedText id="auto.117037054a0b" /></span></p>
              <p className="text-[10px] text-white/30 font-mono">{virtualIp}</p>
            </div>
            <StatusDot status="connected" />
          </div>
          {peers.map((p, i) =>
          <div key={i} className="flex items-center gap-2.5">
              <PlayerHead uuid={null} username={p.nickname} size={32} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/80 truncate">{p.nickname}</p>
                <p className="text-[10px] text-white/30 font-mono">{p.virtualIp}</p>
              </div>
              <StatusDot status="connected" />
            </div>
          )}
          {peers.length === 0 &&
          <p className="text-[11px] text-white/20 text-center py-1"><LocalizedText id="auto.b47ab2bbbe3f" /></p>
          }
        </div>
      </div>

      {/* Log */}
      {logs.length > 0 &&
      <div className="bg-black/40 rounded-xl p-2.5 max-h-20 overflow-y-auto font-mono text-[10px] text-white/30 border border-white/5" style={{ scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
          {logs.map((l, i) => <div key={i}>{l}</div>)}
          <div ref={logEndRef} />
        </div>
      }

      <button onClick={handleStop} className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-all"><LocalizedText id="auto.c855d4d13f27" />

      </button>
    </div>);

}

// ─── Tab: Tham gia phòng (Join) ───────────────────────────────────────────────
function JoinTab({ nickname, uuid, skinUrl }) {const { t } = useLang();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle | joining | active | error
  const [virtualIp, setVirtIp] = useState(null);
  const [hostIp, setHostIp] = useState(null);
  const [peers, setPeers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (!isElectron) return;
    const unsubs = [
    window.electronAPI.onVxlanLog?.((d) => {
      if (!d) return;
      setLogs((p) => [...p.slice(-199), d.msg]);
    }),
    window.electronAPI.onVxlanJoined?.((d) => {
      if (!d) return;
      setVirtIp(d.virtualIp);
      const host = d.peers?.find((p) => p.isHost);
      setHostIp(host?.virtualIp || null);
      setPeers(d.peers || []);
      setStatus('active');
    }),
    window.electronAPI.onVxlanPeers?.((d) => {
      if (!d) return;
      setPeers(d.peers || []);
      const host = d.peers?.find((p) => p.isHost);
      setHostIp(host?.virtualIp || null);
    }),
    window.electronAPI.onVxlanLeft?.(() => {
      setStatus('idle');
      setVirtIp(null);
      setHostIp(null);
      setPeers([]);
    })].
    filter(Boolean);
    return () => unsubs.forEach((fn) => fn?.());
  }, []);

  useEffect(() => {logEndRef.current?.scrollIntoView({ behavior: 'smooth' });}, [logs]);

  const handleJoin = async () => {
    if (!code.trim()) return;
    setStatus('joining');
    setError(null);
    setLogs([]);
    try {
      const r = await window.electronAPI.vxlanJoin?.({ roomCode: code.trim().toUpperCase(), nickname });
      if (r?.needAdmin) {setStatus('needAdmin');return;}
      if (r?.error) {setError(r.error);setStatus('error');}
    } catch (e) {setError(e.message);setStatus('error');}
  };

  const handleRelaunchAdmin = async () => {
    await window.electronAPI.vxlanRelaunchAsAdmin?.();
  };

  const handleLeave = async () => {
    await window.electronAPI.vxlanLeave?.();
    setStatus('idle');
    setVirtIp(null);
    setHostIp(null);
    setPeers([]);
    setCode('');
  };

  if (status === 'idle' || status === 'error') return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
        <p className="text-xs text-white/40 leading-relaxed"><LocalizedText id="auto.60a56031e110" />

        </p>
      </div>

      {error &&
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      }

      <div className="space-y-2">
        <p className="text-[11px] text-white/40 uppercase tracking-wider font-semibold"><LocalizedText id="auto.09bb6d9bd551" /></p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          placeholder={t("auto.ae8f7deb3c6f")}
          maxLength={6}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xl font-mono font-black tracking-[0.3em] text-center placeholder:text-white/20 placeholder:tracking-normal placeholder:text-sm placeholder:font-normal focus:outline-none focus:border-green-500/50 focus:bg-white/8 transition-all" />
        
      </div>

      <button
        onClick={handleJoin}
        disabled={code.length < 6}
        className="w-full py-3 rounded-2xl bg-green-500/15 hover:bg-green-500/25 disabled:opacity-40 disabled:cursor-not-allowed border border-green-500/30 hover:border-green-500/50 text-green-400 font-bold text-sm transition-all flex items-center justify-center gap-2">
        
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M10 17l5-5-5-5v10zm11-9v14a2 2 0 01-2 2H5a2 2 0 01-2-2V8l7-7h9a2 2 0 012 2z" />
        </svg><LocalizedText id="auto.65b414f4bba9" />

      </button>
    </div>);


  if (status === 'needAdmin') return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/8 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400 flex-shrink-0">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <p className="text-sm font-bold text-yellow-400"><LocalizedText id="auto.7ef38cdee432" /></p>
        </div>
        <p className="text-xs text-white/50 leading-relaxed"><LocalizedText id="auto.14e05701ee95" />

        </p>
        <p className="text-[11px] text-white/30"><LocalizedText id="auto.4ec00c93da7a" /></p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setStatus('idle')} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-white/50 text-xs font-semibold transition-all"><LocalizedText id="auto.a77beb7fb873" /></button>
        <button onClick={handleRelaunchAdmin} className="flex-1 py-2.5 rounded-xl bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-500/30 text-yellow-400 text-xs font-bold transition-all flex items-center justify-center gap-2">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5z" />
          </svg><LocalizedText id="auto.8d839d79a580" />

        </button>
      </div>
    </div>);


  if (status === 'joining') return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="w-10 h-10 border-2 border-green-500/30 border-t-green-400 rounded-full animate-spin" />
      <p className="text-sm text-white/50"><LocalizedText id="auto.9555564b95a0" /></p>
      {logs.length > 0 &&
      <p className="text-xs text-white/30 font-mono">{logs[logs.length - 1]}</p>
      }
    </div>);


  // Active
  return (
    <div className="space-y-3">
      {/* Trạng thái kết nối */}
      <div className="rounded-2xl border border-green-500/25 bg-green-500/8 p-4">
        <div className="flex items-center gap-2 mb-3">
          <StatusDot status="connected" />
          <span className="text-xs font-bold text-green-400"><LocalizedText id="auto.05fd341209b5" /></span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5"><LocalizedText id="auto.50ad60cc93cc" /></p>
            <p className="text-sm font-mono font-bold text-white/80">{virtualIp}</p>
          </div>
          {hostIp &&
          <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5"><LocalizedText id="auto.6d3a1b83ad2b" /></p>
              <p className="text-sm font-mono font-bold text-white/80">{hostIp}</p>
            </div>
          }
        </div>
      </div>

      {/* Cách join Minecraft */}
      {hostIp &&
      <div className="rounded-xl border border-white/8 bg-white/3 p-3">
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-2"><LocalizedText id="auto.6627ca3aca49" /></p>
          <div className="flex items-center gap-2">
            <p className="flex-1 text-xs text-white/50"><LocalizedText id="auto.1b2191cbfe09" /><span className="font-mono text-white/80">{hostIp}</span></p>
            <CopyBtn text={hostIp} label={t("auto.fef935416e61")} />
          </div>
        </div>
      }

      {/* Peers */}
      <div className="rounded-xl border border-white/6 bg-white/2 p-3">
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-2"><LocalizedText id="auto.4832924de491" />
          {peers.length + 1}<LocalizedText id="auto.23309765fad4" />
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <PlayerHead uuid={uuid} username={nickname} size={32} customSkinUrl={skinUrl} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/80 truncate">{nickname} <span className="text-white/30 font-normal"><LocalizedText id="auto.117037054a0b" /></span></p>
              <p className="text-[10px] text-white/30 font-mono">{virtualIp}</p>
            </div>
            <StatusDot status="connected" />
          </div>
          {peers.map((p, i) =>
          <div key={i} className="flex items-center gap-2.5">
              <PlayerHead uuid={null} username={p.nickname} size={32} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/80 truncate">{p.nickname}{p.isHost && <span className="text-yellow-400/70 text-[10px] ml-1"><LocalizedText id="auto.c6beae1df578" /></span>}</p>
                <p className="text-[10px] text-white/30 font-mono">{p.virtualIp}</p>
              </div>
              <StatusDot status="connected" />
            </div>
          )}
        </div>
      </div>

      {/* Log */}
      {logs.length > 0 &&
      <div className="bg-black/40 rounded-xl p-2.5 max-h-20 overflow-y-auto font-mono text-[10px] text-white/30 border border-white/5" style={{ scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
          {logs.map((l, i) => <div key={i}>{l}</div>)}
          <div ref={logEndRef} />
        </div>
      }

      <button onClick={handleLeave} className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-all"><LocalizedText id="auto.ac6569117c35" />

      </button>
    </div>);

}

// ─── Main Window ──────────────────────────────────────────────────────────────
export default function LanShareWindow() {const { t } = useLang();
  const [tab, setTab] = useState('host'); // 'host' | 'join'
  const [nickname, setNick] = useState('Player');
  const [uuid, setUuid] = useState(null);
  const [skinUrl, setSkinUrl] = useState(null);
  const [wgOk, setWgOk] = useState(null); // null=checking, true, false
  const [active, setActive] = useState(false); // có tunnel đang chạy không

  // Lấy nickname + uuid + skin từ tài khoản đang chọn
  useEffect(() => {
    if (!isElectron) return;
    window.electronAPI.getAccounts?.().then(async (data) => {
      const accounts = data?.accounts || [];
      const sel = data?.selectedId;
      const acc = accounts.find((a) => a.id === sel) || accounts[0];
      if (!acc) return;
      if (acc.username) setNick(acc.username);
      if (acc.uuid) setUuid(acc.uuid);

      // Lấy skin URL đúng theo thứ tự ưu tiên (giống AccountPage)
      try {
        // 1. webSkinUrl trên account object
        let finalSkin = acc.webSkinUrl || null;

        // 2. Fetch từ web API theo UUID
        if (!finalSkin && acc.uuid) {
          try {
            const res = await fetch(
              `https://www.voxelx.io.vn/api/auth?action=lookup-by-uuid&uuid=${encodeURIComponent(acc.uuid)}`,
              { signal: AbortSignal.timeout(5000) }
            );
            if (res.ok) {
              const d = await res.json();
              if (d.ok && d.skinUrl) finalSkin = d.skinUrl;
            }
          } catch {}
        }

        // 3. Local skin prefs
        if (!finalSkin) {
          const prefs = await window.electronAPI.getSkinPrefs?.({ uuid: acc.uuid }).catch(() => null);
          if (prefs?.skinUrl && !prefs.skinUrl.startsWith('blob:')) finalSkin = prefs.skinUrl;
        }

        setSkinUrl(finalSkin || null);
      } catch {}
    }).catch(() => {});
  }, []);

  // Check WireGuard
  useEffect(() => {
    if (!isElectron) {setWgOk(false);return;}
    window.electronAPI.vxlanCheck?.().then((r) => {
      setWgOk(r?.installed !== false);
      if (r?.state?.active) setActive(true);
    }).catch(() => setWgOk(false));
  }, []);

  // Track active state
  useEffect(() => {
    if (!isElectron) return;
    const unsubs = [
    window.electronAPI.onVxlanCreated?.(() => setActive(true)),
    window.electronAPI.onVxlanJoined?.(() => setActive(true)),
    window.electronAPI.onVxlanLeft?.(() => setActive(false))].
    filter(Boolean);
    return () => unsubs.forEach((fn) => fn?.());
  }, []);

  const handleClose = () => {
    if (isElectron) window.electronAPI.closeWindow?.();
  };
  const handleMinimize = () => {
    if (isElectron) window.electronAPI.minimizeWindow?.();
  };

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-[#0f0f0f] text-white select-none">

      {/* ── Title bar ── */}
      <div
        className="flex items-center justify-between px-4 h-9 flex-shrink-0 border-b border-white/5 bg-black/20"
        style={{ WebkitAppRegion: 'drag' }}>
        
        <div className="flex items-center gap-2.5" style={{ WebkitAppRegion: 'no-drag' }}>
          {/* Icon */}
          <div className="w-5 h-5 rounded-md bg-green-500/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-green-400">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
          </div>
          <span className="text-xs font-bold text-white/60"><LocalizedText id="auto.28acebd5e67d" /></span>
          {active && <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-green-500/15 text-green-400 border border-green-500/20 font-bold"><LocalizedText id="auto.bcf6930fb589" /></span>}
        </div>

        <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
          <button onClick={handleMinimize} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/8 text-white/30 hover:text-white/60 transition-all">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M19 13H5v-2h14v2z" /></svg>
          </button>
          <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>

        {/* Đang tải WireGuard lần đầu */}
        {wgOk === null &&
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin flex-shrink-0" />
            <p className="text-xs text-white/40"><LocalizedText id="auto.f20226dccae0" /></p>
          </div>
        }

        {/* Nickname */}
        <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-3 py-2.5">
          <PlayerHead uuid={uuid} username={nickname} size={36} customSkinUrl={skinUrl} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5"><LocalizedText id="auto.9808eeda51e0" /></p>
            <input
              value={nickname}
              onChange={(e) => setNick(e.target.value.slice(0, 24))}
              className="w-full bg-transparent text-sm font-bold text-white/80 focus:outline-none placeholder:text-white/20"
              placeholder={t("auto.8c34071c9fd8")} />
            
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-white/4 border border-white/6 p-0.5">
          {[
          { id: 'host', label: 'Tạo phòng', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z' },
          { id: 'join', label: 'Tham gia', icon: 'M10 17l5-5-5-5v10zm11-9v14a2 2 0 01-2 2H5a2 2 0 01-2-2V8l7-7h9a2 2 0 012 2z' }].
          map((t) =>
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
            tab === t.id ?
            'bg-white/10 text-white border border-white/10' :
            'text-white/40 hover:text-white/60'}`
            }>
            
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d={t.icon} />
              </svg>
              {t.label}
            </button>
          )}
        </div>

        {/* Tab content */}
        {wgOk !== null &&
        <>
            {tab === 'host' && <HostTab nickname={nickname} uuid={uuid} skinUrl={skinUrl} />}
            {tab === 'join' && <JoinTab nickname={nickname} uuid={uuid} skinUrl={skinUrl} />}
          </>
        }

        {/* Footer */}
        <p className="text-[10px] text-white/15 text-center pb-1"><LocalizedText id="auto.726be3a4fcf2" />
          <span className="text-white/25">F10</span><LocalizedText id="auto.a494b17fac28" />
        </p>
      </div>
    </div>);

}