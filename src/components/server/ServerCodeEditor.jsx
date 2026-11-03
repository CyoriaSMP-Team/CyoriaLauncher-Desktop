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

import { useRef, useCallback, useEffect, useState } from 'react';import LocalizedText from "../../i18n/LocalizedText.jsx";

export function getFileExt(name) {
  const parts = (name || '').split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

function highlightJson(line) {
  const tokens = [];
  let i = 0;
  const push = (text, color) => {if (text) tokens.push({ text, color });};
  while (i < line.length) {
    if (line[i] === '"') {
      let j = i + 1;
      while (j < line.length && !(line[j] === '"' && line[j - 1] !== '\\')) j++;
      j++;
      const str = line.slice(i, j);
      const rest = line.slice(j).trimStart();
      push(str, rest.startsWith(':') ? '#93c5fd' : '#86efac');
      i = j;continue;
    }
    const numMatch = line.slice(i).match(/^-?\d+(\.\d+)?([eE][+-]?\d+)?/);
    if (numMatch && (i === 0 || /[\s,\[{:]/.test(line[i - 1]))) {
      push(numMatch[0], '#fde68a');i += numMatch[0].length;continue;
    }
    const kwMatch = line.slice(i).match(/^(true|false|null)\b/);
    if (kwMatch) {push(kwMatch[0], '#fb923c');i += kwMatch[0].length;continue;}
    if ('{}[]:,'.includes(line[i])) {push(line[i], '#94a3b8');i++;continue;}
    push(line[i], '#e5e7eb');i++;
  }
  return tokens;
}

function highlightYaml(line) {
  const trimmed = line.trimStart();
  const indent = line.length - trimmed.length;
  const indentStr = line.slice(0, indent);
  if (trimmed.startsWith('#')) return [{ text: line, color: '#6b7280' }];
  const colonIdx = trimmed.indexOf(':');
  if (colonIdx > 0) {
    return [
    { text: indentStr, color: '#e5e7eb' },
    { text: trimmed.slice(0, colonIdx), color: '#93c5fd' },
    { text: ':', color: '#94a3b8' },
    { text: trimmed.slice(colonIdx + 1), color: '#86efac' }];

  }
  if (trimmed.startsWith('- ')) {
    return [{ text: indentStr + '- ', color: '#94a3b8' }, { text: trimmed.slice(2), color: '#e5e7eb' }];
  }
  return [{ text: line, color: '#e5e7eb' }];
}

function highlightProperties(line) {
  const trimmed = line.trim();
  if (trimmed.startsWith('#') || trimmed.startsWith('!')) return [{ text: line, color: '#6b7280' }];
  const eqIdx = line.indexOf('=');
  const colonIdx = line.indexOf(':');
  let sepIdx = -1;
  if (eqIdx >= 0 && colonIdx >= 0) sepIdx = Math.min(eqIdx, colonIdx);else
  if (eqIdx >= 0) sepIdx = eqIdx;else
  if (colonIdx >= 0) sepIdx = colonIdx;
  if (sepIdx > 0) {
    return [
    { text: line.slice(0, sepIdx), color: '#93c5fd' },
    { text: line[sepIdx], color: '#94a3b8' },
    { text: line.slice(sepIdx + 1), color: '#86efac' }];

  }
  return [{ text: line, color: '#e5e7eb' }];
}

function highlightLine(line, ext) {
  if (ext === 'json') return highlightJson(line);
  if (ext === 'yml' || ext === 'yaml') return highlightYaml(line);
  if (ext === 'properties') return highlightProperties(line);
  return [{ text: line, color: '#e5e7eb' }];
}

const LINE_H = 20;

export default function ServerCodeEditor({ fileName, content, onChange, onSave, onCancel, saving }) {
  const ext = getFileExt(fileName);
  const lines = content.split('\n');

  const scrollTopRef = useRef(0);
  const textareaRef = useRef(null);
  const lineNumRef = useRef(null);
  const highlightRef = useRef(null);

  const [closing, setClosing] = useState(false);

  function handleClose(cb) {
    setClosing(true);
    setTimeout(() => {setClosing(false);cb();}, 220);
  }

  const onScroll = useCallback(() => {
    const top = textareaRef.current?.scrollTop ?? 0;
    const left = textareaRef.current?.scrollLeft ?? 0;
    if (lineNumRef.current) lineNumRef.current.scrollTop = top;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = top;
      highlightRef.current.scrollLeft = left;
    }
  }, []);

  return (
    <div
      className="flex flex-col h-full bg-[#080808]"
      style={{
        animation: closing ?
        'slideOutRight 0.22s cubic-bezier(0.4,0,1,1) forwards' :
        'slideInRight 0.22s cubic-bezier(0,0,0.2,1) forwards'
      }}>
      
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0);    opacity: 1; }
          to   { transform: translateX(100%); opacity: 0; }
        }
      `}</style>

      {}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-black/30">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-white/30 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-xs text-white/60 font-mono flex-1 truncate">{fileName}</span>
        <span className="text-[10px] text-white/25 uppercase tracking-wider">{ext || 'txt'}</span>
        <div className="w-px h-4 bg-white/10" />
        <button
          onClick={() => handleClose(onCancel)}
          className="px-2.5 py-1 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"><LocalizedText id="auto.d99fdbef66e9" />

        </button>
        <button
          onClick={async () => {await onSave();}}
          disabled={saving}
          className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/20 transition-all disabled:opacity-50">
          {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>

      {}
      <div className="flex flex-1 overflow-hidden" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '12px', lineHeight: `${LINE_H}px` }}>

        {}
        <div
          ref={lineNumRef}
          className="flex-shrink-0 w-10 bg-black/20 border-r border-white/5 select-none overflow-hidden"
          style={{ paddingTop: 8, paddingBottom: 8 }}>
          
          {lines.map((_, idx) =>
          <div key={idx} className="text-right pr-2 text-white/20" style={{ height: LINE_H, lineHeight: `${LINE_H}px` }}>
              {idx + 1}
            </div>
          )}
        </div>

        {}
        <div className="relative flex-1 overflow-hidden">
          {}
          <pre
            ref={highlightRef}
            aria-hidden="true"
            className="absolute inset-0 overflow-hidden pointer-events-none whitespace-pre"
            style={{ padding: '8px 12px', margin: 0, color: '#e5e7eb', background: 'transparent', scrollbarWidth: 'none' }}>
            
            {lines.map((line, idx) => {
              const tokens = highlightLine(line, ext);
              return (
                <div key={idx} style={{ height: LINE_H, lineHeight: `${LINE_H}px` }}>
                  {tokens.map((tok, ti) => <span key={ti} style={{ color: tok.color }}>{tok.text}</span>)}
                </div>);

            })}
          </pre>

          {}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onScroll={onScroll}
            spellCheck={false}
            className="absolute inset-0 w-full h-full resize-none focus:outline-none bg-transparent"
            style={{
              padding: '8px 12px',
              color: 'transparent',
              caretColor: '#4ade80',
              scrollbarColor: 'rgba(255,255,255,0.1) transparent',
              border: 'none',
              outline: 'none',
              lineHeight: `${LINE_H}px`
            }} />
          
        </div>
      </div>

      {}
      <div className="flex-shrink-0 flex items-center gap-3 px-3 py-1 border-t border-white/5 bg-black/20">
        <span className="text-[10px] text-white/25">{lines.length}<LocalizedText id="auto.b512c90edb82" /></span>
        <span className="text-[10px] text-white/25">{content.length}<LocalizedText id="auto.04f224705069" /></span>
      </div>
    </div>);

}