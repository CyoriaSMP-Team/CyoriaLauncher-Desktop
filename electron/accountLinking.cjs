'use strict'
// Store verified Discord links independently of Minecraft account type.
// A Microsoft token refresh must never strip optional identity metadata.
const DISCORD_ID = /^\d{17,20}$/
const LINK_FIELDS = ['discordId','discordUsername','discordGlobalName','discordDiscriminator','discordAvatarUrl','linkedAt']
const str = (v,max) => typeof v === 'string' && v.length <= max ? v : null

function sanitizeDiscordLink(account) {
  if (!DISCORD_ID.test(account?.discordId || '')) return {}
  return {
    discordId: account.discordId,
    discordUsername: str(account.discordUsername,100) || account.discordId,
    discordGlobalName: str(account.discordGlobalName,100),
    discordDiscriminator: str(account.discordDiscriminator,10),
    discordAvatarUrl: str(account.discordAvatarUrl,500),
    linkedAt: str(account.linkedAt,50) || null
  }
}

function verifiedDiscordPatch(request, identity) {
  if (!request || typeof request !== 'object' || !Object.hasOwn(request,'discordId'))
    return {error:'Discord link request is invalid'}
  if (request.discordId === null) {
    return {patch:Object.fromEntries(LINK_FIELDS.map(k=>[k,null]))}
  }
  if (typeof request.discordId !== 'string' || !DISCORD_ID.test(request.discordId))
    return {error:'Discord ID is invalid'}
  if (!identity || identity.discord_user_id !== request.discordId)
    return {error:'Discord link requires a verified CyoriaSMP Auth session for this Discord ID'}
  // Never use a username or avatar supplied by the renderer; only issuer claims.
  return {patch:{
    discordId: identity.discord_user_id,
    discordUsername: str(identity.discord_username,100) || identity.discord_user_id,
    discordGlobalName: null,
    discordDiscriminator: null,
    discordAvatarUrl: null,
    linkedAt: new Date().toISOString()
  }}
}
module.exports = { sanitizeDiscordLink, verifiedDiscordPatch }
