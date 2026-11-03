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

import { useState, useEffect, useRef } from 'react';import LocalizedText from "../../i18n/LocalizedText.jsx";

export default function GroupSelect({ groups = [], value = '', onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = groups.find((g) => g.id === value) || null;

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handler(e) {if (e.key === 'Escape') setOpen(false);}
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  function select(id) {
    onChange(id);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      {}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${open ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'}`
        }}>
        
        <span className="flex items-center gap-2 min-w-0 flex-1">
          {selected ?
          <>
              {}
              <span className="flex-shrink-0 w-5 h-5 rounded-md bg-blue-500/20 border border-blue-500/25 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-blue-400">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </span>
              <span className="truncate font-medium text-white">{selected.name}</span>
            </> :

          <>
              <span className="flex-shrink-0 w-5 h-5 rounded-md bg-white/5 border border-white/8 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white/25">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </span>
              <span className="text-white/30"><LocalizedText id="auto.d4164e2588de" /></span>
            </>
          }
        </span>
        <svg
          viewBox="0 0 24 24" fill="currentColor"
          className={`w-3.5 h-3.5 flex-shrink-0 text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {}
      {open &&
      <div
        className="absolute left-0 right-0 top-full mt-1.5 z-[400] rounded-xl overflow-hidden"
        style={{
          background: 'rgba(18,18,18,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
          backdropFilter: 'blur(12px)'
        }}>
        
          <div className="overflow-y-auto max-h-48 py-1">
            {}
            <button
            type="button"
            onClick={() => select('')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all duration-100"
            style={{
              background: value === '' ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: value === '' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)'
            }}
            onMouseEnter={(e) => {if (value !== '') e.currentTarget.style.background = 'rgba(255,255,255,0.04)';}}
            onMouseLeave={(e) => {if (value !== '') e.currentTarget.style.background = 'transparent';}}>
            
              <span className="flex-shrink-0 w-5 h-5 rounded-md bg-white/5 border border-white/8 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white/25">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </span>
              <span className="flex-1 text-xs font-medium"><LocalizedText id="auto.d4164e2588de" /></span>
              {value === '' &&
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white/40 flex-shrink-0">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
            }
            </button>

            {}
            {groups.length > 0 && <div className="h-px bg-white/5 mx-2 my-1" />}

            {}
            {groups.map((g) => {
            const isSelected = g.id === value;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => select(g.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all duration-100"
                style={{
                  background: isSelected ? 'rgba(59,130,246,0.12)' : 'transparent',
                  color: isSelected ? '#93c5fd' : 'rgba(255,255,255,0.65)'
                }}
                onMouseEnter={(e) => {if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';}}
                onMouseLeave={(e) => {if (!isSelected) e.currentTarget.style.background = 'transparent';}}>
                
                  <span
                  className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center"
                  style={{
                    background: isSelected ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${isSelected ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.08)'}`
                  }}>
                  
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3" style={{ color: isSelected ? '#93c5fd' : 'rgba(255,255,255,0.3)' }}>
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </span>
                  <span className="flex-1 text-xs font-semibold truncate">{g.name}</span>
                  {isSelected &&
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-blue-400 flex-shrink-0">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                }
                </button>);

          })}
          </div>
        </div>
      }
    </div>);

}