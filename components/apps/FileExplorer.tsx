'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { FsItem, useFilesystemStore } from '@/store/filesystem'
import { useClipboardStore } from '@/store/clipboard'
import {
  listFolder,
  createFolder,
  renameItem,
  deleteItem,
  moveItem,
  copyItem,
  uploadFile,
  getDownloadUrl,
  getFileContent,
  isImage,
  isText,
  isPdf,
  isAudio,
  isVideo,
  formatSize,
  formatDate,
  getExtension,
} from '@/lib/fs-api'
import {
  FolderIcon,
  FolderSmallIcon,
  FileIcon,
  TextFileIcon,
  ImageFileIcon,
  PDFIcon,
  AudioFileIcon,
  VideoFileIcon,
  MyComputerIcon,
} from '@/components/icons'
import { useWindowStore } from '@/store/windows'
import ContextMenu, { MenuEntry } from '@/components/os/ContextMenu'
import SystemDialog from '@/components/os/SystemDialog'

interface BreadcrumbEntry {
  id: string | null
  name: string
}

interface FileExplorerProps {
  onOpenFile: (item: FsItem) => void
  initialFolderId?: string | null
  initialFolderName?: string
}

type ViewMode = 'icons' | 'list'
type SortBy = 'name' | 'type' | 'size' | 'date'

