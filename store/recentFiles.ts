import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppId } from '@/store/windows'

export interface RecentFileItem {
  id: string
  name: string
  appId: AppId
  openedAt: number
  size?: number
  mimeType?: string
}

interface RecentFilesStore {
  recentFiles: RecentFileItem[]
  addRecentFile: (item: Omit<RecentFileItem, 'openedAt'>) => void
  removeRecentFile: (id: string) => void
  clearRecentFiles: () => void
}

export const useRecentFilesStore = create<RecentFilesStore>()(
  persist(
    (set) => ({
      recentFiles: [
        {
          id: 'welcome_txt',
          name: 'Welcome_Readme.txt',
          appId: 'notepad',
          openedAt: Date.now() - 3600000,
          size: 1420,
        },
        {
          id: 'sample_notes',
          name: 'Project_Ideas.txt',
          appId: 'notepad',
          openedAt: Date.now() - 7200000,
          size: 890,
        },
      ],

      addRecentFile: (item) =>
        set((state) => {
          const filtered = state.recentFiles.filter((f) => f.id !== item.id)
          const updated = [{ ...item, openedAt: Date.now() }, ...filtered].slice(0, 10)
          return { recentFiles: updated }
        }),

      removeRecentFile: (id) =>
        set((state) => ({
          recentFiles: state.recentFiles.filter((f) => f.id !== id),
        })),

      clearRecentFiles: () => set({ recentFiles: [] }),
    }),
    {
      name: 'clouddesk-recent-files',
    }
  )
)
