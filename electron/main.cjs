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

const { app, BrowserWindow, ipcMain, nativeImage, Tray, Menu, shell } = require('electron')
const path = require('path')
const fs   = require('fs')
const rpc  = require('./discordRPC.cjs')
const { getHwid, getHwidFormatted } = require('./hwid.cjs')
// Discord identity is verified only through CyoriaSMP OIDC (no VoxelX backend).
const cyoriaIdentity = require('./cyoriaIdentity.cjs')
const cyoriaWebIdentity = require('./cyoriaWebIdentity.cjs')
const { sanitizeDiscordLink, verifiedDiscordPatch } = require('./accountLinking.cjs')
const { validateNewOfflineAccount } = require('./offlineAccountPolicy.cjs')
const { registerProfileHandlers, registerGroupHandlers, registerProfileContentHandlers, registerJavaDistroHandlers } = require('./profileManager.cjs')
const { registerServerHandlers } = require('./serverManager.cjs')
const { registerLauncherHandlers } = require('./launcher.cjs')
const { loginWithWindow, refreshMinecraftToken, cancelLogin } = require('./msAuth.cjs')
const { registerLanHandlers, setLanWindowRef } = require('./lanScanner.cjs')
const { openLanWindow, registerLanWindowHandlers, injectSetLanWindowRef } = require('./lanWindow.cjs')
const { registerVxLanHandlers } = require('./wireguard.cjs')
// No silent gameplay telemetry to VoxelX; Minecraft launch is independent.

injectSetLanWindowRef(setLanWindowRef)

const isDev = process.env.NODE_ENV === 'development'

// ── Single instance lock: ngăn mở nhiều instance cùng lúc ─────────────────
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // Khi user mở app lần 2 (double-click, shortcut...), focus lại instance cũ
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      if (!mainWindow.isVisible()) mainWindow.show()
      mainWindow.focus()
    }
  })
}

app.setAppUserModelId('com.voxelxclient.launcher')

function resolveIconPath() {

  const devPath = path.join(__dirname, '../public/icon.ico')
  if (isDev && fs.existsSync(devPath)) return devPath

  const resourcesIcon = path.join(process.resourcesPath, 'icon.ico')
  if (fs.existsSync(resourcesIcon)) return resourcesIcon

  const exeDir = path.dirname(process.execPath)
  const exeIcon = path.join(exeDir, 'resources', 'icon.ico')
  if (fs.existsSync(exeIcon)) return exeIcon

  return devPath
}

function resolveTrayIconPath() {
  const candidates = []
  if (isDev) candidates.push(path.join(__dirname, '../public/icon.png'))
  candidates.push(path.join(process.resourcesPath, 'icon.png'))
  candidates.push(path.join(path.dirname(process.execPath), 'resources', 'icon.png'))
  if (isDev) candidates.push(path.join(__dirname, '../public/icon.png'))
  for (const p of candidates) {
    if (fs.existsSync(p)) return p
  }
  return resolveIconPath()
}

const ICON_PATH     = resolveIconPath()
const TRAY_ICON_PATH = resolveTrayIconPath()
const ACCOUNTS_DIR  = path.join(app.getPath('appData'), '.VoxelXClient')
const ACCOUNTS_FILE = path.join(ACCOUNTS_DIR, 'accounts.json')

const ALLOWED_ORIGINS = isDev
  ? ['http://localhost:5173']
  : ['file://']

const AVATAR_DOMAINS = [
  'https://crafthead.net',
  'https://mc-heads.net',
  'https://minotar.net',
  'https://crafatar.com',
  'https://textures.minecraft.net',
]

function isTrustedOrigin(url) {
  try {
    const u = new URL(url)
    if (!isDev && u.protocol === 'file:') return true
    if (ALLOWED_ORIGINS.some(o => url.startsWith(o))) return true
    return false
  } catch { return false }
}

const USERNAME_RE = /^[a-zA-Z0-9_]{3,16}$/
const MINECRAFT_UUID_RE = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i

function normalizeMinecraftUuid(uuid) {
  return typeof uuid === 'string' && MINECRAFT_UUID_RE.test(uuid) ? uuid.toLowerCase() : null
}

function expectedCyoriaOfflineName(identity) {
  if (typeof identity?.minecraftName === 'string' && USERNAME_RE.test(identity.minecraftName.trim())) return identity.minecraftName.trim()
  const webName = identity?.preferred_username || identity?.name
  return typeof webName === 'string' && USERNAME_RE.test(webName.trim()) ? webName.trim() : null
}

function legacyValidateAccount(account) {
  if (!account || typeof account !== 'object') return 'Invalid data'
  if (!['offline', 'microsoft'].includes(account.type)) return 'Loại tài khoản không hợp lệ'
  if (typeof account.username !== 'string') return 'Username không hợp lệ'
  if (!USERNAME_RE.test(account.username)) return 'Username chỉ được chứa chữ, số và _ (3-16 ký tự)'
  if (typeof account.uuid !== 'string' || !/^[0-9a-f-]{36}$/.test(account.uuid)) return 'UUID không hợp lệ'
  return null
}

function legacySanitizeAccount(account) {
  const base = {
    id:        account.id,
    uuid:      account.uuid,
    type:      account.type,
    username:  account.username,
    createdAt: account.createdAt,
  }
  if (account.type === 'microsoft') {
    base.msRefreshToken = account.msRefreshToken || null
    base.mcToken        = account.mcToken        || null
    base.mcTokenExpiry  = account.mcTokenExpiry  || 0
  }
  return base
}

function legacyValidateId(id) {
  return typeof id === 'string' && /^[0-9a-f-]{36}$/.test(id)
}


function sanitizeAccount(account) {
  const base = {
    id:        account.id,
    uuid:      account.uuid,
    type:      account.type,
    username:  account.username,
    createdAt: account.createdAt,
  }
  if (account.type === 'microsoft') {
    base.msRefreshToken = account.msRefreshToken || null
    base.mcToken        = account.mcToken        || null
    base.mcTokenExpiry  = account.mcTokenExpiry  || 0
  }
  if (typeof account.cyoriaAccountUuid === 'string' && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(account.cyoriaAccountUuid)) {
    base.cyoriaAccountUuid = account.cyoriaAccountUuid
  }
  Object.assign(base, sanitizeDiscordLink(account))
  return base
}

function normalizeDiscordProfile(profile) {
  if (!profile || typeof profile !== 'object') return null

  const discordId = String(
    profile.discordId ??
    profile.id ??
    profile.userId ??
    ''
  ).trim()

  const discordUsername = String(
    profile.discordUsername ??
    profile.username ??
    profile.login ??
    ''
  ).trim()

  const discordGlobalName = String(
    profile.discordGlobalName ??
    profile.globalName ??
    profile.global_name ??
    profile.displayName ??
    ''
  ).trim()

  const discriminatorValue =
    profile.discordDiscriminator ??
    profile.discriminator ??
    profile.tagSuffix ??
    null

  const discordDiscriminator = discriminatorValue == null
    ? null
    : String(discriminatorValue).trim() || null

  const discordAvatarUrl = String(
    profile.discordAvatarUrl ??
    profile.avatarUrl ??
    profile.avatar_url ??
    profile.avatar ??
    ''
  ).trim() || null

  if (!discordId || !discordUsername) return null

  return {
    discordId,
    discordUsername,
    discordGlobalName: discordGlobalName || null,
    discordDiscriminator,
    discordAvatarUrl,
  }
}

function validateId(id) {
  return typeof id === 'string' && /^[0-9a-f-]{36}$/.test(id)
}

function ensureAccountsFile() {
  if (!fs.existsSync(ACCOUNTS_DIR)) fs.mkdirSync(ACCOUNTS_DIR, { recursive: true })
  if (!fs.existsSync(ACCOUNTS_FILE))
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify({ accounts: [], selectedId: null }, null, 2), { mode: 0o600 })
}
function readAccounts() {
  ensureAccountsFile()
  try { return JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf-8')) }
  catch { return { accounts: [], selectedId: null } }
}
function writeAccounts(data) {
  ensureAccountsFile()
  const tmp = ACCOUNTS_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), { mode: 0o600 })
  fs.renameSync(tmp, ACCOUNTS_FILE)
}

const SETTINGS_FILE = path.join(ACCOUNTS_DIR, 'settings.json')

const DEFAULT_SETTINGS = {
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
}

const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS)

