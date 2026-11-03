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

const isElectron = typeof window !== 'undefined' && window.electronAPI

const LOCAL_STORAGE_KEY = 'vxc_settings'
const SYSTEM_FONT_STACK = 'system-ui, -apple-system, sans-serif'

export const DEFAULT_SETTINGS = {
  autoCheckUpdate:      true,
  hideLauncherOnLaunch: true,
  showLogWindow:        true,
  discordRPC:           false,
  boostMode:            false,
  fontId:               'system',
  colorAccent:          '#38bdf8',
  colorHover:           '#7dd3fc',
  colorActive:          '#0284c7',
  background:           'dark',
  borderRadius:         12,
  borderColor:          'rgba(255,255,255,0.08)',
  agreedTos:            false,
  agreedPrivacy:        false,
  musicEnabled:         true,
  musicVolume:          35,
  language:             'en',
}

const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS)

const FONT_STACKS = {
  inter:           "'Inter', sans-serif",
  outfit:          "'Outfit', sans-serif",
  'plus-jakarta':  "'Plus Jakarta Sans', sans-serif",
  'dm-sans':       "'DM Sans', sans-serif",
  nunito:          "'Nunito', sans-serif",
  poppins:         "'Poppins', sans-serif",
  raleway:         "'Raleway', sans-serif",
  'space-grotesk': "'Space Grotesk', sans-serif",
  sora:            "'Sora', sans-serif",
  jetbrains:       "'JetBrains Mono', monospace",
  'fira-code':     "'Fira Code', monospace",
}

function hasOwn(obj, key) {
  return !!obj && Object.prototype.hasOwnProperty.call(obj, key)
}

export function sanitizeSettings(input = {}) {
  const safe = { ...DEFAULT_SETTINGS }
  if (!input || typeof input !== 'object') return safe

  for (const key of SETTING_KEYS) {
    if (key in input) safe[key] = input[key]
  }

  // Migrate only exact upstream default green values; preserve user-customized palettes.
  const previousDefaults = { colorAccent: '#4ade80', colorHover: '#86efac', colorActive: '#22c55e' }
  for (const [key, previous] of Object.entries(previousDefaults)) {
    if (safe[key] === previous) safe[key] = DEFAULT_SETTINGS[key]
  }
  return safe
}

function readLocalSettingsRaw() {
  if (typeof window === 'undefined') return {}

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeLocalSettings(settings) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitizeSettings(settings)))
  } catch {
    return
  }
}

function mergeStoredSettings(primary = {}, fallback = {}) {
  const merged = {}

  for (const key of SETTING_KEYS) {
    if (hasOwn(primary, key)) merged[key] = primary[key]
    else if (hasOwn(fallback, key)) merged[key] = fallback[key]
  }

  return sanitizeSettings(merged)
}

export async function loadAppSettings() {
  const local = readLocalSettingsRaw()

  if (isElectron) {
    try {
      const remote = await window.electronAPI.getSettings()
      return mergeStoredSettings(remote, local)
    } catch {
      return sanitizeSettings(local)
    }
  }

  return sanitizeSettings(local)
}

export async function saveAppSettings(settings) {
  const safe = sanitizeSettings(settings)

  writeLocalSettings(safe)

  if (isElectron) {
    try { await window.electronAPI.saveSettings(safe) } catch {
      return safe
    }
  }

  return safe
}

export function applyAppSettings(settings) {
  if (typeof window === 'undefined') return

  const safe = sanitizeSettings(settings)
  const stack = safe.fontId && safe.fontId !== 'system'
    ? FONT_STACKS[safe.fontId]
    : SYSTEM_FONT_STACK

  window.dispatchEvent(new CustomEvent('vxc-bg-change', { detail: safe.background ?? 'dark' }))
  document.documentElement.style.setProperty('--app-font', stack || SYSTEM_FONT_STACK)
  document.body.style.fontFamily = stack || SYSTEM_FONT_STACK

  if (safe.borderRadius !== undefined) {
    document.documentElement.style.setProperty('--app-radius', `${safe.borderRadius}px`)
  }
  if (safe.borderColor) {
    document.documentElement.style.setProperty('--app-border-color', safe.borderColor)
  }
}

