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
import PlayerHead from '../ui/PlayerHead';
import { useLang } from '../../i18n/LangProvider';import LocalizedText from "../../i18n/LocalizedText.jsx";

const isElectron = typeof window !== 'undefined' && window.electronAPI;
const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-green-500/50 transition-all placeholder-white/20';

function Toggle({ value, onChange, label, desc }) {
  const { t } = useLang();
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-white/5 last:border-0">
      <div className="min-w-0">
        <p className="text-sm text-white/80 font-medium">{typeof label === 'string' ? t(label) : label}</p>
        {desc && <p className="text-xs text-white/35 mt-0.5">{typeof desc === 'string' ? t(desc) : desc}</p>}
      </div>
      <button type="button" onClick={() => onChange(!value)}
      className="flex-shrink-0 relative transition-all"
      style={{ width: 40, height: 22 }}>
        <div className={`w-full h-full rounded-full transition-all ${value ? 'bg-green-500' : 'bg-white/15'}`} />
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>);

}

function Field({ label, desc, children }) {
  const { t } = useLang();
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-white/45 uppercase tracking-wider">{typeof label === 'string' ? t(label) : label}</label>
      {children}
      {desc && <p className="text-[11px] text-white/25">{typeof desc === 'string' ? t(desc) : desc}</p>}
    </div>);

}