function sanitizeSettings(input = {}) {
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

function readSettings() {
  ensureAccountsFile()
  try {
    if (!fs.existsSync(SETTINGS_FILE)) return sanitizeSettings()
    return sanitizeSettings(JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8')))
  } catch { return sanitizeSettings() }
}

function writeSettings(data) {
  ensureAccountsFile()
  const tmp = SETTINGS_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(sanitizeSettings(data), null, 2), { mode: 0o600 })
  fs.renameSync(tmp, SETTINGS_FILE)
}

let mainWindow   = null
let updateWindow = null
let tray         = null

function secureWebPrefs() {
  return {
    preload:                     path.join(__dirname, 'preload.cjs'),
    contextIsolation:            true,
    nodeIntegration:             false,
    nodeIntegrationInWorker:     false,
    nodeIntegrationInSubFrames:  false,

    webSecurity:                 true,
    allowRunningInsecureContent: false,
    experimentalFeatures:        false,
  }
}

function createMainWindow() {
  const icon = fs.existsSync(ICON_PATH) ? nativeImage.createFromPath(ICON_PATH) : undefined

  mainWindow = new BrowserWindow({
    width: 1280, height: 720,
    minWidth: 1024, minHeight: 600,
    frame: false, transparent: false,
    backgroundColor: '#0f0f0f',
    title: 'Cyoria Launcher',
    icon,
    webPreferences: secureWebPrefs(),
  })

  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (!isTrustedOrigin(url)) {
      e.preventDefault()
      shell.openExternal(url)
    }
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isTrustedOrigin(url)) return { action: 'allow' }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (!isDev) {
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) { e.preventDefault(); mainWindow.hide() }
  })
  mainWindow.on('closed', () => { mainWindow = null })
}

function createUpdateWindow() {
  if (updateWindow && !updateWindow.isDestroyed()) { updateWindow.focus(); return }

  const icon = fs.existsSync(ICON_PATH) ? nativeImage.createFromPath(ICON_PATH) : undefined

  updateWindow = new BrowserWindow({
    width: 480, height: 620,
    resizable: false, frame: false,
    backgroundColor: '#0f0f0f',
    title: 'Cyoria Launcher – Check for Updates',
    icon,
    modal:       false,
    skipTaskbar: false,
    webPreferences: secureWebPrefs(),
  })

  updateWindow.webContents.on('will-navigate', (e, url) => {
    if (!isTrustedOrigin(url)) { e.preventDefault(); shell.openExternal(url) }
  })
  updateWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url); return { action: 'deny' }
  })

  if (!isDev) {
    updateWindow.webContents.on('devtools-opened', () => {
      updateWindow.webContents.closeDevTools()
    })
  }

  if (isDev) {
    updateWindow.loadURL('http://localhost:5173/?window=update')
  } else {
    updateWindow.loadFile(path.join(__dirname, '../dist/index.html'), { query: { window: 'update' } })
  }

  updateWindow.on('closed', () => { updateWindow = null })
}

function createTray() {
  try {
    let trayIcon
    if (fs.existsSync(TRAY_ICON_PATH)) {
      trayIcon = nativeImage.createFromPath(TRAY_ICON_PATH).resize({ width: 16, height: 16 })
    } else {

      trayIcon = nativeImage.createEmpty()
    }

    if (trayIcon.isEmpty()) {
      console.error('[Tray] Icon rỗng — bỏ qua tạo tray (kiểm tra icon.png trong resources)')
    }

    tray = new Tray(trayIcon)
    tray.setToolTip('Cyoria Launcher')
    tray.setTitle('Cyoria Launcher')

    const openMainWindow = () => {
      if (!mainWindow || mainWindow.isDestroyed()) {
        createMainWindow()
        return
      }
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }

    const menuIcon = fs.existsSync(TRAY_ICON_PATH)
      ? nativeImage.createFromPath(TRAY_ICON_PATH).resize({ width: 16, height: 16 })
      : undefined

    const trayMenu = Menu.buildFromTemplate([
      {
        label: 'Cyoria Launcher', enabled: false,
        ...(menuIcon ? { icon: menuIcon } : {}),
      },
      { type: 'separator' },
      {
        label: 'Open Cyoria Launcher',
        click: () => openMainWindow(),
      },
      {
        label: 'Kiểm tra cập nhật...',
        click: () => { createUpdateWindow() },
      },
      {
        label: 'P2P LAN (F10)',
        click: () => { openLanWindow({ motd: null, port: null, tunnelAddr: null }) },
      },
      { type: 'separator' },
      {
        label: 'Thoát',
        click: () => { app.isQuitting = true; app.quit() },
      },
    ])

    // BẮT BUỘC cho Linux: AppIndicator/StatusNotifier chỉ hiển thị qua
    // context menu này; các sự kiện click/right-click không hoạt động trên Linux.
    tray.setContextMenu(trayMenu)

    // Windows/macOS: click trái mở app (Linux bỏ qua, dùng menu).
    tray.on('click', () => {
      openMainWindow()
    })

    tray.on('double-click', () => {
      openMainWindow()
    })
  } catch (err) {
    console.error('[Tray] Failed to create tray:', err.message)
  }
}

app.whenReady().then(() => {

  try {
    const os = require('os')
    const updateDir = path.join(os.tmpdir(), 'VoxelXLauncher-update')
    if (fs.existsSync(updateDir)) {
      const files = fs.readdirSync(updateDir)
      for (const f of files) {
        if (f.endsWith('.exe') || f.endsWith('.AppImage') || f.endsWith('.deb')) {
          try { fs.unlinkSync(path.join(updateDir, f)) } catch {}
        }
      }
    }
  } catch {}
  const { session } = require('electron')
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const url = details.url || ''
    if (
      url.includes('login.live.com') ||
      url.includes('login.microsoftonline.com') ||
      url.includes('microsoft.com') ||
      url.includes('xbox.com') ||
      url.includes('youtube.com') ||
      url.includes('youtube-nocookie.com') ||
      url.includes('googlevideo.com') ||
      url.includes('ytimg.com')
    ) {
      return callback({ responseHeaders: details.responseHeaders })
    }

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' http://localhost:5173 ws://localhost:5173;" +
          "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob: http://localhost:5173;" +
          "worker-src 'self' blob:;" +
          "font-src 'self' data:;" +
          "img-src 'self' data: blob: https:;" +
          "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://youtube-nocookie.com https://youtube.com;" +
          "connect-src 'self' blob: http://localhost:5173 ws://localhost:5173 https://minotar.net https://crafthead.net https://mc-heads.net https://meta.fabricmc.net https://maven.fabricmc.net https://api.modrinth.com https://cdn.modrinth.com https://maven.minecraftforge.net https://files.minecraftforge.net https://repo1.maven.org https://maven.neoforged.net https://api.github.com https://github.com https://raw.githubusercontent.com;"
        ],
      },
    })
  })

  createMainWindow()
  createTray()

  // ── F10: toggle cửa sổ VoxelX P2P LAN ────────────────────────────────────
  const { globalShortcut } = require('electron')

  function registerLanShortcut() {
    const success = globalShortcut.register('F10', () => {
      openLanWindow({ motd: null, port: null, tunnelAddr: null })
    })
    if (!success) {
      console.warn('[Shortcut] F10 đăng ký thất bại, thử lại sau 2s...')
      setTimeout(() => {
        try { globalShortcut.unregister('F10') } catch {}
        const retry = globalShortcut.register('F10', () => {
          openLanWindow({ motd: null, port: null, tunnelAddr: null })
        })
        if (!retry) console.warn('[Shortcut] F10 vẫn không đăng ký được')
      }, 2000)
    }
  }
  registerLanShortcut()

  // Mở LAN window qua IPC (backup khi F10 không hoạt động)
  ipcMain.handle('lan:openWindow', (e) => {
    if (!getTrustedWindow(e)) return { error: 'Unauthorized' }
    openLanWindow({ motd: null, port: null, tunnelAddr: null })
    return { ok: true }
  })

  app.on('will-quit', () => {
    globalShortcut.unregisterAll()
  })
  const initSettings = readSettings()
  if (initSettings.discordRPC) rpc.connect()

  // Legacy VoxelX heartbeat is disabled: no unsolicited account / activity uploads.

  app.on('activate', () => {
    if (!mainWindow) createMainWindow(); else mainWindow.show()
  })
})

app.on('window-all-closed', () => {  })
app.on('before-quit', () => { app.isQuitting = true })

function getTrustedWindow(event) {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) return null
  const url = event.sender.getURL()
  if (!isTrustedOrigin(url)) return null
  return win
}

ipcMain.on('window-minimize', (e) => getTrustedWindow(e)?.minimize())
ipcMain.on('window-maximize', (e) => {
  const win = getTrustedWindow(e)
  if (!win) return
  win.isMaximized() ? win.unmaximize() : win.maximize()
})
ipcMain.on('window-close', (e) => {
  const win = getTrustedWindow(e)
  if (!win) return
  if (win === updateWindow) win.close()
  else win.hide()
})

const GITHUB_REPO = 'CyoriaSMP-Team/CyoriaLauncher-Desktop'

ipcMain.handle('updater:openUpdateWindow', (e, checkResult) => {
  if (!getTrustedWindow(e)) return { error: 'Unauthorized' }

  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.hide()

  createUpdateWindow()

  const payload = checkResult ? { ...checkResult, autoDownload: true } : checkResult

  if (updateWindow && !updateWindow.isDestroyed()) {
    updateWindow.webContents.once('did-finish-load', () => {
      if (!updateWindow.isDestroyed()) {
        updateWindow.webContents.send('updater:preloadResult', payload)
      }
    })

    if (updateWindow.webContents.getURL() !== '') {
      setTimeout(() => {
        if (updateWindow && !updateWindow.isDestroyed()) {
          updateWindow.webContents.send('updater:preloadResult', payload)
        }
      }, 300)
    }
  }
  return { ok: true }
})

