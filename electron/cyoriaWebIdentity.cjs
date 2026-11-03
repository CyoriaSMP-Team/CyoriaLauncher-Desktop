'use strict'
/**
 * Cyoria website account sign-in for the optional Launcher identity.
 * Credentials stay in the user's browser; the desktop receives a one-time
 * PKCE authorization code over a loopback callback.
 */
const crypto = require('node:crypto')
const http = require('node:http')
const { shell } = require('electron')

const SITE_ORIGIN = 'https://www.cyoriasmp.com'
const CLIENT_ID = 'cyoria-launcher-desktop'
const AUTH_PAGE = SITE_ORIGIN + '/launcher-auth/'
const AUTH_API = SITE_ORIGIN + '/api/auth/launcher'
let currentIdentity = null
let loginInProgress = false

const b64url = data => Buffer.from(data).toString('base64url')

function status() {
  return { issuer: SITE_ORIGIN, configured: true, connected: Boolean(currentIdentity), identity: currentIdentity }
}

async function login() {
  if (loginInProgress) throw new Error('Cyoria website sign-in is already running')
  if (currentIdentity) return status()
  loginInProgress = true
  let server
  let timeout
  try {
    const verifier = b64url(crypto.randomBytes(32))
    const challenge = b64url(crypto.createHash('sha256').update(verifier).digest())
    const state = b64url(crypto.randomBytes(24))

    server = http.createServer()
    await new Promise((resolve, reject) => {
      server.once('error', reject)
      server.listen(0, '127.0.0.1', resolve)
    })
    const redirectUri = `http://127.0.0.1:${server.address().port}/callback`
    const auth = new URL(AUTH_PAGE)
    const params = {
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256'
    }
    for (const [key, value] of Object.entries(params)) auth.searchParams.set(key, value)

    const callback = new Promise((resolve, reject) => {
      timeout = setTimeout(() => reject(new Error('Cyoria website sign-in timed out')), 5 * 60 * 1000)
      server.on('request', (req, res) => {
        const url = new URL(req.url || '/', redirectUri)
        res.setHeader('Cache-Control', 'no-store')
        res.setHeader('Pragma', 'no-cache')
        res.setHeader('Referrer-Policy', 'no-referrer')
        res.setHeader('X-Content-Type-Options', 'nosniff')
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        if (req.method !== 'GET' || url.pathname !== '/callback') {
          res.writeHead(404); res.end('Not found'); return
        }
        if (url.searchParams.get('state') !== state) {
          res.writeHead(400); res.end('Invalid sign-in state'); return
        }
        const error = url.searchParams.get('error')
        const code = url.searchParams.get('code')
        if (error || !code) {
          res.writeHead(200); res.end('Sign-in cancelled. Return to Cyoria Launcher.')
          reject(new Error('Cyoria website sign-in was cancelled or denied'))
          return
        }
        res.writeHead(200); res.end('Sign-in complete. Return to Cyoria Launcher.')
        resolve(code)
      })
    })
    callback.catch(() => {})
    await shell.openExternal(auth.toString())
    const code = await callback

    const response = await fetch(AUTH_API + '/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ clientId: CLIENT_ID, code, redirectUri, codeVerifier: verifier }),
      signal: AbortSignal.timeout(15000)
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(payload?.error || `Cyoria website sign-in failed (${response.status})`)
    const profile = payload?.identity
    const username = profile?.preferred_username || profile?.name
    if (typeof profile?.sub !== 'string' || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(profile.sub)
      || typeof username !== 'string' || username.trim().length < 3 || username.length > 32
      || /[\u0000-\u001f\u007f]/.test(username)) {
      throw new Error('Cyoria website returned an invalid account identity')
    }
    const minecraftName = typeof profile.minecraft_name === 'string'
      && profile.minecraft_name.trim().length > 0
      && profile.minecraft_name.length <= 64
      && !/[\u0000-\u001f\u007f]/.test(profile.minecraft_name)
      ? profile.minecraft_name.trim()
      : null
    const rawMinecraftUuid = profile.minecraft_uuid
    if (rawMinecraftUuid !== null && (typeof rawMinecraftUuid !== 'string'
      || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(rawMinecraftUuid)
      || /^00000000-0000-0000-/i.test(rawMinecraftUuid))) {
      throw new Error('Cyoria website returned an invalid Minecraft UUID')
    }
    const minecraftUuid = typeof rawMinecraftUuid === 'string' ? rawMinecraftUuid.toLowerCase() : null
    if (typeof profile.minecraft_premium !== 'boolean'
      || profile.minecraft_premium !== Boolean(minecraftUuid)) {
      throw new Error('Cyoria website did not return a valid Minecraft account verification result')
    }
    currentIdentity = {
      sub: profile.sub,
      name: username,
      preferred_username: username,
      minecraftName,
      minecraftUuid,
      minecraftPremium: profile.minecraft_premium,
    }
    return status()
  } finally {
    if (timeout) clearTimeout(timeout)
    if (server) await new Promise(resolve => server.close(() => resolve()))
    loginInProgress = false
  }
}

function logout() {
  currentIdentity = null
  return status()
}

module.exports = { status, login, logout }
