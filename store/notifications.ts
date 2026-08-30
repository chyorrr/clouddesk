import { create } from 'zustand'
import { v4 as uuid } from 'uuid'

export interface SystemNotification {
  id: string
  title: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  timestamp: number
  duration?: number
}

interface NotificationStore {
  notifications: SystemNotification[]
  notify: (notification: Omit<SystemNotification, 'id' | 'timestamp'>) => string
  dismiss: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  notify: (notif) => {
    const id = uuid()
    const newNotif: SystemNotification = {
      ...notif,
      id,
      timestamp: Date.now(),
      duration: notif.duration ?? 4000,
    }

    set((state) => ({
      notifications: [...state.notifications, newNotif],
    }))

    if (newNotif.duration && newNotif.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      }, newNotif.duration)
    }

    return id
  },

  dismiss: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  clearAll: () => set({ notifications: [] }),
}))