ipcMain.handle('updater:check', async (e) => {
  if (!getTrustedWindow(e)) return { error: 'Unauthorized' }

  const currentVersion = app.getVersion()

  try {
    const https = require('https')

    const data = await new Promise((resolve, reject) => {
      const req = https.get(
        `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
        {
          headers: {
            'User-Agent': 'VoxelXLauncher/' + currentVersion,
            'Accept': 'application/vnd.github+json',
          },
          timeout: 8000,
        },
        (res) => {
          let body = ''
          res.on('data', c => { body += c })
          res.on('end', () => {

            if (res.statusCode === 404) {
              resolve(null)
              return
            }
            if (res.statusCode !== 200) {
              reject(new Error(`GitHub API returned HTTP ${res.statusCode}`))
              return
            }
            try { resolve(JSON.parse(body)) }
            catch { reject(new Error('Invalid JSON from GitHub API')) }
          })
        }
      )
      req.on('error', reject)
      req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')) })
    })

    if (!data) {
      return {
        hasUpdate:      false,
        currentVersion,
        latestVersion:  currentVersion,
        message:        'Chưa có bản phát hành nào trên GitHub.',
        releaseUrl:     `https://github.com/${GITHUB_REPO}/releases`,
        noRelease:      true,
      }
    }

    const latestVersion = (data.tag_name || '').replace(/^v/, '')
    const hasUpdate = latestVersion && latestVersion !== currentVersion
      && compareVersions(latestVersion, currentVersion) > 0

    const assets = (data.assets || []).map(a => ({
      name:        a.name,
      downloadUrl: a.browser_download_url,
      size:        a.size,
    }))

    let installerAsset = null
    if (process.platform === 'win32') {

      const exePath = process.execPath || ''
      const isInstalled = /program files/i.test(exePath) || /appdata/i.test(exePath)
      if (isInstalled) {

        installerAsset = assets.find(a => /setup/i.test(a.name) && /\.exe$/i.test(a.name))
      }

    } else if (process.platform === 'darwin') {
      installerAsset = assets.find(a => /\.dmg$/i.test(a.name))
    } else {
      installerAsset = assets.find(a => /\.AppImage$/i.test(a.name))
        || assets.find(a => /\.deb$/i.test(a.name))
    }

    return {
      hasUpdate,
      currentVersion,
      latestVersion:  latestVersion || currentVersion,
      releaseName:    data.name || latestVersion,
      releaseNotes:   data.body || '',
      releaseUrl:     data.html_url || `https://github.com/${GITHUB_REPO}/releases`,
      publishedAt:    data.published_at || null,
      installerAsset,
      assets,
      message: hasUpdate
        ? `Phiên bản mới ${latestVersion} đã có sẵn!`
        : 'Bạn đang dùng phiên bản mới nhất.',
    }
  } catch (err) {
    return {
      error:          true,
      currentVersion,
      message:        `Không thể kiểm tra cập nhật: ${err.message}`,
    }
  }
})

ipcMain.handle('updater:download', async (e, { downloadUrl, fileName }) => {
  if (!getTrustedWindow(e)) return { error: 'Unauthorized' }
  if (typeof downloadUrl !== 'string' || !downloadUrl.startsWith('https://')) {
    return { error: 'Invalid download URL' }
  }

  const win = getTrustedWindow(e)
  const https = require('https')
  const os    = require('os')
  const tmpDir  = path.join(os.tmpdir(), 'VoxelXLauncher-update')
  const tmpFile = path.join(tmpDir, fileName || 'VoxelXLauncher-update.exe')

  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

  if (fs.existsSync(tmpFile)) {
    const stat = fs.statSync(tmpFile)
    if (stat.size > 1024 * 1024) {
      if (!win.isDestroyed()) {
        win.webContents.send('updater:downloadProgress', { downloaded: stat.size, total: stat.size, percent: 100, speed: 0 })
      }
      return { ok: true, filePath: tmpFile, cached: true }
    }

    try { fs.unlinkSync(tmpFile) } catch {}
  }

  try {
    await new Promise((resolve, reject) => {
      function doGet(url) {
        https.get(url, { headers: { 'User-Agent': 'VoxelXLauncher/' + app.getVersion() } }, (res) => {

          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return doGet(res.headers.location)
          }
          if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`))

          const total = parseInt(res.headers['content-length'] || '0', 10)
          let downloaded = 0
          const startTime = Date.now()
          const out = fs.createWriteStream(tmpFile)

          res.on('data', chunk => {
            downloaded += chunk.length
            const elapsed = (Date.now() - startTime) / 1000
            const speed   = elapsed > 0 ? Math.round(downloaded / elapsed) : 0
            const percent = total > 0 ? Math.round(downloaded / total * 100) : 0
            if (!win.isDestroyed()) {
              win.webContents.send('updater:downloadProgress', { downloaded, total, percent, speed })
            }
          })
          res.pipe(out)
          out.on('finish', resolve)
          out.on('error', reject)
          res.on('error', reject)
        }).on('error', reject)
      }
      doGet(downloadUrl)
    })

    return { ok: true, filePath: tmpFile }
  } catch (err) {

    try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile) } catch {}
    return { error: err.message }
  }
})

ipcMain.handle('updater:install', async (e, { filePath }) => {
  if (!getTrustedWindow(e)) return { error: 'Unauthorized' }
  if (typeof filePath !== 'string') return { error: 'Invalid file path' }
  if (!fs.existsSync(filePath)) return { error: 'Installer file not found' }

  const os = require('os')
  const tmpDir = path.join(os.tmpdir(), 'VoxelXLauncher-update')
  if (!filePath.startsWith(tmpDir)) return { error: 'Invalid installer path' }

  try {
    const { spawn } = require('child_process')

    await new Promise(r => setTimeout(r, 1500))

    if (process.platform === 'win32') {
      spawn(filePath, ['/SILENT'], {
        detached: true,
        stdio:    'ignore',
      }).unref()
    } else if (process.platform === 'darwin') {
      spawn('open', [filePath], { detached: true, stdio: 'ignore' }).unref()
    } else {
      // On Linux, AppImageLauncher intercepts AppImage execution and tries to
      // move the file to ~/Applications/. This fails when the AppImage is in /tmp
      // because /tmp is often on a different filesystem (tmpfs → ext4/btrfs),
      // causing a cross-device rename error. Fix: copy to the user's home dir first.
      let runPath = filePath
      try {
        const homeDir   = require('os').homedir()
        const destPath  = path.join(homeDir, path.basename(filePath))
        fs.copyFileSync(filePath, destPath)
        fs.chmodSync(destPath, 0o755)
        runPath = destPath
      } catch {
        // fallback: run from /tmp directly
        fs.chmodSync(filePath, 0o755)
      }
      // Set env to skip AppImageLauncher integration for this run
      const env = { ...process.env, APPIMAGELAUNCHER_DISABLE: '1', NO_CLEANUP: '1' }
      spawn(runPath, [], { detached: true, stdio: 'ignore', env }).unref()
    }

    setTimeout(() => {
      try { fs.unlinkSync(filePath) } catch {}
      app.isQuitting = true
      app.quit()
    }, 500)
    return { ok: true }
  } catch (err) {
    return { error: err.message }
  }
})

ipcMain.handle('updater:reinstall', async (e) => {
  if (!getTrustedWindow(e)) return { error: 'Unauthorized' }

  const win = getTrustedWindow(e)
  const currentVersion = app.getVersion()
  const https = require('https')
  const os    = require('os')

  try {
    const release =
      await fetchGitHubReleaseByTag(GITHUB_REPO, `v${currentVersion}`, currentVersion) ||
      await fetchGitHubReleaseByTag(GITHUB_REPO, currentVersion, currentVersion)

    if (!release) {
      return { error: `Không tìm thấy release v${currentVersion} trên GitHub.` }
    }

    const assets = (release.assets || [])
    let installerAsset = null
    if (process.platform === 'win32') {
      const exePath = process.execPath || ''
      const isInstalled = /program files/i.test(exePath) || /appdata/i.test(exePath)
      if (isInstalled) {
        installerAsset = assets.find(a => /setup/i.test(a.name) && /\.exe$/i.test(a.name))
      }
      if (!installerAsset) {
        installerAsset = assets.find(a => /\.exe$/i.test(a.name))
      }
    } else if (process.platform === 'darwin') {
      installerAsset = assets.find(a => /\.dmg$/i.test(a.name))
    } else {
      installerAsset = assets.find(a => /\.AppImage$/i.test(a.name)) ||
                       assets.find(a => /\.deb$/i.test(a.name))
    }

    if (!installerAsset) {
      return { error: 'Không tìm thấy file installer cho hệ điều hành này.' }
    }

    const tmpDir  = path.join(os.tmpdir(), 'VoxelXLauncher-update')
    const tmpFile = path.join(tmpDir, installerAsset.name)
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile) } catch {}

    await new Promise((resolve, reject) => {
      function doGet(url) {
        https.get(url, { headers: { 'User-Agent': 'VoxelXLauncher/' + currentVersion } }, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return doGet(res.headers.location)
          }
          if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`))

          const total = parseInt(res.headers['content-length'] || '0', 10)
          let downloaded = 0
          const startTime = Date.now()
          const out = fs.createWriteStream(tmpFile)

          res.on('data', chunk => {
            downloaded += chunk.length
            const elapsed = (Date.now() - startTime) / 1000
            const speed   = elapsed > 0 ? Math.round(downloaded / elapsed) : 0
            const percent = total > 0 ? Math.round(downloaded / total * 100) : 0
            if (!win.isDestroyed()) {
              win.webContents.send('updater:reinstallProgress', { downloaded, total, percent, speed })
            }
          })
          res.pipe(out)
          out.on('finish', resolve)
          out.on('error', reject)
          res.on('error', reject)
        }).on('error', reject)
      }
      doGet(installerAsset.browser_download_url)
    })

    const { spawn } = require('child_process')
    await new Promise(r => setTimeout(r, 800))

    if (process.platform === 'win32') {
      spawn(tmpFile, ['/SILENT'], { detached: true, stdio: 'ignore' }).unref()
    } else if (process.platform === 'darwin') {
      spawn('open', [tmpFile], { detached: true, stdio: 'ignore' }).unref()
    } else {
      let runPath = tmpFile
      try {
        const homeDir  = require('os').homedir()
        const destPath = path.join(homeDir, path.basename(tmpFile))
        fs.copyFileSync(tmpFile, destPath)
        fs.chmodSync(destPath, 0o755)
        runPath = destPath
      } catch {
        fs.chmodSync(tmpFile, 0o755)
      }
      const env = { ...process.env, APPIMAGELAUNCHER_DISABLE: '1', NO_CLEANUP: '1' }
      spawn(runPath, [], { detached: true, stdio: 'ignore', env }).unref()
    }

    setTimeout(() => {
      try { fs.unlinkSync(tmpFile) } catch {}
      app.isQuitting = true
      app.quit()
    }, 500)

    return { ok: true }
  } catch (err) {
    return { error: err.message }
  }
})

