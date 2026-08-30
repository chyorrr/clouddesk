'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useWindowStore, AppId } from '@/store/windows'
import { useDesktopStore, WallpaperKey } from '@/store/desktop'
import { useRecentFilesStore } from '@/store/recentFiles'
import { useNotificationStore } from '@/store/notifications'
import { FsItem } from '@/store/filesystem'
import {
  isImage,
  isText,
  isPdf,
  isAudio,
  isVideo,
  getAppForFile,
  getDesktopIconPositions,
  saveDesktopIconPositions,
  getUserSettings,
  listFolder,
  uploadFile,
} from '@/lib/fs-api'

import Window from '@/components/os/Window'
import DesktopIcon from '@/components/os/DesktopIcon'
import Taskbar from '@/components/os/Taskbar'
import StartMenu from '@/components/os/StartMenu'
import ContextMenu from '@/components/os/ContextMenu'
import NotificationContainer from '@/components/os/Notification'
import ShutdownDialog from '@/components/os/ShutdownDialog'
import FilePropertiesDialog from '@/components/os/FilePropertiesDialog'
import RunDialog from '@/components/os/RunDialog'
import Wallpaper from '@/components/os/Wallpaper'

import FileExplorer from '@/components/apps/FileExplorer'
import Notepad from '@/components/apps/Notepad'
import ImageViewer from '@/components/apps/ImageViewer'
import RecycleBin from '@/components/apps/RecycleBin'
import SearchWindow from '@/components/apps/SearchWindow'
import StorageInfo from '@/components/apps/StorageInfo'
import SettingsWindow from '@/components/apps/SettingsWindow'
import MediaPlayer from '@/components/apps/MediaPlayer'
import Paint from '@/components/apps/Paint'
import PDFViewer from '@/components/apps/PDFViewer'
import Calculator from '@/components/apps/Calculator'
import Browser from '@/components/apps/Browser'
import EmailClient from '@/components/apps/EmailClient'
import HelpViewer from '@/components/apps/HelpViewer'
import SystemInfo from '@/components/apps/SystemInfo'
import Terminal from '@/components/apps/Terminal'

import {
  MyComputerIcon,
  FolderIcon,
  RecycleBinIcon,
  NotepadIcon,
  TextFileIcon,
  PaintIcon,
  MediaPlayerIcon,
  CalculatorIcon,
  BrowserIcon,
  EmailIcon,
  PDFIcon,
  SearchIcon,
  StorageIcon,
  SettingsIcon,
  HelpIcon,
  TerminalIcon,
} from '@/components/icons'
import {
  playStartupChime,
  playOpenWindowSound,
  playCloseWindowSound,
} from '@/lib/sound'

interface DesktopClientProps {
  username: string
  userId: string
  onLogout: () => void
}

// Rich authentic retro desktop layout (2 organized columns)
const DEFAULT_ICONS = [
  // Column 1 (System & Documents)
  { id: 'my_computer',  label: 'My Computer',   defaultX: 20, defaultY: 16 },
  { id: 'documents',    label: 'My Documents',  defaultX: 20, defaultY: 106 },
  { id: 'pictures',     label: 'My Pictures',   defaultX: 20, defaultY: 196 },
  { id: 'downloads',    label: 'Downloads',     defaultX: 20, defaultY: 286 },
  { id: 'readme',       label: 'Welcome.txt',   defaultX: 20, defaultY: 376 },
  { id: 'recycle_bin',  label: 'Recycle Bin',   defaultX: 20, defaultY: 466 },

  // Column 2 (Programs & Internet)
  { id: 'terminal',     label: 'MS-DOS Prompt', defaultX: 116, defaultY: 16 },
  { id: 'paint',        label: 'Paint',         defaultX: 116, defaultY: 106 },
  { id: 'media_player', label: 'Media Player',  defaultX: 116, defaultY: 196 },
  { id: 'calculator',   label: 'Calculator',    defaultX: 116, defaultY: 286 },
  { id: 'browser',      label: 'Internet',      defaultX: 116, defaultY: 376 },
  { id: 'email',        label: 'Cloud Mail',    defaultX: 116, defaultY: 466 },
  { id: 'settings',     label: 'Control Panel', defaultX: 116, defaultY: 556 },
]

