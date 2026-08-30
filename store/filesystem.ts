import { create } from 'zustand'

export interface FsItem {
  id: string
  user_id: string
  parent_id: string | null
  name: string
  type: 'folder' | 'file'
  mime_type?: string
  size?: number
  storage_path?: string
  is_deleted: boolean
  deleted_at?: string
  original_parent_id?: string
  created_at: string
  updated_at: string
}

interface FilesystemStore {
  items: Record<string, FsItem[]>   // keyed by parent_id (null → root)
  loading: Record<string, boolean>
  error: string | null
  
  setItems: (parentId: string | null, items: FsItem[]) => void
  addItem: (item: FsItem) => void
  updateItem: (id: string, updates: Partial<FsItem>) => void
  removeItem: (id: string) => void
  setLoading: (parentId: string, loading: boolean) => void
  setError: (error: string | null) => void
  getChildren: (parentId: string | null) => FsItem[]
}

const ROOT_KEY = '__root__'

export const useFilesystemStore = create<FilesystemStore>((set, get) => ({
  items: {},
  loading: {},
  error: null,

  setItems: (parentId, items) => {
    const key = parentId ?? ROOT_KEY
    set(state => ({ items: { ...state.items, [key]: items } }))
  },

  addItem: (item) => {
    const key = item.parent_id ?? ROOT_KEY
    set(state => ({
      items: {
        ...state.items,
        [key]: [...(state.items[key] ?? []), item],
      }
    }))
  },

  updateItem: (id, updates) => {
    set(state => {
      const newItems = { ...state.items }
      for (const key of Object.keys(newItems)) {
        newItems[key] = newItems[key].map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      }
      return { items: newItems }
    })
  },

  removeItem: (id) => {
    set(state => {
      const newItems = { ...state.items }
      for (const key of Object.keys(newItems)) {
        newItems[key] = newItems[key].filter(item => item.id !== id)
      }
      return { items: newItems }
    })
  },

  setLoading: (parentId, loading) => {
    set(state => ({ loading: { ...state.loading, [parentId]: loading } }))
  },

  setError: (error) => set({ error }),

  getChildren: (parentId) => {
    const key = parentId ?? ROOT_KEY
    return get().items[key] ?? []
  },
}))