export default function FileExplorer({
  onOpenFile,
  initialFolderId,
  initialFolderName,
}: FileExplorerProps) {
  const { setItems, addItem, updateItem, removeItem } = useFilesystemStore()
  
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(
    initialFolderId !== 'root' && initialFolderId ? initialFolderId : null
  )
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbEntry[]>([
    { id: null, name: 'My Computer' },
    ...(initialFolderName && initialFolderName !== 'My Computer'
      ? [{ id: initialFolderId ?? null, name: initialFolderName }]
      : []),
  ])
  const [history, setHistory] = useState<(string | null)[]>([null])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [items, setLocalItems] = useState<FsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('icons')
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; targetId?: string } | null>(null)
  const [dialog, setDialog] = useState<{
    type: 'rename' | 'newFolder' | 'delete' | 'alert'
    targetId?: string
    defaultValue?: string
    message?: string
  } | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const clipboard = useClipboardStore()

  // Load folder contents
  const loadFolder = useCallback(async (folderId: string | null) => {
    setLoading(true)
    setSelectedIds(new Set())
    try {
      const data = await listFolder(folderId)
      setLocalItems(data)
      setItems(folderId, data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [setItems])

  useEffect(() => {
    loadFolder(currentFolderId)
  }, [currentFolderId, loadFolder])

  const navigateTo = useCallback((folderId: string | null, folderName: string) => {
    // Update history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(folderId)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    
    setCurrentFolderId(folderId)

    if (folderId === null) {
      setBreadcrumbs([{ id: null, name: 'My Computer' }])
    } else {
      setBreadcrumbs(prev => {
        const existingIdx = prev.findIndex(b => b.id === folderId)
        if (existingIdx >= 0) return prev.slice(0, existingIdx + 1)
        return [...prev, { id: folderId, name: folderName }]
      })
    }
  }, [history, historyIndex])

  const goBack = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1
      setHistoryIndex(newIdx)
      const fid = history[newIdx]
      setCurrentFolderId(fid)
      setBreadcrumbs(prev => prev.length > 1 ? prev.slice(0, -1) : prev)
    }
  }

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1
      setHistoryIndex(newIdx)
      setCurrentFolderId(history[newIdx])
    }
  }

  // Sort items
  const sortedItems = [...items].sort((a, b) => {
    // Folders first
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name)
      case 'size': return (b.size || 0) - (a.size || 0)
      case 'date': return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      case 'type': {
        const extA = getExtension(a.name)
        const extB = getExtension(b.name)
        return extA.localeCompare(extB) || a.name.localeCompare(b.name)
      }
      default: return 0
    }
  })

  // Handle item click
  const handleItemClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (e.ctrlKey || e.metaKey) {
      setSelectedIds(prev => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    } else {
      setSelectedIds(new Set([id]))
    }
  }

  // Handle double click
  const handleItemDoubleClick = (item: FsItem) => {
    if (item.type === 'folder') {
      navigateTo(item.id, item.name)
    } else {
      onOpenFile(item)
    }
  }

  // Context menu for item
  const handleItemContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!selectedIds.has(id)) setSelectedIds(new Set([id]))
    setContextMenu({ x: e.clientX, y: e.clientY, targetId: id })
  }

  // Context menu for background
  const handleBgContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setSelectedIds(new Set())
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  // Rename
  const handleRename = async (id: string, name: string) => {
    if (!name.trim()) return
    try {
      const updated = await renameItem(id, name.trim())
      setLocalItems(prev => prev.map(item => item.id === id ? updated : item))
      updateItem(id, { name: updated.name })
    } catch (e) {
      console.error(e)
    }
  }

  // New folder
  const handleNewFolder = async (name: string) => {
    if (!name.trim()) return
    try {
      const folder = await createFolder(name.trim(), currentFolderId)
      setLocalItems(prev => [...prev, folder])
      addItem(folder)
    } catch (e) {
      console.error(e)
    }
  }

  // Delete
  const handleDelete = async (ids: string[]) => {
    for (const id of ids) {
      try {
        await deleteItem(id)
        setLocalItems(prev => prev.filter(item => item.id !== id))
        removeItem(id)
      } catch (e) {
        console.error(e)
      }
    }
    setSelectedIds(new Set())
  }

  // Upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return
    for (const file of Array.from(files)) {
      const key = `${file.name}-${Date.now()}`
      try {
        const uploaded = await uploadFile(file, currentFolderId, (pct) => {
          setUploadProgress(prev => ({ ...prev, [key]: pct }))
        })
        setLocalItems(prev => [...prev, uploaded])
        addItem(uploaded)
      } catch (e) {
        console.error(e)
      } finally {
        setUploadProgress(prev => {
          const next = { ...prev }
          delete next[key]
          return next
        })
      }
    }
  }

  // Download
  const handleDownload = async (id: string) => {
    try {
      const item = items.find(i => i.id === id)
      if (!item || item.type === 'folder') return
      const url = await getDownloadUrl(id)

      if (url.startsWith('data:')) {
        const a = document.createElement('a')
        a.href = url
        a.download = item.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else {
        const res = await fetch(url)
        const blob = await res.blob()
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = item.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000)
      }
    } catch (e) {
      console.error('Download failed:', e)
    }
  }

  // Copy file content directly to local physical PC clipboard
  const handleCopyToPcClipboard = async (id: string) => {
    try {
      const item = items.find(i => i.id === id)
      if (!item) return
      const text = await getFileContent(id)
      await navigator.clipboard.writeText(text)
      setDialog({
        type: 'alert',
        message: `Content of "${item.name}" copied to your local computer's clipboard!\n\nYou can now paste (Ctrl+V) directly into VS Code, Python IDLE, Notepad, or terminal on your physical computer.`,
      })
    } catch (e) {
      setDialog({
        type: 'alert',
        message: 'Could not access system clipboard. Please ensure browser clipboard permissions are allowed.',
      })
    }
  }

  // Clipboard ops
  const handleCopy = () => {
    const selected = items.filter(i => selectedIds.has(i.id))
    clipboard.copy(selected)
  }

  const handleCut = () => {
    const selected = items.filter(i => selectedIds.has(i.id))
    clipboard.cut(selected)
  }

  const handlePaste = async () => {
    if (!clipboard.items.length || !clipboard.operation) return
    for (const item of clipboard.items) {
      try {
        if (clipboard.operation === 'copy') {
          const copied = await copyItem(item.id, currentFolderId)
          setLocalItems(prev => [...prev, copied])
          addItem(copied)
        } else {
          const moved = await moveItem(item.id, currentFolderId)
          setLocalItems(prev => prev.filter(i => i.id !== item.id))
          removeItem(item.id)
          setLocalItems(prev => [...prev, moved])
          addItem(moved)
        }
      } catch (e) {
        console.error(e)
      }
    }
    if (clipboard.operation === 'cut') clipboard.clear()
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key === 'c') handleCopy()
      if (ctrl && e.key === 'x') handleCut()
      if (ctrl && e.key === 'v') handlePaste()
      if (e.key === 'Delete' && selectedIds.size > 0) {
        setDialog({ type: 'delete', message: `Delete ${selectedIds.size} item(s)?` })
      }
      if (e.key === 'F2' && selectedIds.size === 1) {
        const id = Array.from(selectedIds)[0]
        const item = items.find(i => i.id === id)
        if (item) setDialog({ type: 'rename', targetId: id, defaultValue: item.name })
      }
      if (e.key === 'Backspace') goBack()
      if (e.key === 'Enter' && selectedIds.size === 1) {
        const id = Array.from(selectedIds)[0]
        const item = items.find(i => i.id === id)
        if (item) handleItemDoubleClick(item)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIds, items])

  // Build context menu items
  const buildContextMenuItems = (targetId?: string): MenuEntry[] => {
    if (!targetId) {
      return [
        { label: 'New Folder', onClick: () => setDialog({ type: 'newFolder', defaultValue: 'New Folder' }) },
        { separator: true },
        { label: 'Upload File', onClick: () => fileInputRef.current?.click() },
        { separator: true },
        {
          label: 'Paste',
          disabled: !clipboard.items.length,
          shortcut: 'Ctrl+V',
          onClick: handlePaste,
        },
        { separator: true },
        { label: 'Refresh', onClick: () => loadFolder(currentFolderId) },
      ]
    }

    const item = items.find(i => i.id === targetId)
    const isFolder = item?.type === 'folder'

    return [
      {
        label: isFolder ? 'Open' : 'Open',
        onClick: () => item && handleItemDoubleClick(item),
      },
      { separator: true },
      { label: 'Cut',  shortcut: 'Ctrl+X', onClick: handleCut },
      { label: 'Copy', shortcut: 'Ctrl+C', onClick: handleCopy },
      { separator: true },
      {
        label: 'Rename',
        shortcut: 'F2',
        onClick: () => item && setDialog({ type: 'rename', targetId, defaultValue: item.name }),
      },
      {
        label: 'Delete',
        shortcut: 'Del',
        onClick: () => setDialog({ type: 'delete', message: `Move "${item?.name}" to Recycle Bin?` }),
      },
      { separator: true },
      ...(!isFolder
        ? [
            { label: '⬇ Download to PC', onClick: () => handleDownload(targetId) } as MenuEntry,
            ...(item && isText(item)
              ? [{ label: '📋 Copy to PC Clipboard', onClick: () => handleCopyToPcClipboard(targetId) } as MenuEntry]
              : []),
          ]
        : []),
      { separator: true },
      {
        label: 'Properties',
        onClick: () => {
          if (item) {
            useWindowStore.getState().openWindow({
              appId: 'file-properties',
              title: `Properties: ${item.name}`,
              x: 220 + Math.random() * 40,
              y: 70 + Math.random() * 40,
              width: 340,
              height: 400,
              minimized: false,
              maximized: false,
              data: { item },
            })
          }
        },
      },
    ]
  }

  // Icon for file/folder
  const renderIcon = (item: FsItem, size = 32) => {
    if (item.type === 'folder') return <FolderIcon size={size} />
    if (isImage(item)) return <ImageFileIcon size={size} />
    if (isText(item)) return <TextFileIcon size={size} />
    if (isPdf(item)) return <PDFIcon size={size} />
    if (isAudio(item)) return <AudioFileIcon size={size} />
    if (isVideo(item)) return <VideoFileIcon size={size} />
    return <FileIcon size={size} />
  }

  // Upload progress display
  const uploadKeys = Object.keys(uploadProgress)

  return (
    <div
      className="explorer-container"
      style={{ height: '100%' }}
      onContextMenu={handleBgContextMenu}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('Files')) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
      onDrop={(e) => {
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          e.preventDefault()
          e.stopPropagation()
          handleFileUpload(e.dataTransfer.files)
        }
      }}
    >
      {/* Toolbar */}
      <div className="window-toolbar">
        <button
          className="btn btn-sm"
          onClick={goBack}
          disabled={historyIndex === 0}
          aria-label="Go back"
          title="Back"
        >
          ◀ Back
        </button>
        <button
          className="btn btn-sm"
          onClick={goForward}
          disabled={historyIndex >= history.length - 1}
          aria-label="Go forward"
          title="Forward"
        >
          Forward ▶
        </button>
        <div className="taskbar-divider" style={{ height: 16 }} />
        <button
          className="btn btn-sm"
          onClick={() => fileInputRef.current?.click()}
          title="Upload file"
        >
          ↑ Upload
        </button>
        <button
          className="btn btn-sm"
          onClick={() => setDialog({ type: 'newFolder', defaultValue: 'New Folder' })}
          title="New folder"
        >
          📁 New Folder
        </button>
        {selectedIds.size === 1 && items.find(i => selectedIds.has(i.id) && i.type === 'file') && (
          <>
            <button
              className="btn btn-sm"
              onClick={() => {
                const selectedFile = items.find(i => selectedIds.has(i.id) && i.type === 'file')
                if (selectedFile) handleDownload(selectedFile.id)
              }}
              title="Download selected file to PC"
              style={{ fontWeight: 'bold' }}
            >
              ⬇ Download
            </button>
            {items.find(i => selectedIds.has(i.id) && isText(i)) && (
              <button
                className="btn btn-sm"
                onClick={() => {
                  const selectedFile = items.find(i => selectedIds.has(i.id) && isText(i))
                  if (selectedFile) handleCopyToPcClipboard(selectedFile.id)
                }}
                title="Copy code/text directly to PC clipboard so you can paste (Ctrl+V) anywhere on your local computer"
              >
                📋 Copy to PC
              </button>
            )}
          </>
        )}
        <div style={{ flex: 1 }} />
        <button
          className={`btn btn-sm ${viewMode === 'icons' ? 'pressed' : ''}`}
          onClick={() => setViewMode('icons')}
          title="Icon view"
          aria-pressed={viewMode === 'icons'}
        >
          ⊞
        </button>
        <button
          className={`btn btn-sm ${viewMode === 'list' ? 'pressed' : ''}`}
          onClick={() => setViewMode('list')}
          title="List view"
          aria-pressed={viewMode === 'list'}
        >
          ☰
        </button>
      </div>

      {/* Address bar */}
      <div className="explorer-address">
        <span className="explorer-address-label">Address</span>
        <div
          className="input explorer-address-input"
          style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, overflow: 'auto' }}
        >
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.id ?? 'root'}>
              {i > 0 && <span style={{ color: 'var(--text-muted)' }}>›</span>}
              <span
                style={{
                  cursor: i < breadcrumbs.length - 1 ? 'pointer' : 'default',
                  color: i < breadcrumbs.length - 1 ? 'var(--accent-blue)' : 'var(--text-primary)',
                  textDecoration: i < breadcrumbs.length - 1 ? 'underline' : 'none',
                  whiteSpace: 'nowrap',
                  fontSize: 11,
                }}
                onClick={() => {
                  if (i < breadcrumbs.length - 1) {
                    navigateTo(crumb.id, crumb.name)
                    setBreadcrumbs(prev => prev.slice(0, i + 1))
                  }
                }}
              >
                {crumb.name}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="explorer-main" style={{ flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div className="explorer-sidebar">
          <div
            className={`explorer-sidebar-item ${currentFolderId === null ? 'active' : ''}`}
            onClick={() => navigateTo(null, 'My Computer')}
            role="button"
            tabIndex={0}
          >
            <MyComputerIcon size={14} />
            My Computer
          </div>
          {items
            .filter(i => i.type === 'folder')
            .map(folder => (
              <div
                key={folder.id}
                className={`explorer-sidebar-item ${currentFolderId === folder.id ? 'active' : ''}`}
                onClick={() => navigateTo(folder.id, folder.name)}
                role="button"
                tabIndex={0}
              >
                <FolderSmallIcon size={14} />
                <span className="truncate">{folder.name}</span>
              </div>
            ))}
        </div>

        {/* Content */}
        <div
          className="explorer-content"
          onClick={() => setSelectedIds(new Set())}
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleFileUpload(e.dataTransfer.files)
            }
          }}
        >
          {loading ? (
            <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 11 }}>
              Loading...
            </div>
          ) : sortedItems.length === 0 && uploadKeys.length === 0 ? (
            <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 11 }}>
              This folder is empty.
              <br /><br />
              <span
                style={{ color: 'var(--accent-blue)', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload a file
              </span>{' '}
              or{' '}
              <span
                style={{ color: 'var(--accent-blue)', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setDialog({ type: 'newFolder', defaultValue: 'New Folder' })}
              >
                create a folder
              </span>
            </div>
          ) : viewMode === 'icons' ? (
            <div className="explorer-grid">
              {uploadKeys.map(key => (
                <div key={key} className="explorer-file-item" style={{ opacity: 0.6 }}>
                  <FileIcon size={32} />
                  <div className="explorer-file-label" style={{ fontSize: 10 }}>
                    Uploading...
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                      {uploadProgress[key]}%
                    </div>
                  </div>
                </div>
              ))}
              {sortedItems.map(item => (
                <div
                  key={item.id}
                  className={`explorer-file-item ${selectedIds.has(item.id) ? 'selected' : ''} ${dragOverId === item.id && item.type === 'folder' ? 'drop-target-active' : ''}`}
                  onClick={e => handleItemClick(e, item.id)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  onContextMenu={e => handleItemContextMenu(e, item.id)}
                  draggable
                  onDragStart={e => {
                    setDraggingId(item.id)
                    e.dataTransfer.setData('text/plain', item.id)
                  }}
                  onDragEnd={() => { setDraggingId(null); setDragOverId(null) }}
                  onDragOver={e => {
                    if (item.type === 'folder' && draggingId !== item.id) {
                      e.preventDefault()
                      setDragOverId(item.id)
                    }
                  }}
                  onDragLeave={() => setDragOverId(null)}
                  onDrop={async e => {
                    e.preventDefault()
                    const droppedId = e.dataTransfer.getData('text/plain')
                    if (droppedId && item.type === 'folder' && droppedId !== item.id) {
                      const moved = await moveItem(droppedId, item.id)
                      setLocalItems(prev => prev.filter(i => i.id !== droppedId))
                      removeItem(droppedId)
                    }
                    setDragOverId(null)
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={item.name}
                >
                  {renderIcon(item, 32)}
                  <div className="explorer-file-label">{item.name}</div>
                </div>
              ))}
            </div>
          ) : (
            /* List view */
            <div className="explorer-list">
              <div className="explorer-list-header">
                <div
                  className="explorer-list-header-cell"
                  onClick={() => setSortBy('name')}
                >
                  Name {sortBy === 'name' ? '▲' : ''}
                </div>
                <div
                  className="explorer-list-header-cell"
                  onClick={() => setSortBy('size')}
                >
                  Size {sortBy === 'size' ? '▲' : ''}
                </div>
                <div
                  className="explorer-list-header-cell"
                  onClick={() => setSortBy('type')}
                >
                  Type {sortBy === 'type' ? '▲' : ''}
                </div>
                <div
                  className="explorer-list-header-cell"
                  onClick={() => setSortBy('date')}
                >
                  Modified {sortBy === 'date' ? '▲' : ''}
                </div>
              </div>
              {sortedItems.map(item => (
                <div
                  key={item.id}
                  className={`explorer-list-row ${selectedIds.has(item.id) ? 'selected' : ''}`}
                  onClick={e => handleItemClick(e, item.id)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  onContextMenu={e => handleItemContextMenu(e, item.id)}
                  role="row"
                  tabIndex={0}
                >
                  <div className="explorer-list-cell">
                    {renderIcon(item, 16)}
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="explorer-list-cell text-muted text-xs">
                    {item.type === 'folder' ? '' : formatSize(item.size)}
                  </div>
                  <div className="explorer-list-cell text-muted text-xs">
                    {item.type === 'folder' ? 'Folder' : (getExtension(item.name).toUpperCase() || 'File')}
                  </div>
                  <div className="explorer-list-cell text-muted text-xs">
                    {formatDate(item.updated_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="window-statusbar">
        <div className="window-statusbar-section">
          {sortedItems.length} item{sortedItems.length !== 1 ? 's' : ''}
        </div>
        {selectedIds.size > 0 && (
          <div className="window-statusbar-section">
            {selectedIds.size} selected
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={e => handleFileUpload(e.target.files)}
        aria-hidden="true"
      />

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={buildContextMenuItems(contextMenu.targetId)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Dialogs */}
      {dialog?.type === 'rename' && (
        <SystemDialog
          title="Rename"
          message="Enter a new name:"
          type="prompt"
          defaultValue={dialog.defaultValue}
          confirmLabel="Rename"
          icon="question"
          onConfirm={value => {
            if (value && dialog.targetId) handleRename(dialog.targetId, value)
            setDialog(null)
          }}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog?.type === 'newFolder' && (
        <SystemDialog
          title="New Folder"
          message="Folder name:"
          type="prompt"
          defaultValue={dialog.defaultValue}
          confirmLabel="Create"
          icon="question"
          onConfirm={value => {
            if (value) handleNewFolder(value)
            setDialog(null)
          }}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog?.type === 'delete' && (
        <SystemDialog
          title="Confirm Delete"
          message={dialog.message || 'Move selected items to Recycle Bin?'}
          type="confirm"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          icon="question"
          onConfirm={() => {
            handleDelete(Array.from(selectedIds))
            setDialog(null)
          }}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog?.type === 'alert' && (
        <SystemDialog
          title="CloudDesk"
          message={dialog.message || ''}
          type="alert"
          icon="info"
          onConfirm={() => setDialog(null)}
        />
      )}

      {/* Hidden File Input for Upload */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files)
            e.target.value = ''
          }
        }}
      />

    </div>
  )
}
