/**
 * VoxelXLauncher — Minecraft Launcher
 * Created by FoxStudio. AI-assisted development.
 *
 * Source code : https://github.com/foxstudio-201/VoxelXLauncher
 * Website     : https://voxxelxclient.vercel.app
 *
 * NOTICE:
 *   - This software is provided as-is without warranty of any kind.
 *   - Do not redistribute or resell without explicit permission from FoxStudio.
 *   - If you use or reference this code, please credit FoxStudio.
 *   - Minecraft is a trademark of Mojang Studios / Microsoft. This project is not affiliated with Mojang.
 */

 /**
 * VoxelXLauncher — Minecraft Launcher
 * Created by FoxStudio. AI-assisted development.
 *
 * Source code : https://github.com/foxstudio-201/VoxelXLauncher
 * Website     : https://voxelxclient.vercel.app
 *
 * NOTICE:
 *   - Dành cho mấy cháu cứ thích phỉ báng.
 *   - Launcher sử dụng ai đi kèm trong việc tạo, bản thân người tạo không tự nhận là code toàn bộ do có sự hỗ trợ của ai.
 *   - Giỏi giang thì tự code bằng năng lực của mình đang video làm toàn bộ từ đầu đến cuối, còn không làm được đừng có kích đểu ảnh hưởng đến người sử dụng.
 *   - Bạn chẳng phải là anh hùng mặc áo choàng đỏ mặc quần xịt như thằng trẻ trâu rồi lên mạng ra vẻ ta đây là người tốt, là anh hùng, là người bảo vệ công lý gì đâu :).
 *   - Vậy nên bớt ảo tưởng đi.
 *   - Nếu có sử dụng hoặc tham khảo code này, hãy ghi công cho FoxStudio.
 *   - Minecraft là một thương hiệu của Mojang Studios / Microsoft. Dự án này không liên kết với Mojang.
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { offlineUUID } from '../utils/offlineUUID'

const isElectron = typeof window !== 'undefined' && window.electronAPI

const WEB_API = 'https://www.voxelx.io.vn/api/auth'

// ── Đồng bộ tài khoản với web API ────────────────────────────────────────────
// Trả về { uuid, skinUrl, skinType, capeUrl, conflict }
async function syncWithWebApi(username, localUuid) {
  try {
    // 1. Kiểm tra username đã tồn tại trên web chưa
    const lookupRes = await fetch(`${WEB_API}?action=lookup&username=${encodeURIComponent(username)}`)
    if (lookupRes.ok) {
      const data = await lookupRes.json()
      // Username đã có trên web → dùng UUID từ web
      return {
        uuid: data.uuid,
        skinUrl: data.skinUrl || null,
        skinType: data.skinType || 'wide',
        capeUrl: data.capeUrl || null,
        conflict: false,
        fromWeb: true,
      }
    }

    // 2. Chưa có → đăng ký lên web với UUID từ app
    const regRes = await fetch(`${WEB_API}?action=register-app`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, uuid: localUuid }),
    })
    const regData = await regRes.json()

    if (regRes.status === 409 && regData.conflict) {
      // Race condition — username vừa được tạo bởi người khác
      return {
        uuid: regData.uuid,
        skinUrl: regData.skinUrl || null,
        skinType: regData.skinType || 'wide',
        capeUrl: regData.capeUrl || null,
        conflict: true,
        fromWeb: true,
      }
    }

    if (!regRes.ok) {
      // Lỗi khác — dùng UUID local
      console.warn('[useAccounts] Web sync failed:', regData.error)
      return { uuid: localUuid, skinUrl: null, skinType: 'wide', capeUrl: null, fromWeb: false }
    }

    return { uuid: regData.uuid || localUuid, skinUrl: null, skinType: 'wide', capeUrl: null, fromWeb: true }
  } catch (err) {
    // Offline hoặc lỗi mạng — dùng UUID local
    console.warn('[useAccounts] Web sync error (offline?):', err.message)
    return { uuid: localUuid, skinUrl: null, skinType: 'wide', capeUrl: null, fromWeb: false }
  }
}

const localFallback = {
  get: () => {
    try { return JSON.parse(localStorage.getItem('vxc_accounts') || '{"accounts":[],"selectedId":null}') }
    catch { return { accounts: [], selectedId: null } }
  },
  set: (data) => localStorage.setItem('vxc_accounts', JSON.stringify(data)),
}

export const AccountsContext = createContext(null)

export function AccountsProvider({ children }) {
  const [accounts, setAccounts]     = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    async function load() {
      const data = isElectron
        ? await window.electronAPI.getAccounts()
        : localFallback.get()
      setAccounts(data.accounts)
      setSelectedId(data.selectedId)
      setLoading(false)
    }
    load()
  }, [])

  const addAccount = useCallback(async (account) => {

    if (account._msAlreadySaved) {
      const data = isElectron
        ? await window.electronAPI.getAccounts()
        : localFallback.get()
      setAccounts(data.accounts)
      setSelectedId(data.selectedId)
      return { ok: true, data }
    }

    // Tính UUID local trước (offline UUID chuẩn Minecraft)
    const localUuid = ['offline', 'discord'].includes(account.type)
      ? offlineUUID(account.username)
      : crypto.randomUUID()

    let finalUuid = localUuid
    let webSkinUrl = null
    let webSkinType = 'wide'
    let webCapeUrl = null

    // Đồng bộ với web API cho offline/discord accounts
    if (['offline', 'discord'].includes(account.type)) {
      const sync = await syncWithWebApi(account.username, localUuid)

      if (sync.conflict) {
        // Username đã tồn tại trên web với UUID khác → báo lỗi
        return { error: `Tên "${account.username}" đã được sử dụng trên hệ thống VoxelXLauncher` }
      }

      finalUuid = sync.uuid
      // Ưu tiên skin/cape từ web nếu có
      webSkinUrl  = sync.skinUrl  || null
      webSkinType = sync.skinType || 'wide'
      webCapeUrl  = sync.capeUrl  || null
    }

    const newAccount = {
      id: finalUuid,
      uuid: finalUuid,
      createdAt: new Date().toISOString(),
      ...account,
      // Ghi đè skin/cape từ web nếu có
      ...(webSkinUrl  ? { webSkinUrl }  : {}),
      ...(webCapeUrl  ? { webCapeUrl }  : {}),
      webSkinType,
    }

    let result
    if (isElectron) {
      result = await window.electronAPI.addAccount(newAccount)
    } else {
      const data = localFallback.get()
      const exists = data.accounts.find(a => a.username === newAccount.username && a.type === newAccount.type)
      if (exists) return { error: 'Account already exists' }
      data.accounts.push(newAccount)
      if (!data.selectedId) data.selectedId = newAccount.id
      localFallback.set(data)
      result = { ok: true, data }
    }
    if (result.error) return result
    setAccounts(result.data.accounts)
    setSelectedId(result.data.selectedId)
    return result
  }, [])

  const updateAccount = useCallback(async (id, patch) => {
    let result
    if (isElectron) {
      result = await window.electronAPI.updateAccount(id, patch)
    } else {
      const data = localFallback.get()
      const idx = data.accounts.findIndex(a => a.id === id)
      if (idx === -1) return { error: 'Account not found' }
      data.accounts[idx] = { ...data.accounts[idx], ...patch }
      localFallback.set(data)
      result = { ok: true, data }
    }
    if (result.error) return result
    setAccounts(result.data.accounts)
    return result
  }, [])

  const removeAccount = useCallback(async (id) => {
    let result
    if (isElectron) {
      result = await window.electronAPI.removeAccount(id)
    } else {
      const data = localFallback.get()
      data.accounts = data.accounts.filter(a => a.id !== id)
      if (data.selectedId === id) data.selectedId = data.accounts[0]?.id ?? null
      localFallback.set(data)
      result = { ok: true, data }
    }
    setAccounts(result.data.accounts)
    setSelectedId(result.data.selectedId)
  }, [])

  const selectAccount = useCallback(async (id) => {
    let result
    if (isElectron) {
      result = await window.electronAPI.selectAccount(id)
    } else {
      const data = localFallback.get()
      data.selectedId = id
      localFallback.set(data)
      result = { ok: true, data }
    }
    setSelectedId(result.data.selectedId)
  }, [])

  const selectedAccount = accounts.find(a => a.id === selectedId) ?? null

  return (
    <AccountsContext.Provider value={{
      accounts, selectedId, selectedAccount, loading,
      addAccount, updateAccount, removeAccount, selectAccount,
    }}>
      {children}
    </AccountsContext.Provider>
  )
}

export function useAccounts() {
  const ctx = useContext(AccountsContext)
  if (!ctx) throw new Error('useAccounts must be used inside AccountsProvider')
  return ctx
}


