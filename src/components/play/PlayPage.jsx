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
 * Website     : https://voxxelxclient.vercel.app
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

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '../../hooks/useToast'
import { useLang } from '../../i18n/LangProvider'
import ProfileCard from './ProfileCard'
import CreateProfileModal from './CreateProfileModal'
import ImportProfileModal from './ImportProfileModal'

import vanillaIcon   from '../../assets/loader/vanilla.png'
import fabricIcon    from '../../assets/loader/fabric.png'
import forgeIcon     from '../../assets/loader/forge.png'
import neoforgeIcon  from '../../assets/loader/neoforge.png'

const LOADER_FILTERS = (t) => [
  { id: 'all',      label: t('playpage.filters.all'),      icon: null },
  { id: 'vanilla',  label: t('playpage.filters.vanilla'),  icon: vanillaIcon,  color: '#38bdf8' },
  { id: 'fabric',   label: t('playpage.filters.fabric'),   icon: fabricIcon,   color: '#a855f7' },
  { id: 'forge',    label: t('playpage.filters.forge'),    icon: forgeIcon,    color: '#f97316' },
  { id: 'neoforge', label: t('playpage.filters.neoforge'), icon: neoforgeIcon, color: '#f43f5e' },
  { id: 'modpack',  label: t('playpage.filters.modpack'),  icon: null,         color: '#3b82f6' },
]

function SplashLogoInline({ size = 64, label }) {
  const s = size / 4.5
  const d1 = size * 0.14
  const d2 = size * 0.30
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-sky-500/15 rounded-full blur-2xl" style={{ width: size * 0.8, height: size * 0.8, animation: 'play-logo-glow 3s ease-in-out infinite' }} />
        </div>
        {}
        <div className="absolute rounded-lg" style={{ width: s, height: s, background: '#38bdf8', boxShadow: '0 0 10px #38bdf899', animation: 'play-logo-tl 3s ease-in-out 0s infinite' }} />
        <div className="absolute rounded-lg" style={{ width: s, height: s, background: '#0284c7', boxShadow: '0 0 10px #0284c799', animation: 'play-logo-tr 3s ease-in-out 0.06s infinite' }} />
        <div className="absolute rounded-lg" style={{ width: s, height: s, background: '#0284c7', boxShadow: '0 0 10px #0284c799', animation: 'play-logo-bl 3s ease-in-out 0.12s infinite' }} />
        <div className="absolute rounded-lg" style={{ width: s, height: s, background: '#38bdf8', boxShadow: '0 0 10px #38bdf899', animation: 'play-logo-br 3s ease-in-out 0.18s infinite' }} />
      </div>
      {label && <p className="text-[11px] text-white/30 font-medium">{label}</p>}
      <style>{`
        @keyframes play-logo-tl {
          0%,100% { transform: translate(-${d1}px,-${d1}px) rotate(0deg)   scale(1);   opacity:.9; }
          15%     { transform: translate(-${d2}px,-${d2}px) rotate(0deg)   scale(1.1); opacity:1;  }
          50%     { transform: translate(-${d2}px,-${d2}px) rotate(360deg) scale(1.1); opacity:1;  }
          65%     { transform: translate(-${d1}px,-${d1}px) rotate(360deg) scale(1);   opacity:.9; }
        }
        @keyframes play-logo-tr {
          0%,100% { transform: translate( ${d1}px,-${d1}px) rotate(0deg)   scale(1);   opacity:.9; }
          15%     { transform: translate( ${d2}px,-${d2}px) rotate(0deg)   scale(1.1); opacity:1;  }
          50%     { transform: translate( ${d2}px,-${d2}px) rotate(360deg) scale(1.1); opacity:1;  }
          65%     { transform: translate( ${d1}px,-${d1}px) rotate(360deg) scale(1);   opacity:.9; }
        }
        @keyframes play-logo-bl {
          0%,100% { transform: translate(-${d1}px, ${d1}px) rotate(0deg)   scale(1);   opacity:.9; }
          15%     { transform: translate(-${d2}px, ${d2}px) rotate(0deg)   scale(1.1); opacity:1;  }
          50%     { transform: translate(-${d2}px, ${d2}px) rotate(360deg) scale(1.1); opacity:1;  }
          65%     { transform: translate(-${d1}px, ${d1}px) rotate(360deg) scale(1);   opacity:.9; }
        }
        @keyframes play-logo-br {
          0%,100% { transform: translate( ${d1}px, ${d1}px) rotate(0deg)   scale(1);   opacity:.9; }
          15%     { transform: translate( ${d2}px, ${d2}px) rotate(0deg)   scale(1.1); opacity:1;  }
          50%     { transform: translate( ${d2}px, ${d2}px) rotate(360deg) scale(1.1); opacity:1;  }
          65%     { transform: translate( ${d1}px, ${d1}px) rotate(360deg) scale(1);   opacity:.9; }
        }
        @keyframes play-logo-glow {
          0%,100% { opacity:0.2; transform:scale(1);   }
          15%     { opacity:0.6; transform:scale(1.5); }
          50%     { opacity:0.6; transform:scale(1.5); }
          65%     { opacity:0.2; transform:scale(1);   }
        }
      `}</style>
    </div>
  )
}