function compareVersions(a, b) {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0
    const nb = pb[i] ?? 0
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}

function fetchGitHubReleaseByTag(repo, tag, currentVersion) {
  const https = require('https')
  return new Promise((resolve, reject) => {
    const req = https.get(
      `https://api.github.com/repos/${repo}/releases/tags/${encodeURIComponent(tag)}`,
      {
        headers: {
          'User-Agent': 'VoxelXLauncher/' + currentVersion,
          'Accept': 'application/vnd.github+json',
        },
        timeout: 8000,
      },
      (res) => {
        let body = ''
        res.on('data', c => { body += c })
        res.on('end', () => {
          if (res.statusCode === 404) {
            resolve(null)
            return
          }
          if (res.statusCode !== 200) {
            reject(new Error(`GitHub API returned HTTP ${res.statusCode}`))
            return
          }
          try { resolve(JSON.parse(body)) }
          catch { reject(new Error('Invalid JSON from GitHub API')) }
        })
      }
    )
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')) })
  })
}

ipcMain.handle('patchnotes:getCurrentVersion', async (e) => {
  if (!getTrustedWindow(e)) return { error: 'Unauthorized' }

  const currentVersion = app.getVersion()

  try {
    const release =
      await fetchGitHubReleaseByTag(GITHUB_REPO, `v${currentVersion}`, currentVersion) ||
      await fetchGitHubReleaseByTag(GITHUB_REPO, currentVersion, currentVersion)

    if (!release) {
      return {
        ok: false,
        currentVersion,
        message: 'Không tìm thấy patch note cho phiên bản hiện tại.',
      }
    }

    return {
      ok: true,
      currentVersion,
      version: (release.tag_name || currentVersion).replace(/^v/, ''),
      title: release.name || `VoxelXLauncher ${currentVersion}`,
      body: release.body || '',
      htmlUrl: release.html_url || `https://github.com/${GITHUB_REPO}/releases`,
      publishedAt: release.published_at || null,
    }
  } catch (err) {
    return {
      ok: false,
      currentVersion,
      message: `Không thể tải patch note: ${err.message}`,
    }
  }
})

ipcMain.handle('app:version', (e) => {
  if (!getTrustedWindow(e)) return null
  return app.getVersion()
})

ipcMain.handle('app:hwid', (e) => {
  if (!getTrustedWindow(e)) return null
  return { hwid: getHwid(), hwidFormatted: getHwidFormatted() }
})

ipcMain.handle('accounts:get', (e) => {
  if (!getTrustedWindow(e)) return { accounts: [], selectedId: null }
  return readAccounts()
})

ipcMain.handle('accounts:add', (e, account) => {
  if (!getTrustedWindow(e)) return { error: 'Unauthorized' }

  const requestedCyoriaUuid = account && Object.hasOwn(account, 'cyoriaAccountUuid')
    ? account.cyoriaAccountUuid
    : undefined
  const checked = validateNewOfflineAccount(account)
  if (checked.error) return { error: checked.error }
  account = checked.account

  if (requestedCyoriaUuid !== undefined) {
    const identity = cyoriaWebIdentity.status().identity
    const expectedName = expectedCyoriaOfflineName(identity)
    if (!identity || requestedCyoriaUuid !== identity.sub || identity.minecraftPremium !== false
      || !expectedName || account.username.toLowerCase() !== expectedName.toLowerCase()) {
      return { error: 'This Offline profile does not match the verified Cyoria account' }
    }
    account.cyoriaAccountUuid = identity.sub
  }

  const data = readAccounts()
  const exists = data.accounts.find(a => {
    if (account.type === 'discord' && a.type === 'discord') {
      return a.discordId === account.discordId || a.username === account.username
    }
    return a.username === account.username && a.type === account.type
  })
  if (exists) return { error: 'Account already exists' }

  if (account.type === 'discord' && account.discordId) {
    const discordLinked = data.accounts.find(a => a.discordId === account.discordId)
    if (discordLinked) {
      return {
        error: `This Discord account is already linked to account "${discordLinked.username}". Please use another Discord account.`,
      }
    }
  }

  const safe = sanitizeAccount(account)
  data.accounts.push(safe)
  if (!data.selectedId) data.selectedId = safe.id
  writeAccounts(data)
  return { ok: true, data }
})

ipcMain.handle('accounts:remove', (e, id) => {
  if (!getTrustedWindow(e)) return { error: 'Unauthorized' }
  if (!validateId(id)) return { error: 'Invalid account ID' }

  const data = readAccounts()
  data.accounts = data.accounts.filter(a => a.id !== id)
  if (data.selectedId === id) data.selectedId = data.accounts[0]?.id ?? null
  writeAccounts(data)
  return { ok: true, data }
})

ipcMain.handle('accounts:select', (e, id) => {
  if (!getTrustedWindow(e)) return { error: 'Unauthorized' }
  if (!validateId(id)) return { error: 'Invalid account ID' }

  const data = readAccounts()
  if (!data.accounts.find(a => a.id === id)) return { error: 'Account not found' }
  data.selectedId = id
  writeAccounts(data)
  return { ok: true, data }
})

ipcMain.handle('accounts:update', (e, { id, patch }) => {
  if (!getTrustedWindow(e)) return { error: 'Unauthorized' }
  if (!validateId(id)) return { error: 'Invalid account ID' }
  if (!patch || typeof patch !== 'object') return { error: 'Invalid data' }

  const data = readAccounts()
  const idx = data.accounts.findIndex(a => a.id === id)
  if (idx === -1) return { error: 'Account not found' }
  const safePatch = {}
  if (Object.hasOwn(patch, 'cyoriaAccountUuid')) {
    const identity = cyoriaWebIdentity.status().identity
    const account = data.accounts[idx]
    if (!identity || patch.cyoriaAccountUuid !== identity.sub) return { error: 'Cyoria account link requires a verified website sign-in' }
    if (identity.minecraftPremium === true) {
      if (account.type !== 'microsoft' || normalizeMinecraftUuid(account.uuid) !== normalizeMinecraftUuid(identity.minecraftUuid)) {
        return { error: 'This Microsoft account does not match the verified Cyoria Minecraft UUID' }
      }
    } else if (identity.minecraftPremium === false) {
      const expectedName = expectedCyoriaOfflineName(identity)
      if (account.type !== 'offline' || !expectedName || account.username.toLowerCase() !== expectedName.toLowerCase()) {
        return { error: 'This Offline profile does not match the linked Cyoria account name' }
      }
    } else {
      return { error: 'Cyoria Minecraft verification status is unavailable' }
    }
    safePatch.cyoriaAccountUuid = identity.sub
  }
  if (Object.hasOwn(patch, 'discordId')) {
    const result = verifiedDiscordPatch(patch, cyoriaIdentity.status().identity)
    if (result.error) return { error: result.error }
    Object.assign(safePatch, result.patch)
  }
  if (Object.keys(safePatch).length === 0) return { error: 'No supported account changes were provided' }
  if (safePatch.discordId) {
    const alreadyLinked = data.accounts.find(a => a.id !== id && a.discordId === safePatch.discordId)
    if (alreadyLinked) return {error:`This Discord account is already linked to account "${alreadyLinked.username}"`}
  }

  data.accounts[idx] = { ...data.accounts[idx], ...safePatch }
  writeAccounts(data)
  return { ok: true, data }
})

