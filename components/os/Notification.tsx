'use client'

import React from 'react'
import { useNotificationStore } from '@/store/notifications'
import { InfoIcon, CheckIcon, WarningIcon, ErrorIcon } from '@/components/icons'

export default function NotificationContainer() {
  const { notifications, dismiss } = useNotificationStore()

  if (notifications.length === 0) return null

  return (
    <div className="system-notification-container" aria-live="polite">
      {notifications.map((notif) => (
        <div key={notif.id} className="system-notification-balloon" role="alert">
          <div className="balloon-header">
            {notif.type === 'success' && <CheckIcon size={12} />}
            {notif.type === 'warning' && <WarningIcon size={12} />}
            {notif.type === 'error' && <ErrorIcon size={12} />}
            {(!notif.type || notif.type === 'info') && <InfoIcon size={12} />}
            <span className="balloon-title">{notif.title}</span>
            <button
              className="balloon-close"
              onClick={() => dismiss(notif.id)}
              title="Close notification"
            >
              ✕
            </button>
          </div>
          <div className="balloon-body">{notif.message}</div>
        </div>
      ))}
    </div>
  )
}
