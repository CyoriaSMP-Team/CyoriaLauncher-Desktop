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
import { useLang } from '../i18n/LangProvider';import LocalizedText from "../i18n/LocalizedText.jsx";

const isElectron = typeof window !== 'undefined' && window.electronAPI;

function formatBytes(b) {
  if (!b) return '';
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export default function UpdateWindow() {
  const { t } = useLang();
  const tRef = useRef(t);
  tRef.current = t;
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [version, setVersion] = useState('');
  const [dlProgress, setDlProgress] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const unsubRef = useRef(null);
  const preloadReceivedRef = useRef(false);
  const startDownloadRef = useRef(null);
  async function runDownload(r) {
    if (!r?.installerAsset) {
      setErrorMsg(tRef.current('update.errorNoInstaller'));
      setStatus('error');
      return;
    }

    setStatus('downloading');
    setDlProgress({ percent: 0, downloaded: 0, total: r.installerAsset.size || 0, speed: 0 });

    try {
      const res = isElectron ?
      await window.electronAPI.downloadUpdate({
        downloadUrl: r.installerAsset.downloadUrl,
        fileName: r.installerAsset.name
      }) :
      { ok: true, filePath: '/tmp/fake.exe' };

      if (res?.error) {
        setErrorMsg(tRef.current('update.errorDownload', { detail: res.error }));
        setStatus('error');
        return;
      }

      setStatus('installing');
      await new Promise((resolve) => setTimeout(resolve, 600));

      const installRes = isElectron ?
      await window.electronAPI.installUpdate({ filePath: res.filePath }) :
      { ok: true };

      if (installRes?.error) {
        setErrorMsg(tRef.current('update.errorInstall', { detail: installRes.error }));
        setStatus('error');
      }
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  }

  startDownloadRef.current = runDownload;

  useEffect(() => {
    if (isElectron) window.electronAPI.getVersion().then(setVersion);else
    setVersion('1.0.0');

    if (isElectron) {
      unsubRef.current = window.electronAPI.onDownloadProgress((p) => setDlProgress(p));
    }

    let unsubPreload = null;
    if (isElectron && window.electronAPI.onUpdaterPreloadResult) {
      unsubPreload = window.electronAPI.onUpdaterPreloadResult((res) => {
        preloadReceivedRef.current = true;
        setResult(res);

        if (res?.hasUpdate) {
          if (res?.autoDownload) {
            startDownloadRef.current(res);
          } else {
            setStatus('updateAvailable');
          }
        } else {
          setStatus('upToDate');
        }
      });
    }

    return () => {
      unsubRef.current?.();
      unsubPreload?.();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'idle' && !preloadReceivedRef.current) handleCheck();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  async function handleCheck() {
    setStatus('checking');
    setResult(null);
    setErrorMsg('');
    setDlProgress(null);
    try {
      const res = isElectron ?
      await window.electronAPI.checkUpdate() :
      { hasUpdate: false, currentVersion: '1.0.0', latestVersion: '1.0.0', message: 'Bạn đang dùng phiên bản mới nhất.' };

      setResult(res);
      if (res.error) {
        setErrorMsg(res.message);
        setStatus('error');
      } else if (res.noRelease) {
        setStatus('noRelease');
      } else if (res.hasUpdate) {
        setStatus('updateAvailable');
      } else {
        setStatus('upToDate');
      }
    } catch (err) {
      setErrorMsg(tRef.current('update.errorCheck'));
      setStatus('error');
    }
  }

  async function handleDownload(checkResult) {
    await runDownload(checkResult || result);
  }

  function handleClose() {
    if (isElectron) window.electronAPI.closeWindow();
  }

  function openUrl(url) {
    if (isElectron) window.electronAPI.openExternal(url);else
    window.open(url, '_blank');
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-[#0f0f0f] overflow-hidden select-none">
      {}
      <div className="drag-region flex items-center justify-between h-9 px-4 bg-black/40 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2 no-drag">
          <div className="w-4 h-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <rect x="2" y="2" width="9" height="9" fill="#38bdf8" rx="1" />
              <rect x="13" y="2" width="9" height="9" fill="#0284c7" rx="1" />
              <rect x="2" y="13" width="9" height="9" fill="#0284c7" rx="1" />
              <rect x="13" y="13" width="9" height="9" fill="#38bdf8" rx="1" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-white/50 tracking-widest uppercase">
            {t('update.title')}
          </span>
        </div>
        <button onClick={handleClose}
        className="no-drag w-7 h-7 flex items-center justify-center rounded hover:bg-red-500/80 text-white/40 hover:text-white transition-all">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6 overflow-y-auto py-8">
        {}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400/20 to-cyan-600/20 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9">
            <rect x="2" y="2" width="9" height="9" fill="#38bdf8" rx="1.5" />
            <rect x="13" y="2" width="9" height="9" fill="#0284c7" rx="1.5" />
            <rect x="2" y="13" width="9" height="9" fill="#0284c7" rx="1.5" />
            <rect x="13" y="13" width="9" height="9" fill="#38bdf8" rx="1.5" />
          </svg>
        </div>

        <div className="text-center flex-shrink-0">
          <h1 className="text-lg font-bold text-white"><LocalizedText id="auto.416dbf56c7fb" /></h1>
          <p className="text-xs text-white/30 mt-1">
            {t('update.currentVersion')} <span className="text-white/50 font-mono">{version || '...'}</span>
          </p>
        </div>

        {}
        <div className="w-full max-w-sm">

          {}
          {status === 'checking' &&
          <div className="flex flex-col items-center gap-3 py-4">
              <svg className="animate-spin w-7 h-7 text-sky-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-white/40">{t('update.checking')}</p>
            </div>
          }

          {}
          {status === 'upToDate' &&
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-sky-500/15 border border-sky-500/25 flex items-center justify-center mx-auto mb-3">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-sky-400">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white/70">{t('update.upToDate')}</p>
              <p className="text-xs text-white/30 mt-1 font-mono">{result?.currentVersion}</p>
            </div>
          }

          {}
          {status === 'noRelease' &&
          <div className="rounded-xl border border-yellow-500/15 bg-yellow-500/5 p-5 text-center">
              <p className="text-sm text-yellow-400/80 font-semibold">{t('update.noRelease')}</p>
              <p className="text-xs text-white/30 mt-1"><LocalizedText id="auto.29c0dec8c927" /></p>
            </div>
          }

          {}
          {status === 'updateAvailable' && result &&
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/8 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-sky-500/15 border border-sky-500/25 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-sky-400">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-sky-400">{t('update.hasUpdate')}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    <span className="font-mono">{result.currentVersion}</span>
                    <span className="mx-1.5 text-white/20">→</span>
                    <span className="text-sky-400 font-mono font-bold">{result.latestVersion}</span>
                  </p>
                </div>
              </div>
              {result.installerAsset ?
            <button onClick={() => handleDownload(result)}
            className="w-full py-2.5 rounded-xl text-sm font-bold bg-sky-500 hover:bg-sky-400 text-white transition-all active:scale-95 flex items-center justify-center gap-2">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                  </svg>
                  {t('update.downloadBtn', { version: result.latestVersion })}
                </button> :

            <button onClick={() => openUrl(result.releaseUrl)}
            className="w-full py-2.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/15 text-white transition-all active:scale-95 flex items-center justify-center gap-2">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                  </svg>
                  {t('update.openRelease')}
                </button>
            }
            </div>
          }

          {}
          {status === 'downloading' &&
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/8 p-5">
              <div className="flex items-center gap-2 mb-4">
                <svg className="animate-spin w-4 h-4 text-sky-400 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm font-semibold text-white/80">{t('update.downloading')}</p>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-sky-400 rounded-full transition-all duration-300"
              style={{ width: `${dlProgress?.percent ?? 0}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs text-white/30">
                <span>
                  {dlProgress?.downloaded ? formatBytes(dlProgress.downloaded) : '0 KB'}
                  {dlProgress?.total ? ` / ${formatBytes(dlProgress.total)}` : ''}
                </span>
                <div className="flex items-center gap-3">
                  {dlProgress?.speed > 0 &&
                <span>{formatBytes(dlProgress.speed)}/s</span>
                }
                  <span className="font-mono font-bold text-white/50">{dlProgress?.percent ?? 0}%</span>
                </div>
              </div>
              {result?.installerAsset &&
            <p className="text-[10px] text-white/20 mt-2 truncate">{result.installerAsset.name}</p>
            }
            </div>
          }

          {}
          {status === 'installing' &&
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/8 p-5 text-center">
              <svg className="animate-spin w-7 h-7 text-sky-400 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm font-bold text-sky-400">{t('update.installing')}</p>
            </div>
          }

          {}
          {status === 'error' &&
          <div className="rounded-xl border border-red-500/20 bg-red-500/8 p-5 text-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-400 mx-auto mb-2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <p className="text-sm text-red-400">{errorMsg}</p>
              <button onClick={handleCheck}
            className="mt-3 text-xs text-white/40 hover:text-white/70 transition-colors">
                {t('update.errorRetry')}
              </button>
            </div>
          }
        </div>

        {}
        {['idle', 'upToDate', 'noRelease', 'error'].includes(status) &&
        <button onClick={handleCheck}
        className="px-8 py-2.5 rounded-xl text-sm font-bold bg-sky-500 hover:bg-sky-400 text-white transition-all duration-200 active:scale-95 flex-shrink-0">
            {t('update.checkBtn')}
          </button>
        }

        {}
        <button onClick={() => openUrl('https://github.com/foxstudio-201/VoxelXLauncher')}
        className="text-[10px] text-white/15 hover:text-white/35 transition-colors flex-shrink-0"><LocalizedText id="auto.b50b9bbacef2" />

        </button>
      </div>
    </div>);

}