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

import { useEffect, useState, useRef } from 'react';
import { loadAppSettings } from '../utils/appSettings';
import { useLang } from '../i18n/LangProvider';import LocalizedText from "../i18n/LocalizedText.jsx";

const isElectron = typeof window !== 'undefined' && window.electronAPI;

export default function SplashScreen({ onDone }) {
  const { t } = useLang();
  const tRef = useRef(t);
  tRef.current = t;
  const [pct, setPct] = useState(0);
  const [log, setLog] = useState('');
  const [fadeOut, setFadeOut] = useState(false);
  const [version, setVersion] = useState('');
  const doneRef = useRef(false);
  const pctRef = useRef(0);

  function setProgress(p, label) {
    pctRef.current = p;
    setPct(p);
    if (label) setLog(label);
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {

      setProgress(5, tRef.current('splash.init'));
      if (isElectron) {
        try {
          const v = await window.electronAPI.getVersion();
          if (v && !cancelled) setVersion(v);
        } catch {}
      }
      await delay(120);

      if (cancelled) return;

      setProgress(20, tRef.current('splash.loadSettings'));
      let autoCheckUpdate = true;
      try {
        const s = await loadAppSettings();
        if (s?.background && !cancelled) {
          window.dispatchEvent(new CustomEvent('vxc-bg-change', { detail: s.background }));
        }
        if (typeof s?.autoCheckUpdate === 'boolean') {
          autoCheckUpdate = s.autoCheckUpdate;
        }
      } catch {}
      await delay(100);

      if (cancelled) return;

      if (autoCheckUpdate && isElectron) {
        setProgress(30, tRef.current('splash.checkUpdate'));
        try {
          const updateResult = await window.electronAPI.checkUpdate();
          if (!cancelled && updateResult?.hasUpdate) {

            setProgress(35, tRef.current('splash.newVersion', { version: updateResult.latestVersion || '' }));
            await delay(400);
            window.electronAPI.openUpdateWindow(updateResult);
            return;
          }
        } catch {}
      }

      setProgress(45, tRef.current('splash.loadAccounts'));
      if (isElectron) {
        try {
          const accountData = await window.electronAPI.getAccounts();
          const selected = (accountData?.accounts || []).find((a) => a.id === accountData?.selectedId);

          if (selected?.type === 'microsoft') {
            setProgress(50, tRef.current('splash.syncMs', { username: selected.username || '' }));
            try {
              await window.electronAPI.msRefreshToken(selected.id);
            } catch {}
          }

          const otherMs = (accountData?.accounts || []).filter(
            (a) => a.type === 'microsoft' && a.id !== selected?.id
          );
          for (const acc of otherMs) {
            try {await window.electronAPI.msRefreshToken(acc.id);} catch {}
          }
        } catch {}
      }
      await delay(100);

      if (cancelled) return;

      setProgress(65, tRef.current('splash.loadProfiles'));
      if (isElectron) {
        try {await window.electronAPI.getProfiles();} catch {}
      }
      await delay(100);

      if (cancelled) return;

      setProgress(80, tRef.current('splash.loadVersions'));
      if (isElectron) {
        try {await window.electronAPI.minecraftListVersions();} catch {}
      }
      await delay(100);

      if (cancelled) return;

      setProgress(95, tRef.current('splash.finishing'));
      await delay(200);

      if (cancelled) return;

      setProgress(100, tRef.current('splash.ready'));
      await delay(350);

      if (cancelled) return;

      setFadeOut(true);
      await delay(550);

      if (!doneRef.current && !cancelled) {
        doneRef.current = true;
        onDone();
      }
    }

    run();
    return () => {cancelled = true;};
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-[#080808]"
      style={{ opacity: fadeOut ? 0 : 1, transition: 'opacity 550ms ease-in-out', pointerEvents: fadeOut ? 'none' : 'auto' }}>
      
      {}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(rgba(74,222,128,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(74,222,128,0.8) 1px,transparent 1px)`,
        backgroundSize: '48px 48px'
      }} />

      {}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
      </div>

      {}
      <div className="flex-1 flex flex-col items-center justify-center gap-7 relative z-10">

        {}
        <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 bg-green-500/20 rounded-full blur-3xl" style={{ animation: 'splash-glow 4s ease-in-out infinite' }} />
          </div>
          <div className="absolute rounded-xl" style={{ width: 36, height: 36, background: '#4ade80', boxShadow: '0 0 18px #4ade8099', animation: 'splash-tl 4s ease-in-out 0s infinite' }} />
          <div className="absolute rounded-xl" style={{ width: 36, height: 36, background: '#22c55e', boxShadow: '0 0 18px #22c55e99', animation: 'splash-tr 4s ease-in-out 0.06s infinite' }} />
          <div className="absolute rounded-xl" style={{ width: 36, height: 36, background: '#16a34a', boxShadow: '0 0 18px #16a34a99', animation: 'splash-bl 4s ease-in-out 0.12s infinite' }} />
          <div className="absolute rounded-xl" style={{ width: 36, height: 36, background: '#4ade80', boxShadow: '0 0 18px #4ade8099', animation: 'splash-br 4s ease-in-out 0.18s infinite' }} />
        </div>

        <style>{`
          @keyframes splash-tl {
            0%   { transform:translate(-18px,-18px) rotate(0deg)   scale(1);   opacity:.9; }
            15%  { transform:translate(-42px,-42px) rotate(0deg)   scale(1.1); opacity:1;  }
            50%  { transform:translate(-42px,-42px) rotate(360deg) scale(1.1); opacity:1;  }
            65%  { transform:translate(-18px,-18px) rotate(360deg) scale(1);   opacity:.9; }
            100% { transform:translate(-18px,-18px) rotate(360deg) scale(1);   opacity:.9; }
          }
          @keyframes splash-tr {
            0%   { transform:translate( 18px,-18px) rotate(0deg)   scale(1);   opacity:.9; }
            15%  { transform:translate( 42px,-42px) rotate(0deg)   scale(1.1); opacity:1;  }
            50%  { transform:translate( 42px,-42px) rotate(360deg) scale(1.1); opacity:1;  }
            65%  { transform:translate( 18px,-18px) rotate(360deg) scale(1);   opacity:.9; }
            100% { transform:translate( 18px,-18px) rotate(360deg) scale(1);   opacity:.9; }
          }
          @keyframes splash-bl {
            0%   { transform:translate(-18px, 18px) rotate(0deg)   scale(1);   opacity:.9; }
            15%  { transform:translate(-42px, 42px) rotate(0deg)   scale(1.1); opacity:1;  }
            50%  { transform:translate(-42px, 42px) rotate(360deg) scale(1.1); opacity:1;  }
            65%  { transform:translate(-18px, 18px) rotate(360deg) scale(1);   opacity:.9; }
            100% { transform:translate(-18px, 18px) rotate(360deg) scale(1);   opacity:.9; }
          }
          @keyframes splash-br {
            0%   { transform:translate( 18px, 18px) rotate(0deg)   scale(1);   opacity:.9; }
            15%  { transform:translate( 42px, 42px) rotate(0deg)   scale(1.1); opacity:1;  }
            50%  { transform:translate( 42px, 42px) rotate(360deg) scale(1.1); opacity:1;  }
            65%  { transform:translate( 18px, 18px) rotate(360deg) scale(1);   opacity:.9; }
            100% { transform:translate( 18px, 18px) rotate(360deg) scale(1);   opacity:.9; }
          }
          @keyframes splash-glow {
            0%   { opacity:0.3; transform:scale(1);   }
            15%  { opacity:0.9; transform:scale(1.8); }
            50%  { opacity:0.9; transform:scale(1.8); }
            65%  { opacity:0.3; transform:scale(1);   }
            100% { opacity:0.3; transform:scale(1);   }
          }
        `}</style>

        {}
        <div className="text-center">
          <h1 className="text-3xl font-black text-white tracking-tight"><LocalizedText id="auto.8649a2b37fbb" />
            <span className="text-green-400"><LocalizedText id="auto.79f73a1cb6f8" /></span>
          </h1>
          <p className="text-xs text-white/25 mt-1 font-mono tracking-widest">{version ? `v${version}` : ''}</p>
        </div>

        {}
        <div className="w-72 flex flex-col gap-2">
          {}
          <p className="text-[11px] text-white/40 font-mono text-center truncate">{log}</p>

          {}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg,#16a34a,#4ade80)',
                  boxShadow: '0 0 8px rgba(74,222,128,0.6)',
                  transition: 'width 300ms ease-out'
                }} />
              
            </div>
            <span className="text-[11px] text-green-400 font-mono font-bold w-8 text-right flex-shrink-0">{pct}%</span>
          </div>
        </div>
      </div>
    </div>);

}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}