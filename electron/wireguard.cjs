'use strict'

const { ipcMain } = require('electron')

// The previous virtual LAN relay depended on VoxelX account servers.
// Keep IPC compatibility but never contact the former service or ask for elevation.
function registerVxLanHandlers(getTrustedWindow) {
  for (const channel of ['vxlan:check','vxlan:create','vxlan:join','vxlan:relaunchAsAdmin','vxlan:leave','vxlan:state']) {
    ipcMain.handle(channel, (event) => {
      if (!getTrustedWindow(event)) return { error: 'Unauthorized' }
      return { error: 'Virtual LAN requires a CyoriaSMP relay backend. The legacy VoxelX service is disabled.' }
    })
  }
}

module.exports = { registerVxLanHandlers }
