'use client'

import React, { useState } from 'react'
import { MyComputerIcon } from '@/components/icons'

interface ShutdownDialogProps {
  isOpen: boolean
  username: string
  onClose: () => void
  onLogout: () => void
}

type ShutdownAction = 'shutdown' | 'restart' | 'logoff'

export default function ShutdownDialog({
  isOpen,
  username,
  onClose,
  onLogout,
}: ShutdownDialogProps) {
  const [action, setAction] = useState<ShutdownAction>('logoff')
  const [isShuttingDown, setIsShuttingDown] = useState(false)
  const [shutdownStatus, setShutdownStatus] = useState('')

  if (!isOpen) return null

  const handleConfirm = () => {
    if (action === 'logoff') {
      onLogout()
    } else if (action === 'restart') {
      setIsShuttingDown(true)
      setShutdownStatus('CloudDesk is restarting...')
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else if (action === 'shutdown') {
      setIsShuttingDown(true)
      setShutdownStatus('It is now safe to turn off your computer.')
    }
  }

  if (isShuttingDown) {
    return (
      <div className="dialog-overlay" style={{ background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#FF9900', fontFamily: 'monospace', fontSize: 16, textAlign: 'center', padding: 20 }}>
          <p style={{ marginBottom: 16 }}>{shutdownStatus}</p>
          {action === 'shutdown' && (
            <button
              className="btn btn-default"
              style={{ marginTop: 20 }}
              onClick={() => {
                setIsShuttingDown(false)
                onClose()
              }}
            >
              Power On CloudDesk
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="dialog-box"
        style={{ width: 360 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="shutdown-title"
      >
        <div className="dialog-titlebar">
          <span style={{ fontSize: 11, marginRight: 4 }}>💻</span>
          <span id="shutdown-title">Shut Down CloudDesk</span>
        </div>

        <div className="shutdown-dialog-content">
          <div className="shutdown-row">
            <div style={{ flexShrink: 0, marginTop: 4 }}>
              <MyComputerIcon size={36} />
            </div>
            <div className="shutdown-options">
              <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', marginBottom: 4 }}>
                What do you want the computer to do?
              </div>

              <label className="shutdown-radio-label">
                <input
                  type="radio"
                  name="shutdown_action"
                  checked={action === 'logoff'}
                  onChange={() => setAction('logoff')}
                />
                <span>Log off {username}</span>
              </label>

              <label className="shutdown-radio-label">
                <input
                  type="radio"
                  name="shutdown_action"
                  checked={action === 'restart'}
                  onChange={() => setAction('restart')}
                />
                <span>Restart the computer</span>
              </label>

              <label className="shutdown-radio-label">
                <input
                  type="radio"
                  name="shutdown_action"
                  checked={action === 'shutdown'}
                  onChange={() => setAction('shutdown')}
                />
                <span>Shut down the computer</span>
              </label>
            </div>
          </div>

          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', borderTop: '1px solid var(--bevel-mid-dark)', paddingTop: 6 }}>
            {action === 'logoff' && `Closes all programs and signs out ${username}.`}
            {action === 'restart' && 'Closes all programs and reboots the CloudDesk session.'}
            {action === 'shutdown' && 'Closes all programs and prepares the virtual computer for power down.'}
          </div>
        </div>

        <div className="dialog-buttons">
          <button className="btn btn-default" onClick={handleConfirm} autoFocus>
            OK
          </button>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
