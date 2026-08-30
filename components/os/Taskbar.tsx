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
          <div style={{ display: 'flex', gap: 1, height: 22, alignItems: 'center', paddingRight: 2 }} aria-hidden="true">
            <div style={{ width: 2, height: 18, borderLeft: '1px solid var(--bevel-light)', borderRight: '1px solid var(--bevel-dark)' }} />
            <div style={{ width: 2, height: 18, borderLeft: '1px solid var(--bevel-light)', borderRight: '1px solid var(--bevel-dark)' }} />
          </div>
          <button className="quick-launch-btn" onClick={onToggleShowDesktop} title="Show Desktop (Win+D)" aria-label="Show Desktop">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="2" width="14" height="10" fill="#008080" stroke="#000" strokeWidth="1" />
              <rect x="3" y="4" width="10" height="6" fill="#FFF" />
              <rect x="5" y="12" width="6" height="2" fill="#808080" />
            </svg>
          </button>
          <button className="quick-launch-btn" onClick={() => onLaunchApp?.('browser')} title="Internet Explorer" aria-label="Internet Explorer">
            <BrowserIcon size={18} />
          </button>
          <button className="quick-launch-btn" onClick={() => onLaunchApp?.('media-player')} title="Media Player" aria-label="Media Player">
            <MediaPlayerIcon size={18} />
          </button>
          <button className="quick-launch-btn" onClick={() => onLaunchApp?.('paint')} title="Paint" aria-label="Paint">
            <PaintIcon size={18} />
          </button>
          <button className="quick-launch-btn" onClick={() => onLaunchApp?.('notepad')} title="Notepad" aria-label="Notepad">
            <NotepadIcon size={18} />
          </button>
          <button className="quick-launch-btn" onClick={() => onLaunchApp?.('file-explorer')} title="My Computer (C:)" aria-label="My Computer">
            <MyComputerIcon size={18} />
          </button>
        </div>

        <div className="taskbar-divider" aria-hidden="true" />

        <div style={{ display: 'flex', gap: 3, flex: 1, overflow: 'hidden' }}>
          {windows.map(win => {
            const isActive = !win.minimized && windows.filter(w => !w.minimized)
              .reduce((top, w) => (w.zIndex > top.zIndex ? w : top), windows[0])?.id === win.id
            return (
              <button key={win.id} className={`taskbar-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleTaskbarBtnClick(win)} title={win.title} aria-label={win.title} aria-pressed={!win.minimized}>
                {getAppIcon(win.appId, 18)}
                <span className="taskbar-btn-label">{win.title}</span>
              </button>
            )
          })}
        </div>

        <div className="taskbar-tray" aria-label="System tray">
          <div title="CloudDesk Drive (C:) — 100% Synced & Online" style={{ display: 'flex', alignItems: 'center', cursor: 'default', padding: '0 2px' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="4" width="12" height="8" rx="1" fill="#A0A0A0" stroke="#000" strokeWidth="1" />
              <circle cx="11" cy="8" r="1.5" fill="#00FF00" />
              <line x1="4" y1="8" x2="8" y2="8" stroke="#FFF" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="tray-network-icon" title="Connected: CloudDesk Virtual Ethernet (100.0 Mbps)">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <rect x="1" y="1" width="7" height="6" fill="#008080" stroke="#000" strokeWidth="1" />
              <rect x="2" y="2" width="5" height="4" fill="#00FF88" opacity="0.85" />
              <rect x="9" y="6" width="7" height="6" fill="#008080" stroke="#000" strokeWidth="1" />
              <rect x="10" y="7" width="5" height="4" fill="#00AAFF" opacity="0.85" />
              <path d="M5 7 v5 h7 v-2" stroke="#000" strokeWidth="1" fill="none" />
            </svg>
          </div>
          <button className="btn-icon btn" style={{ minWidth: 22, width: 22, height: 22, padding: 0 }}
            onClick={onToggleSound}
            title={soundEnabled ? 'Volume (100%) — Audio enabled' : 'Volume Muted — Click to unmute'}
            aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}>
            {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
          </button>
          <div className="taskbar-divider" style={{ height: 20 }} aria-hidden="true" />
          <button
            style={{ background: 'transparent', border: 'none', padding: '0 4px', cursor: 'default', fontFamily: 'var(--font-ui)', fontSize: 11, display: 'flex', alignItems: 'center' }}
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
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ imageRendering: 'pixelated' }}>
      <polygon points="2,3 9,1 9,8 2,10" fill="#E81123" />
      <polygon points="10.5,1 18,3 18,10 10.5,8" fill="#107C10" />
      <polygon points="2,11.5 9,9.5 9,16.5 2,18.5" fill="#0078D7" />
      <polygon points="10.5,9.5 18,11.5 18,18.5 10.5,16.5" fill="#FFB900" />
      <rect x="0" y="5" width="1.5" height="1.5" fill="#E81123" />
      <rect x="0" y="13" width="1.5" height="1.5" fill="#0078D7" />
      <rect x="18.5" y="5" width="1.5" height="1.5" fill="#107C10" />
      <rect x="18.5" y="13" width="1.5" height="1.5" fill="#FFB900" />
    </svg>
  )
}

function SoundOnIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M1 4h2l3-3v10L3 8H1z" />
      <path d="M7.5 3.5c1 .8 1.5 1.5 1.5 2.5s-.5 1.7-1.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M9.5 2c1.5 1.2 2 2.4 2 4s-.5 2.8-2 4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function SoundOffIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M1 4h2l3-3v10L3 8H1z" />
      <line x1="8" y1="4" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="4" x2="8" y2="8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
