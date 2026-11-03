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

'use strict'

const https   = require('https')
const http    = require('http')
const crypto  = require('crypto')
const { BrowserWindow } = require('electron')

const CLIENT_ID    = '00000000402b5328'
const REDIRECT_URI = 'https://login.live.com/oauth20_desktop.srf'
const SCOPE        = 'XboxLive.signin offline_access'
const AUTH_URL     = 'https://login.live.com/oauth20_authorize.srf'
const TOKEN_URL    = 'https://login.live.com/oauth20_token.srf'
let activeAuthWindow = null

function httpsPost(url, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body)
    const ctype   = typeof body === 'string' ? 'application/x-www-form-urlencoded' : 'application/json'
    const u       = new URL(url)

    const req = https.request({
      hostname: u.hostname,
      path:     u.pathname + u.search,
      method:   'POST',
      headers:  {
        'Content-Type':   ctype,
        'Content-Length': Buffer.byteLength(bodyStr),
        'User-Agent':     'VoxelXLauncher/1.0',
        'Accept':         'application/json',
        ...extraHeaders,
      },
    }, (res) => {
      let data = ''
      res.on('data', c => { data += c })
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }) }
        catch { resolve({ status: res.statusCode, body: data }) }
      })
    })
    req.on('error', reject)
    req.setTimeout(20000, () => req.destroy(new Error('Microsoft authentication request timed out')))
    req.write(bodyStr)
    req.end()
  })
}

function encodeForm(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
}

function openAuthWindow(parentWindow) {
  if (activeAuthWindow && !activeAuthWindow.isDestroyed()) return Promise.reject(new Error('Microsoft sign-in is already open'))
  return new Promise((resolve, reject) => {
    const state = crypto.randomBytes(16).toString('hex')

    const authUrl = AUTH_URL +
      `?client_id=${CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=${encodeURIComponent(SCOPE)}` +
      `&state=${state}` +
      `&prompt=select_account`

    const win = new BrowserWindow({
      width:  520,
      height: 680,
      parent: parentWindow ?? undefined,
      modal:  true,
      title:  'Sign in with Microsoft',
      frame:  true,
      resizable: false,
      webPreferences: {
        nodeIntegration:  false,
        contextIsolation: true,
        sandbox:          true,
        webSecurity:      true,
        partition:        'auth-window',
      },
    })

    win.setMenuBarVisibility(false)
    activeAuthWindow = win

    let resolved = false
    function fail(error) {
      if (resolved) return
      resolved = true
      reject(error instanceof Error ? error : new Error(String(error)))
      if (!win.isDestroyed()) win.close()
    }

    function handleRedirect(url) {
      let u
      try { u = new URL(url) } catch { return false }
      const expected = new URL(REDIRECT_URI)
      if (u.origin !== expected.origin || u.pathname !== expected.pathname) return false
      const retState = u.searchParams.get('state')
      if (retState !== state) { fail(new Error('Invalid Microsoft OAuth state')); return true }
      const error = u.searchParams.get('error')
      if (error) { fail(new Error(u.searchParams.get('error_description') || error)); return true }
      const code = u.searchParams.get('code')
      if (!code) { fail(new Error('Microsoft authorization code is missing')); return true }
      if (resolved) return true
      resolved = true
      resolve(code)
      if (!win.isDestroyed()) win.close()
      return true
    }

    win.webContents.on('will-redirect', (event, url) => { if (handleRedirect(url)) event.preventDefault() })
    win.webContents.on('will-navigate', (event, url) => { if (handleRedirect(url)) event.preventDefault() })
    win.webContents.on('did-navigate', (_event, url) => { handleRedirect(url) })

    win.on('closed', () => {
      if (activeAuthWindow === win) activeAuthWindow = null
      if (!resolved) fail(new Error('Microsoft sign-in was cancelled'))
    })

    Promise.resolve(win.loadURL(authUrl)).catch(err => fail(err))
  })
}

async function exchangeCodeForTokens(code) {
  const res = await httpsPost(TOKEN_URL, encodeForm({
    client_id:    CLIENT_ID,
    code,
    grant_type:   'authorization_code',
    redirect_uri: REDIRECT_URI,
    scope:        SCOPE,
  }))
  if (!res.body.access_token) {
    throw new Error(res.body.error_description || res.body.error || `Token exchange failed: ${res.status}`)
  }
  return res.body
}

async function refreshAccessToken(refreshToken) {
  const res = await httpsPost(TOKEN_URL, encodeForm({
    client_id:     CLIENT_ID,
    grant_type:    'refresh_token',
    refresh_token: refreshToken,
    scope:         SCOPE,
  }))
  if (!res.body.access_token) {
    throw new Error(res.body.error_description || 'Unable to refresh Microsoft token')
  }
  return res.body
}

