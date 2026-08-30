import { create } from 'zustand'
import { v4 as uuid } from 'uuid'

export type AppId = 
  | 'file-explorer'
  | 'notepad'
  | 'image-viewer'
  | 'recycle-bin'
  | 'search'
  | 'storage-info'
  | 'settings'
  | 'media-player'
  | 'paint'
  | 'pdf-viewer'
  | 'calculator'
  | 'browser'
  | 'email'
  | 'help'
  | 'system-info'
  | 'file-properties'
  | 'terminal'

export interface WindowState {
  id: string
  appId: AppId
  title: string
  icon?: string
  x: number
  y: number
  width: number
  height: number
  minimized: boolean
  maximized: boolean
  prevBounds?: { x: number; y: number; width: number; height: number }
  // App-specific data
  data?: Record<string, unknown>
  zIndex: number
}

interface WindowStore {
  windows: WindowState[]
  topZ: number
  openWindow: (app: Omit<WindowState, 'id' | 'zIndex'>) => string
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  unmaximizeWindow: (id: string) => void
  updateWindow: (id: string, updates: Partial<WindowState>) => void
  bringToFront: (id: string) => void
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  topZ: 10,

  openWindow: (app) => {
    const id = uuid()
    const { topZ } = get()
    const newZ = topZ + 1
    set(state => ({
      windows: [...state.windows, { ...app, id, zIndex: newZ }],
      topZ: newZ,
    }))
    return id
  },

  closeWindow: (id) => {
    set(state => ({ windows: state.windows.filter(w => w.id !== id) }))
  },

  focusWindow: (id) => {
    const { topZ } = get()
    const newZ = topZ + 1
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, zIndex: newZ, minimized: false } : w
      ),
      topZ: newZ,
    }))
  },

  minimizeWindow: (id) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, minimized: true } : w
      )
    }))
  },

  restoreWindow: (id) => {
    const { topZ } = get()
    const newZ = topZ + 1
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, minimized: false, zIndex: newZ } : w
      ),
      topZ: newZ,
    }))
  },

  maximizeWindow: (id) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id
          ? {
              ...w,
              maximized: true,
              prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
            }
          : w
      )
    }))
  },

  unmaximizeWindow: (id) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id && w.prevBounds
          ? {
              ...w,
              maximized: false,
              x: w.prevBounds.x,
              y: w.prevBounds.y,
              width: w.prevBounds.width,
              height: w.prevBounds.height,
              prevBounds: undefined,
            }
          : w
      )
    }))
  },

  updateWindow: (id, updates) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, ...updates } : w
      )
    }))
  },

  bringToFront: (id) => {
    const { topZ } = get()
    const newZ = topZ + 1
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, zIndex: newZ } : w
      ),
      topZ: newZ,
    }))
  },
}))
