import { useLang } from "../../../i18n/LangProvider.jsx"; /**
 * VoxelXLauncher — Minecraft Launcher
 * Shared utilities, icons, and small UI components for ProfileSettingsPanel tabs.
 */

import { useState, useRef } from 'react';import LocalizedText from "../../../i18n/LocalizedText.jsx";

export const isElectron = typeof window !== 'undefined' && window.electronAPI;

export function formatBytes(b) {
  if (!b) return '0 B';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function formatDate(ms) {
  if (!ms) return '—';
  return new Date(ms).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const Icons = {
  settings:
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.02 7.02 0 00-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 00-.59.22L2.74 8.87a.47.47 0 00.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.47.47 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.37 1.04.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 00-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>,

  world:
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>,

  mod:
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7s2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z" />
    </svg>,

  shader:
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
    </svg>,

  resourcepack:
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.53 15.47 0 12.36 0c-1.73 0-3.24.87-4.19 2.19L12 6H20zm-7.45 0l-3.49-4.9C8.44 1.07 7.32.64 6.18.64 3.35.64 1 2.99 1 5.82c0 .48.07.94.18 1.36H2c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H12.55z" />
    </svg>,

  files:
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>,

  trash:
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>,

  check:
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>,

  spin:
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>,

  java:
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0-.001.553.457 3.393.639" />
    </svg>,

  back:
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>,

  list:
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
    </svg>,

  grid:
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />
    </svg>,

  search:
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
    </svg>,

  close:
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>

};

export function LoadingState({ text = 'Đang tải...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <svg className="animate-spin w-6 h-6 text-green-400/40" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-xs text-white/30">{text}</p>
    </div>);

}

export function EmptyState({ icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center text-white/20">
        {icon}
      </div>
      <div className="text-center">
        <p className="text-sm text-white/40 font-medium">{title}</p>
        {desc && <p className="text-xs text-white/20 mt-1">{desc}</p>}
      </div>
    </div>);

}

export function ViewToggle({ view, onChange }) {const { t } = useLang();
  return (
    <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5">
      <button
        onClick={() => onChange('list')}
        className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-white/10 text-white/80' : 'text-white/30 hover:text-white/60'}`}
        title={t("auto.d3b5aa16946e")}>
        
        {Icons.list}
      </button>
      <button
        onClick={() => onChange('grid')}
        className={`p-1.5 rounded-md transition-all ${view === 'grid' ? 'bg-white/10 text-white/80' : 'text-white/30 hover:text-white/60'}`}
        title={t("auto.e7436f20338f")}>
        
        {Icons.grid}
      </button>
    </div>);

}

// Ô tìm kiếm dùng chung cho các tab (mods/shaders/resourcepacks/worlds).
export function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative flex-1 min-w-0">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
        {Icons.search}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-white/5 border border-white/8 text-xs text-white/80 placeholder-white/25 outline-none focus:border-white/15 focus:bg-white/8 transition-all" />
      
      {value &&
      <button
        onClick={() => onChange('')}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-all"
        tabIndex={-1}>
        
          {Icons.close}
        </button>
      }
    </div>);

}

// Reusable drag-and-drop wrapper for mod/shader/resourcepack tabs.
export function DropZoneWrapper({ children, onDrop, accept, color = 'green' }) {
  const [dragging, setDragging] = useState(false);
  const dragCounter = useRef(0);

  const colorMap = {
    green: { border: 'border-green-500/50', bg: 'bg-green-500/5', text: 'text-green-400', ring: 'ring-green-500/20' },
    yellow: { border: 'border-yellow-500/50', bg: 'bg-yellow-500/5', text: 'text-yellow-400', ring: 'ring-yellow-500/20' },
    purple: { border: 'border-purple-500/50', bg: 'bg-purple-500/5', text: 'text-purple-400', ring: 'ring-purple-500/20' }
  };
  const c = colorMap[color] || colorMap.green;

  function handleDragEnter(e) {
    e.preventDefault();
    dragCounter.current++;
    if (dragCounter.current === 1) setDragging(true);
  }
  function handleDragLeave(e) {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  }
  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }
  function handleDrop(e) {
    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;
    // Lọc theo extension — nếu không có accept thì cho qua hết
    const filtered = accept ?
    files.filter((f) => accept.some((ext) => f.name.toLowerCase().endsWith(ext))) :
    files;
    // Luôn gọi onDrop với toàn bộ files đã drop (handler trong tab tự filter thêm)
    if (files.length) onDrop(filtered.length ? filtered : files);
  }

  return (
    <div
      className={`relative flex flex-col h-full transition-all duration-150 ${dragging ? `ring-2 ${c.ring} rounded-xl` : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}>
      
      {children}
      {dragging &&
      <div className={`absolute inset-0 z-20 rounded-xl border-2 border-dashed ${c.border} ${c.bg} flex flex-col items-center justify-center gap-3 pointer-events-none`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className={`w-10 h-10 ${c.text} opacity-70`}>
            <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
          </svg>
          <p className={`text-sm font-semibold ${c.text}`}><LocalizedText id="auto.ae3bebcb2375" /></p>
          {accept && <p className="text-xs text-white/30">{accept.join(', ')}</p>}
        </div>
      }
    </div>);

}