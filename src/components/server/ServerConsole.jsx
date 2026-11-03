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

import { useState, useEffect, useRef, useMemo } from 'react'
import { parseColors, getLineLevel, getLineColor } from './serverColorUtils.jsx'
import ServerFileManager from './ServerFileManager'
import ServerNetworkTab from './ServerNetworkTab'
import ServerPluginModTab from './ServerPluginModTab'
import ServerSettingsTab from './ServerSettingsTab'
import { useLang } from '../../i18n/LangProvider'

const isElectron = typeof window !== 'undefined' && window.electronAPI

const MC_COMMANDS = [
  { cmd: 'stop', descKey: 'stop' },
  { cmd: 'restart', descKey: 'restart' },
  { cmd: 'reload', descKey: 'reload' },
  { cmd: 'save-all', descKey: 'saveAll' },
  { cmd: 'save-on', descKey: 'saveOn' },
  { cmd: 'save-off', descKey: 'saveOff' },
  { cmd: 'kick', descKey: 'kick', args: '<player> [reason]' },
  { cmd: 'ban', descKey: 'ban', args: '<player> [reason]' },
  { cmd: 'ban-ip', descKey: 'banIp', args: '<ip|player>' },
  { cmd: 'pardon', descKey: 'pardon', args: '<player>' },
  { cmd: 'pardon-ip', descKey: 'pardonIp', args: '<ip>' },
  { cmd: 'op', descKey: 'op', args: '<player>' },
  { cmd: 'deop', descKey: 'deop', args: '<player>' },
  { cmd: 'whitelist add', descKey: 'whitelistAdd', args: '<player>' },
  { cmd: 'whitelist remove', descKey: 'whitelistRemove', args: '<player>' },
  { cmd: 'whitelist list', descKey: 'whitelistList' },
  { cmd: 'whitelist on', descKey: 'whitelistOn' },
  { cmd: 'whitelist off', descKey: 'whitelistOff' },
  { cmd: 'whitelist reload', descKey: 'whitelistReload' },
  { cmd: 'list', descKey: 'list' },
  { cmd: 'time set day', descKey: 'timeSetDay' },
  { cmd: 'time set night', descKey: 'timeSetNight' },
  { cmd: 'time set noon', descKey: 'timeSetNoon' },
  { cmd: 'time set midnight', descKey: 'timeSetMidnight' },
  { cmd: 'time add', descKey: 'timeAdd', args: '<ticks>' },
  { cmd: 'weather clear', descKey: 'weatherClear' },
  { cmd: 'weather rain', descKey: 'weatherRain' },
  { cmd: 'weather thunder', descKey: 'weatherThunder' },
  { cmd: 'gamerule', descKey: 'gamerule', args: '<rule> [value]' },
  { cmd: 'difficulty', descKey: 'difficulty', args: '<peaceful|easy|normal|hard>' },
  { cmd: 'gamemode', descKey: 'gamemode', args: '<mode> [player]' },
  { cmd: 'tp', descKey: 'tp', args: '<player> <target|x y z>' },
  { cmd: 'teleport', descKey: 'teleport', args: '<player> <target|x y z>' },
  { cmd: 'give', descKey: 'give', args: '<player> <item> [count]' },
  { cmd: 'clear', descKey: 'clear', args: '[player] [item]' },
  { cmd: 'kill', descKey: 'kill', args: '[player|@a|@e]' },
  { cmd: 'heal', descKey: 'heal', args: '[player]' },
  { cmd: 'effect give', descKey: 'effectGive', args: '<player> <effect> [duration]' },
  { cmd: 'effect clear', descKey: 'effectClear', args: '[player]' },
  { cmd: 'enchant', descKey: 'enchant', args: '<player> <enchantment> [level]' },
  { cmd: 'xp add', descKey: 'xpAdd', args: '<player> <amount>' },
  { cmd: 'xp set', descKey: 'xpSet', args: '<player> <amount>' },
  { cmd: 'seed', descKey: 'seed' },
  { cmd: 'tps', descKey: 'tps' },
  { cmd: 'version', descKey: 'version' },
  { cmd: 'plugins', descKey: 'plugins' },
  { cmd: 'help', descKey: 'help', args: '[command]' },
  { cmd: 'scoreboard', descKey: 'scoreboard' },
  { cmd: 'team', descKey: 'team' },
  { cmd: 'title', descKey: 'title', args: '<player> <title|subtitle|...>' },
  { cmd: 'say', descKey: 'say', args: '<message>' },
  { cmd: 'msg', descKey: 'msg', args: '<player> <message>' },
  { cmd: 'tell', descKey: 'tell', args: '<player> <message>' },
  { cmd: 'broadcast', descKey: 'broadcast', args: '<message>' },
  { cmd: 'execute', descKey: 'execute' },
  { cmd: 'summon', descKey: 'summon', args: '<entity> [x y z]' },
  { cmd: 'setblock', descKey: 'setblock', args: '<x y z> <block>' },
  { cmd: 'fill', descKey: 'fill', args: '<x1 y1 z1> <x2 y2 z2> <block>' },
  { cmd: 'clone', descKey: 'clone', args: '<x1 y1 z1> <x2 y2 z2> <x y z>' },
]

