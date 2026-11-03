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

function ansi256ToHex(n) {
  if (n < 16) {
    const std = [
      '#000000','#800000','#008000','#808000','#000080','#800080','#008080','#c0c0c0',
      '#808080','#ff0000','#00ff00','#ffff00','#0000ff','#ff00ff','#00ffff','#ffffff',
    ]
    return std[n] || '#ffffff'
  }
  if (n >= 232) {
    const v = 8 + (n - 232) * 10
    return `rgb(${v},${v},${v})`
  }
  let idx = n - 16
  const b = idx % 6; idx = Math.floor(idx / 6)
  const g = idx % 6; idx = Math.floor(idx / 6)
  const r = idx % 6
  const toV = x => x === 0 ? 0 : 55 + x * 40
  return `rgb(${toV(r)},${toV(g)},${toV(b)})`
}

const ANSI_COLORS = {
  '30': '#4C4C4C', '31': '#FF5555', '32': '#55FF55', '33': '#FFFF55',
  '34': '#5555FF', '35': '#FF55FF', '36': '#55FFFF', '37': '#BBBBBB',
  '90': '#555555', '91': '#FF5555', '92': '#55FF55', '93': '#FFFF55',
  '94': '#5555FF', '95': '#FF55FF', '96': '#55FFFF', '97': '#FFFFFF',
}

const MC_COLORS = {
  '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA',
  '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA',
  '8': '#555555', '9': '#5555FF', 'a': '#55FF55', 'b': '#55FFFF',
  'c': '#FF5555', 'd': '#FF55FF', 'e': '#FFFF55', 'f': '#FFFFFF',
}

export function parseColors(text) {
  if (!text) return { parts: '', hasColor: false }

  let cleaned = text
    .replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '')
    .replace(/\x1b[^[\x1b]*[A-Za-z]/g, m => m.startsWith('\x1b[') ? m : '')

  const parts = []
  let key = 0
  let hasColor = false
  const regex = /\x1b\[([0-9;]*)m|[\u00a7§]([0-9a-fk-orA-FK-OR])/g
  let lastIndex = 0
  let fg = null
  let bold = false, italic = false, underline = false, strike = false
  let m

  const flush = (str) => {
    if (!str) return
    const style = {}
    if (fg) style.color = fg
    if (bold) style.fontWeight = 'bold'
    if (italic) style.fontStyle = 'italic'
    const deco = [underline && 'underline', strike && 'line-through'].filter(Boolean).join(' ')
    if (deco) style.textDecoration = deco

    parts.push(<span key={key++} style={Object.keys(style).length ? style : undefined}>{str}</span>)
  }

  while ((m = regex.exec(cleaned)) !== null) {
    if (m.index > lastIndex) flush(cleaned.slice(lastIndex, m.index))
    if (m[1] !== undefined) {
      const seq = m[1]
      if (seq === '' || seq === '0') {
        fg = null; bold = false; italic = false; underline = false; strike = false
      } else {
        const codes = seq.split(';')
        let i = 0
        while (i < codes.length) {
          const c = codes[i]
          if      (c === '0')  { fg = null; bold = false; italic = false; underline = false; strike = false }
          else if (c === '1')  bold = true
          else if (c === '2')  bold = false
          else if (c === '3')  italic = true
          else if (c === '4')  underline = true
          else if (c === '9')  strike = true
          else if (c === '22') bold = false
          else if (c === '23') italic = false
          else if (c === '24') underline = false
          else if (c === '29') strike = false
          else if (c === '39') fg = null
          else if (ANSI_COLORS[c]) { fg = ANSI_COLORS[c]; hasColor = true }
          else if (c === '38') {
            if (codes[i + 1] === '5' && codes[i + 2] !== undefined) {
              fg = ansi256ToHex(parseInt(codes[i + 2], 10)); hasColor = true; i += 2
            } else if (codes[i + 1] === '2' && codes[i + 4] !== undefined) {
              fg = `rgb(${codes[i+2]},${codes[i+3]},${codes[i+4]})`; hasColor = true; i += 4
            }
          }
          i++
        }
      }
    } else {
      const code = m[2].toLowerCase()
      if      (code === 'r') { fg = null; bold = false; italic = false; underline = false; strike = false }
      else if (code === 'l') bold = true
      else if (code === 'o') italic = true
      else if (code === 'n') underline = true
      else if (code === 'm') strike = true
      else if (code === 'k') {  }
      else if (MC_COLORS[code]) { fg = MC_COLORS[code]; hasColor = true }
    }
    lastIndex = m.index + m[0].length
  }
  if (lastIndex < cleaned.length) flush(cleaned.slice(lastIndex))
  return { parts: parts.length > 0 ? parts : cleaned, hasColor }
}

export function getLineLevel(line) {
  const upper = line.toUpperCase()
  if (upper.includes('/ERROR]') || upper.includes('[ERROR]') || upper.includes('[ERR]') || upper.includes('EXCEPTION') || upper.includes('FATAL')) return 'error'
  if (upper.includes('/WARN]')  || upper.includes('[WARN]')  || upper.includes('[WARNING]')) return 'warn'
  if (upper.includes('/INFO]')  || upper.includes('[INFO]'))  return 'info'
  if (upper.includes('/DEBUG]') || upper.includes('[DEBUG]') || upper.includes('[LAUNCHER]')) return 'debug'
  if (/Done \([\d.]+s\)/.test(line)) return 'done'
  return 'other'
}

export function getLineColor(line) {
  const level = getLineLevel(line)
  switch (level) {
    case 'error':    return '#f87171'
    case 'warn':     return '#facc15'
    case 'info':     return '#e5e7eb'
    case 'debug':    return '#93c5fd'
    case 'done':     return '#38bdf8'
    default:         return '#9ca3af'
  }
}

