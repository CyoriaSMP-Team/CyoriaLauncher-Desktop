'use strict'
const {createHash} = require('node:crypto')
const NAME = /^[a-zA-Z0-9_]{3,16}$/
function offlineMinecraftUUID(username) {
  const hash = createHash('md5').update(`OfflinePlayer:${username}`, 'utf8').digest()
  hash[6] = (hash[6] & 0x0f) | 0x30
  hash[8] = (hash[8] & 0x3f) | 0x80
  const h = hash.toString('hex')
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`
}
function validateNewOfflineAccount(input) {
  if (!input || typeof input !== 'object') return {error:'Invalid account data'}
  if (input.type !== 'offline') return {error:'Microsoft accounts must use Microsoft sign-in. Discord-only accounts cannot be created.'}
  if (typeof input.username !== 'string' || !NAME.test(input.username)) return {error:'Player name must contain 3–16 letters, numbers or underscores'}
  const uuid = offlineMinecraftUUID(input.username)
  if (input.uuid !== uuid || input.id !== uuid) return {error:'Offline Minecraft UUID does not match username'}
  // Discard any renderer-supplied linked Discord identity or Microsoft tokens.
  return {account:{type:'offline',username:input.username,id:uuid,uuid,createdAt:new Date().toISOString()}}
}
module.exports = {offlineMinecraftUUID,validateNewOfflineAccount}