let msLoginGeneration = 0
ipcMain.handle('ms:startLogin', async (e, options = {}) => {
  const win = getTrustedWindow(e)
  if (!win) return { error: 'Unauthorized' }
  const expectedUsername = typeof options?.expectedUsername === 'string' ? options.expectedUsername.trim() : null
  const expectedUuid = typeof options?.expectedUuid === 'string' ? normalizeMinecraftUuid(options.expectedUuid) : null
  if (expectedUsername && !USERNAME_RE.test(expectedUsername)) return { error: 'Invalid expected Minecraft name' }
  if (options?.expectedUuid && !expectedUuid) return { error: 'Invalid expected Minecraft UUID' }

  const currentGeneration = ++msLoginGeneration
  try {
    const result = await loginWithWindow(win)
    if (currentGeneration !== msLoginGeneration) return { error: 'Microsoft sign-in was cancelled' }
    if (expectedUuid && normalizeMinecraftUuid(result.uuid) !== expectedUuid) {
      return { error: 'MICROSOFT_ACCOUNT_UUID_MISMATCH' }
    }
    if (!expectedUuid && expectedUsername && result.username.toLowerCase() !== expectedUsername.toLowerCase()) {
      return { error: 'MICROSOFT_ACCOUNT_MISMATCH' }
    }
    const data = readAccounts()
    const exists = data.accounts.find(a => a.uuid === result.uuid)
    if (exists) {
      const idx = data.accounts.indexOf(exists)
      data.accounts[idx] = sanitizeAccount({
        ...exists,
        username:       result.username,
        msRefreshToken: result.msRefreshToken,
        mcToken:        result.mcToken,
        mcTokenExpiry:  result.mcTokenExpiry,
      })
      writeAccounts(data)
      return { ok: true, updated: true, account: data.accounts[idx], data }
    }

    const id  = require('crypto').randomUUID()
    const now = new Date().toISOString()
    const account = sanitizeAccount({
      id,
      uuid:           result.uuid,
      type:           'microsoft',
      username:       result.username,
      createdAt:      now,
      msRefreshToken: result.msRefreshToken,
      mcToken:        result.mcToken,
      mcTokenExpiry:  result.mcTokenExpiry,
    })
    data.accounts.push(account)
    if (!data.selectedId) data.selectedId = id
    writeAccounts(data)
    return { ok: true, account, data }

  } catch (err) {
    return { error: err.message }
  }
})

ipcMain.handle('ms:cancelLogin', (e) => {
  if (!getTrustedWindow(e)) return { error: 'Unauthorized' }
  msLoginGeneration++
  return { ok: true, cancelled: cancelLogin() }
})

ipcMain.handle('ms:refreshToken', async (e, id) => {
  if (!getTrustedWindow(e)) return { error: 'Unauthorized' }
  if (!validateId(id)) return { error: 'Invalid account ID' }

  const data = readAccounts()
  const account = data.accounts.find(a => a.id === id)
  if (!account) return { error: 'Account not found' }
  if (account.type !== 'microsoft') return { error: 'Selected account is not a Microsoft account' }
  if (!account.msRefreshToken) return { error: 'Microsoft refresh token is missing' }
  const fiveMin = 5 * 60 * 1000
  if (account.mcTokenExpiry && account.mcTokenExpiry - Date.now() > fiveMin) {
    return { ok: true, skipped: true, mcToken: account.mcToken }
  }

  try {
    const result = await refreshMinecraftToken(account.msRefreshToken)
    const idx = data.accounts.indexOf(account)
    data.accounts[idx] = sanitizeAccount({
      ...account,
      username:       result.username,
      msRefreshToken: result.msRefreshToken,
      mcToken:        result.mcToken,
      mcTokenExpiry:  result.mcTokenExpiry,
    })
    writeAccounts(data)
    return { ok: true, mcToken: result.mcToken, account: data.accounts[idx] }
  } catch (err) {
    return { error: err.message }
  }
})

// Cyoria account is an OPTIONAL launcher identity, separate from Microsoft Minecraft auth.
ipcMain.handle('cyoria:identityStatus', (event) => {
  if (!getTrustedWindow(event)) return { error: 'Unauthorized' }
  return cyoriaWebIdentity.status()
})
ipcMain.handle('cyoria:identityLogin', async (event) => {
  if (!getTrustedWindow(event)) return { error: 'Unauthorized' }
  try { return await cyoriaWebIdentity.login() } catch (err) { return { error: err.message } }
})
ipcMain.handle('cyoria:identityLogout', (event) => {
  if (!getTrustedWindow(event)) return { error: 'Unauthorized' }
  return cyoriaWebIdentity.logout()
})

ipcMain.handle('shell:openExternal', (e, url) => {
  if (!getTrustedWindow(e)) return { error: 'Unauthorized' }
  try {
    const u = new URL(url)
    if (u.protocol !== 'https:') return { error: 'Chỉ cho phép HTTPS' }
    shell.openExternal(url)
    return { ok: true }
  } catch { return { error: 'URL không hợp lệ' } }
})

registerProfileHandlers(getTrustedWindow)
registerGroupHandlers(getTrustedWindow)
registerProfileContentHandlers(getTrustedWindow)
registerJavaDistroHandlers(getTrustedWindow)
registerServerHandlers(getTrustedWindow)
registerLauncherHandlers(getTrustedWindow)
registerLanHandlers(getTrustedWindow, openLanWindow)
registerLanWindowHandlers(getTrustedWindow)
registerVxLanHandlers(getTrustedWindow)

ipcMain.handle('fabric:getLoaderVersions', async (e, gameVersion) => {
  if (!getTrustedWindow(e)) return { error: 'Unauthorized' }
  if (typeof gameVersion !== 'string' || !/^[a-zA-Z0-9._+\-]+$/.test(gameVersion)) {
    return { error: 'Invalid game version' }
  }
  try {
    const https = require('https')
    const url = `https://meta.fabricmc.net/v2/versions/loader/${encodeURIComponent(gameVersion)}`
    const data = await new Promise((resolve, reject) => {
      https.get(url, { headers: { 'User-Agent': 'VoxelXLauncher/1.0' } }, (res) => {
        let body = ''
        res.on('data', chunk => { body += chunk })
        res.on('end', () => {
          if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`))
          try { resolve(JSON.parse(body)) } catch { reject(new Error('Invalid JSON')) }
        })
      }).on('error', reject)
    })
    return { ok: true, data: data.map(item => ({ version: item.loader.version, stable: item.loader.stable })) }
  } catch (err) {
    return { error: err.message }
  }
})

ipcMain.handle('forge:getVersions', async (e, gameVersion) => {
  if (!getTrustedWindow(e)) return { error: 'Unauthorized' }
  if (typeof gameVersion !== 'string') return { error: 'Invalid game version' }
  try {
    const https = require('https')
    const url = `https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json`
    const data = await new Promise((resolve, reject) => {
      https.get(url, { headers: { 'User-Agent': 'VoxelXLauncher/1.0' } }, (res) => {
        let body = ''
        res.on('data', c => { body += c })
        res.on('end', () => {
          if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`))
          try { resolve(JSON.parse(body)) } catch { reject(new Error('Invalid JSON')) }
        })
      }).on('error', reject)
    })
    const promos = data.promos || {}
    const recommended = promos[`${gameVersion}-recommended`] || null
    const latest      = promos[`${gameVersion}-latest`]      || null
    // Collect all forge versions for this MC version
    const versions = Object.entries(promos)
      .filter(([k]) => k.startsWith(gameVersion + '-'))
      .map(([, v]) => `${gameVersion}-${v}`)
      .filter((v, i, a) => a.indexOf(v) === i) // dedupe
    return { ok: true, data: { versions, recommended: recommended ? `${gameVersion}-${recommended}` : null, latest: latest ? `${gameVersion}-${latest}` : null } }
  } catch (err) {
    return { error: err.message }
  }
})