function Select({ value, onChange, options }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function h(e) {if (ref.current && !ref.current.contains(e.target)) setOpen(false);}
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const current = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)}
      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none transition-all flex items-center justify-between gap-2 hover:border-white/20 cursor-pointer">
        <span>{current?.label}</span>
        <svg viewBox="0 0 24 24" fill="currentColor"
        className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      {open &&
      <div className="absolute z-50 left-0 right-0 mt-1 rounded-xl border border-white/10 overflow-hidden"
      style={{ background: 'rgba(18,18,18,0.98)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
          {options.map((o) =>
        <button key={o.value} type="button"
        onClick={() => {onChange(o.value);setOpen(false);}}
        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm transition-all ${
        value === o.value ? 'bg-green-500/15 text-green-400 font-semibold' : 'text-white/70 hover:bg-white/6 hover:text-white'}`
        }>
              {value === o.value ?
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg> :
          <span className="w-3.5 h-3.5 flex-shrink-0" />
          }
              {o.label}
            </button>
        )}
        </div>
      }
    </div>);

}

function ConfigTab({ server, onServerUpdated }) {
  const { t } = useLang();
  const [props, setProps] = useState({});
  const [config, setConfig] = useState({
    ramGb: server.ramGb || 2,
    cores: server.cores || 2,
    jvmArgs: server.jvmArgs || '',
    javaPath: server.javaPath || ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isElectron) return;
    setLoading(true);
    window.electronAPI.serverReadServerProps(server.id).
    then((r) => {if (r?.ok) setProps(r.props || {});}).
    finally(() => setLoading(false));
  }, [server.id]);

  function setProp(k, v) {setProps((p) => ({ ...p, [k]: v }));}

  async function handleSave() {
    if (!isElectron) return;
    setSaving(true);
    try {
      await window.electronAPI.serverWriteServerProps(server.id, {
        motd: props.motd || 'A Minecraft Server',
        'max-players': String(props['max-players'] || '20'),
        'online-mode': String(props['online-mode'] !== 'false'),
        'white-list': String(props['white-list'] === 'true'),
        'server-port': String(props['server-port'] || '25565'),
        pvp: String(props.pvp !== 'false'),
        difficulty: props.difficulty || 'easy',
        gamemode: props.gamemode || 'survival',
        'level-name': props['level-name'] || 'world'
      });
      await window.electronAPI.serverUpdateConfig(server.id, {
        ramGb: Number(config.ramGb),
        cores: Number(config.cores),
        jvmArgs: config.jvmArgs,
        javaPath: config.javaPath
      });
      setSaved(true);setTimeout(() => setSaved(false), 2000);

      const updated = await onServerUpdated?.();
      if (updated) {
        setConfig({
          ramGb: updated.ramGb || config.ramGb,
          cores: updated.cores || config.cores,
          jvmArgs: updated.jvmArgs ?? config.jvmArgs,
          javaPath: updated.javaPath ?? config.javaPath
        });
      }
    } finally {setSaving(false);}
  }

  if (loading) return (
    <div className="flex items-center justify-center h-32 gap-2 text-white/30">
      <svg className="animate-spin w-4 h-4 text-green-400/50" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="text-sm">{t('server.settings.loadingConfig')}</span>
    </div>);


  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5" style={{ scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>

        <div>
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">{t('server.settings.serverProps')}</p>
          <div className="space-y-3">
            <Field label={t('server.settings.motdLabel')} desc={t('server.settings.motdDesc')}>
              <input className={inputCls} value={props.motd || ''} onChange={(e) => setProp('motd', e.target.value)} placeholder={t("auto.0c47352cb3ee")} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('server.settings.maxPlayersLabel')}>
                <input type="number" min="1" max="1000" className={inputCls}
                value={props['max-players'] || '20'}
                onChange={(e) => setProp('max-players', e.target.value)} />
              </Field>
              <Field label={t('server.settings.portLabel')}>
                <input type="number" min="1" max="65535" className={inputCls}
                value={props['server-port'] || '25565'}
                onChange={(e) => setProp('server-port', e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('server.settings.gamemodeLabel')}>
                <Select value={props.gamemode || 'survival'} onChange={(v) => setProp('gamemode', v)}
                options={[
                { value: 'survival', label: 'Survival' },
                { value: 'creative', label: 'Creative' },
                { value: 'adventure', label: 'Adventure' },
                { value: 'spectator', label: 'Spectator' }]
                } />
              </Field>
              <Field label={t('server.settings.difficultyLabel')}>
                <Select value={props.difficulty || 'easy'} onChange={(v) => setProp('difficulty', v)}
                options={[
                { value: 'peaceful', label: 'Peaceful' },
                { value: 'easy', label: 'Easy' },
                { value: 'normal', label: 'Normal' },
                { value: 'hard', label: 'Hard' }]
                } />
              </Field>
            </div>
            <Field label={t('server.settings.levelNameLabel')} desc={t('server.settings.levelNameDesc')}>
              <input className={inputCls} value={props['level-name'] || 'world'} onChange={(e) => setProp('level-name', e.target.value)} />
            </Field>
            <div className="rounded-xl border border-white/8 bg-white/2 px-3 py-1 space-y-0">
              <Toggle label={t('server.settings.onlineModeLabel')} desc={t('server.settings.onlineModeDesc')}
              value={props['online-mode'] !== 'false'}
              onChange={(v) => setProp('online-mode', v ? 'true' : 'false')} />
              <Toggle label={t('server.settings.whitelistLabel')} desc={t('server.settings.whitelistDesc')}
              value={props['white-list'] === 'true'}
              onChange={(v) => setProp('white-list', v ? 'true' : 'false')} />
              <Toggle label={t('server.settings.pvpLabel')} desc={t('server.settings.pvpDesc')}
              value={props.pvp !== 'false'}
              onChange={(v) => setProp('pvp', v ? 'true' : 'false')} />
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">{t('server.settings.launcherConfig')}</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('server.settings.ramLabel', { value: config.ramGb })}>
                <input type="range" min="1" max="32" step="1" value={config.ramGb}
                onChange={(e) => setConfig((c) => ({ ...c, ramGb: Number(e.target.value) }))}
                className="w-full accent-green-500 cursor-pointer" />
                <div className="flex justify-between text-[10px] text-white/20"><span><LocalizedText id="auto.b1bcece2c912" /></span><span><LocalizedText id="auto.3c51ff65e4d3" /></span></div>
              </Field>
              <Field label={t('server.settings.coresLabel', { value: config.cores })}>
                <input type="range" min="1" max="16" step="1" value={config.cores}
                onChange={(e) => setConfig((c) => ({ ...c, cores: Number(e.target.value) }))}
                className="w-full accent-green-500 cursor-pointer" />
                <div className="flex justify-between text-[10px] text-white/20"><span>1</span><span>16</span></div>
              </Field>
            </div>
            <Field label={t('server.settings.jvmLabel')}>
              <textarea rows={3} className={`${inputCls} font-mono text-xs resize-none`}
              value={config.jvmArgs}
              onChange={(e) => setConfig((c) => ({ ...c, jvmArgs: e.target.value }))}
              placeholder={t("auto.b7e9e2d560ff")} />
            </Field>
            <Field label={t('server.settings.javaPathLabel')} desc={t('server.settings.javaPathDesc')}>
              <input className={`${inputCls} font-mono text-xs`}
              value={config.javaPath}
              onChange={(e) => setConfig((c) => ({ ...c, javaPath: e.target.value }))}
              placeholder={t('server.settings.javaPathPlaceholder')} />
            </Field>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 px-4 py-3 border-t border-white/5">
        <button onClick={handleSave} disabled={saving}
        className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        style={{ background: saved ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 4px 16px rgba(34,197,94,0.2)' }}>
          {saved ?
          <><svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>{t('server.settings.saved')}</> :
          saving ?
          <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{t('server.settings.saving')}</> :
          t('server.settings.saveBtn')
          }
        </button>
      </div>
    </div>);

}

function WhitelistTab({ server }) {
  const { t } = useLang();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [addName, setAddName] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(false);

  const load = useCallback(async () => {
    if (!isElectron) return;
    setLoading(true);
    const r = await window.electronAPI.serverGetWhitelist(server.id);
    if (r?.ok) setList(r.list || []);
    setLoading(false);
  }, [server.id]);

  useEffect(() => {load();}, [load]);

  async function handleAdd() {
    if (!addName.trim() || !isElectron) return;
    setAdding(true);
    const r = await window.electronAPI.serverAddWhitelist(server.id, addName.trim(), null);
    if (r?.ok) {setList(r.list);setAddName('');}
    setAdding(false);
  }

  async function handleRemove(names) {
    if (!isElectron) return;
    setRemoving(true);
    const r = await window.electronAPI.serverRemoveWhitelist(server.id, names);
    if (r?.ok) {setList(r.list);setSelected(new Set());}
    setRemoving(false);
  }

  function toggleSelect(name) {
    setSelected((prev) => {const n = new Set(prev);if (n.has(name)) n.delete(name);else n.add(name);return n;});
  }
  function toggleAll() {
    setSelected(selected.size === list.length ? new Set() : new Set(list.map((p) => p.name)));
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/5">
        <div className="flex gap-2">
          <input value={addName} onChange={(e) => setAddName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={t('server.settings.whitelistAddPlaceholder')}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-green-500/50 transition-all placeholder-white/20" />
          <button onClick={handleAdd} disabled={!addName.trim() || adding}
          className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-all disabled:opacity-40 flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
            {t('server.settings.whitelistAdd')}
          </button>
        </div>
      </div>

      {list.length > 0 &&
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/10">
          <div className="flex items-center gap-2">
            <button onClick={toggleAll}
          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${selected.size === list.length && list.length > 0 ? 'bg-green-500 border-green-500' : 'border-white/25'}`}>
              {selected.size === list.length && list.length > 0 &&
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 text-white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
            }
            </button>
            <span className="text-xs text-white/40">{selected.size > 0 ? t('server.settings.whitelistSelected', { count: selected.size }) : t('server.settings.whitelistPlayers', { count: list.length })}</span>
          </div>
          {selected.size > 0 &&
        <button onClick={() => handleRemove([...selected])} disabled={removing}
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/15 text-red-400 text-xs font-semibold hover:bg-red-500/25 transition-all disabled:opacity-40">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
              {t('server.settings.whitelistRemove', { count: selected.size })}
            </button>
        }
        </div>
      }

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1" style={{ scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        {loading ?
        <div className="flex items-center justify-center h-24 gap-2 text-white/30">
            <svg className="animate-spin w-4 h-4 text-green-400/50" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">{t('server.settings.loadingConfig')}</span>
          </div> :
        list.length === 0 ?
        <div className="flex flex-col items-center justify-center h-32 gap-2 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8 text-white/10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-white/30 text-sm">{t('server.settings.whitelistEmpty')}</p>
          </div> :
        list.map((p) =>
        <div key={p.name}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${selected.has(p.name) ? 'bg-green-500/8 border border-green-500/20' : 'bg-white/2 border border-white/6 hover:bg-white/4'}`}>
            <button onClick={() => toggleSelect(p.name)}
          className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${selected.has(p.name) ? 'bg-green-500 border-green-500' : 'border-white/25'}`}>
              {selected.has(p.name) && <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 text-white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
            </button>
            <PlayerHead username={p.name} uuid={p.uuid} size={32} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white/85 truncate">{p.name}</p>
              {p.uuid && <p className="text-[10px] text-white/25 font-mono truncate">{p.uuid}</p>}
            </div>
            <button onClick={() => handleRemove([p.name])}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>);

}

function fmtCountdown(expires, t) {
  if (!expires || expires === 'forever') return null;
  try {
    const diff = new Date(expires) - new Date();
    if (diff <= 0) return t('server.settings.expired');
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff % 86400000 / 3600000);
    const m = Math.floor(diff % 3600000 / 60000);
    if (d > 0) return `Còn ${d}n ${h}g`;
    if (h > 0) return `Còn ${h}g ${m}p`;
    return `Còn ${m} phút`;
  } catch {return null;}
}

function BannedTab({ server }) {
  const { t } = useLang();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [unbanning, setUnbanning] = useState(false);
  const [, tick] = useState(0);

  const load = useCallback(async () => {
    if (!isElectron) return;
    setLoading(true);
    const r = await window.electronAPI.serverGetBanlist(server.id);
    if (r?.ok) setList(r.list || []);
    setLoading(false);
  }, [server.id]);

  useEffect(() => {load();}, [load]);

  useEffect(() => {
    const id = setInterval(async () => {
      tick((n) => n + 1);
      const expired = list.filter((p) => {
        if (!p.expires || p.expires === 'forever') return false;
        try {return new Date(p.expires) <= new Date();} catch {return false;}
      });
      if (expired.length > 0 && isElectron) {
        const r = await window.electronAPI.serverUnban(server.id, expired.map((p) => p.name));
        if (r?.ok) setList(r.list);
      }
    }, 60000);
    return () => clearInterval(id);
  }, [list, server.id]);

  async function handleUnban(names) {
    if (!isElectron) return;
    setUnbanning(true);
    const r = await window.electronAPI.serverUnban(server.id, names);
    if (r?.ok) {setList(r.list);setSelected(new Set());}
    setUnbanning(false);
  }

  function toggleSelect(name) {
    setSelected((prev) => {const n = new Set(prev);if (n.has(name)) n.delete(name);else n.add(name);return n;});
  }
  function toggleAll() {
    setSelected(selected.size === list.length ? new Set() : new Set(list.map((p) => p.name)));
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {list.length > 0 &&
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-black/10">
          <div className="flex items-center gap-2">
            <button onClick={toggleAll}
          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${selected.size === list.length && list.length > 0 ? 'bg-green-500 border-green-500' : 'border-white/25'}`}>
              {selected.size === list.length && list.length > 0 &&
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 text-white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
            }
            </button>
            <span className="text-xs text-white/40">{selected.size > 0 ? t('server.settings.bannedSelected', { count: selected.size }) : t('server.settings.bannedPlayers', { count: list.length })}</span>
          </div>
          {selected.size > 0 &&
        <button onClick={() => handleUnban([...selected])} disabled={unbanning}
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-500/15 text-green-400 text-xs font-semibold hover:bg-green-500/25 transition-all disabled:opacity-40">
              {t('server.settings.unbanCount', { count: selected.size })}
            </button>
        }
        </div>
      }

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5" style={{ scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        {loading ?
        <div className="flex items-center justify-center h-24 gap-2 text-white/30">
            <svg className="animate-spin w-4 h-4 text-green-400/50" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">{t('server.settings.loadingConfig')}</span>
          </div> :
        list.length === 0 ?
        <div className="flex flex-col items-center justify-center h-32 gap-2 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8 text-white/10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <p className="text-white/30 text-sm">{t('server.settings.bannedEmpty')}</p>
          </div> :
        list.map((p) => {
          const isPermanent = !p.expires || p.expires === 'forever';
          const countdown = isPermanent ? null : fmtCountdown(p.expires, t);
          const isExpired = countdown === t('server.settings.expired');
          return (
            <div key={p.name}
            className={`flex items-start gap-3 px-3 py-3 rounded-xl transition-all ${selected.has(p.name) ? 'bg-red-500/8 border border-red-500/20' : 'bg-white/2 border border-white/6 hover:bg-white/4'}`}>
              <button onClick={() => toggleSelect(p.name)}
              className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all mt-0.5 ${selected.has(p.name) ? 'bg-green-500 border-green-500' : 'border-white/25'}`}>
                {selected.has(p.name) && <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 text-white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
              </button>
              <PlayerHead username={p.name} uuid={p.uuid} size={36} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-white/85">{p.name}</p>
                  {isPermanent ?
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 font-bold">{t('server.settings.permanent')}</span> :
                  isExpired ?
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/8 text-white/30 font-bold">{t('server.settings.expired')}</span> :
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 font-bold">{countdown}</span>
                  }
                </div>
                {p.reason && <p className="text-xs text-white/40 mt-0.5">{t('server.settings.reason', { reason: p.reason })}</p>}
                {p.source && <p className="text-[10px] text-white/25 mt-0.5">{t('server.settings.bannedBy', { source: p.source })}</p>}
                {!isPermanent && p.expires &&
                <p className="text-[10px] text-white/20 mt-0.5 font-mono">
                    {t('server.settings.expiresAt', { date: new Date(p.expires).toLocaleString('vi-VN') })}
                  </p>
                }
              </div>
              <button onClick={() => handleUnban([p.name])}
              className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs font-semibold hover:bg-green-500/20 transition-all">
                {t('server.settings.unban')}
              </button>
            </div>);

        })}
      </div>
    </div>);

}

export default function ServerSettingsTab({ server, onServerUpdated }) {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState('config');

  const tabs = [
  {
    id: 'config', label: t('server.settings.tabConfig'),
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
  },
  {
    id: 'whitelist', label: t('server.settings.tabWhitelist'),
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
  },
  {
    id: 'banned', label: t('server.settings.tabBanned'),
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
  }];


  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 flex items-center gap-1 px-3 py-2 border-b border-white/5 bg-black/10">
        {tabs.map((t) =>
        <button key={t.id} onClick={() => setActiveTab(t.id)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        activeTab === t.id ? 'bg-white/10 text-white' : 'text-white/35 hover:text-white/60 hover:bg-white/5'}`
        }>
            {t.icon}{t.label}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        {activeTab === 'config' && <ConfigTab server={server} onServerUpdated={onServerUpdated} />}
        {activeTab === 'whitelist' && <WhitelistTab server={server} />}
        {activeTab === 'banned' && <BannedTab server={server} />}
      </div>
    </div>);

}