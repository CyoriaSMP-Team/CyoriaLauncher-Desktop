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
import { useLang } from '../../i18n/LangProvider';import LocalizedText from "../../i18n/LocalizedText.jsx";

const isElectron = typeof window !== 'undefined' && window.electronAPI;

function CopyBtn({ text }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {navigator.clipboard.writeText(text).then(() => {setCopied(true);setTimeout(() => setCopied(false), 1500);});}}
      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10'}`}>
      {copied ?
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg> :
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" /></svg>
      }
      {copied ? t('server.console.copied') : t('server.console.copyLogs')}
    </button>);

}

function InfoCard({ label, value, sub, accent = false }) {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  const isIp = value && /[\d.:]+/.test(value) && value !== '—' && !value.includes('Đang');

  const displayValue = isIp && !visible ?
  value.replace(/[\d]/g, '•') :
  value || '—';

  return (
    <div className={`rounded-xl p-3 border ${accent ? 'border-green-500/20 bg-green-500/5' : 'border-white/8 bg-white/3'}`}>
      <p className="text-xs text-white/45 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <p className={`text-base font-bold font-mono truncate transition-all select-none ${
        isIp && !visible ? 'blur-[3px] text-white/50' : accent ? 'text-green-400' : 'text-white/80'}`
        }>
          {displayValue}
        </p>
        <div className="flex items-center gap-1 flex-shrink-0">
          {isIp &&
          <button
            onClick={() => setVisible((v) => !v)}
            className="flex items-center justify-center w-6 h-6 rounded text-white/30 hover:text-white/70 hover:bg-white/8 transition-all"
            title={visible ? t('server.network.hideIp') : t('server.network.showIp')}>
            
              {visible ?
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                </svg> :

            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
            }
            </button>
          }
          {value && value !== '—' && !value.includes('Đang') && visible && <CopyBtn text={value} />}
        </div>
      </div>
      {sub && <p className="text-xs text-white/35 mt-1">{sub}</p>}
    </div>);

}

function LanAddressRow({ value }) {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  const masked = value ? value.replace(/[\d]/g, '•') : '—';
  return (
    <div className="flex items-center justify-between gap-2">
      <p className={`text-base font-bold font-mono transition-all select-none ${visible ? 'text-white/85' : 'blur-[3px] text-white/50'}`}>
        {visible ? value : masked}
      </p>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={() => setVisible((v) => !v)}
        className="flex items-center justify-center w-6 h-6 rounded text-white/30 hover:text-white/70 hover:bg-white/8 transition-all"
        title={visible ? t('server.network.hideIp') : t('server.network.showIp')}>
          {visible ?
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" /></svg> :
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          }
        </button>
        {visible && <CopyBtn text={value} />}
      </div>
    </div>);

}

function BoreTunnelTab({ server, tunnelStatus, setTunnelStatus, tunnelAddr, setTunnelAddr, tunnelLog, setTunnelLog }) {
  const { t } = useLang();
  const [localIp, setLocalIp] = useState(null);
  const [port, setPort] = useState('25565');
  const [publicIp, setPublicIp] = useState(null);
  const [loadingIp, setLoadingIp] = useState(true);
  const [tunnelBusy, setTunnelBusy] = useState(false);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (!isElectron || !server) return;
    setLoadingIp(true);
    window.electronAPI.serverGetNetworkInfo(server.id).then((r) => {
      if (r?.ok) {setLocalIp(r.localIp);setPublicIp(r.publicIp);setPort(r.port || '25565');}
      setLoadingIp(false);
    }).catch(() => setLoadingIp(false));
  }, [server?.id]);

  useEffect(() => {logEndRef.current?.scrollIntoView({ behavior: 'smooth' });}, [tunnelLog]);

  const startTunnel = useCallback(async () => {
    if (!isElectron) return;
    setTunnelBusy(true);setTunnelLog([]);setTunnelAddr(null);
    try {
      const r = await window.electronAPI.serverStartTunnel(server.id, port);
      if (r?.error) {setTunnelStatus('error');setTunnelLog([`Lỗi: ${r.error}`]);}
    } finally {setTunnelBusy(false);}
  }, [server?.id, port]);

  const stopTunnel = useCallback(async () => {
    if (!isElectron) return;
    setTunnelBusy(true);
    try {
      await window.electronAPI.serverStopTunnel(server.id);
      setTunnelStatus('stopped');setTunnelAddr(null);
    } finally {setTunnelBusy(false);}
  }, [server?.id]);

  const isRunning = tunnelStatus === 'running';
  const isDownloading = tunnelStatus === 'downloading' || tunnelStatus === 'starting';

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4" style={{ scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
      {}
      <div>
        <p className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-2">{t('server.network.lanSection')}</p>
        <div className="grid grid-cols-2 gap-2">
          <InfoCard label={t('server.network.lanIp')} value={loadingIp ? t('server.network.loadingIp') : localIp} sub={t('server.network.lanIpSub')} />
          <InfoCard label={t('server.network.port')} value={port} sub={t('server.network.portSub')} />
        </div>
        {localIp && port &&
        <div className="mt-2 rounded-xl p-3 border border-white/8 bg-white/3">
            <p className="text-xs text-white/45 uppercase tracking-wider mb-1">{t('server.network.lanAddress')}</p>
            <LanAddressRow value={`${localIp}:${port}`} />
            <p className="text-xs text-white/35 mt-1">{t('server.network.lanAddressSub')}</p>
          </div>
        }
      </div>

      {}
      <div>
        <p className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-2">{t('server.network.publicSection')}</p>
        <InfoCard label={t('server.network.publicIp')} value={loadingIp ? t('server.network.loadingIp') : publicIp} sub={t('server.network.publicIpSub')} />
        <div className="mt-2 rounded-xl p-3 border border-yellow-500/15 bg-yellow-500/5">
          <div className="flex items-start gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-400/70 flex-shrink-0 mt-0.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <p className="text-xs text-white/45 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t('server.network.portForwardHint').replace('<green>', '<span class="text-green-400">').replace('</green>', '</span>') }} />
          </div>
        </div>
      </div>

      {}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">{t('server.network.tunnelSection')}</p>
            <p className="text-xs text-white/35 mt-0.5">{t('server.network.tunnelFree')}</p>
          </div>
          <a href="https://github.com/ekzhang/bore" target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-green-400/60 hover:text-green-400 transition-colors"><LocalizedText id="auto.4d78ef8436c3" /></a>
        </div>

        {tunnelAddr &&
        <div className="mb-3">
            <InfoCard label={t('server.network.tunnelAddress')} value={tunnelAddr}
          sub={t('server.network.tunnelAddressSub')} accent />
          </div>
        }

        <div className="rounded-xl border border-white/8 bg-white/3 p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              isRunning ? 'bg-green-400 animate-pulse' :
              isDownloading ? 'bg-yellow-400 animate-pulse' :
              tunnelStatus === 'error' ? 'bg-red-400' : 'bg-white/20'}`
              } />
              <span className="text-xs text-white/60">
                {isRunning ? t('server.network.tunnelRunning') :
                isDownloading ? t('server.network.tunnelStarting') :
                tunnelStatus === 'error' ? t('server.network.tunnelError') :
                tunnelStatus === 'stopped' ? t('server.network.tunnelStopped') : t('server.network.tunnelIdle')}
              </span>
            </div>
            <div className="flex gap-2">
              {!isRunning && !isDownloading &&
              <button onClick={startTunnel} disabled={tunnelBusy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500 hover:bg-green-400 text-white transition-all disabled:opacity-50">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M8 5v14l11-7z" /></svg>
                  {t('server.network.tunnelStart')}
                </button>
              }
              {(isRunning || isDownloading) &&
              <button onClick={stopTunnel} disabled={tunnelBusy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/25 transition-all disabled:opacity-50">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M6 6h12v12H6z" /></svg>
                  {t('server.network.tunnelStop')}
                </button>
              }
            </div>
          </div>

          {tunnelLog.length > 0 &&
          <div className="relative">
              <button onClick={() => navigator.clipboard.writeText(tunnelLog.join('\n'))}
            className="absolute top-1.5 right-1.5 z-10 px-2 py-0.5 rounded text-[10px] bg-white/8 text-white/30 hover:text-white/60 hover:bg-white/12 transition-all">
                {t('server.console.copyLogs')}
              </button>
              <div className="bg-black/40 rounded-lg p-2 max-h-32 overflow-y-auto font-mono text-xs text-white/50"
            style={{ scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                {tunnelLog.map((line, i) => {
                const clean = line.
                replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '').
                replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '').
                replace(/\x1b[^[\]()#;?0-9A-Za-z]/g, '').
                replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '').
                replace(/\r/g, '').trim();
                if (!clean) return null;
                const isAddr = clean.toLowerCase().includes('bore.pub');
                return <div key={i} className={isAddr ? 'text-green-400/80' : ''}>{clean}</div>;
              })}
                <div ref={logEndRef} />
              </div>
            </div>
          }
        </div>

        {tunnelStatus === 'error' && tunnelLog.some((l) => l.includes('Defender') || l.includes('exclusion') || l.includes('UNKNOWN')) &&
        <div className="mt-2 rounded-xl p-3 border border-red-500/20 bg-red-500/5">
            <p className="text-xs text-red-400 font-semibold mb-1">{t('server.network.defenderTitle')}</p>
            <p className="text-xs text-white/50 leading-relaxed mb-2">
              {t('server.network.defenderDesc')}
            </p>
            <div className="text-xs text-white/45 space-y-0.5">
              {t('server.network.defenderSteps').map((step, i) =>
            <p key={i}>{step}</p>
            )}
            </div>
          </div>
        }

        <div className="mt-2 rounded-xl p-3 border border-white/5 bg-white/2">
          <p className="text-xs text-white/45 font-semibold mb-1.5">{t('server.network.tunnelHowTitle')}</p>
          <div className="space-y-1">
            {t('server.network.tunnelHowSteps').map((step, i) =>
            <div key={i} className="flex items-start gap-2">
                <span className="text-[10px] w-4 h-4 rounded-full bg-white/8 text-white/30 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                <p className="text-xs text-white/45">{step}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>);

}

function VoxelXTunnelTab() {
  const { t } = useLang();
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4" style={{ scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>

      {}
      <div className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/8 to-transparent p-5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-3">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-green-400">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
          </svg>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/25 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">{t('server.network.vxTunnelComingSoon')}</span>
        </div>
        <h3 className="text-base font-bold text-white mb-1">{t('server.network.vxTunnelTitle')}</h3>
        <p className="text-xs text-white/45 leading-relaxed max-w-xs mx-auto">
          {t('server.network.vxTunnelDesc')}
        </p>
      </div>

      {}
      <div className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent p-5 relative overflow-hidden">
        {}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-green-400/70 uppercase tracking-widest font-bold mb-1">{t('server.network.vxTunnelPlan')}</p>
              <h4 className="text-lg font-black text-white"><LocalizedText id="auto.0ba83f3e8392" /></h4>
            </div>
            <div className="text-right">
              <div className="flex items-end gap-1">
                <span className="text-3xl font-black text-green-400">{t('server.network.vxTunnelPrice')}</span>
                <span className="text-sm text-white/50 mb-1">{t('server.network.vxTunnelPriceUnit')}</span>
              </div>
              <p className="text-[10px] text-white/35">{t('server.network.vxTunnelPriceDay')}</p>
            </div>
          </div>

          {}
          <div className="space-y-2.5 mb-5">
            {[
            { icon: '🟢', label: 'Ping xanh', desc: 'Server đặt tại Việt Nam — độ trễ cực thấp' },
            { icon: '⚡', label: 'Không độ trễ', desc: 'Kết nối trực tiếp nội địa, không qua nước ngoài' },
            { icon: '🔒', label: 'Bảo mật', desc: 'Kết nối mã hóa, IP ẩn hoàn toàn' },
            { icon: '🌐', label: 'IP cố định', desc: 'Địa chỉ tunnel không đổi trong suốt gói' },
            { icon: '⏱️', label: 'Uptime 99.9%', desc: 'Hạ tầng ổn định, không gián đoạn' },
            { icon: '🎮', label: 'Tối ưu Minecraft', desc: 'Cấu hình riêng cho game server Java Edition' }].
            map((f, i) =>
            <div key={i} className="flex items-start gap-3">
                <span className="text-base flex-shrink-0 mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white/85">{f.label}</p>
                  <p className="text-xs text-white/40">{f.desc}</p>
                </div>
              </div>
            )}
          </div>

          {}
          <button
            disabled
            className="w-full py-3 rounded-xl text-sm font-bold text-white/40 bg-white/5 border border-white/10 cursor-not-allowed flex items-center justify-center gap-2">
            
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {t('server.network.vxTunnelBuyBtn')}
          </button>
          <p className="text-center text-[10px] text-white/25 mt-2">{t('server.network.vxTunnelBuyNote')}</p>
        </div>
      </div>

      {}
      <div className="rounded-xl border border-white/8 bg-white/3 p-4">
        <p className="text-xs text-white/45 uppercase tracking-wider font-semibold mb-3">{t('server.network.vxTunnelMyTunnel')}</p>
        <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-black/20 border border-white/5">
          <div className="w-2 h-2 rounded-full bg-white/15 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-white/25 font-mono">{t('server.network.vxTunnelNone')}</p>
            <p className="text-xs text-white/20 mt-0.5">{t('server.network.vxTunnelNoneHint')}</p>
          </div>
        </div>
      </div>

      {}
      <div className="rounded-xl border border-white/5 bg-white/2 p-4">
        <p className="text-xs text-white/45 font-semibold mb-2">{t('server.network.vxTunnelCompare')}</p>
        <div className="space-y-2">
          {[
          { label: 'Ping', bore: '~100-200ms (quốc tế)', vx: '~5-20ms (Việt Nam)', better: true },
          { label: 'Giá', bore: 'Miễn phí', vx: '10.000đ/tháng', better: false },
          { label: 'IP cố định', bore: 'Không (thay đổi mỗi lần)', vx: 'Có', better: true },
          { label: 'Tốc độ', bore: 'Phụ thuộc bore.pub', vx: 'Tối ưu nội địa', better: true }].
          map((row, i) =>
          <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-20 text-white/35 flex-shrink-0">{row.label}</span>
              <span className="flex-1 text-white/30">{row.bore}</span>
              <span className={`flex-1 font-semibold ${row.better ? 'text-green-400' : 'text-white/50'}`}>
                {row.better && '✓ '}{row.vx}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>);

}

export default function ServerNetworkTab({ server, tunnelStatus, setTunnelStatus, tunnelAddr, setTunnelAddr, tunnelLog, setTunnelLog }) {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState('bore');

  const tabs = [
  {
    id: 'bore',
    label: t('server.network.tabBore'),
    icon:
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0 3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>

  },
  {
    id: 'voxelx',
    label: t('server.network.tabVoxelX'),
    icon:
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
        </svg>,

    badge: t('server.network.vxTunnelComingSoon')
  }];


  return (
    <div className="flex flex-col h-full overflow-hidden">
      {}
      <div className="flex-shrink-0 grid grid-cols-2 gap-0 border-b border-white/5">
        {tabs.map((tab) =>
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold transition-all border-b-2 ${
          activeTab === tab.id ?
          'border-green-500 text-white bg-green-500/5' :
          'border-transparent text-white/35 hover:text-white/60 hover:bg-white/3'}`
          }>
          
            <span className={activeTab === tab.id ? 'text-green-400' : 'text-white/30'}>{tab.icon}</span>
            {tab.label}
            {tab.badge &&
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/25">
                {tab.badge}
              </span>
          }
          </button>
        )}
      </div>

      {}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'bore' &&
        <BoreTunnelTab
          server={server}
          tunnelStatus={tunnelStatus}
          setTunnelStatus={setTunnelStatus}
          tunnelAddr={tunnelAddr}
          setTunnelAddr={setTunnelAddr}
          tunnelLog={tunnelLog}
          setTunnelLog={setTunnelLog} />

        }
        {activeTab === 'voxelx' && <VoxelXTunnelTab />}
      </div>
    </div>);

}