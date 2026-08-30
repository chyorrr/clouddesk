'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useWindowStore, WindowState, AppId } from '@/store/windows'
import Clock from './Clock'
import {
  FolderSmallIcon,
  NotepadIcon,
  ImageViewerIcon,
  RecycleBinIcon,
  SearchIcon,
  MyComputerIcon,
  StorageIcon,
  SettingsIcon,
  PaintIcon,
  MediaPlayerIcon,
  CalculatorIcon,
  BrowserIcon,
  EmailIcon,
  PDFIcon,
  HelpIcon,
  FilePropertiesIcon,
  TerminalIcon,
} from '@/components/icons'

function getAppIcon(appId: AppId, size = 14) {
  switch (appId) {
    case 'file-explorer':   return <MyComputerIcon size={size} />
    case 'notepad':         return <NotepadIcon size={size} />
    case 'image-viewer':    return <ImageViewerIcon size={size} />
    case 'recycle-bin':     return <RecycleBinIcon size={size} />
    case 'search':          return <SearchIcon size={size} />
    case 'storage-info':    return <StorageIcon size={size} />
    case 'settings':        return <SettingsIcon size={size} />
    case 'media-player':    return <MediaPlayerIcon size={size} />
    case 'paint':           return <PaintIcon size={size} />
    case 'pdf-viewer':      return <PDFIcon size={size} />
    case 'calculator':      return <CalculatorIcon size={size} />
    case 'browser':         return <BrowserIcon size={size} />
    case 'email':           return <EmailIcon size={size} />
    case 'help':            return <HelpIcon size={size} />
    case 'system-info':     return <MyComputerIcon size={size} />
    case 'file-properties': return <FilePropertiesIcon size={size} />
    case 'terminal':        return <TerminalIcon size={size} />
    default:                return <FolderSmallIcon size={size} />
  }
}

interface TaskbarProps {
  onOpenStartMenu: () => void
  startMenuOpen: boolean
  soundEnabled: boolean
  onToggleSound: () => void
  onLaunchApp?: (appId: AppId) => void
  onToggleShowDesktop?: () => void
  onCascadeWindows?: () => void
  onTileHorizontal?: () => void
  onTileVertical?: () => void
  onMinimizeAll?: () => void
  onUndoMinimizeAll?: () => void
}

function CalendarPopup({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa']
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} style={{
      position: 'fixed', bottom: 40, right: 4, zIndex: 9999,
      background: 'var(--sys-bg)',
      border: '2px solid',
      borderTopColor: 'var(--bevel-light)', borderLeftColor: 'var(--bevel-light)',
      borderBottomColor: 'var(--bevel-dark)', borderRightColor: 'var(--bevel-dark)',
      boxShadow: '2px 2px 6px rgba(0,0,0,0.5)',
      padding: 8, fontFamily: 'var(--font-ui)', fontSize: 11, width: 180, userSelect: 'none',
    }}>
      <div style={{
        textAlign: 'center', fontWeight: 'bold', marginBottom: 6,
        background: 'var(--titlebar-active)', color: '#FFF', padding: '2px 4px', fontSize: 11,
      }}>
        {monthNames[month]} {year}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 2 }}>
        {dayNames.map(d => (
          <div key={d} style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--text-muted)', fontSize: 10 }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {cells.map((day, i) => (
          <div key={i} style={{
            textAlign: 'center', padding: '2px 0', fontSize: 11,
            fontWeight: day === today ? 'bold' : 'normal',
            background: day === today ? 'var(--titlebar-active)' : 'transparent',
            color: day === today ? '#FFF' : 'var(--text-primary)',
          }}>
            {day || ''}
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 8, borderTop: '1px solid var(--bevel-mid-dark)',
        paddingTop: 4, textAlign: 'center', fontSize: 10, color: 'var(--text-muted)',
      }}>
        {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  )
}

