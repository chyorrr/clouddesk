'use client'

import React, { useEffect, useRef, useCallback } from 'react'

export interface MenuItemDef {
  label: string
  shortcut?: string
  icon?: React.ReactNode
  disabled?: boolean
  separator?: false
  onClick?: () => void
}

export interface SeparatorDef {
  separator: true
}

export type MenuEntry = MenuItemDef | SeparatorDef

interface ContextMenuProps {
  x: number
  y: number
  items: MenuEntry[]
  onClose: () => void
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleMouseDown, true)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // Clamp to viewport
  useEffect(() => {
    if (!menuRef.current) return
    const rect = menuRef.current.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight - 28 // taskbar

    let left = x
    let top = y
    if (left + rect.width > vw) left = vw - rect.width - 4
    if (top + rect.height > vh) top = vh - rect.height - 4

    menuRef.current.style.left = `${Math.max(0, left)}px`
    menuRef.current.style.top  = `${Math.max(0, top)}px`
  }, [x, y])

  return (
    <div
      ref={menuRef}
      className="menu-popup os-chrome"
      style={{ left: x, top: y }}
      role="menu"
      onContextMenu={e => e.preventDefault()}
    >
      {items.map((item, i) => {
        if ('separator' in item && item.separator) {
          return <div key={i} className="menu-separator" role="separator" />
        }

        const entry = item as MenuItemDef
        return (
          <div
            key={i}
            className={`menu-item ${entry.disabled ? 'disabled' : ''}`}
            role="menuitem"
            tabIndex={entry.disabled ? -1 : 0}
            onClick={() => {
              if (!entry.disabled) {
                onClose()
                entry.onClick?.()
              }
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !entry.disabled) {
                onClose()
                entry.onClick?.()
              }
            }}
          >
            {entry.icon && <span className="menu-item-icon">{entry.icon}</span>}
            {entry.label}
            {entry.shortcut && (
              <span className="menu-item-shortcut">{entry.shortcut}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