const LS_KEY = 'vxc_profiles'

function lsRead() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : { profiles: [], selectedProfileId: null }
  } catch {
    return { profiles: [], selectedProfileId: null }
  }
}

function lsWrite(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)) } catch {}
}

const isElectron = typeof window !== 'undefined' && window.electronAPI

async function apiGetProfiles() {
  if (isElectron) return window.electronAPI.getProfiles()
  return lsRead()
}

async function apiCreateProfile(profileData) {
  if (isElectron) return window.electronAPI.createProfile(profileData)
  const data = lsRead()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const loaderLabel = profileData.loader.charAt(0).toUpperCase() + profileData.loader.slice(1)
  const name = (profileData.name && profileData.name.trim())
    ? profileData.name.trim()
    : `${loaderLabel} ${profileData.gameVersion}`
  const profile = {
    id, name,
    loader:        profileData.loader,
    gameVersion:   profileData.gameVersion,
    loaderVersion: profileData.loaderVersion || '',
    instancePath:  profileData.instancePath || `instances/${id}`,
    isCustomPath:  !!(profileData.instancePath && profileData.instancePath.trim()),
    createdAt:     now,
    lastPlayed:    null,
    sizeBytes:     0,
  }
  data.profiles.push(profile)
  if (!data.selectedProfileId) data.selectedProfileId = id
  lsWrite(data)
  return { ok: true, profile, data }
}

async function apiDeleteProfile(id) {
  if (isElectron) return window.electronAPI.deleteProfile(id)
  const data = lsRead()
  data.profiles = data.profiles.filter(p => p.id !== id)
  if (data.selectedProfileId === id) data.selectedProfileId = data.profiles[0]?.id ?? null
  lsWrite(data)
  return { ok: true, data }
}

async function apiSelectProfile(id) {
  if (isElectron) return window.electronAPI.selectProfile(id)
  const data = lsRead()
  data.selectedProfileId = id
  lsWrite(data)
  return { ok: true, data }
}

function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0, val = bytes
  while (val >= 1024 && i < units.length - 1) { val /= 1024; i++ }
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

const LOADER_ICONS_MAP = {
  vanilla:  vanillaIcon,
  fabric:   fabricIcon,
  forge:    forgeIcon,
  neoforge: neoforgeIcon,
}

function GroupCard({ group, onOpen, onDelete, t }) {
  const previewProfiles = (group.profiles || []).slice(0, 4)
  const placeholders = Array(Math.max(0, 4 - previewProfiles.length)).fill(null)

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 bg-[#0a0c0f] transition-all duration-200 cursor-pointer group"
      onClick={() => onOpen(group.id)}
    >
      {}
      <div className="grid grid-cols-2 gap-0.5 p-3 pb-2">
        {previewProfiles.map(p => {

          const icon = p.importIconUrl || LOADER_ICONS_MAP[p.loader] || null
          const isLoaderIcon = !p.importIconUrl && !!icon
          return (
            <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/5 flex items-center justify-center">
              {icon
                ? <img
                    src={icon}
                    alt={p.name}
                    className={isLoaderIcon ? 'w-1/2 h-1/2 object-contain' : 'w-full h-full object-cover'}
                    draggable={false}
                  />
                : <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white/20">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                  </svg>
              }
            </div>
          )
        })}
        {placeholders.map((_, i) => (
          <div key={`ph-${i}`} className="aspect-square rounded-lg bg-white/3 border border-white/5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white/10">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </div>
        ))}
      </div>

      {}
      <div className="flex items-center gap-2 px-3 pb-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-white truncate">{group.name}</p>
          <p className="text-[10px] text-white/35 mt-0.5">
            {group.profileCount} {t ? t('playpage.group.profiles') : 'profiles'} · {formatSize(group.totalSize)}
          </p>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(group.id) }}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
          title={t ? t('playpage.card.deleteGroup') : 'Delete group'}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

