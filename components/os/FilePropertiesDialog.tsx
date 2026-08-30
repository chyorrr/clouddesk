'use client'

import React, { useState } from 'react'
import { FsItem } from '@/store/filesystem'
import { formatSize, formatDate, getExtension } from '@/lib/fs-api'
import {
  FolderIcon,
  TextFileIcon,
  ImageFileIcon,
  PDFIcon,
  AudioFileIcon,
  VideoFileIcon,
  FileIcon,
} from '@/components/icons'

interface FilePropertiesDialogProps {
  item: FsItem
  onClose: () => void
}

export default function FilePropertiesDialog({ item, onClose }: FilePropertiesDialogProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'details'>('general')

  const getIcon = () => {
    if (item.type === 'folder') return <FolderIcon size={32} />
    const ext = getExtension(item.name)
    if (['txt', 'md', 'json', 'log'].includes(ext)) return <TextFileIcon size={32} />
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return <ImageFileIcon size={32} />
    if (ext === 'pdf') return <PDFIcon size={32} />
    if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) return <AudioFileIcon size={32} />
    if (['mp4', 'webm', 'mov'].includes(ext)) return <VideoFileIcon size={32} />
    return <FileIcon size={32} />
  }

  const getTypeName = () => {
    if (item.type === 'folder') return 'File Folder'
    const ext = getExtension(item.name).toUpperCase()
    if (!ext) return 'File'
    return `${ext} Document`
  }

  const getOpensWith = () => {
    if (item.type === 'folder') return 'File Explorer'
    const ext = getExtension(item.name)
    if (['txt', 'md', 'json', 'log', 'csv'].includes(ext)) return 'Notepad'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return 'Image Viewer'
    if (ext === 'pdf') return 'PDF Viewer'
    if (['mp3', 'wav', 'ogg', 'mp4', 'webm'].includes(ext)) return 'Media Player'
    return 'Notepad'
  }

  return (
    <div className="properties-dialog">
      <div className="properties-tabs">
        <button
          className={`properties-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`properties-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
      </div>

      <div className="properties-card">
        {activeTab === 'general' ? (
          <>
            <div className="properties-head">
              {getIcon()}
              <div>
                <input
                  type="text"
                  className="input"
                  value={item.name}
                  readOnly
                  style={{ width: 180, fontWeight: 'bold' }}
                />
              </div>
            </div>

            <div className="properties-field-row">
              <span className="text-muted">Type of file:</span>
              <span>{getTypeName()}</span>
            </div>

            <div className="properties-field-row">
              <span className="text-muted">Opens with:</span>
              <span>{getOpensWith()}</span>
            </div>

            <div style={{ height: 1, background: 'var(--bevel-mid-dark)', margin: '4px 0' }} />

            <div className="properties-field-row">
              <span className="text-muted">Location:</span>
              <span>C:\CloudDesk\My Files\</span>
            </div>

            <div className="properties-field-row">
              <span className="text-muted">Size:</span>
              <span>{formatSize(item.size)} {item.size ? `(${item.size.toLocaleString()} bytes)` : ''}</span>
            </div>

            <div style={{ height: 1, background: 'var(--bevel-mid-dark)', margin: '4px 0' }} />

            <div className="properties-field-row">
              <span className="text-muted">Created:</span>
              <span>{formatDate(item.created_at)}</span>
            </div>

            <div className="properties-field-row">
              <span className="text-muted">Modified:</span>
              <span>{formatDate(item.updated_at)}</span>
            </div>

            <div style={{ height: 1, background: 'var(--bevel-mid-dark)', margin: '4px 0' }} />

            <div className="properties-field-row">
              <span className="text-muted">Attributes:</span>
              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="checkbox" defaultChecked={false} disabled /> Read-only
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="checkbox" defaultChecked={false} disabled /> Hidden
                </label>
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="properties-field-row">
              <span className="text-muted">File ID:</span>
              <span style={{ fontFamily: 'monospace', fontSize: 10 }}>{item.id}</span>
            </div>
            <div className="properties-field-row">
              <span className="text-muted">MIME Type:</span>
              <span>{item.mime_type || 'application/octet-stream'}</span>
            </div>
            <div className="properties-field-row">
              <span className="text-muted">Storage:</span>
              <span>Cloud Virtual Drive (Primary)</span>
            </div>
            <div className="properties-field-row">
              <span className="text-muted">Availability:</span>
              <span style={{ color: '#008000', fontWeight: 'bold' }}>✓ Synced & Available</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 8 }}>
        <button className="btn btn-default" onClick={onClose} autoFocus>
          OK
        </button>
        <button className="btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  )
}
