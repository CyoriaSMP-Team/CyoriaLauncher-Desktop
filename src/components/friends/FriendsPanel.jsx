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

import { useLang } from '../../i18n/LangProvider'

// The upstream friends backend was owned by VoxelX, not CyoriaSMP.
// No UUID or account data is transmitted until a first-party service exists.
export default function FriendsPanel() {
  const { t } = useLang()
  return <section className="flex h-full items-center justify-center p-5 text-center">
    <div className="max-w-sm rounded-2xl border border-sky-400/20 bg-sky-400/5 p-6">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400">
        <svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M16 11a4 4 0 1 0-2.3-7.27M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-2a7 7 0 0 1 14 0v2H2Zm16-7a5 5 0 0 1 4 5v2h-4"/></svg>
      </div>
      <h2 className="text-sm font-semibold text-sky-300">{t('cyoria.friendsUnavailableTitle')}</h2>
      <p className="mt-2 text-xs leading-5 text-white/50">{t('cyoria.friendsUnavailableDescription')}</p>
    </div>
  </section>
}
