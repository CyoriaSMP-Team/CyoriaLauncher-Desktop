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

import { useState, useCallback, useEffect, useRef } from 'react';
import ServerCodeEditor, { getFileExt } from './ServerCodeEditor';
import { useLang } from '../../i18n/LangProvider';import LocalizedText from "../../i18n/LocalizedText.jsx";

const isElectron = typeof window !== 'undefined' && window.electronAPI;

function formatBytes(b, t) {
  if (!b) return '0 B';
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function FileIcon({ name, isDir }) {
  if (isDir) return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-400/70 flex-shrink-0">
      <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
    </svg>);

  const ext = getFileExt(name);
  if (['zip', 'gz', 'tar'].includes(ext)) return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-purple-400/70 flex-shrink-0">
      <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 10h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V6h2v2z" />
    </svg>);

  if (ext === 'jar') return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-orange-400/70 flex-shrink-0">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
    </svg>);

  if (['json', 'yml', 'yaml', 'properties', 'toml', 'xml', 'conf', 'cfg', 'ini'].includes(ext)) return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-blue-400/70 flex-shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>);

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-white/20 flex-shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>);

}

const EDITABLE_EXTS = ['json', 'yml', 'yaml', 'properties', 'toml', 'xml', 'conf', 'cfg', 'ini', 'txt', 'log', 'md', 'sh', 'bat', 'ps1'];
const isEditable = (name) => EDITABLE_EXTS.includes(getFileExt(name));