// Authentic pixel-crafted SVG Wallpapers
const SVG_WALLPAPERS: Record<WallpaperKey, React.CSSProperties> = {
  teal: {
    background: '#008080',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Crect x='0' y='0' width='2' height='2' fill='%23008888'/%3E%3Crect x='2' y='2' width='2' height='2' fill='%23007878'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'repeat',
  },
  skyhill: {
    background: 'linear-gradient(180deg, #4A90E2 0%, #87CEEB 55%, #3E8E41 55%, #2E6B30 100%)',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='100' viewBox='0 0 160 100'%3E%3Crect width='160' height='55' fill='%235CA0D3'/%3E%3Crect y='55' width='160' height='45' fill='%234A8505'/%3E%3Cpolygon points='0,55 50,45 100,52 160,40 160,55 0,55' fill='%2360AA08'/%3E%3Crect x='20' y='18' width='30' height='10' fill='%23FFFFFF' opacity='0.7'/%3E%3Crect x='26' y='12' width='18' height='6' fill='%23FFFFFF' opacity='0.7'/%3E%3Crect x='90' y='24' width='40' height='12' fill='%23FFFFFF' opacity='0.7'/%3E%3Crect x='100' y='16' width='22' height='8' fill='%23FFFFFF' opacity='0.7'/%3E%3C/svg%3E")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  bliss: {
    background: 'linear-gradient(180deg, #3A75C4 0%, #7CB5EC 50%, #4D9A2B 50%, #2A6812 100%)',
    backgroundImage: `url('/wallpapers/bliss_pixel.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  sky: {
    background: 'linear-gradient(180deg, #87CEEB 0%, #b0d8e8 55%, #5a9e6a 55%, #4a8a55 100%)',
  },
  slate: {
    background: '#1A2332',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect x='4' y='6' width='1' height='1' fill='%234A5D78'/%3E%3Crect x='20' y='18' width='1' height='1' fill='%234A5D78'/%3E%3Crect x='14' y='28' width='1' height='1' fill='%233B4A60'/%3E%3Crect x='28' y='8' width='1' height='1' fill='%233B4A60'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'repeat',
  },
  abstract: {
    background: '#101820',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M0 40 L40 0 M0 0 L40 40' stroke='%231D2D44' stroke-width='1'/%3E%3Crect width='40' height='40' fill='none' stroke='%230E1724' stroke-width='1'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'repeat',
  },
  dusk: {
    background: 'linear-gradient(180deg, #2D3561 0%, #7B5EA7 100%)',
  },
  custom: {
    background: '#008080',
  },
}

export default function DesktopClient({ username, userId, onLogout }: DesktopClientProps) {
  const { windows, openWindow, closeWindow, updateWindow } = useWindowStore()
  const { settings, updateSettings, toggleStartMenu, startMenuOpen, setStartMenuOpen } = useDesktopStore()
  const { addRecentFile } = useRecentFilesStore()
  const { notify } = useNotificationStore()

  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>({})
  const [selectedIconIds, setSelectedIconIds] = useState<Set<string>>(new Set())
  const [desktopContextMenu, setDesktopContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [shutdownModalOpen, setShutdownModalOpen] = useState(false)
  const [runModalOpen, setRunModalOpen] = useState(false)

  // System folders
  const [systemFolderIds, setSystemFolderIds] = useState<Record<string, string>>({})

  // Load settings and icon positions on mount
  useEffect(() => {
    const init = async () => {
      const positions = await getDesktopIconPositions().catch(() => ({}))
      setIconPositions(positions)

      const serverSettings = await getUserSettings().catch(() => null)
      if (serverSettings) {
        updateSettings({
          wallpaper: serverSettings.wallpaper || 'bliss',
          soundEnabled: serverSettings.sound_enabled || false,
          iconSize: serverSettings.icon_size || 'medium',
        })
      } else {
        // Guest users or no settings: always start with bliss
        updateSettings({ wallpaper: 'bliss' })
      }

      const rootItems = await listFolder(null).catch(() => [])
      const folderMap: Record<string, string> = {}
      for (const item of rootItems) {
        if (item.type === 'folder') {
          const key = item.name.toLowerCase().replace(/\s/g, '_')
          folderMap[key] = item.id
          if (item.name === 'Documents') folderMap['documents'] = item.id
          if (item.name === 'Pictures') folderMap['pictures'] = item.id
          if (item.name === 'Downloads') folderMap['downloads'] = item.id
        }
      }
      setSystemFolderIds(folderMap)
      updateSettings({ username })

      // Send initial welcome notification
      setTimeout(() => {
        notify({
          title: 'CloudDesk OS Ready',
          message: `Welcome back, ${username}. Storage drive C:\\ online.`,
          type: 'info',
        })
      }, 800)
    }
    init()
  }, [username, updateSettings, notify])

  const getIconPosition = (id: string, defaultX: number, defaultY: number) => {
    return iconPositions[id] || { x: defaultX, y: defaultY }
  }

  const handleIconPositionChange = (id: string, x: number, y: number) => {
    setIconPositions((prev) => ({ ...prev, [id]: { x, y } }))
  }

  const handleIconSelect = (id: string, multi: boolean) => {
    if (multi) {
      setSelectedIconIds((prev) => {
        const n = new Set(prev)
        if (n.has(id)) n.delete(id)
        else n.add(id)
        return n
      })
    } else {
      setSelectedIconIds(new Set([id]))
    }
  }
  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Esc → toggle Start Menu
      if (e.ctrlKey && e.key === 'Escape') {
        e.preventDefault()
        toggleStartMenu()
        return
      }
      // Alt+F4 → close focused (top-most) window
      if (e.altKey && e.key === 'F4') {
        e.preventDefault()
        const wins = useWindowStore.getState().windows
        if (wins.length > 0) {
          const topWin = [...wins].sort((a, b) => b.zIndex - a.zIndex)[0]
          if (topWin) closeWindow(topWin.id)
        }
        return
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleStartMenu, closeWindow])

  // Window cascade function
  const cascadeWindows = useCallback(() => {
    const wins = useWindowStore.getState().windows.filter(w => !w.minimized)
    wins.forEach((win, i) => {
      useWindowStore.getState().updateWindow(win.id, {
        x: 30 + i * 24,
        y: 30 + i * 24,
        width: 560,
        height: 420,
        maximized: false,
      })
    })
  }, [])

  // Tile windows horizontally
  const tileHorizontal = useCallback(() => {
    const wins = useWindowStore.getState().windows.filter(w => !w.minimized)
    if (!wins.length) return
    const taskH = 36
    const availH = (typeof window !== 'undefined' ? window.innerHeight : 800) - taskH
    const rowH = Math.floor(availH / wins.length)
    wins.forEach((win, i) => {
      useWindowStore.getState().updateWindow(win.id, {
        x: 0, y: i * rowH, width: typeof window !== 'undefined' ? window.innerWidth : 1200, height: rowH, maximized: false,
      })
    })
  }, [])

  // Tile windows vertically
  const tileVertical = useCallback(() => {
    const wins = useWindowStore.getState().windows.filter(w => !w.minimized)
    if (!wins.length) return
    const taskH = 36
    const totalW = typeof window !== 'undefined' ? window.innerWidth : 1200
    const availH = (typeof window !== 'undefined' ? window.innerHeight : 800) - taskH
    const colW = Math.floor(totalW / wins.length)
    wins.forEach((win, i) => {
      useWindowStore.getState().updateWindow(win.id, {
        x: i * colW, y: 0, width: colW, height: availH, maximized: false,
      })
    })
  }, [])

  // Minimize / restore all
  const [preMinimizeAll, setPreMinimizeAll] = useState<string[]>([])
  const minimizeAll = useCallback(() => {
    const wins = useWindowStore.getState().windows
    const openIds = wins.filter(w => !w.minimized).map(w => w.id)
    setPreMinimizeAll(openIds)
    openIds.forEach(id => useWindowStore.getState().minimizeWindow(id))
  }, [])
  const undoMinimizeAll = useCallback(() => {
    preMinimizeAll.forEach(id => useWindowStore.getState().restoreWindow(id))
    setPreMinimizeAll([])
  }, [preMinimizeAll])


  // Arrange / Sort Desktop Icons
  const handleArrangeIcons = useCallback((by: 'name' | 'type' | 'default') => {
    let sorted = [...DEFAULT_ICONS]
    if (by === 'name') {
      sorted.sort((a, b) => a.label.localeCompare(b.label))
    } else if (by === 'type') {
      sorted.sort((a, b) => {
        const isFolderA = a.id.includes('folder') || a.id.includes('doc') || a.id.includes('pic') || a.id.includes('down')
        const isFolderB = b.id.includes('folder') || b.id.includes('doc') || b.id.includes('pic') || b.id.includes('down')
        if (isFolderA && !isFolderB) return -1
        if (!isFolderA && isFolderB) return 1
        return a.label.localeCompare(b.label)
      })
    }

    const positions: Record<string, { x: number; y: number }> = {}
    const itemsPerCol = Math.max(4, Math.floor(((typeof window !== 'undefined' ? window.innerHeight : 800) - 80) / 90))
    sorted.forEach((item, index) => {
      const col = Math.floor(index / itemsPerCol)
      const row = index % itemsPerCol
      positions[item.id] = {
        x: 20 + col * 96,
        y: 16 + row * 90,
      }
    })
    setIconPositions(positions)
    saveDesktopIconPositions(positions).catch(() => {})
  }, [])

  // Launch application (enforces single-instance per app, except file-explorer which allows per-folder instances)
  const launchApp = useCallback(
    (appId: AppId, data?: Record<string, unknown>) => {
      const currentWindows = useWindowStore.getState().windows
      const existing = currentWindows.find(w => {
        if (w.appId !== appId) return false
        // file-explorer: each unique folder gets its own window
        if (appId === 'file-explorer') {
          const targetFolder = data?.folderId ?? null
          const windowFolder = w.data?.folderId ?? null
          return targetFolder === windowFolder
        }
        // For file-specific viewers, match same file ID
        if (data?.item && (w.data?.item as FsItem)?.id) {
          return (w.data?.item as FsItem).id === (data.item as FsItem).id
        }
        // Default: single instance for all other apps
        return true
      })

      if (existing) {
        useWindowStore.getState().focusWindow(existing.id)
        if (existing.minimized) {
          useWindowStore.getState().restoreWindow(existing.id)
        }
        return
      }

      const windowDefaults: Record<AppId, { title: string; w: number; h: number; x: number; y: number }> = {
        'file-explorer':   { title: data?.folderName ? `${data.folderName}` : 'My Computer (C:)', w: 620, h: 420, x: 70 + Math.random() * 50, y: 30 + Math.random() * 40 },
        'notepad':         { title: data?.item ? `${(data.item as FsItem).name} — Notepad` : 'Untitled — Notepad', w: 520, h: 380, x: 120 + Math.random() * 50, y: 50 + Math.random() * 40 },
        'image-viewer':    { title: data?.item ? (data.item as FsItem).name : 'Image Viewer', w: 540, h: 420, x: 100 + Math.random() * 50, y: 40 + Math.random() * 40 },
        'recycle-bin':     { title: 'Recycle Bin', w: 480, h: 320, x: 90 + Math.random() * 50, y: 60 + Math.random() * 40 },
        'search':          { title: 'Find Files', w: 380, h: 340, x: 190 + Math.random() * 50, y: 70 + Math.random() * 40 },
        'storage-info':    { title: 'Drive Properties (C:)', w: 320, h: 380, x: 220 + Math.random() * 50, y: 70 + Math.random() * 40 },
        'settings':        { title: 'Control Panel', w: 420, h: 440, x: 180 + Math.random() * 50, y: 50 + Math.random() * 40 },
        'media-player':    { title: data?.item ? `${(data.item as FsItem).name} — Media Player` : 'CloudDesk Media Player', w: 380, h: 360, x: 140 + Math.random() * 50, y: 60 + Math.random() * 40 },
        'paint':           { title: 'Paint — Bitmap Editor', w: 600, h: 460, x: 90 + Math.random() * 50, y: 40 + Math.random() * 40 },
        'pdf-viewer':      { title: data?.item ? `${(data.item as FsItem).name} — PDF Viewer` : 'Document — PDF Viewer', w: 640, h: 480, x: 80 + Math.random() * 50, y: 30 + Math.random() * 40 },
        'calculator':      { title: 'Calculator', w: 260, h: 280, x: 240 + Math.random() * 50, y: 90 + Math.random() * 40 },
        'browser':         { title: 'World Wide Web Browser', w: 680, h: 480, x: 60 + Math.random() * 50, y: 30 + Math.random() * 40 },
        'email':           { title: 'CloudDesk Mail', w: 640, h: 440, x: 80 + Math.random() * 50, y: 40 + Math.random() * 40 },
        'help':            { title: 'CloudDesk Help Topics', w: 560, h: 420, x: 110 + Math.random() * 50, y: 50 + Math.random() * 40 },
        'system-info':     { title: 'System Properties', w: 380, h: 380, x: 200 + Math.random() * 50, y: 60 + Math.random() * 40 },
        'file-properties': { title: data?.item ? `Properties: ${(data.item as FsItem).name}` : 'File Properties', w: 340, h: 400, x: 210 + Math.random() * 50, y: 70 + Math.random() * 40 },
        'terminal':        { title: 'MS-DOS Prompt (C:\\)', w: 600, h: 380, x: 120 + Math.random() * 40, y: 50 + Math.random() * 40 },
      }

      const def = windowDefaults[appId] || { title: appId, w: 400, h: 300, x: 100, y: 100 }
      openWindow({
        appId,
        title: def.title,
        x: def.x,
        y: def.y,
        width: def.w,
        height: def.h,
        minimized: false,
        maximized: false,
        data,
      })
    },
    [openWindow]
  )

  // Open file with associated app
  const handleOpenFile = useCallback(
    (item: FsItem) => {
      if (item.type === 'folder') {
        launchApp('file-explorer', { folderId: item.id, folderName: item.name })
        return
      }

      const targetApp = getAppForFile(item)
      addRecentFile({
        id: item.id,
        name: item.name,
        appId: targetApp,
        size: item.size,
        mimeType: item.mime_type,
      })

      launchApp(targetApp, { item, initialFile: item })
    },
    [launchApp, addRecentFile]
  )

  // Show desktop toggle (minimize / restore all)
  const handleToggleShowDesktop = useCallback(() => {
    const hasVisible = windows.some(w => !w.minimized)
    if (hasVisible) {
      windows.forEach(w => {
        if (!w.minimized) useWindowStore.getState().minimizeWindow(w.id)
      })
    } else {
      windows.forEach(w => {
        if (w.minimized) useWindowStore.getState().restoreWindow(w.id)
      })
    }
  }, [windows])

  // Desktop icon double-click handlers
  const handleIconDoubleClick = (iconId: string) => {
    switch (iconId) {
      case 'my_computer':
        launchApp('file-explorer')
        break
      case 'documents':
        launchApp('file-explorer', {
          folderId: systemFolderIds['documents'] || null,
          folderName: 'Documents',
        })
        break
      case 'pictures':
        launchApp('file-explorer', {
          folderId: systemFolderIds['pictures'] || null,
          folderName: 'Pictures',
        })
        break
      case 'downloads':
        launchApp('file-explorer', {
          folderId: systemFolderIds['downloads'] || null,
          folderName: 'Downloads',
        })
        break
      case 'projects':
        launchApp('file-explorer', {
          folderName: 'Project Files',
        })
        break
      case 'readme':
        launchApp('notepad', {
          initialContent: 'Welcome to CloudDesk Personal Computer 2.0!\n\nYour computer. In the cloud.\n\nAll your files, programs, and desktop settings are persistent in your personal virtual machine.\n\nTips:\n- Double-click any program on the desktop to launch\n- Use Start > Programs to see all tools\n- Right-click desktop for Control Panel & settings',
        })
        break
      case 'recycle_bin':
        launchApp('recycle-bin')
        break
      case 'terminal':
        launchApp('terminal')
        break
      case 'paint':
        launchApp('paint')
        break
      case 'media_player':
        launchApp('media-player')
        break
      case 'calculator':
        launchApp('calculator')
        break
      case 'browser':
        launchApp('browser')
        break
      case 'email':
        launchApp('email')
        break
      case 'settings':
        launchApp('settings')
        break
      default:
        break
    }
  }

  const getDesktopIconGraphic = (id: string) => {
    const iconSize = settings.iconSize === 'small' ? 32 : settings.iconSize === 'large' ? 48 : 42
    switch (id) {
      case 'my_computer':  return <MyComputerIcon size={iconSize} />
      case 'documents':    return <FolderIcon size={iconSize} />
      case 'pictures':     return <FolderIcon size={iconSize} />
      case 'downloads':    return <FolderIcon size={iconSize} />
      case 'readme':       return <TextFileIcon size={iconSize} />
      case 'recycle_bin':  return <RecycleBinIcon size={iconSize} />
      case 'terminal':     return <TerminalIcon size={iconSize} />
      case 'paint':        return <PaintIcon size={iconSize} />
      case 'media_player': return <MediaPlayerIcon size={iconSize} />
      case 'calculator':   return <CalculatorIcon size={iconSize} />
      case 'browser':      return <BrowserIcon size={iconSize} />
      case 'email':        return <EmailIcon size={iconSize} />
      case 'settings':     return <SettingsIcon size={iconSize} />
      default:             return <FolderIcon size={iconSize} />
    }
  }

  // Active wallpaper styling
  const wallpaperStyle: React.CSSProperties =
    settings.wallpaper === 'custom' && settings.customWallpaperUrl
      ? {
          backgroundImage: `url(${settings.customWallpaperUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : SVG_WALLPAPERS[settings.wallpaper] || SVG_WALLPAPERS.bliss

  return (
    <>
      {/* Desktop Canvas */}
      <div
        className="desktop"
        onClick={() => {
          setSelectedIconIds(new Set())
          setStartMenuOpen(false)
          setDesktopContextMenu(null)
        }}
        onContextMenu={(e) => {
          e.preventDefault()
          setDesktopContextMenu({ x: e.clientX, y: e.clientY })
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onDrop={async (e) => {
          e.preventDefault()
          e.stopPropagation()
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            for (const file of Array.from(e.dataTransfer.files)) {
              try {
                await uploadFile(file, null)
                notify({
                  title: 'File Uploaded',
                  message: `Saved "${file.name}" to CloudDesk C:\\`,
                  type: 'info',
                })
              } catch (err) {
                console.error(err)
              }
            }
          }
        }}
        role="main"
        aria-label="Desktop"
      >
        {/* Pixel Art Wallpaper Background Layer */}
        <Wallpaper
          wallpaper={settings.wallpaper}
          customUrl={settings.customWallpaperUrl}
        />

        {/* Desktop icons */}
        {DEFAULT_ICONS.map((icon) => {
          const pos = getIconPosition(icon.id, icon.defaultX, icon.defaultY)
          return (
            <DesktopIcon
              key={icon.id}
              id={icon.id}
              label={icon.label}
              icon={getDesktopIconGraphic(icon.id)}
              x={pos.x}
              y={pos.y}
              isSelected={selectedIconIds.has(icon.id)}
              onSelect={handleIconSelect}
              onDoubleClick={() => handleIconDoubleClick(icon.id)}
              onRightClick={(e) => {
                setSelectedIconIds(new Set([icon.id]))
                setDesktopContextMenu({ x: e.clientX, y: e.clientY })
              }}
              onPositionChange={handleIconPositionChange}
            />
          )
        })}

        {/* Windows */}
        {windows.map((win) => (
          <Window key={win.id} window={win} onFocus={() => {}}>
            {renderAppContent(win.appId, win.data, win.id, {
              onOpenFile: handleOpenFile,
              onClose: () => closeWindow(win.id),
              onTitleChange: (title) => updateWindow(win.id, { title }),
              username,
              onLaunchApp: (appId, data) => launchApp(appId, data),
            })}
          </Window>
        ))}

        {/* Desktop Context Menu */}
        {desktopContextMenu && (
          <ContextMenu
            x={desktopContextMenu.x}
            y={desktopContextMenu.y}
            items={[
              { label: 'Arrange Icons by Name', onClick: () => handleArrangeIcons('name') },
              { label: 'Arrange Icons by Type', onClick: () => handleArrangeIcons('type') },
              { label: 'Auto Arrange (Align to Grid)', onClick: () => handleArrangeIcons('default') },
              { label: 'Line up Icons', onClick: () => handleArrangeIcons('default') },
              { separator: true },
              { label: 'Refresh Desktop', onClick: () => window.location.reload() },
              { separator: true },
              { label: 'New Folder', onClick: () => launchApp('file-explorer') },
              { separator: true },
              { label: 'Notepad', onClick: () => launchApp('notepad') },
              { label: 'Paint', onClick: () => launchApp('paint') },
              { label: 'Media Player', onClick: () => launchApp('media-player') },
              { label: 'Calculator', onClick: () => launchApp('calculator') },
              { label: 'MS-DOS Prompt', onClick: () => launchApp('terminal') },
              { label: 'Run...', onClick: () => setRunModalOpen(true) },
              { separator: true },
              { label: 'Find Files...', onClick: () => launchApp('search') },
              { label: 'Properties (Display & Wallpaper)', onClick: () => launchApp('settings') },
            ]}
            onClose={() => setDesktopContextMenu(null)}
          />
        )}

        {/* Balloon Notifications */}
        <NotificationContainer />

        {/* Shutdown Dialog */}
        <ShutdownDialog
          isOpen={shutdownModalOpen}
          username={username}
          onClose={() => setShutdownModalOpen(false)}
          onLogout={onLogout}
        />

        {/* Run Dialog */}
        <RunDialog
          isOpen={runModalOpen}
          onClose={() => setRunModalOpen(false)}
          onRun={(appId, data) => launchApp(appId, data)}
        />
      </div>

      {/* Taskbar */}
      <Taskbar
        onOpenStartMenu={toggleStartMenu}
        startMenuOpen={startMenuOpen}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
        onLaunchApp={(appId) => launchApp(appId)}
        onToggleShowDesktop={handleToggleShowDesktop}
        onCascadeWindows={cascadeWindows}
        onTileHorizontal={tileHorizontal}
        onTileVertical={tileVertical}
        onMinimizeAll={minimizeAll}
        onUndoMinimizeAll={undoMinimizeAll}
      />

      {/* Start menu */}
      {startMenuOpen && (
        <StartMenu
          username={username}
          onClose={() => setStartMenuOpen(false)}
          onOpenApp={(appId, data) => {
            setStartMenuOpen(false)
            launchApp(appId as AppId, data)
          }}
          onRunClick={() => {
            setStartMenuOpen(false)
            setRunModalOpen(true)
          }}
          onShutdownClick={() => {
            setStartMenuOpen(false)
            setShutdownModalOpen(true)
          }}
        />
      )}
    </>
  )
}

// Render app-specific content inside a window
function renderAppContent(
  appId: AppId,
  data: Record<string, unknown> | undefined,
  windowId: string,
  callbacks: {
    onOpenFile: (item: FsItem) => void
    onClose: () => void
    onTitleChange: (title: string) => void
    username: string
    onLaunchApp: (appId: AppId, data?: Record<string, unknown>) => void
  }
) {
  const { onOpenFile, onClose, onTitleChange, username, onLaunchApp } = callbacks

  switch (appId) {
    case 'file-explorer':
      return (
        <FileExplorer
          onOpenFile={onOpenFile}
          initialFolderId={data?.folderId as string | null | undefined}
          initialFolderName={data?.folderName as string | undefined}
        />
      )

    case 'notepad':
      return (
        <Notepad
          item={data?.item as FsItem | null | undefined}
          initialContent={data?.initialContent as string | undefined}
          parentFolderId={data?.parentFolderId as string | null | undefined}
          onClose={onClose}
          onTitleChange={onTitleChange}
        />
      )

    case 'image-viewer':
      return data?.item ? (
        <ImageViewer
          item={data.item as FsItem}
          siblingImages={data.siblings as FsItem[] | undefined}
        />
      ) : null

    case 'recycle-bin':
      return <RecycleBin />

    case 'search':
      return <SearchWindow onOpenFile={onOpenFile} />

    case 'storage-info':
      return <StorageInfo />

    case 'settings':
      return <SettingsWindow />

    case 'media-player':
      return <MediaPlayer initialFile={data?.item as FsItem | undefined} />

    case 'paint':
      return <Paint />

    case 'pdf-viewer':
      return <PDFViewer initialFile={data?.item as FsItem | undefined} />

    case 'calculator':
      return <Calculator />

    case 'browser':
      return <Browser />

    case 'email':
      return <EmailClient />

    case 'help':
      return <HelpViewer />

    case 'system-info':
      return <SystemInfo username={username} />

    case 'file-properties':
      return data?.item ? (
        <FilePropertiesDialog item={data.item as FsItem} onClose={onClose} />
      ) : null

    case 'terminal':
      return (
        <Terminal
          onLaunchApp={(appId, data) => onLaunchApp(appId, data)}
          onClose={onClose}
        />
      )

    default:
      return null
  }
}
