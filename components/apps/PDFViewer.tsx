'use client'

import React, { useState, useEffect, useRef } from 'react'
import { FsItem } from '@/store/filesystem'
import { getDownloadUrl } from '@/lib/fs-api'
import { PDFIcon } from '@/components/icons'

interface PDFViewerProps {
  initialFile?: FsItem | { id: string; name: string; url?: string }
}

export default function PDFViewer({ initialFile }: PDFViewerProps) {
  const [fileUrl, setFileUrl] = useState<string>('')
  const [zoom, setZoom] = useState(100)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState(initialFile?.name || 'Document.pdf')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeBlobUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (initialFile?.name) setFileName(initialFile.name)
    const resolveUrl = async () => {
      if (!initialFile) return
      setLoading(true)
      setError('')
      try {
        let rawUrl = ''
        if ('url' in initialFile && initialFile.url) {
          rawUrl = initialFile.url
        } else if (initialFile.id) {
          rawUrl = await getDownloadUrl(initialFile.id)
        }

        if (rawUrl) {
          if (activeBlobUrlRef.current) {
            URL.revokeObjectURL(activeBlobUrlRef.current)
            activeBlobUrlRef.current = null
          }

          if (rawUrl.startsWith('data:')) {
            const parts = rawUrl.split(',')
            const mimeMatch = parts[0].match(/:(.*?);/)
            const mime = mimeMatch ? mimeMatch[1] : 'application/pdf'
            const byteString = atob(parts[1])
            const ab = new ArrayBuffer(byteString.length)
            const ia = new Uint8Array(ab)
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i)
            }
            const blob = new Blob([ab], { type: mime })
            const bUrl = URL.createObjectURL(blob)
            activeBlobUrlRef.current = bUrl
            setFileUrl(bUrl)
          } else {
            setFileUrl(rawUrl)
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Could not load PDF document'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    resolveUrl()

    return () => {
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current)
      }
    }
  }, [initialFile])

  const handleLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current)
    }
    const bUrl = URL.createObjectURL(file)
    activeBlobUrlRef.current = bUrl
    setFileUrl(bUrl)
    setError('')
  }

  const handleDownload = () => {
    if (!fileUrl) return
    const a = document.createElement('a')
    a.href = fileUrl
    a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleZoomIn = () => setZoom((z) => Math.min(200, z + 25))
  const handleZoomOut = () => setZoom((z) => Math.max(50, z - 25))
  const handleFit = () => setZoom(100)

  return (
    <div className="pdf-viewer-container os-chrome" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#525659' }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={handleLocalFile}
      />

      {/* PDF Toolbar */}
      <div className="window-toolbar" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            className="btn btn-sm"
            onClick={() => fileInputRef.current?.click()}
            title="Open a PDF file from your computer"
          >
            📂 Open PDF...
          </button>
          <div className="taskbar-divider" style={{ height: 16 }} />
          <button className="btn btn-sm" onClick={handleZoomOut} title="Zoom Out">
            −
          </button>
          <span style={{ fontSize: 'var(--fs-xs)', minWidth: 36, textAlign: 'center', color: '#FFF' }}>
            {zoom}%
          </span>
          <button className="btn btn-sm" onClick={handleZoomIn} title="Zoom In">
            +
          </button>
          <button className="btn btn-sm" onClick={handleFit} title="Fit to window">
            Fit
          </button>
        </div>

        <div>
          {fileUrl && (
            <button
              onClick={handleDownload}
              className="btn btn-sm"
              style={{ fontWeight: 'bold' }}
              title="Download PDF"
            >
              ⬇ Download
            </button>
          )}
        </div>
      </div>

      {/* Document Viewport */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: 16,
        }}
      >
        {loading ? (
          <div style={{ color: '#FFFFFF', padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 13, marginBottom: 8 }}>Opening document...</div>
            <div style={{ fontSize: 10, color: '#C0C0C0' }}>Please wait.</div>
          </div>
        ) : error ? (
          <div className="bevel-sunken" style={{ background: '#FFFFFF', padding: 24, textAlign: 'center', maxWidth: 400 }}>
            <PDFIcon size={48} />
            <div style={{ color: '#CC0000', fontWeight: 'bold', margin: '12px 0 4px' }}>Cannot View PDF</div>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{error}</div>
          </div>
        ) : fileUrl ? (
          <div
            style={{
              width: `${(650 * zoom) / 100}px`,
              height: `${(850 * zoom) / 100}px`,
              background: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
              border: '1px solid #222',
              overflow: 'hidden',
            }}
          >
            <object
              data={fileUrl}
              type="application/pdf"
              style={{ width: '100%', height: '100%' }}
            >
              <iframe
                src={fileUrl}
                title={fileName}
                style={{ width: '100%', height: '100%', border: 'none' }}
              >
                <div style={{ padding: 20, textAlign: 'center' }}>
                  <p>Your browser does not support inline PDF viewing.</p>
                  <button onClick={handleDownload} className="btn">
                    Download {fileName}
                  </button>
                </div>
              </iframe>
            </object>
          </div>
        ) : (
          <div
            className="bevel-sunken"
            style={{
              width: `${(540 * zoom) / 100}px`,
              minHeight: `${(700 * zoom) / 100}px`,
              background: '#FFFFFF',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
              padding: 40,
              fontFamily: 'Times New Roman, serif',
              color: '#000000',
              lineHeight: 1.6,
            }}
          >
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 16, marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, margin: 0 }}>CLOUDDESK OPERATING SYSTEM</h1>
              <h3 style={{ fontSize: 14, margin: '6px 0 0', fontWeight: 'normal', color: '#555' }}>
                Technical Architecture Document &amp; User Manual
              </h3>
            </div>

            <h4 style={{ fontSize: 15, borderBottom: '1px solid #888', paddingBottom: 4 }}>1. Introduction</h4>
            <p style={{ fontSize: 13 }}>
              CloudDesk represents the concept of <em>&ldquo;Your computer. In the cloud.&rdquo;</em> A personal virtual environment where authenticated users store, organize, and interact with files through a tactile, nostalgic personal computing interface.
            </p>

            <h4 style={{ fontSize: 15, borderBottom: '1px solid #888', paddingBottom: 4, marginTop: 20 }}>2. File System Architecture</h4>
            <p style={{ fontSize: 13 }}>
              The file hierarchy is rooted in virtual drive <code>C:\</code>. Files are securely isolated per user account and backed by cloud object storage with atomic transaction consistency.
            </p>

            <div style={{ background: '#F0F0F0', border: '1px solid #CCC', padding: 12, marginTop: 20, fontSize: 11, fontFamily: 'monospace' }}>
              Document ID: CLOUD-DSK-2026-v2.0<br />
              Status: VERIFIED &amp; ACTIVE
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="window-statusbar" style={{ background: 'var(--sys-bg)' }}>
        <div className="window-statusbar-section" style={{ flex: 1 }}>
          {fileName}
        </div>
        <div className="window-statusbar-section">
          Zoom: {zoom}%
        </div>
      </div>
    </div>
  )
}