function CreateGroupModal({ onClose, onCreate, t }) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try { await onCreate(name.trim()) }
    finally { setSubmitting(false) }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <h2 className="text-base font-bold text-white">{t ? t('playpage.modal.createGroupTitle') : 'Create new group'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-white/30 hover:text-white hover:bg-white/8 transition-all">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 pb-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">{t ? t('playpage.modal.groupName') : 'Group name'}</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t ? t('playpage.modal.groupNamePlaceholder') : 'Enter group name...'}
              maxLength={64}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/8 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/8 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/8 border border-white/5 transition-all">
              {t ? t('playpage.modal.cancel') : 'Cancel'}
            </button>
            <button type="submit" disabled={!name.trim() || submitting}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-500 hover:bg-blue-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {submitting ? (t ? t('playpage.modal.creating') : 'Creating...') : (t ? t('playpage.modal.createGroup') : 'Create group')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function GroupDetailView({ group, selectedProfileId, deleteConfirm, onBack, onSelect, onDelete, onCancelDelete, onRemoveFromGroup, t }) {
  return (
    <div className="flex flex-col h-full">
      {}
      <div className="flex-shrink-0 flex items-center gap-3 px-6 pt-4 pb-3">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          {t ? t('playpage.group.allGroups') : 'All groups'}
        </button>
        <span className="text-white/15">·</span>
        <span className="text-sm font-bold text-white">{group.name}</span>
        <span className="text-xs text-white/30">({group.profileCount} {t ? t('playpage.group.profiles') : 'profiles'})</span>
      </div>
      <div className="border-t border-white/5 flex-shrink-0" />

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {group.profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white/15">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </div>
            <p className="text-sm text-white/30">{t ? t('playpage.empty.noProfilesInGroup') : 'This group has no profiles yet'}</p>
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {group.profiles.map(profile => (
              <div key={profile.id} className="relative">
                <ProfileCard
                  profile={profile}
                  isSelected={profile.id === selectedProfileId}
                  confirmDelete={deleteConfirm === profile.id}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onCancelDelete={onCancelDelete}
                />
                <button
                  onClick={() => onRemoveFromGroup(group.id, profile.id)}
                  className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] text-white/50 hover:text-white/80 hover:bg-black/80 transition-all"
                  title={t ? t('playpage.group.removeFromGroup') : 'Remove from group'}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                  {t ? t('playpage.group.removeFromGroup') : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PlayPage() {
  const { t } = useLang()
  const toast = useToast()
  const [profiles, setProfiles]                   = useState([])
  const [selectedProfileId, setSelectedProfileId] = useState(null)
  const [groups, setGroups]                       = useState([])
  const [loading, setLoading]                     = useState(true)
  const [showCreate, setShowCreate]               = useState(false)
  const [showImport, setShowImport]               = useState(false)
  const [showDropdown, setShowDropdown]           = useState(false)
  const [showCreateGroup, setShowCreateGroup]     = useState(false)
  const [deleteConfirm, setDeleteConfirm]         = useState(null)
  const [activeTab, setActiveTab]                 = useState('profiles')
  const [loaderFilter, setLoaderFilter]           = useState('all')
  const [selectedGroupId, setSelectedGroupId]     = useState(null)
  const dropdownRef                               = useRef(null)

  const loadProfiles = useCallback(async () => {
    setLoading(true)
    try {
      const [profileData, groupData] = await Promise.all([
        apiGetProfiles(),
        isElectron ? window.electronAPI.getGroups() : { groups: [] },
      ])
      setProfiles(profileData.profiles || [])
      setSelectedProfileId(profileData.selectedProfileId || null)
      setGroups(groupData.groups || [])
    } catch {
      setProfiles([])
      setGroups([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProfiles() }, [loadProfiles])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  async function handleSelect(id) {
    if (id === selectedProfileId) return
    const result = await apiSelectProfile(id)
    if (result?.error) {
      toast({ type: 'error', title: t('playpage.toast.errorSelecting'), message: result.error })
      return
    }
    setSelectedProfileId(id)
    const p = profiles.find(x => x.id === id)
    toast({ type: 'success', title: t('playpage.toast.profileSelected'), message: p?.name })
  }

  async function handleDelete(id) {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(prev => prev === id ? null : prev), 3000)
      return
    }
    const p = profiles.find(x => x.id === id)
    const result = await apiDeleteProfile(id)
    if (result?.error) {
      toast({ type: 'error', title: t('playpage.toast.errorDeleting'), message: result.error })
      return
    }
    setDeleteConfirm(null)
    setProfiles(result.data.profiles || [])
    setSelectedProfileId(result.data.selectedProfileId || null)

    if (isElectron) {
      const gd = await window.electronAPI.getGroups()
      setGroups(gd.groups || [])
    }
    toast({ type: 'info', title: t('playpage.toast.profileDeleted'), message: p?.name })
  }

  async function handleCreate(profileData) {
    const result = await apiCreateProfile(profileData)
    if (result?.error) {
      toast({ type: 'error', title: t('playpage.toast.errorCreatingProfile'), message: result.error })
      return result
    }
    setProfiles(result.data.profiles || [])
    setSelectedProfileId(result.data.selectedProfileId || null)

    if (profileData.groupId && isElectron) {
      await window.electronAPI.addProfileToGroup(profileData.groupId, result.profile.id)
      const gd = await window.electronAPI.getGroups()
      setGroups(gd.groups || [])
    }
    setShowCreate(false)
    toast({ type: 'success', title: t('playpage.toast.profileCreated'), message: result.profile?.name })
    return result
  }

  async function handleCreateForImport(profileData) {
    const result = await apiCreateProfile(profileData)
    if (result?.error) {
      toast({ type: 'error', title: t('playpage.toast.errorCreatingProfile'), message: result.error })
      return result
    }
    setProfiles(result.data.profiles || [])
    setSelectedProfileId(result.data.selectedProfileId || null)
    if (profileData.groupId && isElectron) {
      await window.electronAPI.addProfileToGroup(profileData.groupId, result.profile.id)
      const gd = await window.electronAPI.getGroups()
      setGroups(gd.groups || [])
    }
    return result
  }

  function handleImportClose() {
    setShowImport(false)
    loadProfiles()
  }

  async function handleCreateGroup(name) {
    if (!isElectron) return
    const result = await window.electronAPI.createGroup({ name })
    if (result?.error) {
      toast({ type: 'error', title: t('playpage.toast.errorCreatingGroup'), message: result.error })
      return
    }
    const gd = await window.electronAPI.getGroups()
    setGroups(gd.groups || [])
    setShowCreateGroup(false)
    toast({ type: 'success', title: t('playpage.toast.groupCreated'), message: name })
  }

  async function handleDeleteGroup(id) {
    if (!isElectron) return
    const g = groups.find(x => x.id === id)
    const result = await window.electronAPI.deleteGroup(id)
    if (result?.error) {
      toast({ type: 'error', title: t('playpage.toast.errorDeletingGroup'), message: result.error })
      return
    }
    setGroups(prev => prev.filter(x => x.id !== id))
    if (selectedGroupId === id) setSelectedGroupId(null)
    toast({ type: 'info', title: t('playpage.toast.groupDeleted'), message: g?.name })
  }

  async function handleRemoveFromGroup(groupId, profileId) {
    if (!isElectron) return
    await window.electronAPI.removeProfileFromGroup(groupId, profileId)
    const gd = await window.electronAPI.getGroups()
    setGroups(gd.groups || [])
  }

  const filteredProfiles = profiles.filter(p => {
    if (loaderFilter === 'all') return true
    if (loaderFilter === 'modpack') return !!p.importSource
    return p.loader === loaderFilter
  })

  const selectedGroup = groups.find(g => g.id === selectedGroupId) || null

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {}
      <div className="flex-shrink-0 flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-2">
          {}
          <button
            onClick={() => { setActiveTab('profiles'); setSelectedGroupId(null) }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'profiles'
                ? 'bg-white/12 text-white border border-white/12'
                : 'text-white/40 hover:text-white/70 hover:bg-white/6'
            }`}
          >
            {t('playpage.tabs.allProfiles')}
          </button>
          <button
            onClick={() => { setActiveTab('groups'); setSelectedGroupId(null) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'groups'
                ? 'bg-white/12 text-white border border-white/12'
                : 'text-white/40 hover:text-white/70 hover:bg-white/6'
            }`}
          >
            {t('playpage.tabs.groups')}
            {groups.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-white/50 min-w-[20px] text-center">{groups.length}</span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {}
          {activeTab === 'groups' && !selectedGroupId && (
            <button
              onClick={() => setShowCreateGroup(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 text-xs font-semibold border border-blue-500/20 transition-all"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              {t('playpage.buttons.newGroup')}
            </button>
          )}
          {}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(v => !v)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all duration-150 active:scale-95 shadow-lg shadow-sky-500/20"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              {t('playpage.buttons.create')}
              <svg viewBox="0 0 24 24" fill="currentColor" className={`w-3 h-3 transition-transform duration-150 ${showDropdown ? 'rotate-180' : ''}`}>
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-50">
                <button
                  onClick={() => { setShowCreate(true); setShowDropdown(false) }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-all"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-sky-400">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  {t('playpage.buttons.newProfile')}
                </button>
                <div className="h-px bg-white/5 mx-2" />
                <button
                  onClick={() => { setShowImport(true); setShowDropdown(false) }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-all"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-blue-400">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                  </svg>
                  {t('playpage.buttons.importProfile')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      {activeTab === 'profiles' && (
        <div className="flex-shrink-0 flex items-center gap-2 px-6 pb-3 flex-wrap">
          {LOADER_FILTERS(t).map(f => {
            const isActive = loaderFilter === f.id
            return (
              <button
                key={f.id}
                onClick={() => setLoaderFilter(f.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                  isActive
                    ? 'bg-white/10 border-white/15 text-white'
                    : 'border-transparent text-white/40 hover:text-white/65 hover:bg-white/6'
                }`}
              >
                {f.icon
                  ? <img src={f.icon} alt={f.label} className="w-4 h-4 object-contain" />
                  : f.id === 'modpack'
                    ?
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" style={{ color: isActive ? f.color : 'rgba(255,255,255,0.4)' }}>
                        <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18s-.41-.06-.57-.18l-7.9-4.44A1 1 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18s.41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9M12 4.15L6.04 7.5 12 10.85l5.96-3.35L12 4.15M5 15.91l6 3.38v-6.71L5 9.21v6.7m14 0v-6.7l-6 3.37v6.71l6-3.38z"/>
                      </svg>
                    : <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white/40">
                        <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                      </svg>
                }
                <span style={isActive && f.color ? { color: f.color } : {}}>{f.label}</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="border-t border-white/5 flex-shrink-0" />

      {}
      {activeTab === 'groups' && selectedGroup ? (

        <GroupDetailView
          group={selectedGroup}
          selectedProfileId={selectedProfileId}
          deleteConfirm={deleteConfirm}
          onBack={() => setSelectedGroupId(null)}
          onSelect={handleSelect}
          onDelete={handleDelete}
          onCancelDelete={() => setDeleteConfirm(null)}
          onRemoveFromGroup={handleRemoveFromGroup}
          t={t}
        />
      ) : activeTab === 'groups' ? (

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <SplashLogoInline size={64} label={t('playpage.loading.loading')} />
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white/15">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-white/30 font-medium">{t('playpage.empty.noGroups')}</p>
                <p className="text-xs text-white/15 mt-0.5">{t('playpage.empty.noGroupsHint')}</p>
              </div>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="px-4 py-2 rounded-xl bg-blue-500/15 text-blue-400 text-xs font-semibold border border-blue-500/20 hover:bg-blue-500/25 transition-all"
              >
                {t('playpage.empty.createFirstGroup')}
              </button>
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {groups.map(group => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onOpen={id => setSelectedGroupId(id)}
                  onDelete={handleDeleteGroup}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      ) : (

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <SplashLogoInline size={64} label={t('playpage.loading.loadingProfile')} />
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white/15">
                  <path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.06 15.94 0 13.36 0c-1.46 0-2.75.67-3.6 1.72L9 3 8.24 1.72C7.39.67 6.1 0 4.64 0 2.06 0 0 2.06 0 4.64c0 .48.11.92.18 1.36H0v2h20V6zM0 8v14h20V8H0z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-white/30 font-medium">
                  {profiles.length === 0 ? t('playpage.empty.noProfiles') : t('playpage.empty.noProfilesMatch')}
                </p>
                <p className="text-xs text-white/15 mt-0.5">
                  {profiles.length === 0 ? t('playpage.empty.noProfilesHint') : t('playpage.empty.noProfilesMatchHint')}
                </p>
              </div>
              {profiles.length === 0 && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-4 py-2 rounded-xl bg-sky-500/15 text-sky-400 text-xs font-semibold border border-sky-500/20 hover:bg-sky-500/25 transition-all"
                >
                  {t('playpage.empty.createFirstProfile')}
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {filteredProfiles.map(profile => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  isSelected={profile.id === selectedProfileId}
                  confirmDelete={deleteConfirm === profile.id}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                  onCancelDelete={() => setDeleteConfirm(null)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {}
      {showCreate && (
        <CreateProfileModal
          groups={groups}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}

      {}
      {showImport && (
        <ImportProfileModal
          groups={groups}
          onClose={handleImportClose}
          onCreate={handleCreateForImport}
        />
      )}

      {}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onCreate={handleCreateGroup}
          t={t}
        />
      )}
    </div>
  )
}

