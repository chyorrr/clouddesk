'use client'

import React, { useState, useRef, useEffect } from 'react'
import { AppId, useWindowStore } from '@/store/windows'
import { useDesktopStore } from '@/store/desktop'
import { playClickSound, playErrorSound, playOpenWindowSound } from '@/lib/sound'

interface RunDialogProps {
  isOpen: boolean
  onClose: () => void
  onRun: (appId: AppId, data?: Record<string, unknown>) => void
}

export default function RunDialog({ isOpen, onClose, onRun }: RunDialogProps) {
  const [command, setCommand] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const soundEnabled = useDesktopStore(s => s.settings.soundEnabled)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault()
    const cmd = command.trim().toLowerCase()
    if (!cmd) return

    if (soundEnabled) playClickSound()

    // Command mapping
    if (cmd === 'calc' || cmd === 'calculator') {
      onRun('calculator')
      onClose()
    } else if (cmd === 'paint' || cmd === 'mspaint' || cmd === 'pbrush') {
      onRun('paint')
      onClose()
    } else if (cmd === 'notepad') {
      onRun('notepad')
      onClose()
    } else if (cmd === 'cmd' || cmd === 'command' || cmd === 'terminal' || cmd === 'dos') {
      onRun('terminal')
      onClose()
    } else if (cmd === 'iexplore' || cmd === 'browser' || cmd === 'www' || cmd.startsWith('http://') || cmd.startsWith('https://')) {
      onRun('browser', { initialUrl: cmd.startsWith('http') ? cmd : undefined })
      onClose()
    } else if (cmd === 'mail' || cmd === 'email' || cmd === 'outlook') {
      onRun('email')
      onClose()
    } else if (cmd === 'explorer' || cmd === 'files') {
      onRun('file-explorer')
      onClose()
    } else if (cmd === 'control' || cmd === 'settings') {
      onRun('settings')
      onClose()
    } else if (cmd === 'help' || cmd === 'winhelp') {
      onRun('help')
      onClose()
    } else if (cmd === 'mplayer' || cmd === 'media') {
      onRun('media-player')
      onClose()
    } else {
      if (soundEnabled) playErrorSound()
      alert(`Cannot find the file '${command}' (or one of its components). Make sure the path and filename are correct.`)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'transparent',
        zIndex: 10005,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        className="os-chrome"
        style={{
          width: 360,
          background: 'var(--sys-bg)',
          border: '2px solid',
          borderTopColor: 'var(--bevel-light)',
          borderLeftColor: 'var(--bevel-light)',
          borderBottomColor: 'var(--bevel-dark)',
          borderRightColor: 'var(--bevel-dark)',
          boxShadow: '3px 3px 6px rgba(0,0,0,0.4)',
        }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-labelledby="run-title"
      >
        {/* Title bar */}
        <div className="window-titlebar" style={{ cursor: 'default' }}>
          <span id="run-title" className="window-title-text">Run</span>
          <button className="window-ctrl-btn close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleExecute} style={{ padding: '12px 14px' }}>
          {/* Header row with classic Run icon */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
            <svg width="34" height="34" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
              <rect x="2" y="4" width="28" height="20" rx="1" fill="#FFFFFF" stroke="#000" strokeWidth="1.5" />
              <rect x="5" y="7" width="22" height="14" fill="#000080" />
              <rect x="4" y="24" width="24" height="4" fill="#808080" stroke="#000" strokeWidth="1" />
              <polygon points="12,14 18,14 18,11 23,15 18,19 18,16 12,16" fill="#00FF00" />
            </svg>
            <div style={{ fontSize: 11, lineHeight: 1.35 }}>
              Type the name of a program, folder, document, or Internet resource, and CloudDesk will open it for you.
            </div>
          </div>

          {/* Open input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <label htmlFor="run-input" style={{ fontSize: 11, fontWeight: 'bold' }}>
              Open:
            </label>
            <input
              ref={inputRef}
              id="run-input"
              className="input"
              style={{ flex: 1, height: 22 }}
              type="text"
              value={command}
              onChange={e => setCommand(e.target.value)}
              placeholder="e.g. calc, paint, notepad, browser, mail..."
              autoComplete="off"
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
            <button type="submit" className="btn btn-default" style={{ minWidth: 70 }}>
              OK
            </button>
            <button type="button" className="btn" onClick={onClose} style={{ minWidth: 70 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