ipcMain.handle('neoforge:getVersions', async (e, gameVersion) => {
  if (!getTrustedWindow(e)) return { error: 'Unauthorized' }
  if (typeof gameVersion !== 'string') return { error: 'Invalid game version' }
  try {
    const https = require('https')
    const url = `https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml`
    const xml = await new Promise((resolve, reject) => {
      https.get(url, { headers: { 'User-Agent': 'VoxelXLauncher/1.0' } }, (res) => {
        let body = ''
        res.on('data', c => { body += c })
        res.on('end', () => {
          if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`))
          resolve(body)
        })
      }).on('error', reject)
    })
    const matches = xml.match(/<version>([^<]+)<\/version>/g) || []
    // NeoForge version format: "21.1.x" → MC "1.21.1", "26.0.x" → MC "26"
    const mcKey = gameVersion.startsWith('1.')
      ? gameVersion.replace(/^1\./, '')   // "1.21.1" → "21.1"
      : gameVersion                        // "26" → "26"
    const allVersions = matches
      .map(m => m.replace(/<\/?version>/g, '').trim())
      .filter(v => v.startsWith(mcKey + '.'))
      .reverse()
      .slice(0, 30)
    const latest = allVersions[0] || null
    return { ok: true, data: { versions: allVersions, latest, recommended: null } }
  } catch (err) {
    return { error: err.message }
  }
})

ipcMain.handle('minecraft:listVersions', async (e) => {
  if (!getTrustedWindow(e)) return { error: 'Unauthorized' }
  try {
    const { listVersions } = require('./launcher/vanilla/versionResolver.cjs')
    const versions = await listVersions()
    return { ok: true, data: versions }
  } catch (err) {
    return { error: err.message }
  }
})

ipcMain.handle('modpack:browse', async (e) => {
  const win = getTrustedWindow(e)
  if (!win) return { error: 'Unauthorized' }

  const { dialog } = require('electron')
  const result = await dialog.showOpenDialog(win, {
    title:       'Chọn file modpack',    buttonLabel: 'Chọn',
    filters: [
      { name: 'Modpack', extensions: ['zip', 'mrpack'] },
      { name: 'All Files', extensions: ['*'] },
    ],
    properties: ['openFile'],
  })

  if (result.canceled || !result.filePaths.length) return { canceled: true }
  const filePath = result.filePaths[0]
  const name = require('path').basename(filePath)
  return { ok: true, filePath, name }
})

ipcMain.handle('modpack:readMeta', async (e, filePath) => {
  if (!getTrustedWindow(e)) return { error: 'Unauthorized' }
  if (typeof filePath !== 'string') return { error: 'Invalid path' }

  const fs   = require('fs')
  const path = require('path')
  const zlib = require('zlib')

  if (!fs.existsSync(filePath)) return { error: 'File không tồn tại' }

  try {
    const buf = fs.readFileSync(filePath)
    function readZipEntry(name) {
      let eocdOffset = -1
      for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65558); i--) {
        if (buf.readUInt32LE(i) === 0x06054b50) { eocdOffset = i; break }
      }
      if (eocdOffset < 0) return null
      const cdOffset = buf.readUInt32LE(eocdOffset + 16)
      const cdCount  = buf.readUInt16LE(eocdOffset + 10)
      let pos = cdOffset
      for (let i = 0; i < cdCount; i++) {
        if (buf.readUInt32LE(pos) !== 0x02014b50) break
        const compMethod  = buf.readUInt16LE(pos + 10)
        const compSize    = buf.readUInt32LE(pos + 20)
        const fnLen       = buf.readUInt16LE(pos + 28)
        const extraLen    = buf.readUInt16LE(pos + 30)
        const commentLen  = buf.readUInt16LE(pos + 32)
        const localOffset = buf.readUInt32LE(pos + 42)
        const fileName    = buf.slice(pos + 46, pos + 46 + fnLen).toString('utf8')
        if (fileName === name) {
          const lfnLen  = buf.readUInt16LE(localOffset + 26)
          const lexLen  = buf.readUInt16LE(localOffset + 28)
          const dataOff = localOffset + 30 + lfnLen + lexLen
          const comp    = buf.slice(dataOff, dataOff + compSize)
          if (compMethod === 0) return comp
          if (compMethod === 8) return zlib.inflateRawSync(comp)
          return null
        }
        pos += 46 + fnLen + extraLen + commentLen
      }
      return null
    }

    const baseName = path.basename(filePath).replace(/\.(zip|mrpack)$/i, '')
    let name = baseName, gameVersion = '', loader = '', loaderVersion = ''
    let iconBase64 = null
    let iconUrl    = null

    const manifestData = readZipEntry('manifest.json')
    if (manifestData) {
      const manifest = JSON.parse(manifestData.toString('utf8'))
      name        = manifest.name || baseName
      gameVersion = manifest.minecraft?.version || ''
      const loaderRaw = (manifest.minecraft?.modLoaders || [])[0]?.id || ''
      if (loaderRaw.startsWith('neoforge-'))    { loader = 'neoforge'; loaderVersion = loaderRaw.replace('neoforge-', '') }
      else if (loaderRaw.startsWith('forge-'))  { loader = 'forge';    loaderVersion = loaderRaw.replace('forge-', '') }
      else if (loaderRaw.startsWith('fabric-')) { loader = 'fabric';   loaderVersion = loaderRaw.replace('fabric-', '') }
      else { loader = 'forge'; loaderVersion = loaderRaw }
      if (manifest.image) iconUrl = manifest.image    }

    const mrData = readZipEntry('modrinth.index.json')
    if (mrData) {
      const mr = JSON.parse(mrData.toString('utf8'))
      name        = mr.name || baseName
      gameVersion = mr.dependencies?.minecraft || ''
      if (mr.dependencies?.['fabric-loader'])   { loader = 'fabric';   loaderVersion = mr.dependencies['fabric-loader'] }
      else if (mr.dependencies?.['neoforge'])   { loader = 'neoforge'; loaderVersion = mr.dependencies['neoforge'] }
      else if (mr.dependencies?.['forge'])      { loader = 'forge';    loaderVersion = mr.dependencies['forge'] }
      else if (mr.dependencies?.['quilt-loader']){ loader = 'quilt';   loaderVersion = mr.dependencies['quilt-loader'] }
    }
    for (const iconName of ['icon.png', 'pack.png']) {
      const iconData = readZipEntry(iconName)
      if (iconData) {
        iconBase64 = 'data:image/png;base64,' + iconData.toString('base64')
        break
      }
    }

    return { ok: true, name, gameVersion, loader, loaderVersion, iconBase64, iconUrl, filePath }
  } catch (err) {
    return { error: err.message }
  }
})

ipcMain.handle('profiles:importModpack', async (e, { filePath, source, profileId }) => {
  const win = getTrustedWindow(e)
  if (!win) return { error: 'Unauthorized' }

  const path = require('path')
  const fs   = require('fs')

  if (!filePath || !fs.existsSync(filePath)) return { error: 'File không tồn tại' }
  if (!['curseforge', 'modrinth'].includes(source)) return { error: 'Source không hợp lệ' }

  const DATA_DIR_IMPORT = path.join(require('electron').app.getPath('appData'), '.VoxelXClient')
  const PROFILES_FILE_IMPORT = require('path').join(DATA_DIR_IMPORT, 'profiles.json')
  let profilesData
  try { profilesData = JSON.parse(fs.readFileSync(PROFILES_FILE_IMPORT, 'utf-8')) }
  catch { profilesData = { profiles: [] } }
  const profile = profilesData.profiles.find(p => p.id === profileId)
  if (!profile) return { error: 'Profile không tồn tại' }

  const instancePath = profile.instancePath
  if (!fs.existsSync(instancePath)) fs.mkdirSync(instancePath, { recursive: true })

  function sendProgress(data) {
    if (!win.isDestroyed()) win.webContents.send('import:progress', data)
  }

  try {
    let result
    if (source === 'modrinth') {
      const { importModrinthPack } = require('./launcher/modrinth/modrinthImporter.cjs')
      result = await importModrinthPack(filePath, instancePath, sendProgress)
    } else {
      const { importCurseForgePack } = require('./launcher/curseforge/curseforgeImporter.cjs')
      result = await importCurseForgePack(filePath, instancePath, sendProgress)
    }

    try {
      const latestData = JSON.parse(fs.readFileSync(PROFILES_FILE_IMPORT, 'utf-8'))
      const idx = latestData.profiles.findIndex(p => p.id === profileId)
      if (idx >= 0) {
        if (result.gameVersion)   latestData.profiles[idx].gameVersion   = result.gameVersion
        if (result.loader)        latestData.profiles[idx].loader        = result.loader
        if (result.loaderVersion) latestData.profiles[idx].loaderVersion = result.loaderVersion
        if (result.name && !latestData.profiles[idx].name.trim()) {
          latestData.profiles[idx].name = result.name
        }

        latestData.profiles[idx].importSource  = source

        if (result.iconUrl) {
          latestData.profiles[idx].importIconUrl = result.iconUrl
          latestData.profiles[idx].importBgUrl   = result.iconUrl
        }
        if (result.bgUrl && result.bgUrl !== result.iconUrl) {
          latestData.profiles[idx].importBgUrl = result.bgUrl
        }
        const tmp = PROFILES_FILE_IMPORT + '.tmp'
        fs.writeFileSync(tmp, JSON.stringify(latestData, null, 2), { mode: 0o600 })
        fs.renameSync(tmp, PROFILES_FILE_IMPORT)
      }
    } catch {}

    return { ok: true, ...result }
  } catch (err) {
    sendProgress({ phase: 'error', log: `Lỗi: ${err.message}`, percent: 0 })
    return { error: err.message }
  }
})

ipcMain.handle('profiles:saveTempFile', async (e, { name, buffer }) => {
  if (!getTrustedWindow(e)) return null
  try {
    const os   = require('os')
    const path = require('path')
    const fs   = require('fs')
    const tmpPath = path.join(os.tmpdir(), `vxc-import-${Date.now()}-${name}`)
    fs.writeFileSync(tmpPath, Buffer.from(buffer))
    return tmpPath
  } catch {
    return null
  }
})

// Map lưu AbortController cho từng download đang chạy (key = webContents id)
const activeModpackDownloads = new Map()

ipcMain.handle('modpack:cancel', (e) => {
  const win = getTrustedWindow(e)
  if (!win) return { error: 'Unauthorized' }
  const controller = activeModpackDownloads.get(win.webContents.id)
  if (controller) {
    controller.abort()
    activeModpackDownloads.delete(win.webContents.id)
    return { ok: true }
  }
  return { ok: true, noop: true }
})

ipcMain.handle('modpack:downloadAndImport', async (e, { downloadUrl, filename, source, profileMeta, groupId }) => {
  const win = getTrustedWindow(e)
  if (!win) return { error: 'Unauthorized' }

  const os   = require('os')
  const path = require('path')
  const fs   = require('fs')
  const https = require('https')
  const http  = require('http')

  // Tạo AbortController cho lần download này
  const controller = new AbortController()
  const { signal } = controller
  activeModpackDownloads.set(win.webContents.id, controller)

  function sendProgress(data) {
    if (!win.isDestroyed()) win.webContents.send('import:progress', data)
  }

  // Dọn dẹp khi xong (dù thành công hay lỗi)
  function cleanup(tmpPath) {
    activeModpackDownloads.delete(win.webContents.id)
    if (tmpPath) try { fs.unlinkSync(tmpPath) } catch {}
  }

  const tmpPath = path.join(os.tmpdir(), `vxc-modpack-${Date.now()}-${filename}`)
  sendProgress({ phase: 'download', log: `Đang tải ${filename}...`, percent: 2 })

  try {
    await new Promise((resolve, reject) => {
      // Nếu đã bị hủy trước khi bắt đầu
      if (signal.aborted) return reject(new Error('Cancelled'))
      signal.addEventListener('abort', () => reject(new Error('Cancelled')), { once: true })

      let settled = false
      let activeReq = null
      function done(err) {
        if (settled) return
        settled = true
        if (err) reject(err); else resolve()
      }

      // Theo dõi redirect và chỉ tạo WriteStream một lần duy nhất sau khi có URL thực
      const MAX_REDIRECTS = 10
      function doGet(url, redirectCount) {
        if (signal.aborted) return done(new Error('Cancelled'))
        if (redirectCount > MAX_REDIRECTS) return done(new Error('Too many redirects'))
        const client = url.startsWith('https') ? https : http
        const req = client.get(url, { headers: { 'User-Agent': 'VoxelXLauncher/1.0' } }, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            res.resume()
            return doGet(res.headers.location, redirectCount + 1)
          }
          if (res.statusCode !== 200) {
            res.resume()
            return done(new Error(`HTTP ${res.statusCode}: ${url}`))
          }
          // Chỉ tạo WriteStream sau khi đã resolve hết redirect
          const tmpFile = fs.createWriteStream(tmpPath)
          const total = parseInt(res.headers['content-length'] || '0', 10)
          let received = 0

          // Hủy stream khi signal abort
          signal.addEventListener('abort', () => {
            res.destroy()
            tmpFile.destroy()
            try { fs.unlinkSync(tmpPath) } catch {}
            done(new Error('Cancelled'))
          }, { once: true })

          res.on('data', chunk => {
            received += chunk.length
            if (total > 0) {
              const pct = 2 + Math.round((received / total) * 18)
              sendProgress({ phase: 'download', log: `Đang tải ${filename}: ${pct}%`, percent: pct })
            }
          })
          res.pipe(tmpFile)
          tmpFile.on('finish', () => done())
          tmpFile.on('error', err => { try { fs.unlinkSync(tmpPath) } catch {} done(err) })
          res.on('error',     err => { try { fs.unlinkSync(tmpPath) } catch {} done(err) })
        })
        activeReq = req
        req.on('error', err => done(err))
      }
      doGet(downloadUrl, 0)
    })
  } catch (err) {
    const isCancelled = err.message === 'Cancelled'
    if (isCancelled) {
      cleanup(tmpPath)
      sendProgress({ phase: 'cancelled', log: 'Đã hủy tải xuống.', percent: 0 })
      return { cancelled: true }
    }
    cleanup(null)
    sendProgress({ phase: 'error', log: `Lỗi tải file: ${err.message}`, percent: 0 })
    return { error: err.message }
  }

  sendProgress({ phase: 'read', log: 'Đọc metadata modpack...', percent: 20 })

  let meta = {}
  try {
    const { ipcMain: _ipc, BrowserWindow } = require('electron')

    const zlib = require('zlib')
    const buf = fs.readFileSync(tmpPath)

    function readZipEntry(name) {
      let eocdOffset = -1
      for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65558); i--) {
        if (buf.readUInt32LE(i) === 0x06054b50) { eocdOffset = i; break }
      }
      if (eocdOffset < 0) return null
      const cdOffset = buf.readUInt32LE(eocdOffset + 16)
      const cdCount  = buf.readUInt16LE(eocdOffset + 10)
      let pos = cdOffset
      for (let i = 0; i < cdCount; i++) {
        if (buf.readUInt32LE(pos) !== 0x02014b50) break
        const compMethod  = buf.readUInt16LE(pos + 10)
        const compSize    = buf.readUInt32LE(pos + 20)
        const fnLen       = buf.readUInt16LE(pos + 28)
        const extraLen    = buf.readUInt16LE(pos + 30)
        const commentLen  = buf.readUInt16LE(pos + 32)
        const localOffset = buf.readUInt32LE(pos + 42)
        const fileName    = buf.slice(pos + 46, pos + 46 + fnLen).toString('utf8')
        if (fileName === name) {
          const lfnLen  = buf.readUInt16LE(localOffset + 26)
          const lexLen  = buf.readUInt16LE(localOffset + 28)
          const dataOff = localOffset + 30 + lfnLen + lexLen
          const comp    = buf.slice(dataOff, dataOff + compSize)
          if (compMethod === 0) return comp
          if (compMethod === 8) return zlib.inflateRawSync(comp)
          return null
        }
        pos += 46 + fnLen + extraLen + commentLen
      }
      return null
    }

    const baseName = path.basename(filename).replace(/\.(zip|mrpack)$/i, '')
    let name = profileMeta?.name || baseName
    let gameVersion = profileMeta?.gameVersion || ''
    let loader = profileMeta?.loader || 'forge'
    let loaderVersion = profileMeta?.loaderVersion || ''

    const manifestData = readZipEntry('manifest.json')
    if (manifestData) {
      const manifest = JSON.parse(manifestData.toString('utf8'))
      name        = manifest.name || name
      gameVersion = manifest.minecraft?.version || gameVersion
      const loaderRaw = (manifest.minecraft?.modLoaders || [])[0]?.id || ''
      if (loaderRaw.startsWith('neoforge-'))    { loader = 'neoforge'; loaderVersion = loaderRaw.replace('neoforge-', '') }
      else if (loaderRaw.startsWith('forge-'))  { loader = 'forge';    loaderVersion = loaderRaw.replace('forge-', '') }
      else if (loaderRaw.startsWith('fabric-')) { loader = 'fabric';   loaderVersion = loaderRaw.replace('fabric-', '') }
    }
    const mrData = readZipEntry('modrinth.index.json')
    if (mrData) {
      const mr = JSON.parse(mrData.toString('utf8'))
      name        = mr.name || name
      gameVersion = mr.dependencies?.minecraft || gameVersion
      if (mr.dependencies?.['fabric-loader'])    { loader = 'fabric';   loaderVersion = mr.dependencies['fabric-loader'] }
      else if (mr.dependencies?.['neoforge'])    { loader = 'neoforge'; loaderVersion = mr.dependencies['neoforge'] }
      else if (mr.dependencies?.['forge'])       { loader = 'forge';    loaderVersion = mr.dependencies['forge'] }
      else if (mr.dependencies?.['quilt-loader']){ loader = 'quilt';    loaderVersion = mr.dependencies['quilt-loader'] }
    }
    meta = { name, gameVersion, loader, loaderVersion }
  } catch (err) {
    meta = {
      name:          profileMeta?.name || path.basename(filename, path.extname(filename)),
      gameVersion:   profileMeta?.gameVersion || '',
      loader:        profileMeta?.loader || 'forge',
      loaderVersion: profileMeta?.loaderVersion || '',
    }
  }

  sendProgress({ phase: 'create', log: 'Tạo profile...', percent: 22 })

  const DATA_DIR_DL = path.join(require('electron').app.getPath('appData'), '.VoxelXClient')
  const PROFILES_FILE_DL = path.join(DATA_DIR_DL, 'profiles.json')

  const profileId = require('crypto').randomUUID()
  const now = new Date().toISOString()
  const INSTANCES_DIR_DL = path.join(DATA_DIR_DL, 'instances')
  const instancePath = path.join(INSTANCES_DIR_DL, profileId)
  try { fs.mkdirSync(instancePath, { recursive: true }) } catch {}

  const profile = {
    id:            profileId,
    name:          meta.name || 'Modpack',
    loader:        meta.loader,
    gameVersion:   meta.gameVersion,
    loaderVersion: meta.loaderVersion,
    instancePath,
    isCustomPath:  false,
    createdAt:     now,
    lastPlayed:    null,
    sizeBytes:     0,
    importSource:  source,
    importIconUrl: profileMeta?.iconUrl || null,
    importBgUrl:   profileMeta?.iconUrl || null,
  }

  try {
    let profilesData
    try { profilesData = JSON.parse(fs.readFileSync(PROFILES_FILE_DL, 'utf-8')) }
    catch { profilesData = { profiles: [], selectedProfileId: null } }
    profilesData.profiles.push(profile)
    if (!profilesData.selectedProfileId) profilesData.selectedProfileId = profileId
    const tmp = PROFILES_FILE_DL + '.tmp'
    fs.writeFileSync(tmp, JSON.stringify(profilesData, null, 2), { mode: 0o600 })
    fs.renameSync(tmp, PROFILES_FILE_DL)
  } catch (err) {
    try { fs.unlinkSync(tmpPath) } catch {}
    sendProgress({ phase: 'error', log: `Lỗi tạo profile: ${err.message}`, percent: 0 })
    return { error: err.message }
  }

  sendProgress({ phase: 'start', log: 'Bắt đầu import modpack...', percent: 25 })

  try {
    let result
    if (source === 'modrinth') {
      const { importModrinthPack } = require('./launcher/modrinth/modrinthImporter.cjs')
      result = await importModrinthPack(tmpPath, instancePath, sendProgress)
    } else if (source === 'curseforge') {
      const { importCurseForgePack } = require('./launcher/curseforge/curseforgeImporter.cjs')
      result = await importCurseForgePack(tmpPath, instancePath, sendProgress)
    } else {

      result = { name: meta.name, gameVersion: meta.gameVersion, loader: meta.loader, loaderVersion: meta.loaderVersion }
    }

    try {
      const latestData = JSON.parse(fs.readFileSync(PROFILES_FILE_DL, 'utf-8'))
      const idx = latestData.profiles.findIndex(p => p.id === profileId)
      if (idx >= 0) {
        if (result.gameVersion)   latestData.profiles[idx].gameVersion   = result.gameVersion
        if (result.loader)        latestData.profiles[idx].loader        = result.loader
        if (result.loaderVersion) latestData.profiles[idx].loaderVersion = result.loaderVersion
        if (result.name)          latestData.profiles[idx].name          = result.name
        if (result.iconUrl) {
          latestData.profiles[idx].importIconUrl = result.iconUrl
          latestData.profiles[idx].importBgUrl   = result.iconUrl
        }
        const tmp2 = PROFILES_FILE_DL + '.tmp'
        fs.writeFileSync(tmp2, JSON.stringify(latestData, null, 2), { mode: 0o600 })
        fs.renameSync(tmp2, PROFILES_FILE_DL)
      }
    } catch {}

    try { fs.unlinkSync(tmpPath) } catch {}

    if (groupId && typeof groupId === 'string' && /^[0-9a-f-]{36}$/.test(groupId)) {
      try {
        const GROUPS_FILE_DL = path.join(DATA_DIR_DL, 'groups.json')
        let groupsData
        try { groupsData = JSON.parse(fs.readFileSync(GROUPS_FILE_DL, 'utf-8')) }
        catch { groupsData = { groups: [] } }
        const grp = groupsData.groups.find(g => g.id === groupId)
        if (grp && !grp.profileIds.includes(profileId)) {
          grp.profileIds.push(profileId)
          const tmpG = GROUPS_FILE_DL + '.tmp'
          fs.writeFileSync(tmpG, JSON.stringify(groupsData, null, 2), { mode: 0o600 })
          fs.renameSync(tmpG, GROUPS_FILE_DL)
        }
      } catch {}
    }

    sendProgress({ phase: 'done', log: `Đã tạo profile "${meta.name}" thành công!`, percent: 100 })
    activeModpackDownloads.delete(win.webContents.id)
    return { ok: true, profileId, profileName: meta.name }
  } catch (err) {
    try { fs.unlinkSync(tmpPath) } catch {}
    activeModpackDownloads.delete(win.webContents.id)
    const isCancelled = err.message === 'Cancelled'
    if (isCancelled) {
      sendProgress({ phase: 'cancelled', log: 'Đã hủy tải xuống.', percent: 0 })
      return { cancelled: true }
    }
    sendProgress({ phase: 'error', log: `Lỗi import: ${err.message}`, percent: 0 })
    return { error: err.message }
  }
})

ipcMain.handle('settings:get', (e) => {
  if (!getTrustedWindow(e)) return DEFAULT_SETTINGS
  return readSettings()
})

ipcMain.handle('settings:save', (e, patch) => {
  if (!getTrustedWindow(e)) return { error: 'Unauthorized' }
  if (!patch || typeof patch !== 'object') return { error: 'Invalid data' }

  const safe = {}
  for (const key of SETTING_KEYS) {
    if (key in patch) safe[key] = patch[key]
  }

  const current = readSettings()
  const updated = { ...current, ...safe }
  writeSettings(updated)

  if ('discordRPC' in safe && safe.discordRPC !== current.discordRPC) {
    if (safe.discordRPC) rpc.connect()
    else rpc.disconnect()
  }

  return { ok: true, data: updated }
})

ipcMain.handle('system:boostMode', async (e, enable) => {
  if (!getTrustedWindow(e)) return { error: 'Unauthorized' }
  if (process.platform !== 'win32') return { ok: true, skipped: true, reason: 'Windows only' }

  const { exec } = require('child_process')

  const BOOST_KILL_LIST = [
    'OneDrive.exe',
    'Teams.exe',
    'Slack.exe',
    'Spotify.exe',
    'Discord.exe',
    'EpicGamesLauncher.exe',
    'steam.exe',
    'GalaxyClient.exe',
    'upc.exe',
    'origin.exe',
    'OriginWebHelperService.exe',
    'SearchIndexer.exe',
    'SearchProtocolHost.exe',
    'SearchFilterHost.exe',
    'SgrmBroker.exe',
    'MsMpEng.exe',
    'NisSrv.exe',
    'SecurityHealthSystray.exe',
    'OneDriveSetup.exe',
    'SkypeApp.exe',
    'SkypeBridge.exe',
    'msedge.exe',
    'chrome.exe',
    'firefox.exe',
    'opera.exe',
    'brave.exe',
    'Cortana.exe',
    'WinStore.App.exe',
    'XboxApp.exe',
    'XboxGameBarWidgets.exe',
    'GameBar.exe',
    'GameBarFTServer.exe',
    'RiotClientServices.exe',
    'LeagueClient.exe',
    'valorant.exe',
    'EADesktop.exe',
    'BattleNet.exe',
    'Agent.exe',
  ]

  if (enable) {
    const killed = []
    const failed = []

    for (const proc of BOOST_KILL_LIST) {
      await new Promise(resolve => {
        exec(`taskkill /F /IM "${proc}" /T`, { windowsHide: true }, (err) => {
          if (!err) killed.push(proc)
          else failed.push(proc)
          resolve()
        })
      })
    }

    try {
      exec(`wmic process where ProcessId=${process.pid} CALL setpriority "above normal"`, { windowsHide: true })
    } catch {}

    return { ok: true, killed, failed }
  } else {
    return { ok: true, restored: true }
  }
})

ipcMain.handle('discord:startLink', async (event) => {
  if (!getTrustedWindow(event)) return { error: 'Unauthorized' }
  try {
    const result = await cyoriaIdentity.login()
    const id = result.identity
    if (!id?.discord_user_id || !/^\d{17,20}$/.test(id.discord_user_id)) {
      return { error: 'Cyoria account has no verified Discord connection. Link Discord in CyoriaSMP Auth first.' }
    }
    return { ok: true, profile: {
      discordId: id.discord_user_id,
      discordUsername: id.discord_username || id.discord_user_id,
      discordGlobalName: id.name || id.preferred_username || null,
      discordDiscriminator: null,
      discordAvatarUrl: null
    } }
  } catch (err) { return { error: err.message } }
})

