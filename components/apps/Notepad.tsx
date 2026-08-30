'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { FsItem } from '@/store/filesystem'
import { getFileContent, saveFileContent, createTextFile, formatSize } from '@/lib/fs-api'
import SystemDialog from '@/components/os/SystemDialog'

interface NotepadProps {
  item?: FsItem | null
  initialContent?: string
  parentFolderId?: string | null
  onClose: () => void
  onTitleChange?: (title: string) => void
  onFileSaved?: (item: FsItem) => void
}

export default function Notepad({
  item,
  initialContent,
  parentFolderId,
  onClose,
  onTitleChange,
  onFileSaved,
}: NotepadProps) {
  const [content, setContent] = useState(initialContent || '')
  const [savedContent, setSavedContent] = useState(initialContent || '')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [currentItem, setCurrentItem] = useState<FsItem | null>(item || null)
  const [dialog, setDialog] = useState<{
    type: 'unsaved' | 'saveAs' | 'alert' | 'new'
    message?: string
    onAfter?: () => void
  } | null>(null)

  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isDirty = content !== savedContent

  // Load file content
  useEffect(() => {
    if (!item) return
    setLoading(true)
    getFileContent(item.id)
      .then(text => {
        setContent(text)
        setSavedContent(text)
      })
      .catch(() => setContent(''))
      .finally(() => setLoading(false))
  }, [item])

  // Update window title
  useEffect(() => {
    const name = currentItem?.name || 'Untitled.txt'
    onTitleChange?.(`${isDirty ? '* ' : ''}${name} — Notepad`)
  }, [isDirty, currentItem, onTitleChange])

  const handleSave = useCallback(async () => {
    if (!currentItem) {
      setDialog({ type: 'saveAs' })
      return
    }
    setSaving(true)
    try {
      const updated = await saveFileContent(currentItem.id, content)
      setSavedContent(content)
      setCurrentItem(updated)
      onFileSaved?.(updated)
    } catch (e) {
      setDialog({ type: 'alert', message: 'Failed to save file.' })
    } finally {
      setSaving(false)
    }
  }, [currentItem, content, onFileSaved])

  const handleSaveAs = async (name: string) => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const filename = name.trim().endsWith('.txt') ? name.trim() : `${name.trim()}.txt`
      const newItem = await createTextFile(filename, parentFolderId || null, content)
      setCurrentItem(newItem)
      setSavedContent(content)
      onFileSaved?.(newItem)
      onTitleChange?.(`${newItem.name} — Notepad`)
    } catch (e) {
      setDialog({ type: 'alert', message: 'Failed to save file.' })
    } finally {
      setSaving(false)
    }
  }

  const requestClose = () => {
    if (isDirty) {
      setDialog({ type: 'unsaved', onAfter: onClose })
    } else {
      onClose()
    }
  }

  const requestNew = () => {
    if (isDirty) {
      setDialog({ type: 'new' })
    } else {
      setContent('')
      setSavedContent('')
      setCurrentItem(null)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      if (e.key === 's') { e.preventDefault(); handleSave() }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave])

  const closeMenu = useCallback(() => setMenuOpen(null), [])

  const wordCount = content.split(/\s+/).filter(Boolean).length
  const charCount = content.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Menu bar */}
      <div className="window-menubar os-chrome" onMouseLeave={closeMenu}>
        {/* File menu */}
        <div style={{ position: 'relative' }}>
          <div
            className={`window-menubar-item ${menuOpen === 'file' ? 'open' : ''}`}
            onClick={() => setMenuOpen(menuOpen === 'file' ? null : 'file')}
          >
            File
          </div>
          {menuOpen === 'file' && (
            <div className="menu-popup" style={{ top: '100%', left: 0 }}>
              <div className="menu-item" onClick={() => { closeMenu(); requestNew() }}>
                New<span className="menu-item-shortcut">Ctrl+N</span>
              </div>
              <div className="menu-separator" />
              <div className="menu-item" onClick={() => { closeMenu(); handleSave() }}>
                Save<span className="menu-item-shortcut">Ctrl+S</span>
              </div>
              <div className="menu-item" onClick={() => { closeMenu(); setDialog({ type: 'saveAs' }) }}>
                Save As...
              </div>
              <div
                className="menu-item"
                onClick={() => {
                  closeMenu()
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = currentItem?.name || 'Untitled.txt'
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  setTimeout(() => URL.revokeObjectURL(url), 2000)
                }}
              >
                Download to PC...
              </div>
              <div className="menu-separator" />
              <div className="menu-item" onClick={() => { closeMenu(); requestClose() }}>
                Exit
              </div>
            </div>
          )}
        </div>

        {/* Edit menu */}
        <div style={{ position: 'relative' }}>
          <div
            className={`window-menubar-item ${menuOpen === 'edit' ? 'open' : ''}`}
            onClick={() => setMenuOpen(menuOpen === 'edit' ? null : 'edit')}
          >
            Edit
          </div>
          {menuOpen === 'edit' && (
            <div className="menu-popup" style={{ top: '100%', left: 0 }}>
              <div className="menu-item" onClick={() => { closeMenu(); document.execCommand('cut') }}>
                Cut<span className="menu-item-shortcut">Ctrl+X</span>
              </div>
              <div className="menu-item" onClick={() => { closeMenu(); document.execCommand('copy') }}>
                Copy<span className="menu-item-shortcut">Ctrl+C</span>
              </div>
              <div className="menu-item" onClick={() => { closeMenu(); document.execCommand('paste') }}>
                Paste<span className="menu-item-shortcut">Ctrl+V</span>
              </div>
              <div className="menu-separator" />
              <div
                className="menu-item"
                onClick={async () => {
                  closeMenu()
                  try {
                    await navigator.clipboard.writeText(content)
                    setDialog({
                      type: 'alert',
                      message: 'Full document content copied to your physical computer\'s clipboard!',
                    })
                  } catch {
                    textareaRef.current?.select()
                    document.execCommand('copy')
                  }
                }}
              >
                Copy All to PC Clipboard
              </div>
              <div className="menu-separator" />
              <div className="menu-item" onClick={() => { closeMenu(); textareaRef.current?.select() }}>
                Select All<span className="menu-item-shortcut">Ctrl+A</span>
              </div>
            </div>
          )}
        </div>

        {/* Format menu */}
        <div style={{ position: 'relative' }}>
          <div
            className={`window-menubar-item ${menuOpen === 'format' ? 'open' : ''}`}
            onClick={() => setMenuOpen(menuOpen === 'format' ? null : 'format')}
          >
            Format
          </div>
          {menuOpen === 'format' && (
            <div className="menu-popup" style={{ top: '100%', left: 0 }}>
              <div className="menu-item disabled">Word Wrap</div>
              <div className="menu-item disabled">Font...</div>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 8, color: 'var(--text-muted)', fontSize: 11 }}>Loading...</div>
        ) : (
          <textarea
            ref={textareaRef}
            className="notepad-editor"
            value={content}
            onChange={e => setContent(e.target.value)}
            spellCheck={false}
            aria-label="Text editor"
            placeholder="Type here..."
          />
        )}
      </div>

      {/* Status bar */}
      <div className="window-statusbar">
        <div className="window-statusbar-section">
          {charCount} chars
        </div>
        <div className="window-statusbar-section">
          {wordCount} words
        </div>
        {currentItem && (
          <div className="window-statusbar-section">
            {formatSize(currentItem.size)}
          </div>
        )}
        {saving && (
          <div className="window-statusbar-section" style={{ color: 'var(--accent-blue)' }}>
            Saving...
          </div>
        )}
        {isDirty && !saving && (
          <div className="window-statusbar-section" style={{ color: 'var(--accent-red)' }}>
            Unsaved changes
          </div>
        )}
      </div>

      {/* Dialogs */}
      {dialog?.type === 'unsaved' && (
        <SystemDialog
          title="Notepad"
          message={`Save changes to "${currentItem?.name || 'Untitled'}"?`}
          type="confirm"
          confirmLabel="Save"
          cancelLabel="Don't Save"
          icon="warning"
          onConfirm={async () => {
            await handleSave()
            setDialog(null)
            dialog.onAfter?.()
          }}
          onCancel={() => {
            setDialog(null)
            dialog.onAfter?.()
          }}
        />
      )}
      {dialog?.type === 'saveAs' && (
        <SystemDialog
          title="Save As"
          message="File name:"
          type="prompt"
          defaultValue={currentItem?.name || 'Untitled.txt'}
          confirmLabel="Save"
          icon="question"
          onConfirm={value => {
            if (value) handleSaveAs(value)
            setDialog(null)
          }}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog?.type === 'new' && (
        <SystemDialog
          title="Notepad"
          message="Save changes before creating a new document?"
          type="confirm"
          confirmLabel="Save"
          cancelLabel="Don't Save"
          icon="warning"
          onConfirm={async () => {
            await handleSave()
            setContent('')
            setSavedContent('')
            setCurrentItem(null)
            setDialog(null)
          }}
          onCancel={() => {
            setContent('')
            setSavedContent('')
            setCurrentItem(null)
            setDialog(null)
          }}
        />
      )}
      {dialog?.type === 'alert' && (
        <SystemDialog
          title="Notepad"
          message={dialog.message || ''}
          type="alert"
          icon="error"
          onConfirm={() => setDialog(null)}
        />
      )}
    </div>
  )
}