function TaskbarContextMenu({ x, y, onClose, onCascade, onTileH, onTileV, onMinAll, onUndoMin }: {
  x: number; y: number; onClose: () => void
  onCascade?: () => void; onTileH?: () => void; onTileV?: () => void
  onMinAll?: () => void; onUndoMin?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', h)
    document.addEventListener('keydown', k)
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k) }
  }, [onClose])

  const items: ({ label: string; action?: () => void } | null)[] = [
    { label: 'Cascade Windows', action: onCascade },
    { label: 'Tile Windows Horizontally', action: onTileH },
    { label: 'Tile Windows Vertically', action: onTileV },
    null,
    { label: 'Minimize All Windows', action: onMinAll },
    { label: 'Undo Minimize All', action: onUndoMin },
  ]

  const menuH = items.length * 22 + 8
  const topPos = Math.max(4, y - menuH - 40)

  return (
    <div ref={ref} role="menu" style={{
      position: 'fixed', left: x, top: topPos, zIndex: 9999,
      background: 'var(--sys-bg)',
      border: '2px solid',
      borderTopColor: 'var(--bevel-light)', borderLeftColor: 'var(--bevel-light)',
      borderBottomColor: 'var(--bevel-dark)', borderRightColor: 'var(--bevel-dark)',
      boxShadow: '2px 2px 4px rgba(0,0,0,0.4)',
      padding: '2px 0', minWidth: 200, fontFamily: 'var(--font-ui)', fontSize: 11,
    }}>
      {items.map((item, i) =>
        item === null ? (
          <div key={i} style={{ height: 1, background: 'var(--bevel-mid-dark)', margin: '2px 4px' }} />
        ) : (
          <div key={i} role="menuitem" tabIndex={0}
            style={{ padding: '4px 20px 4px 8px', cursor: 'default' }}
            onClick={() => { item.action?.(); onClose() }}
            onKeyDown={e => { if (e.key === 'Enter') { item.action?.(); onClose() } }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--select-bg)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--select-text)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
            }}
          >
            {item.label}
          </div>
        )
      )}
    </div>
  )
}