export default function ServerFileManager({ server }) {
  const { t } = useLang();
  const [currentPath, setCurrentPath] = useState('');
  const [entries, setEntries] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [openedFile, setOpenedFile] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorSaving, setEditorSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [zipName, setZipName] = useState('');
  const [showZipInput, setShowZipInput] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const selectedArr = Array.from(selectedFiles);
  const hasSelection = selectedArr.length > 0;
  const anyZip = hasSelection && selectedArr.some((p) => p.toLowerCase().endsWith('.zip'));

  const loadDir = useCallback(async (subPath = '') => {
    if (!isElectron) return;
    setLoading(true);
    setSelectedFiles(new Set());
    try {
      const r = await window.electronAPI.serverListDirFull(server.id, subPath);
      setEntries(r?.ok ? r.entries : []);
      setCurrentPath(subPath);
    } finally {setLoading(false);}
  }, [server?.id]);

  useEffect(() => {loadDir('');}, [loadDir]);

  const toggleSelect = useCallback((p) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);else next.add(p);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedFiles.size === entries.length) setSelectedFiles(new Set());else
    setSelectedFiles(new Set(entries.map((e) => e.path)));
  }, [selectedFiles.size, entries]);

  const openFile = useCallback(async (entry) => {
    if (entry.isDir || !isElectron) return;
    const r = await window.electronAPI.serverReadFile(server.id, entry.path);
    if (r?.error) {alert(t('server.files.errorRead', { error: r.error }));return;}
    setOpenedFile({ name: entry.name, path: entry.path });
    setEditorContent(r.content);
  }, [server?.id]);

  const saveFile = useCallback(async () => {
    if (!openedFile || !isElectron) return;
    setEditorSaving(true);
    try {
      const r = await window.electronAPI.serverWriteFile(server.id, openedFile.path, editorContent);
      if (r?.error) alert(t('server.files.errorSave', { error: r.error }));else
      await loadDir(currentPath);
    } finally {setEditorSaving(false);}
  }, [openedFile, editorContent, server?.id, currentPath, loadDir]);

  const deleteSelected = useCallback(async () => {
    if (!hasSelection || !isElectron) return;
    if (!window.confirm(t('server.files.confirmDelete', { count: selectedArr.length }))) return;
    setBusy(true);
    try {
      const r = await window.electronAPI.serverDeleteItems(server.id, selectedArr);
      if (r?.error) alert(t('server.files.errorDelete', { error: r.error }));
      await loadDir(currentPath);
    } finally {setBusy(false);}
  }, [hasSelection, selectedArr, server?.id, currentPath, loadDir]);

  const compressSelected = useCallback(async (name) => {
    if (!hasSelection || !isElectron) return;
    setBusy(true);setShowZipInput(false);
    try {
      const r = await window.electronAPI.serverCompress(server.id, selectedArr, name || 'archive.zip');
      if (r?.error) alert(t('server.files.errorCompress', { error: r.error }));
      await loadDir(currentPath);
    } finally {setBusy(false);}
  }, [hasSelection, selectedArr, server?.id, currentPath, loadDir]);

  const extractSelected = useCallback(async () => {
    if (!anyZip || !isElectron) return;
    setBusy(true);
    try {
      for (const p of selectedArr.filter((p) => p.toLowerCase().endsWith('.zip'))) {
        const r = await window.electronAPI.serverExtract(server.id, p);
        if (r?.error) alert(t('server.files.errorExtract', { error: r.error }));
      }
      await loadDir(currentPath);
    } finally {setBusy(false);}
  }, [anyZip, selectedArr, server?.id, currentPath, loadDir]);

  const uploadFiles = useCallback(async (fileList) => {
    if (!isElectron || !fileList?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        const buf = await file.arrayBuffer();
        const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        const r = await window.electronAPI.serverUploadFile(server.id, currentPath, file.name, b64);
        if (r?.error) alert(t('server.files.errorUpload', { name: file.name, error: r.error }));
      }
      await loadDir(currentPath);
    } finally {setUploading(false);}
  }, [server?.id, currentPath, loadDir]);

  const onDragOver = useCallback((e) => {e.preventDefault();setDragOver(true);}, []);
  const onDragLeave = useCallback(() => setDragOver(false), []);
  const onDrop = useCallback((e) => {
    e.preventDefault();setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  }, [uploadFiles]);

  const breadcrumbs = currentPath ? currentPath.split(/[\\/]/).filter(Boolean) : [];

  return (
    <div className="flex h-full overflow-hidden">
      {}
      <div
        className={`flex flex-col overflow-hidden border-r border-white/5 transition-all ${openedFile ? 'w-[42%] min-w-[220px]' : 'flex-1'} ${dragOver ? 'ring-2 ring-inset ring-green-500/40' : ''}`}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
        
        {}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-2 py-1.5 border-b border-white/5 bg-black/20 flex-wrap">
          {}
          <div className="flex items-center gap-1 text-[10px] flex-1 min-w-0 overflow-hidden">
            <button onClick={() => loadDir('')} className="text-white/40 hover:text-white/70 transition-colors flex-shrink-0">{t('server.files.root')}</button>
            {breadcrumbs.map((part, i, arr) =>
            <span key={i} className="flex items-center gap-1 min-w-0">
                <span className="text-white/20 flex-shrink-0">/</span>
                <button onClick={() => loadDir(arr.slice(0, i + 1).join('/'))}
              className={`truncate max-w-[80px] ${i === arr.length - 1 ? 'text-white/60' : 'text-white/40 hover:text-white/70'}`}>
                  {part}
                </button>
              </span>
            )}
          </div>

          {}
          <button onClick={() => loadDir(currentPath)} disabled={loading || busy}
          className="w-6 h-6 flex items-center justify-center rounded text-white/30 hover:text-white/60 hover:bg-white/5 transition-all disabled:opacity-30" title={t('server.files.reload')}>
            <svg viewBox="0 0 24 24" fill="currentColor" className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}>
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
            </svg>
          </button>

          <div className="w-px h-4 bg-white/10 flex-shrink-0" />

          {}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || busy}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold bg-green-500/10 text-green-400/80 hover:bg-green-500/20 hover:text-green-400 border border-green-500/15 transition-all disabled:opacity-30"
            title={t('server.files.upload')}>
            {uploading ?
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 animate-spin">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
              </svg> :

            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            }
            {t('server.files.upload')}
          </button>
          <input ref={fileInputRef} type="file" multiple className="hidden"
          onChange={(e) => {uploadFiles(e.target.files);e.target.value = '';}} />

          {}
          <button onClick={deleteSelected} disabled={!hasSelection || busy}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold bg-red-500/10 text-red-400/70 hover:bg-red-500/20 hover:text-red-400 border border-red-500/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
            {t('server.files.delete')}
          </button>

          {}
          {showZipInput ?
          <div className="flex items-center gap-1">
              <input autoFocus value={zipName} onChange={(e) => setZipName(e.target.value)}
            onKeyDown={(e) => {if (e.key === 'Enter') compressSelected(zipName || 'archive.zip');if (e.key === 'Escape') {setShowZipInput(false);setZipName('');}}}
            placeholder="archive.zip"
            className="w-24 px-1.5 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-white/70 focus:outline-none focus:border-white/20" />
              <button onClick={() => compressSelected(zipName || 'archive.zip')}
            className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-all"><LocalizedText id="auto.21d10d091035" /></button>
              <button onClick={() => {setShowZipInput(false);setZipName('');}}
            className="px-1.5 py-0.5 rounded text-[10px] text-white/30 hover:text-white/60 hover:bg-white/5 transition-all">✕</button>
            </div> :

          <button onClick={() => {setShowZipInput(true);setZipName('archive.zip');}} disabled={!hasSelection || busy}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 border border-white/8 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 10h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V6h2v2z" />
              </svg>
              {t('server.files.compress')}
            </button>
          }

          {}
          <button onClick={extractSelected} disabled={!anyZip || busy}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 border border-white/8 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t('server.files.extract')}
          </button>
        </div>

        {}
        {dragOver &&
        <div className="flex-shrink-0 flex items-center justify-center gap-2 py-2 bg-green-500/10 border-b border-green-500/20 text-xs text-green-400">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            {t('server.files.dropHint')}
          </div>
        }

        {}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
          {loading ?
          <div className="flex items-center justify-center py-12">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white/20 animate-spin">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
              </svg>
            </div> :

          <div className="p-2 flex flex-col gap-0.5">
              {}
              {entries.length > 0 &&
            <div className="flex items-center gap-2 px-2 py-1 mb-1">
                  <input type="checkbox" checked={selectedFiles.size === entries.length && entries.length > 0}
              onChange={toggleAll} className="w-3.5 h-3.5 rounded accent-green-400 cursor-pointer flex-shrink-0" />
                  <span className="text-[10px] text-white/25 select-none">
                    {selectedFiles.size > 0 ? t('server.files.selected', { count: selectedFiles.size }) : t('server.files.selectAll')}
                  </span>
                </div>
            }

              {}
              {currentPath &&
            <button onClick={() => loadDir(breadcrumbs.slice(0, -1).join('/'))}
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-white/35 hover:text-white/60 hover:bg-white/5 transition-all text-xs">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white/20">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                  </svg>
                  ..
                </button>
            }

              {entries.length === 0 &&
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-white/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  </svg>
                  <p className="text-xs">{t('server.files.emptyFolder')}</p>
                </div>
            }

              {entries.map((entry) => {
              const isSelected = selectedFiles.has(entry.path);
              const canEdit = !entry.isDir && isEditable(entry.name);
              return (
                <div key={entry.path}
                onClick={() => entry.isDir && loadDir(entry.path)}
                onDoubleClick={() => !entry.isDir && canEdit && openFile(entry)}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all group select-none ${
                entry.isDir ? 'cursor-pointer' : 'cursor-default'} ${
                isSelected ? 'bg-green-500/10 border border-green-500/15' : 'hover:bg-white/5 border border-transparent'}`}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(entry.path)}
                  onClick={(e) => e.stopPropagation()} className="w-3.5 h-3.5 rounded accent-green-400 cursor-pointer flex-shrink-0" />
                    <FileIcon name={entry.name} isDir={entry.isDir} />
                    <span className={`text-xs flex-1 truncate ${entry.isDir ? 'text-white/70' : canEdit ? 'text-white/65 group-hover:text-white/85' : 'text-white/45'}`}
                  title={entry.isDir ? t('server.files.titleOpenDir') : canEdit ? t('server.files.titleEditFile') : entry.name}>
                      {entry.name}
                    </span>
                    {!entry.isDir && entry.size != null &&
                  <span className="text-[10px] text-white/20 flex-shrink-0 font-mono">{formatBytes(entry.size, t)}</span>
                  }
                    {canEdit &&
                  <button onClick={(e) => {e.stopPropagation();openFile(entry);}}
                  className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-white/25 hover:text-white/60 hover:bg-white/10 transition-all flex-shrink-0" title={t('server.files.titleOpenEditor')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                  }
                  </div>);

            })}
            </div>
          }
        </div>
      </div>

      {}
      {openedFile &&
      <div className="flex-1 overflow-hidden" style={{ animation: 'slideInRight 0.22s cubic-bezier(0,0,0.2,1) forwards' }}>
          <style>{`@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
          <ServerCodeEditor
          fileName={openedFile.name}
          content={editorContent}
          onChange={setEditorContent}
          onSave={saveFile}
          onCancel={() => setOpenedFile(null)}
          saving={editorSaving} />
        
        </div>
      }
    </div>);

}