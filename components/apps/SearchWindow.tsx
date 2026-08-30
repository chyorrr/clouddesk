'use client'

import React, { useState, useCallback } from 'react'
import { FsItem } from '@/store/filesystem'
import { searchFiles, formatSize, formatDate, getExtension } from '@/lib/fs-api'
import { FileIcon, FolderSmallIcon, ImageFileIcon, TextFileIcon, SearchIcon } from '@/components/icons'

interface SearchWindowProps {
  onOpenFile: (item: FsItem) => void
}

export default function SearchWindow({ onOpenFile }: SearchWindowProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(false)
    try {
      const data = await searchFiles(query)
      setResults(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }, [query])

  const getIcon = (item: FsItem) => {
    if (item.type === 'folder') return <FolderSmallIcon size={16} />
    const ext = getExtension(item.name)
    if (['jpg','jpeg','png','gif','webp','bmp'].includes(ext)) return <ImageFileIcon size={16} />
    if (['txt','md','log','json'].includes(ext)) return <TextFileIcon size={16} />
    return <FileIcon size={16} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search form */}
      <div style={{ padding: '8px 12px', background: 'var(--sys-bg)', borderBottom: '1px solid var(--bevel-mid-dark)' }}>
        <div style={{ marginBottom: 4, fontSize: 11, color: 'var(--text-muted)' }}>
          Search for files and folders:
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="File name..."
            aria-label="Search query"
            autoFocus
          />
          <button
            className="btn"
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            aria-label="Search"
          >
            <SearchIcon size={12} />
            Search
          </button>
        </div>
        {searched && (
          <div style={{ marginTop: 4, fontSize: 10, color: 'var(--text-muted)' }}>
            {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </div>
        )}
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--content-bg)' }}>
        {loading && (
          <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 11 }}>Searching...</div>
        )}
        {!loading && searched && results.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 11 }}>
            No files found matching "{query}".
          </div>
        )}
        {!loading && results.length > 0 && (
          <div className="explorer-list">
            <div className="explorer-list-header" style={{ gridTemplateColumns: '1fr 80px 80px' }}>
              <div className="explorer-list-header-cell">Name</div>
              <div className="explorer-list-header-cell">Size</div>
              <div className="explorer-list-header-cell">Modified</div>
            </div>
            {results.map(item => (
              <div
                key={item.id}
                className={`explorer-list-row ${selectedId === item.id ? 'selected' : ''}`}
                style={{ gridTemplateColumns: '1fr 80px 80px' }}
                onClick={() => setSelectedId(item.id)}
                onDoubleClick={() => onOpenFile(item)}
                role="row"
                tabIndex={0}
                aria-label={item.name}
              >
                <div className="explorer-list-cell">
                  {getIcon(item)}
                  <span className="truncate">{item.name}</span>
                </div>
                <div className="explorer-list-cell text-xs text-muted">
                  {item.type === 'folder' ? 'Folder' : formatSize(item.size)}
                </div>
                <div className="explorer-list-cell text-xs text-muted">
                  {formatDate(item.updated_at)}
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && !searched && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 11, lineHeight: 1.6 }}>
            <SearchIcon size={24} />
            <br /><br />
            Type a filename to search
            <br />
            across all your files and folders.
          </div>
        )}
      </div>

      <div className="window-statusbar">
        {searched && (
          <div className="window-statusbar-section">{results.length} result{results.length !== 1 ? 's' : ''}</div>
        )}
      </div>
    </div>
  )
}
