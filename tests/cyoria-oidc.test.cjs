'use strict'
const { test } = require('node:test')
const assert = require('node:assert/strict')
const Module = require('node:module')
const originalLoad = Module._load
const mockShell = { openExternal: async () => {} }
Module._load = function(request,...args) {
  if (request === 'electron') return { shell: mockShell }
  return originalLoad.call(this,request,...args)
}
const identity = require('../electron/cyoriaIdentity.cjs')
Module._load = originalLoad
const originalFetch = global.fetch
const originalClientId = process.env.CYORIA_OIDC_CLIENT_ID
function response(value, status=200) { return { ok: status < 400, status, json:async()=>value } }
function metadata() {return {issuer:'https://auth.cyoriasmp.com',authorization_endpoint:'https://auth.cyoriasmp.com/authorize',token_endpoint:'https://auth.cyoriasmp.com/token',userinfo_endpoint:'https://auth.cyoriasmp.com/userinfo',token_endpoint_auth_methods_supported:['none'],code_challenge_methods_supported:['S256']}}
test('optional Cyoria identity must not require an OAuth client at launcher startup', () => {
  delete process.env.CYORIA_OIDC_CLIENT_ID
  assert.equal(identity.status().configured, false)
  assert.equal(identity.status().connected, false)
})
test('login fails cleanly without public client ID', async () => {
  delete process.env.CYORIA_OIDC_CLIENT_ID
  await assert.rejects(identity.login(), /not configured/)
})
test('rejects non-public token exchange discovery', async () => {
  process.env.CYORIA_OIDC_CLIENT_ID = 'public-test-client'
  global.fetch = async()=>response({...metadata(),token_endpoint_auth_methods_supported:['client_secret_basic']})
  await assert.rejects(identity.login(), /token_endpoint_auth_method=none/)
  assert.equal(identity.status().connected,false)
  global.fetch = originalFetch
})
test('rejects issuer and endpoint impersonation',async()=>{
  process.env.CYORIA_OIDC_CLIENT_ID='public-test-client'
  global.fetch=async()=>response({...metadata(),userinfo_endpoint:'https://evil.example/userinfo'})
  await assert.rejects(identity.login(), /Untrusted OIDC endpoint/)
  global.fetch=async()=>response({...metadata(),issuer:'https://evil.example'})
  await assert.rejects(identity.login(), /issuer mismatch/)
  global.fetch=originalFetch
})
test('PKCE callback completes, ignores invalid state, and reads verified userinfo',async()=>{
  process.env.CYORIA_OIDC_CLIENT_ID='public-test-client'
  let exchangeCount=0
  let authUrl
  mockShell.openExternal=async url=>{
    authUrl = new URL(url)
    assert.equal(authUrl.searchParams.get('code_challenge_method'),'S256')
    assert.equal(authUrl.searchParams.get('response_type'),'code')
    assert.equal(authUrl.searchParams.get('client_id'),'public-test-client')
    const cb = authUrl.searchParams.get('redirect_uri')
    assert.ok(cb.startsWith('http://127.0.0.1:'))
    const bad = await originalFetch(`${cb}?code=bad&state=not-valid`)
    assert.equal(bad.status,400)
    const good = await originalFetch(`${cb}?code=legit&state=${authUrl.searchParams.get('state')}`)
    assert.equal(good.status,200)
  }
  global.fetch=async (url, opts)=>{
    const target=String(url)
    if(target.includes('openid-configuration'))return response(metadata())
    if(target.endsWith('/token')){
      exchangeCount++
      assert.equal(opts.method,'POST')
      const body=opts.body
      assert.equal(body.get('code'),'legit')
      assert.ok(body.get('code_verifier')?.length > 32)
      return response({access_token:'fake-test-token', token_type:'Bearer'})
    }
    if(target.endsWith('/userinfo'))return response({sub:'cyoria-test-subject',preferred_username:'mockPlayer',discord_user_id:'123456789012345678'})
    throw new Error('Unexpected URL '+target)
  }
  const result=await identity.login()
  assert.equal(exchangeCount,1)
  assert.equal(result.connected,true)
  assert.equal(result.identity.preferred_username,'mockPlayer')
  assert.equal(result.identity.discord_user_id,'123456789012345678')
  assert.equal(identity.logout().connected,false)
  global.fetch=originalFetch
})
test.after(()=>{
  global.fetch=originalFetch
  if(originalClientId===undefined) delete process.env.CYORIA_OIDC_CLIENT_ID
  else process.env.CYORIA_OIDC_CLIENT_ID=originalClientId
})
