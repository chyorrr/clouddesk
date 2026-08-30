'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  MyComputerIcon,
  FolderSmallIcon,
  SearchIcon,
  SettingsIcon,
  RecycleBinIcon,
  StorageIcon,
  PaintIcon,
  MediaPlayerIcon,
  CalculatorIcon,
  BrowserIcon,
  EmailIcon,
  HelpIcon,
  NotepadIcon,
  PDFIcon,
  TextFileIcon,
  TerminalIcon,
} from '@/components/icons'
import { useRecentFilesStore } from '@/store/recentFiles'

interface StartMenuProps {
  username: string
  onClose: () => void
  onOpenApp: (appId: string, data?: Record<string, unknown>) => void
  onShutdownClick: () => void
  onRunClick?: () => void
}

export default function StartMenu({
  username,
  onClose,
  onOpenApp,
  onShutdownClick,
  onRunClick,
}: StartMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [activeSubmenu, setActiveSubmenu] = useState<'programs' | 'documents' | 'favorites' | null>(null)
  const { recentFiles } = useRecentFilesStore()

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const startBtn = document.getElementById('start-button')
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        startBtn &&
        !startBtn.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const launch = (appId: string, data?: Record<string, unknown>) => {
    onClose()
    onOpenApp(appId, data)
  }

  return (
    <div
      ref={menuRef}
      className="start-menu os-chrome"
      role="menu"
      aria-label="Start menu"
      style={{
        position: 'fixed',
        bottom: 'var(--taskbar-h)',
        left: 0,
        width: 220,
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'row',
        padding: 2,
      }}
    >
      {/* Authentic Windows 95/98 Vertical Left Sidebar Banner */}
      <div
        className="start-menu-sidebar"
        style={{
          width: 26,
          background: 'linear-gradient(to top, #00007A 0%, #1084D0 65%, #00007A 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 8,
          flexShrink: 0,
          userSelect: 'none',
          borderRight: '1px solid var(--bevel-mid-dark)',
        }}
      >
        <div
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 'bold',
            letterSpacing: '2.5px',
            fontFamily: 'var(--font-ui)',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ color: '#FFD700', fontSize: 10, fontWeight: 900 }}>CRETE </span>
          <span style={{ color: '#FFFFFF', fontWeight: 900 }}>CloudDesk</span>{' '}
          <span style={{ color: '#A0E0FF', fontSize: 10, fontWeight: 'bold' }}>2.0</span>
        </div>
      </div>

      {/* Menu Right Column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div className="start-menu-items" style={{ position: 'relative', flex: 1, padding: '2px 0' }}>
          {/* Programs Submenu Trigger */}
          <div
            className="start-menu-item"
            role="menuitem"
            tabIndex={0}
            onMouseEnter={() => setActiveSubmenu('programs')}
            onClick={() => setActiveSubmenu(activeSubmenu === 'programs' ? null : 'programs')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>📁</span>
              <strong>Programs</strong>
            </div>
            <span style={{ fontSize: 10 }}>▶</span>
          </div>

          {/* Documents / Recent Items Submenu Trigger */}
          <div
            className="start-menu-item"
            role="menuitem"
            tabIndex={0}
            onMouseEnter={() => setActiveSubmenu('documents')}
            onClick={() => setActiveSubmenu(activeSubmenu === 'documents' ? null : 'documents')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FolderSmallIcon size={20} />
              <strong>Documents</strong>
            </div>
            <span style={{ fontSize: 10 }}>▶</span>
          </div>

          {/* Favorites Submenu Trigger */}
          <div
            className="start-menu-item"
            role="menuitem"
            tabIndex={0}
            onMouseEnter={() => setActiveSubmenu('favorites')}
            onClick={() => setActiveSubmenu(activeSubmenu === 'favorites' ? null : 'favorites')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>⭐</span>
              <strong>Favorites</strong>
            </div>
            <span style={{ fontSize: 10 }}>▶</span>
          </div>

          <div className="start-menu-separator" role="separator" />

          {/* Direct Apps */}
          <div
            className="start-menu-item"
            role="menuitem"
            tabIndex={0}
            onMouseEnter={() => setActiveSubmenu(null)}
            onClick={() => launch('file-explorer')}
          >
            <MyComputerIcon size={20} />
            My Computer (C:)
          </div>

          <div
            className="start-menu-item"
            role="menuitem"
            tabIndex={0}
            onMouseEnter={() => setActiveSubmenu(null)}
            onClick={() => launch('search')}
          >
            <SearchIcon size={20} />
            Find Files or Folders...
          </div>

          <div
            className="start-menu-item"
            role="menuitem"
            tabIndex={0}
            onMouseEnter={() => setActiveSubmenu(null)}
            onClick={() => launch('settings')}
          >
            <SettingsIcon size={20} />
            Settings (Control Panel)
          </div>

          <div
            className="start-menu-item"
            role="menuitem"
            tabIndex={0}
            onMouseEnter={() => setActiveSubmenu(null)}
            onClick={() => launch('help')}
          >
            <HelpIcon size={20} />
            Help Topics
          </div>

          {/* Classic Run Dialog Trigger */}
          <div
            className="start-menu-item"
            role="menuitem"
            tabIndex={0}
            onMouseEnter={() => setActiveSubmenu(null)}
            onClick={() => {
              onClose()
              onRunClick?.()
            }}
          >
            <span style={{ fontSize: 16 }}>🏃</span>
            Run...
          </div>

          <div className="start-menu-separator" role="separator" />

          {/* Classic Windows Log Off */}
          <div
            className="start-menu-item"
            role="menuitem"
            tabIndex={0}
            onMouseEnter={() => setActiveSubmenu(null)}
            onClick={() => {
              onClose()
              onShutdownClick()
            }}
          >
            <span style={{ fontSize: 16 }}>🔑</span>
            Log Off {username}...
          </div>

          {/* Classic Windows Shut Down */}
          <div
            className="start-menu-item"
            role="menuitem"
            tabIndex={0}
            onMouseEnter={() => setActiveSubmenu(null)}
            onClick={() => {
              onClose()
              onShutdownClick()
            }}
            style={{ fontWeight: 'bold' }}
          >
            <span style={{ fontSize: 16 }}>🔴</span>
            Shut Down...
          </div>

        {/* Cascaded Favorites Submenu */}
        {activeSubmenu === 'favorites' && (
          <div
            className="menu-popup"
            style={{
              position: 'absolute',
              left: '100%',
              top: 56,
              width: 190,
              background: 'var(--sys-bg)',
              zIndex: 10001,
            }}
          >
            <div className="start-menu-item" onClick={() => launch('browser', { initialUrl: 'https://en.wikipedia.org' })}>
              <BrowserIcon size={16} /> Wikipedia
            </div>
            <div className="start-menu-item" onClick={() => launch('browser', { initialUrl: 'https://archive.org' })}>
              <BrowserIcon size={16} /> Internet Archive
            </div>
            <div className="start-menu-item" onClick={() => launch('browser', { initialUrl: 'https://news.ycombinator.com' })}>
              <BrowserIcon size={16} /> Hacker News
            </div>
          </div>
        )}

        {/* Cascaded Programs Submenu */}
        {activeSubmenu === 'programs' && (
          <div
            className="menu-popup"
            style={{
              position: 'absolute',
              left: '100%',
              top: 0,
              width: 180,
              background: 'var(--sys-bg)',
              zIndex: 10001,
            }}
          >
            <div className="start-menu-item" onClick={() => launch('file-explorer')}>
              <MyComputerIcon size={18} /> File Explorer
            </div>
            <div className="start-menu-item" onClick={() => launch('notepad')}>
              <NotepadIcon size={18} /> Notepad
            </div>
            <div className="start-menu-item" onClick={() => launch('paint')}>
              <PaintIcon size={18} /> Paint
            </div>
            <div className="start-menu-item" onClick={() => launch('media-player')}>
              <MediaPlayerIcon size={18} /> Media Player
            </div>
            <div className="start-menu-item" onClick={() => launch('calculator')}>
              <CalculatorIcon size={18} /> Calculator
            </div>
            <div className="start-menu-item" onClick={() => launch('browser')}>
              <BrowserIcon size={18} /> Web Browser
            </div>
            <div className="start-menu-item" onClick={() => launch('email')}>
              <EmailIcon size={18} /> Email Client
            </div>
            <div className="start-menu-item" onClick={() => launch('pdf-viewer')}>
              <PDFIcon size={18} /> PDF Viewer
            </div>
            <div className="start-menu-item" onClick={() => launch('terminal')}>
              <TerminalIcon size={18} /> MS-DOS Prompt
            </div>
            <div className="start-menu-item" onClick={() => launch('storage-info')}>
              <StorageIcon size={18} /> Disk Storage
            </div>
          </div>
        )}

        {/* Cascaded Documents Submenu */}
        {activeSubmenu === 'documents' && (
          <div
            className="menu-popup"
            style={{
              position: 'absolute',
              left: '100%',
              top: 28,
              width: 200,
              background: 'var(--sys-bg)',
              zIndex: 10001,
            }}
          >
            <div
              className="start-menu-item"
              onClick={() => launch('file-explorer', { folderId: 'documents', folderName: 'Documents' })}
              style={{ fontWeight: 'bold', borderBottom: '1px solid var(--bevel-mid-dark)', marginBottom: 2 }}
            >
              <FolderSmallIcon size={18} /> Open Documents Folder
            </div>
            {recentFiles.length === 0 ? (
              <div style={{ padding: '6px 12px', fontSize: 11, color: 'var(--text-muted)' }}>
                (No recent documents)
              </div>
            ) : (
              recentFiles.map((file) => (
                <div
                  key={file.id}
                  className="start-menu-item"
                  onClick={() => launch(file.appId, { fileId: file.id, fileName: file.name })}
                  title={file.name}
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  <TextFileIcon size={16} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