async function authXboxLive(msAccessToken) {
  const res = await httpsPost('https://user.auth.xboxlive.com/user/authenticate', {
    Properties: {
      AuthMethod: 'RPS',
      SiteName:   'user.auth.xboxlive.com',
      RpsTicket:  `d=${msAccessToken}`,
    },
    RelyingParty: 'http://auth.xboxlive.com',
    TokenType:    'JWT',
  })
  if (res.status !== 200) throw new Error(`XBL auth failed: ${res.status}`)
  const xblToken = res.body.Token
  const userHash = res.body.DisplayClaims?.xui?.[0]?.uhs
  if (!xblToken || !userHash) throw new Error('XBL response missing token/userhash')
  return { xblToken, userHash }
}

async function authXSTS(xblToken) {
  const res = await httpsPost('https://xsts.auth.xboxlive.com/xsts/authorize', {
    Properties: {
      SandboxId:  'RETAIL',
      UserTokens: [xblToken],
    },
    RelyingParty: 'rp://api.minecraftservices.com/',
    TokenType:    'JWT',
  })
  if (res.status === 401) {
    const xerr = res.body.XErr
    if (xerr === 2148916233) throw new Error('This Microsoft account does not have Xbox Live. Set it up at xbox.com.')
    if (xerr === 2148916235) throw new Error('Xbox Live is unavailable in your region.')
    if (xerr === 2148916238) throw new Error('This child account requires parental consent.')
    throw new Error(`XSTS error: ${xerr}`)
  }
  if (res.status !== 200) throw new Error(`XSTS auth failed: ${res.status}`)
  const xstsToken = res.body.Token
  const userHash  = res.body.DisplayClaims?.xui?.[0]?.uhs
  if (!xstsToken || !userHash) throw new Error('XSTS response missing token/userhash')
  return { xstsToken, userHash }
}

async function authMinecraft(xstsToken, userHash) {
  const res = await httpsPost(
    'https://api.minecraftservices.com/authentication/login_with_xbox',
    { identityToken: `XBL3.0 x=${userHash};${xstsToken}` }
  )
  if (res.status !== 200) throw new Error(`Minecraft auth failed: ${res.status}`)
  const mcToken = res.body.access_token
  if (!mcToken) throw new Error('Minecraft access token is missing')
  return { mcToken, expiresIn: res.body.expires_in || 86400 }
}

async function getMinecraftProfile(mcToken) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.minecraftservices.com',
      path:     '/minecraft/profile',
      method:   'GET',
      headers:  { 'Authorization': `Bearer ${mcToken}`, 'User-Agent': 'VoxelXLauncher/1.0' },
    }, (res) => {
      let data = ''
      res.on('data', c => { data += c })
      res.on('end', () => {
        try {
          const body = JSON.parse(data)
          if (res.statusCode === 404 || body.error === 'NOT_FOUND') {
            return reject(new Error('This account does not own Minecraft Java Edition.'))
          }
          if (res.statusCode !== 200) return reject(new Error(`Profile fetch failed: ${res.statusCode}`))
          if (!body.id || !body.name) return reject(new Error('Invalid Minecraft profile response'))
          const raw  = body.id
          const uuid = `${raw.slice(0,8)}-${raw.slice(8,12)}-${raw.slice(12,16)}-${raw.slice(16,20)}-${raw.slice(20)}`
          resolve({ uuid, username: body.name })
        } catch { reject(new Error('Unable to read Minecraft profile response')) }
      })
    })
    req.on('error', reject)
    req.setTimeout(20000, () => req.destroy(new Error('Minecraft profile request timed out')))
    req.end()
  })
}

async function msTokensToMinecraft(msAccessToken, msRefreshToken) {
  const { xblToken }              = await authXboxLive(msAccessToken)
  const { xstsToken, userHash }   = await authXSTS(xblToken)
  const { mcToken, expiresIn }    = await authMinecraft(xstsToken, userHash)
  const { uuid, username }        = await getMinecraftProfile(mcToken)
  return {
    username, uuid,
    msRefreshToken,
    mcToken,
    mcTokenExpiry: Date.now() + expiresIn * 1000,
  }
}

function cancelLogin() {
  if (!activeAuthWindow || activeAuthWindow.isDestroyed()) return false
  activeAuthWindow.close()
  return true
}

async function loginWithWindow(parentWindow) {
  const code     = await openAuthWindow(parentWindow)
  const msTokens = await exchangeCodeForTokens(code)
  return msTokensToMinecraft(msTokens.access_token, msTokens.refresh_token)
}

async function refreshMinecraftToken(msRefreshToken) {
  const msTokens = await refreshAccessToken(msRefreshToken)
  return msTokensToMinecraft(msTokens.access_token, msTokens.refresh_token || msRefreshToken)
}

module.exports = { loginWithWindow, refreshMinecraftToken, cancelLogin }

