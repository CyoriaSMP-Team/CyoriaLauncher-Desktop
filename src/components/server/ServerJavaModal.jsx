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
import adoptiumIcon from '../../assets/java-icon/adoptium.png';
import azulIcon from '../../assets/java-icon/azul.png';import LocalizedText from "../../i18n/LocalizedText.jsx";

const isElectron = typeof window !== 'undefined' && window.electronAPI;

const DISTROS = {
  adoptium: { id: 'adoptium', name: 'Eclipse Temurin', icon: adoptiumIcon, color: '#f97316', badge: 'Recommended', desc: 'OpenJDK chính thống, ổn định nhất.' },
  azul: { id: 'azul', name: 'Azul Zulu', icon: azulIcon, color: '#3b82f6', badge: 'Lightweight', desc: 'Nhẹ, khởi động nhanh, tiết kiệm RAM.' },
  graalvm: { id: 'graalvm', name: 'GraalVM Community', icon: null, color: '#a855f7', badge: 'Best Perf', desc: 'JIT tiên tiến, giảm lag spike.' }
};

const MC_JAVA_MAP = {
  8: 'MC ≤ 1.16', 11: 'MC 1.17 (một số mod)',
  17: 'MC 1.17–1.20', 21: 'MC 1.21+', 25: 'MC tương lai'
};

function GraalIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#7c3aed" fillOpacity="0.2" />
      <path d="M8 24L16 8l8 16H8z" fill="#a855f7" fillOpacity="0.8" />
      <circle cx="16" cy="16" r="2" fill="#e9d5ff" />
    </svg>);

}

export default function ServerJavaModal({ onClose, onSelect }) {
  const [step, setStep] = useState('distro');
  const [selectedDistro, setSelectedDistro] = useState(null);
  const [distros, setDistros] = useState({ adoptium: [], azul: [], graalvm: [] });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!isElectron) {setLoading(false);return;}
    setLoading(true);

    window.electronAPI.javaFetchDistros(null).
    then((r) => {
      if (r?.ok) setDistros(r.distros || { adoptium: [], azul: [], graalvm: [] });else
      setFetchError(r?.error || 'Không thể tải danh sách Java');
    }).
    catch((err) => setFetchError(err.message)).
    finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const h = (e) => {if (e.key === 'Escape') onClose();};
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const distroList = Object.values(DISTROS);
  const currentVersions = selectedDistro ? distros[selectedDistro] || [] : [];

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center px-4"
    onClick={(e) => {if (e.target === e.currentTarget) onClose();}}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl rounded-2xl overflow-hidden flex flex-col"
      style={{ background: 'rgba(12,12,12,0.98)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 80px rgba(0,0,0,0.8)', maxHeight: '80vh' }}>

        {}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            {step === 'versions' &&
            <button onClick={() => {setStep('distro');setSelectedDistro(null);}}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-all">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
              </button>
            }
            <div>
              <h3 className="text-white font-bold text-sm">
                {step === 'distro' ? 'Chọn Java Distribution' : `${DISTROS[selectedDistro]?.name} — Chọn phiên bản`}
              </h3>
              <p className="text-white/30 text-xs mt-0.5"><LocalizedText id="auto.1aad3e68e5ee" /></p>
            </div>
          </div>
          <button onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
          {loading ?
          <div className="flex flex-col items-center justify-center py-12 gap-3">
              <svg className="animate-spin w-6 h-6 text-green-400/50" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-xs text-white/30"><LocalizedText id="auto.ae5afc08fdbf" /></p>
            </div> :
          fetchError ?
          <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-xs text-red-400">{fetchError}</p>
            </div> :
          step === 'distro' ?
          <div className="p-4 flex flex-col gap-2.5">
              {distroList.map((d) =>
            <button key={d.id}
            onClick={() => {setSelectedDistro(d.id);setStep('versions');}}
            className="flex items-center gap-4 p-4 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15 transition-all text-left group">
                  <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
              style={{ background: `${d.color}15`, border: `1px solid ${d.color}30` }}>
                    {d.icon ? <img src={d.icon} alt={d.name} className="w-7 h-7 object-contain" /> : <GraalIcon />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-white/90">{d.name}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: `${d.color}20`, color: d.color }}>{d.badge}</span>
                    </div>
                    <p className="text-xs text-white/40">{d.desc}</p>
                  </div>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                  </svg>
                </button>
            )}
            </div> :

          <div className="p-4">
              {currentVersions.length === 0 ?
            <p className="text-xs text-white/25 text-center py-8"><LocalizedText id="auto.96b591480fa4" /></p> :

            <div className="grid grid-cols-2 gap-3">
                  {currentVersions.map((pkg) => {
                const d = DISTROS[pkg.distro];
                const mcNote = MC_JAVA_MAP[pkg.javaVersion] || '';
                return (
                  <button key={`${pkg.distro}-${pkg.javaVersion}`}
                  onClick={() => {onSelect(pkg);onClose();}}
                  className="flex flex-col gap-2 p-4 rounded-2xl border border-white/8 bg-white/3 hover:border-green-500/40 hover:bg-green-500/5 transition-all text-left group">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0"
                      style={{ background: `${d.color}20`, color: d.color }}>
                            {pkg.javaVersion}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white/90"><LocalizedText id="auto.af063e43a5a2" />{pkg.javaVersion}</p>
                            <p className="text-[10px] text-white/30">{pkg.releaseVersion}</p>
                          </div>
                        </div>
                        {mcNote &&
                    <p className="text-[10px] text-green-400/70 flex items-center gap-1">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 flex-shrink-0">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            {mcNote}
                          </p>
                    }
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-[10px] text-white/25">
                            {pkg.size > 0 ? `${(pkg.size / 1024 / 1024).toFixed(0)} MB` : ''}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full group-hover:opacity-100 opacity-0 transition-all"
                      style={{ background: `${d.color}20`, color: d.color }}><LocalizedText id="auto.d1460806d3dc" />

                      </span>
                        </div>
                      </button>);

              })}
                </div>
            }
            </div>
          }
        </div>

        {}
        <div className="flex-shrink-0 px-5 py-3 border-t border-white/5 flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white/20 flex-shrink-0">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          <p className="text-[10px] text-white/20"><LocalizedText id="auto.23109c7f2212" />
            <span className="text-white/40 font-mono"><LocalizedText id="auto.551ce03cd443" /></span><LocalizedText id="auto.675f63e7ea0f" />
          </p>
        </div>
      </div>
    </div>);

}