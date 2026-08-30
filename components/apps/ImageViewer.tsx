'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { FsItem } from '@/store/filesystem'
import { getDownloadUrl } from '@/lib/fs-api'

interface ImageViewerProps {
  item: FsItem
  siblingImages?: FsItem[]
  onNavigate?: (item: FsItem) => void
}

export default function ImageViewer({ item, siblingImages = [], onNavigate }: ImageViewerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [fitMode, setFitMode] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)

  const currentIndex = siblingImages.findIndex(i => i.id === item.id)

  useEffect(() => {
    setLoading(true)
    setError(false)
    setZoom(1)
    setFitMode(true)
    getDownloadUrl(item.id)
      .then(url => setImageUrl(url))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [item.id])

  const zoomIn = () => { setZoom(z => Math.min(z + 0.25, 5)); setFitMode(false) }
  const zoomOut = () => { setZoom(z => Math.max(z - 0.25, 0.1)); setFitMode(false) }
  const resetZoom = () => { setZoom(1); setFitMode(false) }
  const fitToWindow = () => { setFitMode(true); setZoom(1) }

  const goNext = () => {
    if (currentIndex < siblingImages.length - 1) {
      onNavigate?.(siblingImages[currentIndex + 1])
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      onNavigate?.(siblingImages[currentIndex - 1])
    }
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === '+' || e.key === '=') zoomIn()
      if (e.key === '-') zoomOut()
      if (e.key === '0') fitToWindow()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentIndex, siblingImages])

  return (
    <div className="image-viewer-body">
      {/* Toolbar */}
      <div className="image-viewer-toolbar">
        <button
          className="btn btn-sm"
          onClick={goPrev}
          disabled={currentIndex <= 0}
          title="Previous image"
          aria-label="Previous image"
        >
          ◀ Prev
        </button>
        <button
          className="btn btn-sm"
          onClick={goNext}
          disabled={currentIndex >= siblingImages.length - 1 || siblingImages.length === 0}
          title="Next image"
          aria-label="Next image"
        >
          Next ▶
        </button>
        <div className="taskbar-divider" style={{ height: 16 }} />
        <button className="btn btn-sm" onClick={zoomIn} title="Zoom in" aria-label="Zoom in">
          +
        </button>
        <button className="btn btn-sm" onClick={zoomOut} title="Zoom out" aria-label="Zoom out">
          −
        </button>
        <button
          className={`btn btn-sm ${fitMode ? 'pressed' : ''}`}
          onClick={fitToWindow}
          title="Fit to window"
          aria-label="Fit to window"
        >
          Fit
        </button>
        <button
          className="btn btn-sm"
          onClick={resetZoom}
          title="Actual size (100%)"
          aria-label="Actual size"
        >
          1:1
        </button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginRight: 8 }}>
          {Math.round(zoom * 100)}%
          {siblingImages.length > 1 && ` · ${currentIndex + 1}/${siblingImages.length}`}
        </span>
        <button
          className="btn btn-sm"
          onClick={() => {
            const el = document.querySelector('.image-viewer-body') as HTMLElement
            if (el) {
              if (!document.fullscreenElement) {
                el.requestFullscreen?.()
                setFullscreen(true)
              } else {
                document.exitFullscreen?.()
                setFullscreen(false)
              }
            }
          }}
          title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {fullscreen ? '⊠' : '⊡'}
        </button>
      </div>

      {/* Image canvas */}
      <div
        className="image-viewer-canvas"
        style={{ cursor: fitMode ? 'default' : 'move' }}
      >
        {loading && (
          <div style={{ color: '#C0C0C0', fontSize: 11 }}>Loading image...</div>
        )}
        {error && (
          <div style={{ color: '#C0C0C0', fontSize: 11 }}>
            Unable to load image.
          </div>
        )}
        {imageUrl && !loading && !error && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={item.name}
            className="image-viewer-img"
            style={
              fitMode
                ? { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }
                : { transform: `scale(${zoom})`, transition: 'transform 0.1s ease' }
            }
            draggable={false}
          />
        )}
      </div>

      {/* Status */}
      <div className="window-statusbar" style={{ background: 'var(--sys-bg)', borderTop: '1px solid var(--bevel-mid-dark)' }}>
        <div className="window-statusbar-section">{item.name}</div>
        <div className="window-statusbar-section">{Math.round(zoom * 100)}%</div>
      </div>
    </div>
  )
}
