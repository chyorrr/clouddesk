import { FsItem } from '@/store/filesystem'

// In-memory virtual filesystem store for guest sessions and fallback
let guestFiles: FsItem[] = [
  // Root folders
  {
    id: 'folder-documents',
    user_id: 'guest',
    parent_id: null,
    name: 'Documents',
    type: 'folder',
    is_deleted: false,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'folder-downloads',
    user_id: 'guest',
    parent_id: null,
    name: 'Downloads',
    type: 'folder',
    is_deleted: false,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'folder-pictures',
    user_id: 'guest',
    parent_id: null,
    name: 'Pictures',
    type: 'folder',
    is_deleted: false,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'folder-music',
    user_id: 'guest',
    parent_id: null,
    name: 'Music',
    type: 'folder',
    is_deleted: false,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },

  // Documents folder items
  {
    id: 'file-doc-welcome',
    user_id: 'guest',
    parent_id: 'folder-documents',
    name: 'Welcome to CloudDesk.txt',
    type: 'file',
    size: 512,
    mime_type: 'text/plain',
    storage_path: 'local://welcome.txt',
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'file-doc-guide',
    user_id: 'guest',
    parent_id: 'folder-documents',
    name: 'User Guide.txt',
    type: 'file',
    size: 1024,
    mime_type: 'text/plain',
    storage_path: 'local://guide.txt',
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'file-doc-notes',
    user_id: 'guest',
    parent_id: 'folder-documents',
    name: 'Project Notes.txt',
    type: 'file',
    size: 256,
    mime_type: 'text/plain',
    storage_path: 'local://notes.txt',
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Pictures folder items
  {
    id: 'file-pic-bliss',
    user_id: 'guest',
    parent_id: 'folder-pictures',
    name: 'Bliss Hills.bmp',
    type: 'file',
    size: 245760,
    mime_type: 'image/jpeg',
    storage_path: '/wallpapers/bliss_pixel.jpg',
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Downloads folder items
  {
    id: 'file-dl-setup',
    user_id: 'guest',
    parent_id: 'folder-downloads',
    name: 'CloudDesk_Setup_v2.zip',
    type: 'file',
    size: 1048576,
    mime_type: 'application/zip',
    storage_path: 'local://setup.zip',
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'file-dl-readme',
    user_id: 'guest',
    parent_id: 'folder-downloads',
    name: 'Release_Notes.txt',
    type: 'file',
    size: 680,
    mime_type: 'text/plain',
    storage_path: 'local://release_notes.txt',
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Music folder items
  {
    id: 'file-music-synth',
    user_id: 'guest',
    parent_id: 'folder-music',
    name: 'Retro Synth Track.mp3',
    type: 'file',
    size: 3145728,
    mime_type: 'audio/mpeg',
    storage_path: 'local://music.mp3',
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const fileContents: Record<string, string> = {
  'file-doc-welcome': '==================================================\n   WELCOME TO CLOUDDESK PERSONAL COMPUTER 2.0\n==================================================\n\nYour Computer. In The Cloud.\n\nKey Highlights:\n- Real Cloud File System with Folders and Uploads\n- Interactive MS-DOS Command Prompt (DIR, CD, MKDIR, TYPE, CALC)\n- Authentic pixelated retro interface inspired by 90s personal computing\n- Full desktop apps: Paint, Notepad, Media Player, Calculator, Web Browser, Mail, Control Panel\n\nDouble-click any document or program to begin.',
  'file-doc-guide': 'CLOUDDESK USER MANUAL\n---------------------\n1. Uploading Files: Click "Upload" in File Explorer or drag and drop any file from your computer.\n2. Running MS-DOS: Open Start > Programs > MS-DOS Prompt and type commands like "dir", "mkdir", "calc".\n3. Saving Documents: Notepad and Paint can save new files directly into your cloud folders.\n4. Recycle Bin: Deleted files are moved to the Recycle Bin and can be restored at any time.',
  'file-doc-notes': 'PROJECT ROADMAP:\n- Complete Phase 1 & 2 desktop experience\n- Verified file upload pipelines & storage encryption\n- Retro audio synthesis and classic UI styling',
  'file-dl-readme': 'CloudDesk 2.0 Release Notes\n--------------------------\n- Added 36px high-visibility taskbar with 4-color Windows waving flag.\n- Added Quick Launch toolbar with 6 system shortcuts.\n- Added System Tray with live Drive Sync, Network, Volume, and Clock.\n- Added MS-DOS Command Prompt and classic Run dialog.',
}

export function getGuestFiles(parentId: string | null, isDeleted: boolean = false): FsItem[] {
  return guestFiles.filter(item => {
    if (item.is_deleted !== isDeleted) return false
    if (isDeleted) return true
    if (parentId === 'root' || parentId === null) return item.parent_id === null
    return item.parent_id === parentId
  })
}

export function addGuestFolder(name: string, parentId: string | null): FsItem {
  const newFolder: FsItem = {
    id: `folder-${Date.now()}`,
    user_id: 'guest',
    parent_id: parentId || null,
    name,
    type: 'folder',
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  guestFiles.push(newFolder)
  return newFolder
}

export function addGuestFile(
  name: string,
  parentId: string | null,
  size: number,
  mimeType: string,
  content?: string
): FsItem {
  const id = `file-${Date.now()}`
  const newFile: FsItem = {
    id,
    user_id: 'guest',
    parent_id: parentId || null,
    name,
    type: 'file',
    size,
    mime_type: mimeType,
    storage_path: `local://${name}`,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  guestFiles.push(newFile)
  if (content) {
    fileContents[id] = content
  }
  return newFile
}

export function getGuestFileContent(id: string): string {
  const raw = fileContents[id]
  if (!raw) return 'CloudDesk Sample Document Content'
  if (raw.startsWith('data:')) {
    try {
      const commaIdx = raw.indexOf(',')
      if (commaIdx !== -1) {
        const base64 = raw.slice(commaIdx + 1)
        return Buffer.from(base64, 'base64').toString('utf-8')
      }
    } catch {
      return raw
    }
  }
  return raw
}

export function getGuestStorageUsage(): { used: number; total: number } {
  const used = guestFiles
    .filter(f => !f.is_deleted && f.type === 'file')
    .reduce((sum, f) => sum + (f.size || 0), 0)
  return { used, total: 1 * 1024 * 1024 * 1024 }
}

export function setGuestFileContent(id: string, content: string): void {
  fileContents[id] = content
}

export function deleteGuestItem(id: string): void {
  guestFiles = guestFiles.map(item =>
    item.id === id ? { ...item, is_deleted: true, updated_at: new Date().toISOString() } : item
  )
}

export function restoreGuestItem(id: string): FsItem | undefined {
  let restored: FsItem | undefined
  guestFiles = guestFiles.map(item => {
    if (item.id === id) {
      restored = { ...item, is_deleted: false, updated_at: new Date().toISOString() }
      return restored
    }
    return item
  })
  return restored
}

export function permanentlyDeleteGuestItem(id: string): void {
  guestFiles = guestFiles.filter(item => item.id !== id)
  delete fileContents[id]
}

export function searchGuestFiles(query: string): FsItem[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  return guestFiles.filter(item => !item.is_deleted && item.name.toLowerCase().includes(q))
}

export function copyGuestItem(id: string, newParentId: string | null): FsItem | null {
  const original = guestFiles.find(item => item.id === id)
  if (!original) return null
  const newId = `${original.type}-${Date.now()}`
  const copyName = original.name.includes('.')
    ? original.name.replace(/(\.[^.]+)$/, ' - Copy$1')
    : `${original.name} - Copy`

  const copyItem: FsItem = {
    ...original,
    id: newId,
    name: copyName,
    parent_id: newParentId || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  guestFiles.push(copyItem)
  if (fileContents[id]) {
    fileContents[newId] = fileContents[id]
  }
  return copyItem
}

export function emptyGuestRecycleBin(): void {
  const deletedIds = guestFiles.filter(i => i.is_deleted).map(i => i.id)
  guestFiles = guestFiles.filter(i => !i.is_deleted)
  deletedIds.forEach(id => {
    delete fileContents[id]
  })
}

export function getGuestDownloadUrl(id: string): { url: string; name: string } | null {
  const item = guestFiles.find(f => f.id === id)
  if (!item) return null

  if (fileContents[id]) {
    const val = fileContents[id]
    if (val.startsWith('data:') || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/')) {
      return { url: val, name: item.name }
    }
    const base64Text = Buffer.from(val).toString('base64')
    return { url: `data:text/plain;charset=utf-8;base64,${base64Text}`, name: item.name }
  }

  if (id === 'file-pic-bliss') {
    return { url: '/wallpapers/bliss_pixel.jpg', name: item.name }
  }

  if (id === 'file-music-synth') {
    return { url: 'https://cdn.freesound.org/previews/469/469279_6890478-lq.mp3', name: item.name }
  }

  if (item.storage_path && (item.storage_path.startsWith('http://') || item.storage_path.startsWith('https://') || item.storage_path.startsWith('/'))) {
    return { url: item.storage_path, name: item.name }
  }

  const sampleContent = `CloudDesk File: ${item.name}\nSize: ${item.size || 0} bytes`
  const base64 = Buffer.from(sampleContent).toString('base64')
  return { url: `data:text/plain;charset=utf-8;base64,${base64}`, name: item.name }
}
