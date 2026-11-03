'use strict'
const { test } = require('node:test')
const assert = require('node:assert/strict')
const EventEmitter = require('node:events')
const Module = require('node:module')

let windowInstance = null
class MockBrowserWindow extends EventEmitter {
  constructor(opts) {
    super()
    this.options = opts
    this.webContents = new EventEmitter()
    this.destroyed = false
    windowInstance = this
  }
  setMenuBarVisibility() {}
  isDestroyed() { return this.destroyed }
  close() { if (!this.destroyed) { this.destroyed = true; this.emit('closed') } }
  loadURL(url) {this.url = url; return Promise.resolve()}
}
const originalLoad = Module._load
Module._load = function(request,...args) {
  if (request === 'electron') return { BrowserWindow: MockBrowserWindow }
  return originalLoad.call(this,request,...args)
}
const { loginWithWindow, cancelLogin } = require('../electron/msAuth.cjs')
Module._load = originalLoad

test('Cancel closes the actual Microsoft auth window without storing a token',async()=>{
  const pending = loginWithWindow(null)
  assert.equal(windowInstance.options.webPreferences.webSecurity,true)
  assert.equal(windowInstance.options.webPreferences.sandbox,true)
  assert.equal(cancelLogin(),true)
  await assert.rejects(pending,/cancelled/)
  assert.equal(windowInstance.isDestroyed(),true)
  assert.equal(cancelLogin(),false)
})
test('Microsoft URL prefix impersonation cannot provide an authorization code',async()=>{
  const pending = loginWithWindow(null)
  const malicious='https://login.live.com/oauth20_desktop.srf.evil.invalid/?code=bad&state=ignored'
  let prevented=false
  windowInstance.webContents.emit('will-navigate',{preventDefault(){prevented=true}},malicious)
  assert.equal(prevented,false)
  assert.equal(cancelLogin(),true)
  await assert.rejects(pending,/cancelled/)
})
test('OAuth callback with mismatched state is rejected',async()=>{
  const pending=loginWithWindow(null)
  let prevented=false
  windowInstance.webContents.emit('will-navigate',{preventDefault(){prevented=true}},'https://login.live.com/oauth20_desktop.srf?code=example&state=wrong')
  assert.equal(prevented,true)
  await assert.rejects(pending,/Invalid Microsoft OAuth state/)
})
test('only one Microsoft auth window can run at a time',async()=>{
  const pending=loginWithWindow(null)
  await assert.rejects(loginWithWindow(null),/already open/)
  assert.equal(cancelLogin(),true)
  await assert.rejects(pending,/cancelled/)
})
