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
  return metadata
}

function status() {
  return { issuer: ISSUER, configured: Boolean(process.env.CYORIA_OIDC_CLIENT_ID), connected: Boolean(currentIdentity), identity: currentIdentity }
}

async function login() {
  if (loginInProgress) throw new Error('Cyoria Auth login already running')
  const clientId = process.env.CYORIA_OIDC_CLIENT_ID
  if (!clientId) throw new Error('CYORIA_OIDC_CLIENT_ID is missing; register an OIDC public desktop client first')
  loginInProgress = true
  let server
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
    const redirectUri = 'http://127.0.0.1:' + server.address().port + '/callback'
    const auth = new URL(metadata.authorization_endpoint)
    for (const [k,v] of Object.entries({response_type:'code',client_id:clientId,redirect_uri:redirectUri,scope:'openid profile',state,nonce,code_challenge:challenge,code_challenge_method:'S256'})) auth.searchParams.set(k,v)

    const callback = new Promise((resolve,reject) => {
      const timer = setTimeout(() => reject(new Error('Cyoria Auth sign-in timed out')), 120000)
      server.on('request', (req,res) => {
        const u = new URL(req.url || '/',redirectUri)
        if (req.method !== 'GET' || u.pathname !== '/callback') { res.writeHead(404); res.end(); return }
        if (u.searchParams.get('state') !== state) { res.writeHead(400); res.end('Invalid state'); return }
        const error = u.searchParams.get('error')
        const code = u.searchParams.get('code')
        res.writeHead(error || !code ? 400 : 200,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'})
        res.end(error ? 'Cyoria Auth rejected sign-in' : code ? 'Cyoria Auth complete. Return to Cyoria Launcher.' : 'Missing authorization code')
        clearTimeout(timer)
        if (error || !code) reject(new Error('Cyoria Auth sign-in failed')); else resolve(code)
      })
    })
    try { await shell.openExternal(auth.toString()); const code = await callback
      const tokenResponse = await fetch(metadata.token_endpoint, {method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'authorization_code',client_id:clientId,code,redirect_uri:redirectUri,code_verifier:verifier}),signal:AbortSignal.timeout(10000)})
      if (!tokenResponse.ok) throw new Error('Cyoria Auth token exchange failed: '+tokenResponse.status)
      const tokens = await tokenResponse.json()
      if (!tokens.access_token || tokens.token_type?.toLowerCase() !== 'bearer') throw new Error('Invalid Cyoria Auth token response')
      const info = await fetch(metadata.userinfo_endpoint,{headers:{Authorization:'Bearer '+tokens.access_token},signal:AbortSignal.timeout(10000)})
      if (!info.ok) throw new Error('Cyoria Auth profile lookup failed: '+info.status)
      const profile = await info.json()
      if (!profile.sub || typeof profile.sub !== 'string') throw new Error('Invalid Cyoria Auth subject')
      currentIdentity = { sub: profile.sub, name: typeof profile.name === 'string' ? profile.name : null, preferred_username: typeof profile.preferred_username === 'string' ? profile.preferred_username : null }
      return status()
    } finally { callback.catch(()=>{}) }
  } finally { if (server) server.close(); loginInProgress = false }
}
function logout(){ currentIdentity = null; return status() }
module.exports = {status,login,logout,discover}
