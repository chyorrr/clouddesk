import { FsItem } from '@/store/filesystem'

// Client-side filesystem API — all calls go through Next.js API routes

export async function listFolder(parentId: string | null): Promise<FsItem[]> {
  const url = parentId
    ? `/api/fs?parentId=${parentId}&deleted=false`
    : `/api/fs?parentId=root&deleted=false`
  const res = await fetch(url)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function listDeleted(): Promise<FsItem[]> {
  const res = await fetch(`/api/fs?deleted=true`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function createFolder(name: string, parentId: string | null): Promise<FsItem> {
  const res = await fetch('/api/fs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'folder', name, parentId }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function renameItem(id: string, name: string): Promise<FsItem> {
  const res = await fetch(`/api/fs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function moveItem(id: string, newParentId: string | null): Promise<FsItem> {
  const res = await fetch(`/api/fs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parentId: newParentId }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteItem(id: string): Promise<void> {
  const res = await fetch(`/api/fs/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error(await res.text())
}

export async function restoreItem(id: string): Promise<FsItem> {
  const res = await fetch(`/api/fs/${id}/restore`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function permanentlyDeleteItem(id: string): Promise<void> {
  const res = await fetch(`/api/fs/${id}/permanent`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error(await res.text())
}

export async function uploadFile(
  file: File,
  parentId: string | null,
  onProgress?: (pct: number) => void
): Promise<FsItem> {
  const formData = new FormData()
  formData.append('file', file)
  if (parentId) formData.append('parentId', parentId)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/fs/upload')
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject(new Error(xhr.responseText))
      }
    }

    xhr.onerror = () => reject(new Error('Upload failed'))
    xhr.send(formData)
  })
}

export async function getDownloadUrl(id: string): Promise<string> {
  const res = await fetch(`/api/fs/${id}/download-url`)
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  return data.url
}

export async function getFileContent(id: string): Promise<string> {
  const res = await fetch(`/api/fs/${id}/content`)
  if (!res.ok) throw new Error(await res.text())
  return res.text()
}

export async function saveFileContent(id: string, content: string): Promise<FsItem> {
  const res = await fetch(`/api/fs/${id}/content`, {
    method: 'PUT',
    headers: { 'Content-Type': 'text/plain' },
    body: content,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function createTextFile(
  name: string,
  parentId: string | null,
  content: string = ''
): Promise<FsItem> {
  const res = await fetch('/api/fs/create-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, parentId, content }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function searchFiles(query: string): Promise<FsItem[]> {
  const res = await fetch(`/api/fs/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getStorageUsage(): Promise<{ used: number; total: number }> {
  const res = await fetch('/api/fs/storage')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function copyItem(id: string, newParentId: string | null): Promise<FsItem> {
  const res = await fetch(`/api/fs/${id}/copy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parentId: newParentId }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function emptyRecycleBin(): Promise<void> {
  const res = await fetch('/api/fs/recycle-bin', { method: 'DELETE' })
  if (!res.ok) throw new Error(await res.text())
}

// Utility: get user settings
export async function getUserSettings() {
  const res = await fetch('/api/settings')
  if (!res.ok) return null
  return res.json()
}

export async function updateUserSettings(settings: Record<string, unknown>) {
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// Desktop icon positions
export async function getDesktopIconPositions(): Promise<Record<string, { x: number; y: number }>> {
  const res = await fetch('/api/desktop-icons')
  if (!res.ok) return {}
  return res.json()
}

export async function saveDesktopIconPosition(iconKey: string, x: number, y: number): Promise<void> {
  await fetch('/api/desktop-icons', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ iconKey, x, y }),
  }).catch(() => {})
}

export async function saveDesktopIconPositions(positions: Record<string, { x: number; y: number }>): Promise<void> {
  for (const [iconKey, pos] of Object.entries(positions)) {
    await saveDesktopIconPosition(iconKey, pos.x, pos.y).catch(() => {})
  }
}

// Helper: format file size
export function formatSize(bytes?: number): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

// Helper: get file extension
export function getExtension(name: string): string {
  const parts = name.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

// Helper: is image file
export function isImage(item: FsItem): boolean {
  if (item.type !== 'file') return false
  const ext = getExtension(item.name)
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)
}

// Helper: is text / code file
export function isText(item: FsItem): boolean {
  if (item.type !== 'file') return false
  const ext = getExtension(item.name)
  return [
    'txt', 'md', 'csv', 'log', 'json', 'js', 'ts', 'jsx', 'tsx',
    'html', 'htm', 'css', 'xml', 'py', 'python', 'sh', 'bash', 'bat', 'cmd',
    'ps1', 'c', 'cpp', 'h', 'hpp', 'java', 'rs', 'go', 'sql', 'yaml',
    'yml', 'env', 'ini', 'toml', 'cfg', 'conf', 'rb', 'php'
  ].includes(ext)
}

// Helper: format date
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Helper: is PDF file
export function isPdf(item: FsItem): boolean {
  if (item.type !== 'file') return false
  return getExtension(item.name) === 'pdf'
}

// Helper: is audio file
export function isAudio(item: FsItem): boolean {
  if (item.type !== 'file') return false
  const ext = getExtension(item.name)
  return ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext)
}

// Helper: is video file
export function isVideo(item: FsItem): boolean {
  if (item.type !== 'file') return false
  const ext = getExtension(item.name)
  return ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)
}

// Helper: determine default application for file item
export function getAppForFile(item: FsItem): import('@/store/windows').AppId {
  if (item.type === 'folder') return 'file-explorer'
  if (isText(item)) return 'notepad'
  if (isImage(item)) return 'image-viewer'
  if (isPdf(item)) return 'pdf-viewer'
  if (isAudio(item) || isVideo(item)) return 'media-player'
  return 'notepad'
}