export default function Taskbar({
  onOpenStartMenu, startMenuOpen, soundEnabled, onToggleSound,
  onLaunchApp, onToggleShowDesktop,
  onCascadeWindows, onTileHorizontal, onTileVertical, onMinimizeAll, onUndoMinimizeAll,
}: TaskbarProps) {
  const { windows, focusWindow, minimizeWindow, restoreWindow } = useWindowStore()
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)

  const handleTaskbarBtnClick = (win: WindowState) => {
    if (win.minimized) {
      restoreWindow(win.id)
    } else {
      const isTopFocused = windows.filter(w => !w.minimized)
        .reduce((top, w) => (w.zIndex > top.zIndex ? w : top), windows[0])?.id === win.id
      if (isTopFocused) minimizeWindow(win.id)
      else focusWindow(win.id)
    }
  }

  return (
    <>
      <div className="taskbar os-chrome" role="toolbar" aria-label="Taskbar"
        onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY }) }}
      >
        <button id="start-button" className={`start-btn ${startMenuOpen ? 'open' : ''}`}
          onClick={onOpenStartMenu} aria-haspopup="true" aria-expanded={startMenuOpen} aria-label="Start menu">
          <StartLogoIcon />
          <span>Start</span>
        </button>

        <div className="taskbar-divider" aria-hidden="true" />

        <div className="taskbar-quick-launch" title="Quick Launch">
          <div style={{ display: 'flex', gap: 1, height: 26, alignItems: 'center', paddingRight: 3 }} aria-hidden="true">
            <div style={{ width: 2, height: 26, borderLeft: '1px solid var(--bevel-light)', borderRight: '1px solid var(--bevel-dark)' }} />
            <div style={{ width: 2, height: 26, borderLeft: '1px solid var(--bevel-light)', borderRight: '1px solid var(--bevel-dark)' }} />
          </div>
          <button className="quick-launch-btn" onClick={onToggleShowDesktop} title="Show Desktop (Win+D)" aria-label="Show Desktop">
            <svg width="26" height="26" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="2" width="14" height="10" fill="#008080" stroke="#000" strokeWidth="1" />
              <rect x="3" y="4" width="10" height="6" fill="#FFF" />
              <rect x="5" y="12" width="6" height="2" fill="#808080" />
            </svg>
          </button>
          <button className="quick-launch-btn" onClick={() => onLaunchApp?.('browser')} title="World Wide Web Browser" aria-label="Internet Browser">
            <BrowserIcon size={26} />
          </button>
          <button className="quick-launch-btn" onClick={() => onLaunchApp?.('media-player')} title="CloudDesk Media Player" aria-label="Media Player">
            <MediaPlayerIcon size={26} />
          </button>
          <button className="quick-launch-btn" onClick={() => onLaunchApp?.('paint')} title="Paint — Bitmap Editor" aria-label="Paint">
            <PaintIcon size={26} />
          </button>
          <button className="quick-launch-btn" onClick={() => onLaunchApp?.('notepad')} title="Notepad Text Editor" aria-label="Notepad">
            <NotepadIcon size={26} />
          </button>
          <button className="quick-launch-btn" onClick={() => onLaunchApp?.('file-explorer')} title="My Computer (C:)" aria-label="My Computer">
            <MyComputerIcon size={26} />
          </button>
          <button className="quick-launch-btn" onClick={() => onLaunchApp?.('email')} title="CloudDesk Mail" aria-label="Cloud Mail">
            <EmailIcon size={26} />
          </button>
          <button className="quick-launch-btn" onClick={() => onLaunchApp?.('terminal')} title="MS-DOS Prompt" aria-label="MS-DOS Prompt">
            <TerminalIcon size={26} />
          </button>
        </div>

        <div className="taskbar-divider" aria-hidden="true" />

        <div style={{ display: 'flex', gap: 4, flex: 1, overflow: 'hidden' }}>
          {windows.map(win => {
            const isActive = !win.minimized && windows.filter(w => !w.minimized)
              .reduce((top, w) => (w.zIndex > top.zIndex ? w : top), windows[0])?.id === win.id
            return (
              <button key={win.id} className={`taskbar-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleTaskbarBtnClick(win)} title={win.title} aria-label={win.title} aria-pressed={!win.minimized}>
                {getAppIcon(win.appId, 20)}
                <span className="taskbar-btn-label">{win.title}</span>
              </button>
            )
          })}
        </div>

        <div className="taskbar-tray" aria-label="System tray">
          <div title="CloudDesk Drive (C:) — 100% Synced & Online" style={{ display: 'flex', alignItems: 'center', cursor: 'default', padding: '0 2px' }}>
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="5" width="16" height="11" rx="1.5" fill="#B0B0B0" stroke="#000" strokeWidth="1.2" />
              <rect x="4" y="7" width="12" height="4" fill="#D8D8D8" />
              <circle cx="15" cy="12.5" r="2" fill="#00FF00" />
              <circle cx="15" cy="12.5" r="1" fill="#FFF" />
              <line x1="5" y1="12.5" x2="11" y2="12.5" stroke="#404040" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="tray-network-icon" title="Connected: CloudDesk Virtual Ethernet (100.0 Mbps)" style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="22" viewBox="0 0 24 20" fill="none">
              <rect x="1" y="2" width="10" height="9" fill="#008080" stroke="#000" strokeWidth="1.2" />
              <rect x="2.5" y="3.5" width="7" height="6" fill="#00FF88" opacity="0.9" />
              <rect x="12" y="8" width="10" height="9" fill="#008080" stroke="#000" strokeWidth="1.2" />
              <rect x="13.5" y="9.5" width="7" height="6" fill="#00AAFF" opacity="0.9" />
              <path d="M6 11 v6 h11 v-3" stroke="#000" strokeWidth="1.4" fill="none" />
            </svg>
          </div>
          <button className="btn-icon btn" style={{ minWidth: 26, width: 26, height: 26, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={onToggleSound}
            title={soundEnabled ? 'Volume (100%) — Audio enabled' : 'Volume Muted — Click to unmute'}
            aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}>
            {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
          </button>
          <div className="taskbar-divider" style={{ height: 24 }} aria-hidden="true" />
          <button
            style={{ background: 'transparent', border: 'none', padding: '0 6px', cursor: 'default', fontFamily: 'var(--font-ui)', fontSize: 13, display: 'flex', alignItems: 'center' }}
            onClick={() => setShowCalendar(v => !v)}
            title="Click for calendar"
            aria-label="System clock — click for calendar"
          >
            <Clock />
          </button>
        </div>
      </div>

      {contextMenu && (
        <TaskbarContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)}
          onCascade={onCascadeWindows} onTileH={onTileHorizontal} onTileV={onTileVertical}
          onMinAll={onMinimizeAll} onUndoMin={onUndoMinimizeAll} />
      )}

      {showCalendar && <CalendarPopup onClose={() => setShowCalendar(false)} />}
    </>
  )
}

function StartLogoIcon() {
  return (
    <img
      src="/icons/crete-logo.png"
      alt="Start"
      width={24}
      height={24}
      style={{
        width: 24,
        height: 24,
        objectFit: 'contain',
        imageRendering: 'pixelated',
        flexShrink: 0,
        display: 'block',
      }}
    />
  )
}

function SoundOnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 5h3l4-4v14L5 11H2z" />
      <path d="M10.5 4.5c1.5 1.2 2 2.2 2 3.5s-.5 2.3-2 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 2.5c2.2 1.8 3 3.5 3 5.5s-.8 3.7-3 5.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SoundOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 5h3l4-4v14L5 11H2z" />
      <line x1="11" y1="5" x2="16" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="5" x2="11" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
