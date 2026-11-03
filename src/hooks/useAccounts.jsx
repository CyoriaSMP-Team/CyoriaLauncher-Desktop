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

// Minecraft identities are local unless explicitly authenticated with Microsoft.
// Never silently send offline usernames or UUIDs to a third-party account service.

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

    // Keep the canonical offline UUID stable. Do not let optional Cyoria Auth
    // or an unrelated website override Minecraft profile identity.
    const finalUuid = ['offline', 'discord'].includes(account.type)
      ? offlineUUID(account.username)
      : crypto.randomUUID()

    const newAccount = {
      id: finalUuid,
      uuid: finalUuid,
      createdAt: new Date().toISOString(),
      ...account,
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


