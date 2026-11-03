'use strict'
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const read = name => fs.readFileSync(name, 'utf8')
test('no automatic VoxelX heartbeat registration or module', () => {
  assert.doesNotMatch(read('electron/main.cjs'), /startHeartbeat\s*\(/)
  assert.equal(fs.existsSync('electron/heartbeat.cjs'), false)
})
test('offline Minecraft accounts never contact external account sync', () => {
  assert.doesNotMatch(read('src/hooks/useAccounts.jsx'), /voxelx\.io\.vn|syncWithWebApi|register-app/)
  assert.match(read('src/hooks/useAccounts.jsx'), /offlineUUID\(account.username\)/)
})
test('game launch never silently injects VoxelXMods', () => {
  assert.equal(fs.existsSync('electron/launcher/voxelxMods.cjs'), false)
  assert.doesNotMatch(read('electron/launcher/ipcHandlers.cjs'), /ensureVoxelXMods\s*\(/)
  assert.doesNotMatch(read('electron/launcher/ipcHandlers.cjs'), /hostname:\s*['"]voxelx\.io\.vn/)
})
test('legacy friends and virtual LAN relays are unavailable rather than leaking identity', () => {
  assert.doesNotMatch(read('src/components/friends/FriendsPanel.jsx'), /voxelx\.io\.vn/)
  assert.doesNotMatch(read('electron/wireguard.cjs'), /voxelx\.io\.vn|https\.request/)
  assert.doesNotMatch(read('src/components/LanShareWindow.jsx'), /voxelx\.io\.vn/)
  assert.doesNotMatch(read('src/components/TitleBar.jsx'), /voxelx\.io\.vn/)
})
test('skin save does not transmit legacy web token', () => {
  assert.doesNotMatch(read('src/components/account/SkinCustomizeModal.jsx'), /uploadSkinToWeb\s*\(/)
  assert.doesNotMatch(read('src/components/account/SkinCustomizeModal.jsx'), /vxc_auth_token/)
})
