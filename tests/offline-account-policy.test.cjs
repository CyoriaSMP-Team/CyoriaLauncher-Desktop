'use strict'
const {test}=require('node:test')
const assert=require('node:assert/strict')
const {offlineMinecraftUUID,validateNewOfflineAccount}=require('../electron/offlineAccountPolicy.cjs')
test('new offline Minecraft account keeps deterministic player UUID',async()=>{
  const {offlineUUID}=await import('../src/utils/offlineUUID.js')
  for(const name of ['Steve','Alex','NamKrub_123'])assert.equal(offlineMinecraftUUID(name),offlineUUID(name))
})
test('direct account add accepts canonical offline identity and strips extra credentials',()=>{
  const uuid=offlineMinecraftUUID('Steve')
  const result=validateNewOfflineAccount({type:'offline',username:'Steve',id:uuid,uuid,discordId:'123456789012345678',msRefreshToken:'fake'})
  assert.equal(result.account.id,uuid)
  assert.equal(result.account.discordId,undefined)
  assert.equal(result.account.msRefreshToken,undefined)
})
test('new Microsoft/Discord account spoofing is rejected',()=>{
  const uuid=offlineMinecraftUUID('Steve')
  for(const type of ['microsoft','discord','cyoria'])assert.match(validateNewOfflineAccount({type,username:'Steve',id:uuid,uuid}).error,/Microsoft accounts/)
})
test('rejects mismatched UUID, invalid name and ID overrides',()=>{
  const uuid=offlineMinecraftUUID('Steve')
  assert.match(validateNewOfflineAccount({type:'offline',username:'Steve',uuid,id:'fake'}).error,/does not match/)
  assert.match(validateNewOfflineAccount({type:'offline',username:'Steve',uuid:'fake',id:uuid}).error,/does not match/)
  assert.match(validateNewOfflineAccount({type:'offline',username:'bad name',uuid,id:uuid}).error,/Player name/)
})
