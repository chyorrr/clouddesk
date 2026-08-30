import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WallpaperKey = 'teal' | 'sky' | 'skyhill' | 'bliss' | 'slate' | 'abstract' | 'dusk' | 'custom'

export interface UserSettings {
  wallpaper: WallpaperKey
  customWallpaperUrl?: string
  theme: 'classic'
  soundEnabled: boolean
  iconSize: 'small' | 'medium' | 'large'
  username: string
}

interface DesktopStore {
  settings: UserSettings
  settingsLoaded: boolean
  startMenuOpen: boolean

  updateSettings: (updates: Partial<UserSettings>) => void
  setSettingsLoaded: (v: boolean) => void
  setStartMenuOpen: (open: boolean) => void
  toggleStartMenu: () => void
}

export const useDesktopStore = create<DesktopStore>()(
  persist(
    (set) => ({
      settings: {
        wallpaper: 'bliss',
        theme: 'classic',
        soundEnabled: false,
        iconSize: 'medium',
        username: 'User',
      },
      settingsLoaded: false,
      startMenuOpen: false,

      updateSettings: (updates) =>
        set(state => ({ settings: { ...state.settings, ...updates } })),

      setSettingsLoaded: (v) => set({ settingsLoaded: v }),

      setStartMenuOpen: (open) => set({ startMenuOpen: open }),

      toggleStartMenu: () =>
        set(state => ({ startMenuOpen: !state.startMenuOpen })),
    }),
    {
      name: 'clouddesk-desktop-settings-v3',
      version: 3,
      migrate: (persistedState: unknown) => {
        const state = persistedState as { settings?: { wallpaper?: string } }
        if (!state?.settings?.wallpaper || state?.settings?.wallpaper === 'teal') {
          if (state && state.settings) {
            state.settings.wallpaper = 'bliss'
          }
        }
        return state
      },
    }
  )
)
