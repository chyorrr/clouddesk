import { create } from 'zustand'
import { FsItem } from './filesystem'

export type ClipboardOperation = 'copy' | 'cut'

interface ClipboardStore {
  items: FsItem[]
  operation: ClipboardOperation | null
  copy: (items: FsItem[]) => void
  cut: (items: FsItem[]) => void
  clear: () => void
}

export const useClipboardStore = create<ClipboardStore>((set) => ({
  items: [],
  operation: null,

  copy: (items) => set({ items, operation: 'copy' }),
  cut: (items) => set({ items, operation: 'cut' }),
  clear: () => set({ items: [], operation: null }),
}))
