'use strict'
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { sanitizeDiscordLink, verifiedDiscordPatch } = require('../electron/accountLinking.cjs')
const id = '123456789012345678'
const another = '234567890123456789'

test('existing Microsoft account Discord link survives sanitation and token refresh', () => {
  const account = {type:'microsoft', username:'Steve', discordId:id, discordUsername:'testuser', linkedAt:'2026-11-03T00:00:00.000Z'}
  const fields = sanitizeDiscordLink(account)
  assert.equal(fields.discordId,id)
  assert.equal(fields.discordUsername,'testuser')
  assert.equal(fields.linkedAt,account.linkedAt)
})
test('optional Discord link can be attached to an offline Minecraft account',()=>{
  assert.equal(sanitizeDiscordLink({type:'offline', discordId:id}).discordId,id)
  assert.deepEqual(sanitizeDiscordLink({type:'offline', discordId:null}),{})
})
test('rejects forged Discord ID and unverified link',()=>{
  const auth={discord_user_id:id,discord_username:'valid-issuer-name'}
  assert.match(verifiedDiscordPatch({discordId:another},auth).error,/verified CyoriaSMP Auth/)
  assert.match(verifiedDiscordPatch({discordId:id},null).error,/verified CyoriaSMP Auth/)
  assert.match(verifiedDiscordPatch({discordId:'invalid'},auth).error,/invalid/)
  assert.match(verifiedDiscordPatch({discordUsername:'unverified'},auth).error,/invalid/)
})
test('user supplied display name cannot impersonate issuer provided identity',()=>{
  const auth={discord_user_id:id, discord_username:'issuer-verified'}
  const r=verifiedDiscordPatch({discordId:id, discordUsername:'fake',discordAvatarUrl:'https://evil.invalid/p.png'},auth)
  assert.equal(r.patch.discordId,id)
  assert.equal(r.patch.discordUsername,'issuer-verified')
  assert.equal(r.patch.discordAvatarUrl,null)
  assert.ok(Number.isFinite(Date.parse(r.patch.linkedAt)))
})
test('unlink clears Discord metadata without requiring Cyoria Auth',()=>{
  const r=verifiedDiscordPatch({discordId:null},null)
  assert.equal(r.patch.discordId,null)
  assert.ok(Object.values(r.patch).every(value=>value===null))
})
