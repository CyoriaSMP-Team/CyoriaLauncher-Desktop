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

import { useEffect, useState } from 'react';
import { useLang } from '../i18n/LangProvider';import LocalizedText from "../i18n/LocalizedText.jsx";

export default function NoAccountHint({ onGoToAccount }) {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setVisible(false);
  }

  function goToAccount() {
    setVisible(false);
    setTimeout(onGoToAccount, 200);
  }

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">

      {}
      <div
        onClick={dismiss}
        className={`
          absolute inset-0 pointer-events-auto
          transition-opacity duration-300
          ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        style={{ background: 'rgba(0,0,0,0.35)' }} />
      

      {}
      <div
        className={`
          absolute pointer-events-none
          transition-all duration-500
          ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
        `}
        style={{
          left: 8,
          bottom: 16,
          width: 48,
          height: 48,
          borderRadius: 'var(--app-radius)',
          border: '2px solid rgba(74,222,128,0.7)',
          boxShadow: '0 0 0 4px rgba(74,222,128,0.15), 0 0 16px rgba(74,222,128,0.3)',
          animation: visible ? 'pulse-ring 1.8s ease-in-out infinite' : 'none'
        }} />
      

      {}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          absolute pointer-events-auto
          transition-all duration-300 ease-out
          ${visible ?
        'opacity-100 translate-x-0' :
        'opacity-0 -translate-x-2 pointer-events-none'}
        `
        }
        style={{ left: 72, bottom: 10 }}>
        
        <div className="flex items-end gap-0">
          {}
          <div
            className="flex-shrink-0 self-center mb-1"
            style={{
              width: 0, height: 0,
              borderTop: '7px solid transparent',
              borderBottom: '7px solid transparent',
              borderRight: '9px solid rgba(74,222,128,0.2)'
            }} />
          

          {}
          <div className="relative bg-[#161616] border border-sky-500/20 rounded-xl shadow-2xl shadow-black/70 w-60 overflow-hidden">
            <div className="h-[2px] bg-gradient-to-r from-sky-500 to-cyan-400 w-full" />

            {}
            <span className="absolute top-3 right-3 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
            </span>

            <div className="p-4">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-sky-400">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{t('noacccounthint.noaccount')}</p>
                  <p className="text-[11px] text-white/35">{t('noacccounthint.needacccount')}</p>
                </div>
              </div>

              <p className="text-[11px] text-white/45 leading-relaxed mb-3.5">
                {t('noacccounthint.createacccount')} <span className="text-white/70 font-medium"><LocalizedText id="auto.3cea045320a8" /></span> {t('noacccounthint.ofloggins')}{' '}
                <span className="text-white/70 font-medium"><LocalizedText id="auto.b2e1b2b3c4d8" /></span> {t('noacccounthint.tostartmc')}
              </p>

              {}
              <button
                onClick={goToAccount}
                className="
                  w-full py-2 rounded-lg text-xs font-bold
                  bg-sky-500 hover:bg-sky-400 text-white
                  transition-all duration-150 active:scale-95
                  flex items-center justify-center gap-1.5
                ">





                
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                {t('noacccounthint.createnow')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>);

}