export default function ServerConsole({ server, onBack }) {
  const { t } = useLang()
  const [activeTab, setActiveTab] = useState('console')
  const [logs, setLogs] = useState([])
  const [logFilter, setLogFilter] = useState('ALL')
  const [command, setCommand] = useState('')
  const [status, setStatus] = useState('offline')
  const [autoScroll, setAutoScroll] = useState(true)
  const [dlProgress, setDlProgress] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [folderPath] = useState('')
  const [serverData, setServerData] = useState(server)
  const [tunnelStatus, setTunnelStatus] = useState('idle')
  const [tunnelAddr, setTunnelAddr] = useState(null)
  const [tunnelLog, setTunnelLog] = useState([])
  const [stats, setStats] = useState({ cpu: 0, ramMb: 0, xmxMb: (server?.ramGb || 2) * 1024, rssMb: 0 })

  const statsIntervalRef = useRef(null)
  const logEndRef = useRef(null)
  const unsubsRef = useRef([])

  useEffect(() => {
    setStats(prev => ({ ...prev, xmxMb: (serverData.ramGb || 2) * 1024 }))
  }, [serverData.ramGb])

  const filteredLogs = logFilter === 'ALL' ? logs : logs.filter(line => {
    const level = getLineLevel(line)
    if (logFilter === 'ERROR') return level === 'error'
    if (logFilter === 'WARN') return level === 'warn' || level === 'error'
    if (logFilter === 'INFO') return level === 'info' || level === 'done'
    return true
  })

  useEffect(() => {
    if (!isElectron || !server) return
    window.electronAPI.serverGetStatus(server.id).then(r => { if (r?.ok) setStatus(r.status) })
    window.electronAPI.serverGetLogs(server.id).then(r => { if (r?.ok) setLogs(r.logs || []) })
    const unsubLog = window.electronAPI.onServerLog(data => {
      if (data.serverId !== server.id) return
      setLogs(prev => [...prev.slice(-4999), data.line])
    })
    const unsubStatus = window.electronAPI.onServerStatus(data => {
      if (data.serverId !== server.id) return
      setStatus(data.status)
    })
    const unsubDl = window.electronAPI.onServerDownloadProgress(data => {
      if (data.serverId !== server.id) return
      setDlProgress(data)
      if ((data?.percent ?? 0) >= 100) setDownloading(false)
    })
    const unsubTunnel = window.electronAPI.onServerTunnelLog?.(data => {
      if (data.serverId !== server.id) return
      if (data.status) setTunnelStatus(data.status)
      if (data.addr) setTunnelAddr(data.addr)
      if (data.line) setTunnelLog(prev => [...prev.slice(-199), data.line])
    })
    unsubsRef.current = [unsubLog, unsubStatus, unsubDl, unsubTunnel].filter(Boolean)
    return () => unsubsRef.current.forEach(fn => fn?.())
  }, [server?.id])

  useEffect(() => {
    if (autoScroll && logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [logs, autoScroll])

  useEffect(() => {
    clearInterval(statsIntervalRef.current)
    if (!isElectron || !server || status !== 'online') {
      setStats({ cpu: 0, ramMb: 0, xmxMb: (server?.ramGb || 2) * 1024 })
      return
    }
    const poll = async () => {
      try {
        const r = await window.electronAPI.serverGetStats(server.id)
        if (r?.ok && r.running) {
          setStats({
            cpu: r.cpu ?? 0,
            ramMb: r.ramMb ?? 0,
            xmxMb: r.xmxMb ?? (server.ramGb || 2) * 1024,
            rssMb: r.rssMb ?? 0,
          })
        }
      } catch {
        // Ignore transient stats polling failures.
      }
    }
    poll()
    statsIntervalRef.current = setInterval(poll, 2000)
    return () => clearInterval(statsIntervalRef.current)
  }, [server?.id, status])

  async function handleStart() {
    if (!isElectron) return

    try {
      if (!server.jarFile) {
        setDownloading(true)
        setDlProgress({ percent: 0 })
        setLogs(prev => [...prev, `[Server] ${t('server.console.downloadingJar')}`])

        const r = await window.electronAPI.serverDownloadJar(server.id)

        setDownloading(false)
        setDlProgress(null)

        if (r?.error) {
          setLogs(prev => [...prev, `[ERR] ${r.error}`])
          return
        }

        server.jarFile = r.jarPath?.split(/[\\/]/).pop()
        setLogs(prev => [...prev, `[Server] ${t('server.console.downloadComplete', { file: server.jarFile || 'server.jar' })}`])
      }

      setStatus('starting')
      setLogs(prev => [...prev, `[Server] ${t('server.console.startingServer')}`])

      const startResult = await window.electronAPI.serverStart(server.id)
      if (startResult?.error) {
        setStatus('offline')
        setLogs(prev => [...prev, `[ERR] ${startResult.error}`])
        return
      }

      setDownloading(false)
      setDlProgress(null)
    } catch (err) {
      setDownloading(false)
      setDlProgress(null)
      setStatus('offline')
      setLogs(prev => [...prev, `[ERR] ${err?.message || t('server.console.errorStart')}`])
    }
  }

  async function handleStop() {
    if (!isElectron) return
    window.electronAPI.serverStop(server.id)
  }

  async function handleRestart() {
    if (!isElectron) return
    window.electronAPI.serverRestart(server.id)
  }

  async function handleSendCommand(e) {
    e?.preventDefault()
    if (!command.trim() || !isElectron) return

    const cmd = command.trim().replace(/^\//, '')
    await window.electronAPI.serverSendCommand(server.id, cmd)
    setLogs(prev => [...prev, `> /${cmd}`])
    setCommand('')
  }

  const isRunning = status === 'online' || status === 'starting'
  const statusColor = { online: 'text-sky-400', starting: 'text-yellow-400', offline: 'text-white/30' }[status] || 'text-white/30'
  const statusDot = { online: 'bg-sky-400 animate-pulse', starting: 'bg-yellow-400 animate-pulse', offline: 'bg-white/20' }[status] || 'bg-white/20'

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden border-r border-white/5">
        <div className="flex-shrink-0 flex items-center gap-1 px-3 py-2 border-b border-white/5 bg-black/20">
          <button onClick={onBack} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-all flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          </button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          {[
            { id: 'console', label: t('server.console.tabConsole'), icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> },
            { id: 'files', label: t('server.console.tabFiles'), icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg> },
            { id: 'network', label: t('server.console.tabNetwork'), icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg> },
            { id: 'plugins', label: t('server.console.tabPlugins'), icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7s2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/></svg> },
            { id: 'mods', label: t('server.console.tabMods'), icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> },
            { id: 'settings', label: t('server.console.tabSettings'), icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.id ? 'bg-white/10 text-white' : 'text-white/35 hover:text-white/60 hover:bg-white/5'}`}>
              {tab.icon}{tab.label}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={() => isElectron && window.electronAPI.serverOpenFolder(server.id, activeTab === 'folders' ? folderPath : '')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white/35 hover:text-white/60 hover:bg-white/5 transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            {t('server.console.openFolder')}
          </button>
          {activeTab === 'console' && (
            <>
              <div className="flex items-center gap-0.5">
                {['ALL', 'INFO', 'WARN', 'ERROR'].map(f => (
                  <button key={f} onClick={() => setLogFilter(f)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${logFilter === f ? f === 'ERROR' ? 'bg-red-500/20 text-red-400' : f === 'WARN' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/15 text-white' : 'text-white/25 hover:text-white/50'}`}>
                    {f}
                  </button>
                ))}
              </div>
              <button onClick={() => { navigator.clipboard.writeText(logs.join('\n')).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }) }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${copied ? 'bg-sky-500/15 text-sky-400' : 'text-white/35 hover:text-white/60 hover:bg-white/5'}`}>
                {copied
                  ? <><svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>{t('server.console.copied')}</>
                  : <><svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>{t('server.console.copyLogs')}</>
                }
              </button>
            </>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'console' && (
            <div className="flex flex-col h-full">
              {(downloading || dlProgress) && (
                <div className="flex-shrink-0 px-3 py-2 border-b border-white/5 bg-black/20">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white/50">{t('server.console.downloadingJar')}</span>
                    <span className="font-mono text-white/40">{dlProgress?.percent ?? 0}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400 rounded-full transition-all" style={{ width: `${dlProgress?.percent ?? 0}%` }} />
                  </div>
                </div>
              )}
              <div className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[11px] leading-relaxed bg-[#080808]"
                style={{ scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
                onScroll={e => { const el = e.currentTarget; setAutoScroll(el.scrollTop + el.clientHeight >= el.scrollHeight - 40) }}>
                {filteredLogs.length === 0 ? (
                  <p className="text-white/20 text-center py-8">{isRunning ? t('server.console.starting') : t('server.console.noLog')}</p>
                ) : (
                  filteredLogs.map((line, i) => {
                    const { parts, hasColor } = parseColors(line)
                    const fallbackColor = hasColor ? undefined : getLineColor(line)
                    return (
                      <div key={i} className="break-all py-0.5 leading-relaxed" style={fallbackColor ? { color: fallbackColor } : undefined}>
                        {parts}
                      </div>
                    )
                  })
                )}
                <div ref={logEndRef} />
              </div>
              <form onSubmit={handleSendCommand} className="flex-shrink-0 relative border-t border-white/5 bg-black/30">
                <CommandInput
                  value={command}
                  onChange={setCommand}
                  onSubmit={() => { if (command.trim() && isRunning) { handleSendCommand({ preventDefault: () => {} }) } }}
                  disabled={!isRunning}
                  isRunning={isRunning}
                  autoScroll={autoScroll}
                  onToggleScroll={() => setAutoScroll(v => !v)}
                />
              </form>
            </div>
          )}

          {activeTab === 'files' && <ServerFileManager server={server} />}

          {activeTab === 'network' && (
            <ServerNetworkTab
              server={server}
              tunnelStatus={tunnelStatus}
              setTunnelStatus={setTunnelStatus}
              tunnelAddr={tunnelAddr}
              setTunnelAddr={setTunnelAddr}
              tunnelLog={tunnelLog}
              setTunnelLog={setTunnelLog}
            />
          )}

          {activeTab === 'plugins' && <ServerPluginModTab server={server} projectType="plugin" />}
          {activeTab === 'mods' && <ServerPluginModTab server={server} projectType="mod" />}

          {activeTab === 'settings' && (
            <ServerSettingsTab
              server={serverData}
              onServerUpdated={async () => {
                if (!isElectron) return null
                const r = await window.electronAPI.serverList()
                if (r?.ok) {
                  const updated = r.servers.find(s => s.id === serverData.id)
                  if (updated) {
                    setServerData(updated)
                    return updated
                  }
                }
                return null
              }}
            />
          )}
        </div>
      </div>

      <div className="w-64 flex-shrink-0 flex flex-col overflow-hidden bg-black/15">
        <div className="flex-shrink-0 p-4 border-b border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
              <ServerTypeIcon type={serverData.type} size={48} />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-white/95 truncate">{serverData.name}</p>
              <p className="text-xs text-white/40 capitalize">{serverData.type} {serverData.gameVersion}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusDot}`} />
            <span className={`text-sm font-bold capitalize ${statusColor}`}>
              {status === 'online' ? t('server.console.statusOnline') : status === 'starting' ? t('server.console.statusStarting') : t('server.console.statusOffline')}
            </span>
          </div>

          <IpDisplay tunnelAddr={tunnelAddr} tunnelStatus={tunnelStatus} server={serverData} />

          <div className="flex gap-2 mt-3">
            {!isRunning ? (
              <button onClick={handleStart} disabled={downloading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-50">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M8 5v14l11-7z"/></svg>
                {t('server.console.startBtn')}
              </button>
            ) : (
              <>
                <button onClick={handleStop}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-bold border border-red-500/25 transition-all">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M6 6h12v12H6z"/></svg>
                  {t('server.console.stopBtn')}
                </button>
                <button onClick={handleRestart} title={t('server.console.restartBtn')}
                  className="w-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 border border-white/8 transition-all">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">{t('server.console.ramLabel')}</span>
              <span className="text-xs text-white/60 font-mono font-semibold">{t('server.console.ramMax', { value: serverData.ramGb })}</span>
            </div>
            <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400/60 rounded-full transition-all duration-1000"
                style={{ width: isRunning && stats.ramMb > 0 ? `${Math.min(100, Math.round(stats.ramMb / stats.xmxMb * 100))}%` : '0%' }} />
            </div>
            <p className="text-xs text-white/35 mt-1 font-mono">
              {isRunning && stats.ramMb > 0
                ? `${stats.ramMb} MB / ${stats.xmxMb} MB`
                : isRunning ? t('server.console.measuring') : t('server.console.idle')}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">{t('server.console.cpuLabel')}</span>
              <span className="text-xs text-white/60 font-mono font-semibold">{t('server.console.coresValue', { value: serverData.cores })}</span>
            </div>
            <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden">
              <div className="h-full bg-sky-400/60 rounded-full transition-all duration-1000"
                style={{ width: isRunning ? `${Math.min(100, stats.cpu / (serverData.cores || 1))}%` : '0%' }} />
            </div>
            <p className="text-xs text-white/35 mt-1 font-mono">
              {isRunning ? `${Math.min(100, stats.cpu / (serverData.cores || 1)).toFixed(1)}%` : t('server.console.idle')}
            </p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-2">
            <InfoRow label={t('server.console.typeLabel')} value={serverData.type} />
            <InfoRow label={t('server.console.versionLabel')} value={serverData.gameVersion} />
            <InfoRow label={t('server.console.ramLabel')} value={`${serverData.ramGb} GB`} />
            <InfoRow label={t('server.console.coresLabel')} value={String(serverData.cores)} />
            {serverData.jarFile && <InfoRow label={t('server.console.jarLabel')} value={serverData.jarFile} mono />}
          </div>
        </div>
      </div>
    </div>
  )
}

function CommandInput({ value, onChange, onSubmit, disabled, isRunning, autoScroll, onToggleScroll }) {
  const { t } = useLang()
  const [selIdx, setSelIdx] = useState(0)
  const [showSug, setShowSug] = useState(false)
  const inputRef = useRef(null)
  const sugRef = useRef(null)

  const suggestions = useMemo(() => {
    const raw = value.startsWith('/') ? value.slice(1) : value
    if (!raw.trim()) return []
    const lower = raw.toLowerCase()
    return MC_COMMANDS
      .filter(c => c.cmd.toLowerCase().startsWith(lower) && c.cmd.toLowerCase() !== lower)
      .map(c => ({ ...c, desc: t(`server.console.commands.${c.descKey}`) }))
      .slice(0, 8)
  }, [value, t])

  function applySuggestion(cmd, args) {
    onChange(args ? `${cmd} ${args}` : cmd)
    setShowSug(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (showSug && suggestions.length > 0) {
      if (e.key === 'Tab' || e.key === 'ArrowDown') {
        e.preventDefault()
        setSelIdx(i => (i + 1) % suggestions.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelIdx(i => (i - 1 + suggestions.length) % suggestions.length)
        return
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        if (e.key === 'Tab') {
          e.preventDefault()
          applySuggestion(suggestions[selIdx].cmd, suggestions[selIdx].args)
          return
        }
      }
      if (e.key === 'Escape') {
        setShowSug(false)
        return
      }
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      if (suggestions.length > 0) applySuggestion(suggestions[0].cmd, suggestions[0].args)
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      setShowSug(false)
      onSubmit()
    }
  }

  function handleChange(e) {
    let v = e.target.value
    if (v.startsWith('/')) v = v.slice(1)
    setSelIdx(0)
    setShowSug(Boolean(v.trim()))
    onChange(v)
  }

  return (
    <div className="relative">
      {showSug && suggestions.length > 0 && (
        <div ref={sugRef}
          className="absolute bottom-full left-0 right-0 mb-1 mx-3 rounded-xl border border-white/10 overflow-hidden"
          style={{ background: 'rgba(14,14,14,0.98)', boxShadow: '0 -8px 32px rgba(0,0,0,0.6)', maxHeight: 240, overflowY: 'auto', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
          {suggestions.map((s, i) => (
            <button key={s.cmd} type="button"
              onMouseDown={e => { e.preventDefault(); applySuggestion(s.cmd, s.args) }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-all ${i === selIdx ? 'bg-sky-500/15' : 'hover:bg-white/5'}`}>
              <span className={`text-xs font-mono font-bold flex-shrink-0 ${i === selIdx ? 'text-sky-400' : 'text-white/70'}`}>
                /{s.cmd}
              </span>
              {s.args && <span className="text-[10px] text-white/30 font-mono">{s.args}</span>}
              <span className="text-[10px] text-white/25 ml-auto truncate">{s.desc}</span>
            </button>
          ))}
          <div className="px-3 py-1.5 border-t border-white/5 flex items-center gap-3">
            <span className="text-[9px] text-white/20">{t('server.console.sugTab')}</span>
            <span className="text-[9px] text-white/20">{t('server.console.sugArrow')}</span>
            <span className="text-[9px] text-white/20">{t('server.console.sugEsc')}</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 px-3 py-2">
        <span className="text-sky-400/60 font-mono text-xs flex-shrink-0">/</span>
        <input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setShowSug(true) }}
          onBlur={() => setTimeout(() => setShowSug(false), 150)}
          placeholder={isRunning ? t('server.console.commandPlaceholder') : t('server.console.commandDisabled')}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          className="flex-1 bg-transparent text-white/80 text-xs font-mono focus:outline-none placeholder-white/20 disabled:opacity-40"
        />
        <button type="button" onClick={onSubmit} disabled={disabled || !value.trim()}
          className="px-3 py-1 rounded-lg bg-sky-500/15 text-sky-400 text-xs font-semibold hover:bg-sky-500/25 transition-all disabled:opacity-30">
          {t('server.console.sendBtn')}
        </button>
        <button type="button" onClick={onToggleScroll}
          className={`px-2 py-1 rounded-lg text-xs transition-all ${autoScroll ? 'bg-sky-500/15 text-sky-400' : 'text-white/25 hover:text-white/50'}`}>
          ↓
        </button>
      </div>
    </div>
  )
}

function IpDisplay({ tunnelAddr, tunnelStatus, server }) {
  const { t } = useLang()
  const [localIp, setLocalIp] = useState(null)
  const [port, setPort] = useState('25565')
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isElectron || !server) return
    window.electronAPI.serverGetNetworkInfo(server.id).then(r => {
      if (r?.ok) {
        setLocalIp(r.localIp)
        setPort(r.port || '25565')
      }
    }).catch(() => {})
  }, [server?.id])

  const isTunnelActive = tunnelStatus === 'running' && tunnelAddr
  const displayAddr = isTunnelActive ? tunnelAddr : (localIp ? `${localIp}:${port}` : null)
  const label = isTunnelActive ? t('server.console.publicTunnel') : t('server.console.localIp')
  const accent = isTunnelActive
  const maskedAddr = displayAddr ? displayAddr.replace(/[\d]/g, '•') : null

  function copy() {
    if (!displayAddr) return
    navigator.clipboard.writeText(displayAddr).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  if (!displayAddr) return null

  return (
    <div className={`rounded-xl px-3 py-2.5 border ${accent ? 'border-sky-500/25 bg-sky-500/5' : 'border-white/8 bg-white/3'}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${accent ? 'text-sky-400/70' : 'text-white/35'}`}>
          {label}
        </span>
        {accent && (
          <span className="flex items-center gap-1 text-[9px] text-sky-400/60">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            {t('server.console.tunnelOn')}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-1.5">
        <span className={`text-sm font-bold font-mono truncate transition-all select-none ${
          visible ? accent ? 'text-sky-400' : 'text-white/80' : 'blur-[3px] text-white/40'
        }`}>
          {visible ? displayAddr : maskedAddr}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setVisible(v => !v)}
            className="flex items-center justify-center w-6 h-6 rounded text-white/30 hover:text-white/70 hover:bg-white/8 transition-all"
            title={visible ? t('server.network.hideIp') : t('server.network.showIp')}>
            {visible
              ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
              : <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
          </button>
          {visible && (
            <button onClick={copy}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                copied ? 'bg-sky-500/20 text-sky-400' : 'bg-white/8 text-white/40 hover:text-white/70 hover:bg-white/12'
              }`}>
              {copied
                ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                : <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>}
              {copied ? t('server.console.copied') : t('server.network.tunnelCopy')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-white/40">{label}</span>
      <span className={`text-xs text-white/70 truncate max-w-[120px] font-medium ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

function ServerTypeIcon({ type, size = 32 }) {
  const icons = {
    vanilla: () => import('../../assets/server-icon/vanilla-server.png'),
    paper: () => import('../../assets/server-icon/paper-server.png'),
    purpur: () => import('../../assets/server-icon/purpur-server.png'),
    folia: () => import('../../assets/server-icon/Folia-server.png'),
    fabric: () => import('../../assets/server-icon/fabric-server.png'),
    forge: () => import('../../assets/server-icon/forge-server.png'),
    neoforge: () => import('../../assets/server-icon/neoforge-server.png'),
    mohist: () => import('../../assets/server-icon/mohist-server.png'),
    sponge: () => import('../../assets/server-icon/sponge-server.png'),
    arclight: () => import('../../assets/server-icon/Arclight.png'),
    magma: () => import('../../assets/server-icon/Magma.png'),
  }
  const [src, setSrc] = useState(null)
  useEffect(() => {
    const loader = icons[type]
    if (loader) {
      loader()
        .then(m => setSrc(m.default))
        .catch(() => setSrc(null))
    }
  }, [type])
  if (!src) return <div className="w-full h-full bg-white/5 rounded-xl" />
  return <img src={src} alt={type} style={{ width: size, height: size }} className="object-contain rounded-xl" />
}
