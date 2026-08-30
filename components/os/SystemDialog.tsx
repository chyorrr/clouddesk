'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'

export interface DialogOptions {
  title?: string
  message: string
  type?: 'alert' | 'confirm' | 'prompt'
  confirmLabel?: string
  cancelLabel?: string
  defaultValue?: string
  icon?: 'info' | 'warning' | 'error' | 'question'
}

interface SystemDialogProps extends DialogOptions {
  onConfirm: (value?: string) => void
  onCancel?: () => void
}

export default function SystemDialog({
  title = 'CloudDesk',
  message,
  type = 'alert',
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  defaultValue = '',
  icon = 'info',
  onConfirm,
  onCancel,
}: SystemDialogProps) {
  const [inputValue, setInputValue] = useState(defaultValue)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (type === 'prompt') {
      inputRef.current?.focus()
      inputRef.current?.select()
    } else {
      confirmRef.current?.focus()
    }
  }, [type])

  // Trap focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (type === 'confirm' || type === 'prompt')) {
        onCancel?.()
      }
      if (e.key === 'Enter') {
        if (type === 'prompt') {
          onConfirm(inputValue)
        } else {
          onConfirm()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [type, inputValue, onConfirm, onCancel])

  const iconContent = {
    info:     <InfoDialogIcon />,
    warning:  <WarningDialogIcon />,
    error:    <ErrorDialogIcon />,
    question: <QuestionDialogIcon />,
  }[icon]

  return createPortal(
    <div className="dialog-overlay" role="presentation">
      <div
        className="dialog-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dlg-title"
        aria-describedby="dlg-msg"
      >
        <div className="dialog-titlebar os-chrome">
          <span id="dlg-title">{title}</span>
        </div>
        <div className="dialog-body">
          <div className="dialog-icon" aria-hidden="true">{iconContent}</div>
          <div className="dialog-text" id="dlg-msg">{message}</div>
        </div>
        {type === 'prompt' && (
          <div className="dialog-input-row">
            <input
              ref={inputRef}
              className="input"
              style={{ width: '100%' }}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              aria-label="Input"
            />
          </div>
        )}
        <div className="dialog-buttons">
          {(type === 'confirm' || type === 'prompt') && (
            <button
              className="btn"
              onClick={() => onCancel?.()}
            >
              {cancelLabel}
            </button>
          )}
          <button
            ref={confirmRef}
            className="btn btn-default"
            onClick={() => {
              if (type === 'prompt') onConfirm(inputValue)
              else onConfirm()
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// Dialog icon SVGs
function InfoDialogIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#000080" />
      <rect x="15" y="10" width="2" height="2" fill="white" />
      <rect x="15" y="14" width="2" height="10" fill="white" />
    </svg>
  )
}

function WarningDialogIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 4L2 28h28L16 4z" fill="#FFD700" />
      <path d="M16 4L2 28h28L16 4z" fill="none" stroke="#C0C000" strokeWidth="1" />
      <rect x="15" y="14" width="2" height="8" fill="#404000" />
      <rect x="15" y="24" width="2" height="2" fill="#404000" />
    </svg>
  )
}

function ErrorDialogIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#800000" />
      <line x1="10" y1="10" x2="22" y2="22" stroke="white" strokeWidth="2" />
      <line x1="22" y1="10" x2="10" y2="22" stroke="white" strokeWidth="2" />
    </svg>
  )
}

function QuestionDialogIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#000080" />
      <text x="16" y="22" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="serif">?</text>
    </svg>
  )
}
