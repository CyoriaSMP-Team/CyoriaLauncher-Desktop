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

import { useState } from 'react'
import ModrinthTab from './modrinth/ModrinthTab'
import CurseForgeTab from './curseforge/CurseForgeTab'
import TechnicTab from './technic/TechnicTab'
import FtbTab from './ftb/FtbTab'

import modrinthIcon   from '../../assets/loader/modrinth.png'
import curseforgeIcon from '../../assets/loader/curseforge.png'
import technicIcon    from '../../assets/loader/technic.png'
import ftbIcon        from '../../assets/loader/ftb.png'

const PLATFORM_TABS = [
  { id: 'modrinth',   label: 'Modrinth',   icon: modrinthIcon   },
  { id: 'curseforge', label: 'CurseForge', icon: curseforgeIcon },
  { id: 'technic',    label: 'Technic',    icon: technicIcon    },
  { id: 'ftb',        label: 'FTB',        icon: ftbIcon        },
]

export default function ModsPage() {
  const [platform, setPlatform] = useState('modrinth')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 px-4 pt-3 pb-0">
        <div className="flex gap-1 border-b border-white/5">
          {PLATFORM_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setPlatform(tab.id)}
              className={`
                flex items-center gap-2.5 px-5 py-3 text-sm font-semibold
                border-b-2 transition-all duration-150 -mb-px
                ${platform === tab.id
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-white/35 hover:text-white/60 hover:border-white/15'
                }
              `}
            >
              <img
                src={tab.icon}
                alt={tab.label}
                className={`w-5 h-5 object-contain transition-opacity ${platform === tab.id ? 'opacity-100' : 'opacity-40'}`}
              />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {platform === 'modrinth'   && <ModrinthTab />}
        {platform === 'curseforge' && <CurseForgeTab />}
        {platform === 'technic'    && <TechnicTab />}
        {platform === 'ftb'        && <FtbTab />}
      </div>
    </div>
  )
}

