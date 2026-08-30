'use client'

import React, { useRef, useCallback, useEffect, useState } from 'react'
import { useWindowStore, WindowState } from '@/store/windows'

interface WindowProps {
  window: WindowState
  children: React.ReactNode
  onFocus?: () => void
}

const TASKBAR_H = 28

export default function Window({ window: win, children, onFocus }: WindowProps) {
  const {
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    unmaximizeWindow,
    updateWindow,
    bringToFront,
  } = useWindowStore()

  const windowRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const resizing = useRef<string | null>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, wx: 0, wy: 0 })

  const [animClass, setAnimClass] = useState('')

  const isFocused = useWindowStore(s =>
    s.windows.reduce((topZ, w) => (w.id === win.id ? w.zIndex : topZ), 0) ===
    s.windows.reduce((max, w) => (!w.minimized ? Math.max(max, w.zIndex) : max), 0)
  )

  // Dragging
  const onTitleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    if (win.maximized) return
    
    bringToFront(win.id)
    dragging.current = true
    dragOffset.current = {
      x: e.clientX - win.x,
      y: e.clientY - win.y,
    }

    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const x = Math.max(0, e.clientX - dragOffset.current.x)
      const y = Math.max(0, Math.min(
        e.clientY - dragOffset.current.y,
        globalThis.innerHeight - TASKBAR_H - 30
      ))
      updateWindow(win.id, { x, y })
    }

    const onUp = () => {
      dragging.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [win, bringToFront, updateWindow])

  // Resizing
  const onResizeMouseDown = useCallback((e: React.MouseEvent, direction: string) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    bringToFront(win.id)
    resizing.current = direction
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      w: win.width,
      h: win.height,
      wx: win.x,
      wy: win.y,
    }

    const onMove = (e: MouseEvent) => {
      if (!resizing.current) return
      const dx = e.clientX - resizeStart.current.x
      const dy = e.clientY - resizeStart.current.y
      const dir = resizing.current

      let x = resizeStart.current.wx
      let y = resizeStart.current.wy
      let w = resizeStart.current.w
      let h = resizeStart.current.h

      if (dir.includes('e')) w = Math.max(200, w + dx)
      if (dir.includes('s')) h = Math.max(100, h + dy)
      if (dir.includes('w')) {
        w = Math.max(200, w - dx)
        x = resizeStart.current.wx + (resizeStart.current.w - w)
      }
      if (dir.includes('n')) {
        h = Math.max(100, h - dy)
        y = resizeStart.current.wy + (resizeStart.current.h - h)
      }

      updateWindow(win.id, { x, y, width: w, height: h })
    }

    const onUp = () => {
      resizing.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [win, bringToFront, updateWindow])

  const handleMinimize = useCallback(() => {
    setAnimClass('window-minimizing')
    setTimeout(() => {
      minimizeWindow(win.id)
      setAnimClass('')
    }, 100)
  }, [minimizeWindow, win.id])

  const handleMaximize = useCallback(() => {
    if (win.maximized) {
      unmaximizeWindow(win.id)
    } else {
      maximizeWindow(win.id)
    }
  }, [win.maximized, maximizeWindow, unmaximizeWindow, win.id])

  const handleClose = useCallback(() => {
    closeWindow(win.id)
  }, [closeWindow, win.id])

  const handleWindowClick = useCallback(() => {
    bringToFront(win.id)
    onFocus?.()
  }, [bringToFront, win.id, onFocus])

  if (win.minimized) return null

  const style: React.CSSProperties = win.maximized
    ? {
        left: 0,
        top: 0,
        width: '100vw',
        height: `calc(100vh - ${TASKBAR_H}px)`,
        zIndex: win.zIndex,
      }
    : {
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex,
      }

  return (
    <div
      ref={windowRef}
      className={`window ${isFocused ? 'focused' : 'inactive'} ${animClass}`}
      style={style}
      onMouseDown={handleWindowClick}
      role="dialog"
      aria-label={win.title}
    >
      {/* Resize handles */}
      {!win.maximized && (
        <>
          <div className="resize-handle resize-n"  onMouseDown={e => onResizeMouseDown(e, 'n')} />
          <div className="resize-handle resize-s"  onMouseDown={e => onResizeMouseDown(e, 's')} />
          <div className="resize-handle resize-e"  onMouseDown={e => onResizeMouseDown(e, 'e')} />
          <div className="resize-handle resize-w"  onMouseDown={e => onResizeMouseDown(e, 'w')} />
          <div className="resize-handle resize-nw" onMouseDown={e => onResizeMouseDown(e, 'nw')} />
          <div className="resize-handle resize-ne" onMouseDown={e => onResizeMouseDown(e, 'ne')} />
          <div className="resize-handle resize-se" onMouseDown={e => onResizeMouseDown(e, 'se')} />
          <div className="resize-handle resize-sw" onMouseDown={e => onResizeMouseDown(e, 'sw')} />
        </>
      )}

      {/* Title bar */}
      <div
        className="window-titlebar os-chrome"
        onMouseDown={onTitleMouseDown}
        onDoubleClick={handleMaximize}
      >
        {win.icon && (
          <span className="window-title-icon" aria-hidden="true">{win.icon}</span>
        )}
        <span className="window-title-text">{win.title}</span>
        <div className="window-controls" onMouseDown={e => e.stopPropagation()}>
          <button
            className="window-ctrl-btn"
            onClick={handleMinimize}
            title="Minimize"
            aria-label="Minimize window"
          >
            <MinimizeIcon />
          </button>
          <button
            className="window-ctrl-btn"
            onClick={handleMaximize}
            title={win.maximized ? 'Restore' : 'Maximize'}
            aria-label={win.maximized ? 'Restore window' : 'Maximize window'}
          >
            {win.maximized ? <RestoreIcon /> : <MaximizeIcon />}
          </button>
          <button
            className="window-ctrl-btn close"
            onClick={handleClose}
            title="Close"
            aria-label="Close window"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="window-body" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  )
}

function MinimizeIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
      <rect x="0" y="6" width="8" height="2" />
    </svg>
  )
}

function MaximizeIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="0.5" y="0.5" width="7" height="7" />
    </svg>
  )
}

function RestoreIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="2" y="0" width="6" height="6" />
      <rect x="0" y="2" width="6" height="6" fill="var(--sys-bg)" />
      <rect x="0" y="2" width="6" height="6" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
      <path d="M0 0L8 8M8 0L0 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )
}
