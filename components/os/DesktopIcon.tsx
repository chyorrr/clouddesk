'use client'

import React, { useRef, useCallback } from 'react'
import { saveDesktopIconPosition } from '@/lib/fs-api'
import { playClickSound, playOpenWindowSound } from '@/lib/sound'
import { useDesktopStore } from '@/store/desktop'

interface DesktopIconProps {
  id: string
  label: string
  icon: React.ReactNode
  x: number
  y: number
  onDoubleClick: () => void
  onRightClick: (e: React.MouseEvent) => void
  onPositionChange: (id: string, x: number, y: number) => void
  isSelected: boolean
  onSelect: (id: string, multi: boolean) => void
}

const ICON_W = 82
const ICON_H = 84
const GRID = 4

export default function DesktopIcon({
  id,
  label,
  icon,
  x,
  y,
  onDoubleClick,
  onRightClick,
  onPositionChange,
  isSelected,
  onSelect,
}: DesktopIconProps) {
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const lastClick = useRef(0)
  const hasMoved = useRef(false)

  const snap = (v: number) => Math.round(v / GRID) * GRID

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    e.stopPropagation()

    if (useDesktopStore.getState().settings.soundEnabled) {
      playClickSound()
    }

    onSelect(id, e.ctrlKey || e.metaKey)

    dragging.current = true
    hasMoved.current = false
    dragOffset.current = {
      x: e.clientX - x,
      y: e.clientY - y,
    }

    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const newX = snap(Math.max(0, e.clientX - dragOffset.current.x))
      const newY = snap(Math.max(0, e.clientY - dragOffset.current.y))
      if (Math.abs(newX - x) > 4 || Math.abs(newY - y) > 4) {
        hasMoved.current = true
      }
      onPositionChange(id, newX, newY)
    }

    const onUp = (e: MouseEvent) => {
      dragging.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)

      if (!hasMoved.current) {
        // Check double click
        const now = Date.now()
        if (now - lastClick.current < 400) {
          if (useDesktopStore.getState().settings.soundEnabled) {
            playOpenWindowSound()
          }
          onDoubleClick()
        }
        lastClick.current = now
      } else {
        // Save position
        const newX = snap(Math.max(0, e.clientX - dragOffset.current.x))
        const newY = snap(Math.max(0, e.clientY - dragOffset.current.y))
        saveDesktopIconPosition(id, newX, newY).catch(() => {})
      }
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [id, x, y, onDoubleClick, onSelect, onPositionChange])

  return (
    <div
      ref={ref}
      className={`desktop-icon os-chrome ${isSelected ? 'selected' : ''}`}
      style={{ left: x, top: y, width: ICON_W }}
      onMouseDown={onMouseDown}
      onDoubleClick={(e) => {
        e.stopPropagation()
        if (useDesktopStore.getState().settings.soundEnabled) {
          playOpenWindowSound()
        }
        onDoubleClick()
      }}
      onContextMenu={e => {
        e.preventDefault()
        e.stopPropagation()
        onRightClick(e)
      }}
      role="button"
      tabIndex={0}
      aria-label={label}
      onKeyDown={e => {
        if (e.key === 'Enter') onDoubleClick()
        if (e.key === ' ') onSelect(id, e.ctrlKey)
      }}
    >
      <div className="desktop-icon-img" aria-hidden="true">
        {icon}
      </div>
      <div className="desktop-icon-label">{label}</div>
    </div>
  )
}
