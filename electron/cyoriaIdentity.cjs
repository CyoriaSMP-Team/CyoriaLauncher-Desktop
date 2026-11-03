'use strict'
/**
 * Optional Cyoria Identity (OIDC) connection.
 * This NEVER creates a Minecraft session or replaces Microsoft ownership checks.
 * Register a PUBLIC desktop client with loopback redirect URIs at the issuer.
 */
const crypto = require('node:crypto')
const http = require('node:http')
const { shell } = require('electron')

const ISSUER = 'https://auth.cyoriasmp.com'
let currentIdentity = null
let loginInProgress = false
const b64url = data => Buffer.from(data).toString('base64url')

async function discover() {
  const response = await fetch(ISSUER + '/.well-known/openid-configuration', { signal: AbortSignal.timeout(10000) })
  if (!response.ok) throw new Error('Cyoria Auth discovery failed: ' + response.status)
  const metadata = await response.json()
  if (metadata.issuer !== ISSUER) throw new Error('Cyoria Auth issuer mismatch')
  for (const field of ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint']) {
    const target = new URL(metadata[field])
    if (target.protocol !== 'https:' || target.origin !== ISSUER) throw new Error('Untrusted OIDC endpoint: ' + field)
  }
  if (Array.isArray(metadata.token_endpoint_auth_methods_supported) && !metadata.token_endpoint_auth_methods_supported.includes('none')) {
    throw new Error('CyoriaSMP Auth must enable token_endpoint_auth_method=none for the registered public PKCE desktop client.')
  }
  return metadata
}

function status() {
  return { issuer: ISSUER, configured: Boolean((process.env.CYORIA_OIDC_CLIENT_ID || '').trim()), connected: Boolean(currentIdentity), identity: currentIdentity }
}

async function login() {
  if (loginInProgress) throw new Error('Cyoria Auth login already running')
  if (currentIdentity) return status()
  const clientId = (process.env.CYORIA_OIDC_CLIENT_ID || '').trim()
  if (!clientId) throw new Error('CyoriaSMP desktop OAuth client is not configured')
  loginInProgress = true
  let server
  let timeout
  try {
    const metadata = await discover()
    const verifier = b64url(crypto.randomBytes(32))
    const challenge = b64url(crypto.createHash('sha256').update(verifier).digest())
    const state = b64url(crypto.randomBytes(24))
    const nonce = b64url(crypto.randomBytes(24))
    server = http.createServer()
    await new Promise((resolve, reject) => {
      server.once('error', reject)
      server.listen(0, '127.0.0.1', resolve)
    })
    const redirectUri = `http://127.0.0.1:${server.address().port}/callback`
    const auth = new URL(metadata.authorization_endpoint)
    const params = { response_type:'code', client_id:clientId, redirect_uri:redirectUri,
      scope:'openid profile', state, nonce, code_challenge:challenge, code_challenge_method:'S256' }
    for (const [key,value] of Object.entries(params)) auth.searchParams.set(key,value)

    const callback = new Promise((resolve, reject) => {
      timeout = setTimeout(() => reject(new Error('Cyoria Auth sign-in timed out')), 120000)
      server.on('request', (req,res) => {
        const url = new URL(req.url || '/', redirectUri)
        res.setHeader('Cache-Control', 'no-store')
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        if (req.method !== 'GET' || url.pathname !== '/callback') {
          res.writeHead(404); res.end('Not found'); return
        }
        if (url.searchParams.get('state') !== state) {
          res.writeHead(400); res.end('Invalid OAuth state'); return
        }
        const error = url.searchParams.get('error')
        const code = url.searchParams.get('code')
        if (error || !code) {
          res.writeHead(400); res.end('Sign-in cancelled or rejected')
          reject(new Error(error ? `Cyoria Auth denied sign-in: ${error}` : 'Authorization code missing'))
          return
        }
        res.writeHead(200); res.end('Authorization received. Return to Cyoria Launcher to finish signing in.')
        resolve(code)
      })
    })
    // Attach a rejection handler before openExternal can reject to prevent unhandled promise rejection.
    callback.catch(() => {})
    await shell.openExternal(auth.toString())
    const code = await callback
    const response = await fetch(metadata.token_endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({grant_type:'authorization_code',client_id:clientId,code,redirect_uri:redirectUri,code_verifier:verifier}),
      signal: AbortSignal.timeout(12000)
    })
    if (!response.ok) throw new Error(`Cyoria Auth token exchange failed (${response.status})`)
    const tokens = await response.json()
    if (typeof tokens.access_token !== 'string' || tokens.token_type?.toLowerCase() !== 'bearer') {
      throw new Error('Invalid Cyoria Auth token response')
    }
    const info = await fetch(metadata.userinfo_endpoint, {
      headers: { Authorization: `Bearer ${tokens.access_token}` }, signal: AbortSignal.timeout(12000)
    })
    if (!info.ok) throw new Error(`Cyoria Auth userinfo lookup failed (${info.status})`)
    const profile = await info.json()
    if (typeof profile.sub !== 'string' || !profile.sub) throw new Error('Cyoria Auth subject is missing')
    // The verified identity comes from the issuer userinfo endpoint, not a Discord client response.
    currentIdentity = {
      sub: profile.sub,
      name: typeof profile.name === 'string' ? profile.name : null,
      preferred_username: typeof profile.preferred_username === 'string' ? profile.preferred_username : null,
      discord_user_id: typeof profile.discord_user_id === 'string' && /^\d{17,20}$/.test(profile.discord_user_id)
        ? profile.discord_user_id : null,
      discord_username: typeof profile.discord_username === 'string' && profile.discord_username.length <= 100 ? profile.discord_username : null
    }
    return status()
  } finally {
    if (timeout) clearTimeout(timeout)
    if (server) await new Promise(resolve => server.close(() => resolve()))
    loginInProgress = false
  }
}

function logout(){ currentIdentity = null; return status() }
module.exports = {status,login,logout,discover}
