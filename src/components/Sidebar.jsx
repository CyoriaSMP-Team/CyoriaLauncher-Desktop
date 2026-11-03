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

import {
  House,
  PlayCircle,
  PuzzlePiece,
  HardDrives,
  Gear,
  UserCircle,
} from '@phosphor-icons/react'

import PlayerHead from './ui/PlayerHead'
import { useLang } from '../i18n/LangProvider'

export default function Sidebar({ activePage, onNavigate, selectedAccount }) {
  const isAccountPage = activePage === 'account'
  const { t } = useLang()

  const navItems = [
    { id: 'home',     label: t('sidebar.home'),     Icon: House       },
    { id: 'play',     label: t('sidebar.play'),     Icon: PlayCircle  },
    { id: 'mods',     label: t('sidebar.mods'),     Icon: PuzzlePiece },
    { id: 'worlds',   label: t('sidebar.worlds'),   Icon: HardDrives  },
    { id: 'settings', label: t('sidebar.settings'), Icon: Gear        },
  ]

  return (
    <aside className="w-[68px] flex flex-col items-center py-4 gap-0.5 bg-black/25 backdrop-blur-md border-r border-white/[0.06] z-50 overflow-visible">
      {}
      <div className="mb-4 mt-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-600/10 flex items-center justify-center relative overflow-hidden shadow-lg shadow-sky-500/20 select-none border border-sky-500/15">
          {}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-6 h-6 bg-sky-500/30 rounded-full blur-lg" style={{ animation: 'sb-glow 3s ease-in-out infinite' }} />
          </div>
          {}
          <div className="absolute rounded-[3px]" style={{ width: 8, height: 8, background: '#38bdf8', boxShadow: '0 0 6px #38bdf899', animation: 'sb-tl 3s ease-in-out 0s infinite' }} />
          <div className="absolute rounded-[3px]" style={{ width: 8, height: 8, background: '#0284c7', boxShadow: '0 0 6px #0284c799', animation: 'sb-tr 3s ease-in-out 0.06s infinite' }} />
          <div className="absolute rounded-[3px]" style={{ width: 8, height: 8, background: '#0284c7', boxShadow: '0 0 6px #0284c799', animation: 'sb-bl 3s ease-in-out 0.12s infinite' }} />
          <div className="absolute rounded-[3px]" style={{ width: 8, height: 8, background: '#38bdf8', boxShadow: '0 0 6px #38bdf899', animation: 'sb-br 3s ease-in-out 0.18s infinite' }} />
        </div>
        <style>{`
          @keyframes sb-tl {
            0%,100% { transform: translate(-4px,-4px) rotate(0deg)   scale(1);   opacity:.9; }
            15%     { transform: translate(-8px,-8px) rotate(0deg)   scale(1.1); opacity:1;  }
            50%     { transform: translate(-8px,-8px) rotate(360deg) scale(1.1); opacity:1;  }
            65%     { transform: translate(-4px,-4px) rotate(360deg) scale(1);   opacity:.9; }
          }
          @keyframes sb-tr {
            0%,100% { transform: translate( 4px,-4px) rotate(0deg)   scale(1);   opacity:.9; }
            15%     { transform: translate( 8px,-8px) rotate(0deg)   scale(1.1); opacity:1;  }
            50%     { transform: translate( 8px,-8px) rotate(360deg) scale(1.1); opacity:1;  }
            65%     { transform: translate( 4px,-4px) rotate(360deg) scale(1);   opacity:.9; }
          }
          @keyframes sb-bl {
            0%,100% { transform: translate(-4px, 4px) rotate(0deg)   scale(1);   opacity:.9; }
            15%     { transform: translate(-8px, 8px) rotate(0deg)   scale(1.1); opacity:1;  }
            50%     { transform: translate(-8px, 8px) rotate(360deg) scale(1.1); opacity:1;  }
            65%     { transform: translate(-4px, 4px) rotate(360deg) scale(1);   opacity:.9; }
          }
          @keyframes sb-br {
            0%,100% { transform: translate( 4px, 4px) rotate(0deg)   scale(1);   opacity:.9; }
            15%     { transform: translate( 8px, 8px) rotate(0deg)   scale(1.1); opacity:1;  }
            50%     { transform: translate( 8px, 8px) rotate(360deg) scale(1.1); opacity:1;  }
            65%     { transform: translate( 4px, 4px) rotate(360deg) scale(1);   opacity:.9; }
          }
          @keyframes sb-glow {
            0%,100% { opacity:0.3; transform:scale(1);   }
            15%     { opacity:0.8; transform:scale(1.5); }
            50%     { opacity:0.8; transform:scale(1.5); }
            65%     { opacity:0.3; transform:scale(1);   }
          }
        `}</style>
      </div>

      {}
      <nav className="flex flex-col gap-1 flex-1 w-full px-2 relative">
        {/* Sliding active indicator */}
        <div
          className="absolute left-0 w-[3px] h-6 bg-sky-400 rounded-r-full transition-all duration-300 ease-out z-20"
          style={{
            top: (() => {
              const idx = navItems.findIndex(n => n.id === activePage)
              if (idx < 0) return '-100px'
              // Mỗi button h-12 (48px) + gap-1 (4px) = 52px mỗi item, centered là 48/2 - 24/2 = 12px offset
              return `${idx * 52 + 12}px`
            })(),
            opacity: navItems.some(n => n.id === activePage) ? 1 : 0,
          }}
        />
        {navItems.map(({ id, label, Icon }) => {
          const isActive = activePage === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`
                relative w-full h-12 rounded-xl flex items-center justify-center
                transition-all duration-200 group
                ${isActive
                  ? 'bg-sky-500/15 text-sky-400'
                  : 'text-white/30 hover:text-white/70 hover:bg-white/[0.06]'
                }
              `}
            >
              <Icon size={24} weight="duotone" />
              <span className="
                pointer-events-none absolute left-[calc(100%+10px)] px-2.5 py-1.5
                bg-[#1a1a1a] border border-white/[0.08] rounded-lg
                text-white/80 text-[11px] font-semibold whitespace-nowrap
                shadow-2xl shadow-black/60
                opacity-0 group-hover:opacity-100
                -translate-x-2 group-hover:translate-x-0
                transition-all duration-150 z-[999]
              ">{label}</span>
            </button>
          )
        })}
      </nav>

      {}
      <div className="w-8 h-px bg-white/10 my-2" />

      {}
      <div className="w-full px-2 pb-1">
        <button
          onClick={() => onNavigate('account')}
          className={`
            relative w-full h-12 rounded-xl flex items-center justify-center
            transition-all duration-150 group
            ${isAccountPage
              ? 'bg-sky-500/15 text-sky-400'
              : 'text-white/30 hover:text-white/70 hover:bg-white/[0.06]'
            }
          `}
        >
          {selectedAccount ? (
            <div className={`rounded-lg overflow-hidden ${isAccountPage ? 'ring-2 ring-sky-400/50 ring-offset-1 ring-offset-black/50' : ''}`}>
              <PlayerHead uuid={selectedAccount.uuid} username={selectedAccount.username} size={34} />
            </div>
          ) : (
            <UserCircle size={24} weight="duotone" />
          )}
          {selectedAccount && (
            <span className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-400 border-2 border-black/60" />
          )}
          <span className="
            pointer-events-none absolute left-[calc(100%+10px)] px-2.5 py-1.5
            bg-[#1a1a1a] border border-white/[0.08] rounded-lg
            text-white/80 text-[11px] font-semibold whitespace-nowrap
            shadow-2xl shadow-black/60
            opacity-0 group-hover:opacity-100
            -translate-x-2 group-hover:translate-x-0
            transition-all duration-150 z-[999]
          ">{selectedAccount?.username ?? 'Account'}</span>
        </button>
      </div>
    </aside>
  )
}

