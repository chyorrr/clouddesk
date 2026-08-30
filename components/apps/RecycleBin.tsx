'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { FsItem } from '@/store/filesystem'
import {
  listDeleted,
  restoreItem,
  permanentlyDeleteItem,
  emptyRecycleBin,
  formatSize,
  formatDate,
} from '@/lib/fs-api'
import { FileIcon, FolderIcon, RecycleBinIcon } from '@/components/icons'
import SystemDialog from '@/components/os/SystemDialog'

export default function RecycleBin() {
  const [items, setItems] = useState<FsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [dialog, setDialog] = useState<{
    type: 'confirmEmpty' | 'confirmDelete'
  } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listDeleted()
      setItems(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleRestore = async (id: string) => {
    try {
      await restoreItem(id)
      setItems(prev => prev.filter(i => i.id !== id))
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n })
    } catch (e) {
      console.error(e)
    }
  }

  const handlePermanentDelete = async (id: string) => {
    try {
      await permanentlyDeleteItem(id)
      setItems(prev => prev.filter(i => i.id !== id))
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n })
    } catch (e) {
      console.error(e)
    }
  }

  const handleEmptyBin = async () => {
    try {
      await emptyRecycleBin()
      setItems([])
      setSelectedIds(new Set())
    } catch (e) {
      console.error(e)
    }
  }

  const handleItemClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (e.ctrlKey) {
      setSelectedIds(prev => {
        const n = new Set(prev)
        if (n.has(id)) n.delete(id); else n.add(id)
        return n
      })
    } else {
      setSelectedIds(new Set([id]))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div className="recycle-toolbar window-toolbar">
        <button
          className="btn btn-sm"
          onClick={() => {
            const sel = Array.from(selectedIds)
            for (const id of sel) handleRestore(id)
          }}
          disabled={selectedIds.size === 0}
          title="Restore selected"
          aria-label="Restore selected items"
        >
          ↩ Restore
        </button>
        <button
          className="btn btn-sm"
          onClick={() => setDialog({ type: 'confirmDelete' })}
          disabled={selectedIds.size === 0}
          title="Delete permanently"
          aria-label="Delete permanently"
          style={{ color: selectedIds.size > 0 ? 'var(--accent-red)' : '' }}
        >
          ✕ Delete
        </button>
        <div style={{ flex: 1 }} />
        <button
          className="btn btn-sm"
          onClick={() => setDialog({ type: 'confirmEmpty' })}
          disabled={items.length === 0}
          title="Empty Recycle Bin"
          aria-label="Empty Recycle Bin"
          style={{ color: items.length > 0 ? 'var(--accent-red)' : '' }}
        >
          Empty Recycle Bin
        </button>
      </div>

      {/* Content */}
      <div
        style={{ flex: 1, overflow: 'auto', background: 'var(--content-bg)', padding: 4 }}
        onClick={() => setSelectedIds(new Set())}
      >
        {loading ? (
          <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 11 }}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 11 }}>
            <RecycleBinIcon size={32} />
            <br /><br />
            Recycle Bin is empty.
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="explorer-list-header" style={{ gridTemplateColumns: '1fr 80px 100px 80px' }}>
              <div className="explorer-list-header-cell">Name</div>
              <div className="explorer-list-header-cell">Size</div>
              <div className="explorer-list-header-cell">Date Deleted</div>
              <div className="explorer-list-header-cell">Type</div>
            </div>
            {items.map(item => (
              <div
                key={item.id}
                className={`explorer-list-row ${selectedIds.has(item.id) ? 'selected' : ''}`}
                style={{ gridTemplateColumns: '1fr 80px 100px 80px' }}
                onClick={e => handleItemClick(e, item.id)}
                onDoubleClick={() => handleRestore(item.id)}
                role="row"
                tabIndex={0}
                title={`Double-click to restore`}
              >
                <div className="explorer-list-cell">
                  {item.type === 'folder'
                    ? <FolderIcon size={14} />
                    : <FileIcon size={14} />
                  }
                  <span className="truncate">{item.name}</span>
                </div>
                <div className="explorer-list-cell text-xs text-muted">
                  {item.type === 'folder' ? '' : formatSize(item.size)}
                </div>
                <div className="explorer-list-cell text-xs text-muted">
                  {item.deleted_at ? formatDate(item.deleted_at) : '—'}
                </div>
                <div className="explorer-list-cell text-xs text-muted">
                  {item.type === 'folder' ? 'Folder' : 'File'}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Status */}
      <div className="window-statusbar">
        <div className="window-statusbar-section">
          {items.length} item{items.length !== 1 ? 's' : ''} in Recycle Bin
        </div>
        {selectedIds.size > 0 && (
          <div className="window-statusbar-section">{selectedIds.size} selected</div>
        )}
      </div>

      {/* Dialogs */}
      {dialog?.type === 'confirmEmpty' && (
        <SystemDialog
          title="Empty Recycle Bin"
          message="Permanently delete all items in the Recycle Bin? This cannot be undone."
          type="confirm"
          confirmLabel="Empty"
          cancelLabel="Cancel"
          icon="warning"
          onConfirm={() => { handleEmptyBin(); setDialog(null) }}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog?.type === 'confirmDelete' && (
        <SystemDialog
          title="Confirm Delete"
          message={`Permanently delete ${selectedIds.size} item(s)? This cannot be undone.`}
          type="confirm"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          icon="warning"
          onConfirm={() => {
            Array.from(selectedIds).forEach(id => handlePermanentDelete(id))
            setDialog(null)
          }}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  )
}
