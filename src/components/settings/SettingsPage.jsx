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

import { useState, useEffect, useCallback, useRef } from 'react'
import LauncherTab from './tabs/LauncherTab'
import PrivacyTab  from './tabs/PrivacyTab'
import AboutTab    from './tabs/AboutTab'
import { DEFAULT_SETTINGS, sanitizeSettings, loadAppSettings, saveAppSettings, applyAppSettings } from '../../utils/appSettings'
import { useLang } from '../../i18n/LangProvider'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('launcher')
  const [settings, setSettings]  = useState(DEFAULT_SETTINGS)
  const [loaded, setLoaded]      = useState(false)
  const saveTimerRef             = useRef(null)
  const { t } = useLang()

  const TABS = [
    {
      id: 'launcher',
      label: t('settings.tabs.launcher'),
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
        </svg>
      ),
    },
    {
      id: 'privacy',
      label: t('settings.tabs.privacy'),
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
      ),
    },
    {
      id: 'about',
      label: t('settings.tabs.about'),
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      ),
    },
  ]

  useEffect(() => {
    loadAppSettings().then(s => {
      setSettings(s)
      setLoaded(true)
      applyAppSettings(s)
    })
  }, [])

  useEffect(() => {
    if (!loaded) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveAppSettings(settings)
    }, 600)
    return () => clearTimeout(saveTimerRef.current)
  }, [settings, loaded])

  const handleChange = useCallback((patch) => {
    setSettings(prev => {
      const next = sanitizeSettings({ ...prev, ...patch })
      applyAppSettings(next)
      return next
    })
  }, [])

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {}
      <div className="flex-shrink-0 px-6 pt-6 pb-0">
        <div className="mb-4">
          <h1 className="text-lg font-bold text-white">{t('settings.title')}</h1>
          <p className="text-xs text-white/30 mt-0.5">{t('settings.subtitle')}</p>
        </div>

        {}
        <div className="flex gap-1 border-b border-white/5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 text-xs font-semibold
                border-b-2 transition-all duration-150 -mb-px
                ${activeTab === tab.id
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-white/35 hover:text-white/60 hover:border-white/15'
                }
              `}
            >
              <span className={activeTab === tab.id ? 'text-sky-400' : 'text-white/25'}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'launcher' && (
          <LauncherTab settings={settings} onChange={handleChange} />
        )}
        {activeTab === 'privacy' && (
          <PrivacyTab settings={settings} onChange={handleChange} />
        )}
        {activeTab === 'about' && (
          <AboutTab />
        )}
      </div>
    </div>
  )
}

