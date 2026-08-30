'use client'

import React, { useState, useRef } from 'react'

const BOOKMARKS = [
  { title: 'CloudDesk Portal', url: 'home' },
  { title: 'Wikipedia', url: 'https://en.m.wikipedia.org' },
  { title: 'Internet Archive', url: 'https://archive.org' },
  { title: 'Hacker News', url: 'https://news.ycombinator.com' },
  { title: 'W3C Standards', url: 'https://www.w3.org' },
]

export default function Browser() {
  const [url, setUrl] = useState('home')
  const [inputUrl, setInputUrl] = useState('http://clouddesk.internal/portal')
  const [history, setHistory] = useState<string[]>(['home'])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [statusText, setStatusText] = useState('Done')
  const [iframeError, setIframeError] = useState(false)

  const navigateTo = (destination: string) => {
    setIframeError(false)
    setIsLoading(true)
    setStatusText(`Connecting to ${destination}...`)

    let target = destination
    if (destination !== 'home') {
      if (!destination.startsWith('http://') && !destination.startsWith('https://')) {
        target = 'https://' + destination
      }
    }

    setUrl(target)
    setInputUrl(target === 'home' ? 'http://clouddesk.internal/portal' : target)

    const updatedHistory = history.slice(0, historyIndex + 1)
    updatedHistory.push(target)
    setHistory(updatedHistory)
    setHistoryIndex(updatedHistory.length - 1)

    setTimeout(() => {
      setIsLoading(false)
      setStatusText('Done')
    }, 600)
  }

  const handleBack = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1]
      setHistoryIndex(historyIndex - 1)
      setUrl(prev)
      setInputUrl(prev === 'home' ? 'http://clouddesk.internal/portal' : prev)
      setIframeError(false)
    }
  }

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1]
      setHistoryIndex(historyIndex + 1)
      setUrl(next)
      setInputUrl(next === 'home' ? 'http://clouddesk.internal/portal' : next)
      setIframeError(false)
    }
  }

  const handleReload = () => {
    setIsLoading(true)
    setStatusText('Reloading page...')
    setTimeout(() => {
      setIsLoading(false)
      setStatusText('Done')
    }, 400)
  }

  const handleHome = () => {
    navigateTo('home')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigateTo(inputUrl)
  }

  return (
    <div className="browser-frame os-chrome">
      {/* Browser Menubar */}
      <div className="window-menubar">
        <div className="window-menubar-item">File</div>
        <div className="window-menubar-item">Edit</div>
        <div className="window-menubar-item">View</div>
        <div className="window-menubar-item">Favorites</div>
        <div className="window-menubar-item">Help</div>
      </div>

      {/* Navigation Toolbar */}
      <div className="browser-bar">
        <button
          className="btn btn-sm"
          onClick={handleBack}
          disabled={historyIndex <= 0}
          title="Back"
        >
          ◀ Back
        </button>
        <button
          className="btn btn-sm"
          onClick={handleForward}
          disabled={historyIndex >= history.length - 1}
          title="Forward"
        >
          Forward ▶
        </button>
        <button className="btn btn-sm" onClick={handleReload} title="Refresh">
          ↻
        </button>
        <button className="btn btn-sm" onClick={handleHome} title="Home Page">
          🏠 Home
        </button>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flex: 1, gap: 4 }}>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', alignSelf: 'center' }}>
            Address:
          </span>
          <input
            type="text"
            className="browser-url-input"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
          />
          <button type="submit" className="btn btn-sm">
            Go
          </button>
        </form>
      </div>

      {/* Bookmarks Bar */}
      <div className="browser-bookmarks">
        <span style={{ fontWeight: 'bold', color: '#606060' }}>Links:</span>
        {BOOKMARKS.map((bm, i) => (
          <button
            key={i}
            className="browser-bookmark-link btn-sm"
            onClick={() => navigateTo(bm.url)}
          >
            {bm.title}
          </button>
        ))}
      </div>

      {/* Browser Viewport */}
      <div className="browser-viewport">
        {url === 'home' ? (
          <div className="browser-home">
            <div style={{ textAlign: 'center', borderBottom: '3px double #000080', paddingBottom: 16, marginBottom: 20 }}>
              <h1 style={{ color: '#000080', fontSize: 24, margin: '0 0 6px' }}>
                🌐 CloudDesk World Wide Web
              </h1>
              <p style={{ fontSize: 13, fontStyle: 'italic', margin: 0 }}>
                Welcome to the Early Internet Directory &middot; Established 2026
              </p>
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <div style={{ flex: 1, border: '1px solid #C0C0C0', padding: 12, background: '#FFFFF0' }}>
                <h3 style={{ fontSize: 14, color: '#800000', marginTop: 0 }}>🌟 Featured Sites</h3>
                <ul style={{ paddingLeft: 18, fontSize: 12, lineHeight: 1.8 }}>
                  <li>
                    <a
                      href="#wiki"
                      onClick={(e) => {
                        e.preventDefault()
                        navigateTo('https://en.m.wikipedia.org')
                      }}
                      style={{ color: '#0000FF' }}
                    >
                      Wikipedia (Free Encyclopedia)
                    </a>
                  </li>
                  <li>
                    <a
                      href="#archive"
                      onClick={(e) => {
                        e.preventDefault()
                        navigateTo('https://archive.org')
                      }}
                      style={{ color: '#0000FF' }}
                    >
                      The Internet Archive (Wayback Machine)
                    </a>
                  </li>
                  <li>
                    <a
                      href="#w3c"
                      onClick={(e) => {
                        e.preventDefault()
                        navigateTo('https://www.w3.org')
                      }}
                      style={{ color: '#0000FF' }}
                    >
                      World Wide Web Consortium (W3C)
                    </a>
                  </li>
                </ul>
              </div>

              <div style={{ flex: 1, border: '1px solid #C0C0C0', padding: 12, background: '#F0F8FF' }}>
                <h3 style={{ fontSize: 14, color: '#004080', marginTop: 0 }}>💻 System Net News</h3>
                <p style={{ fontSize: 12 }}>
                  CloudDesk Operating System v2.0 released with native web browser integration, retro Paint, and high-fidelity Media Player.
                </p>
                <div style={{ fontSize: 11, color: '#666', borderTop: '1px dotted #888', paddingTop: 6 }}>
                  Status: 56.6 kbps Simulated Dial-up Connection &middot; Active
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid #000', padding: 10, background: '#FFFFCC', fontSize: 12, textAlign: 'center' }}>
              🚧 <strong>Notice:</strong> External websites that enforce restrictive frame security headers can be opened in a separate window.
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <iframe
              src={url}
              title="CloudDesk Web Browser Viewport"
              style={{ width: '100%', height: '100%', border: 'none' }}
              onError={() => setIframeError(true)}
            />

            {iframeError && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#FFFFFF',
                  padding: 30,
                  fontFamily: 'sans-serif',
                }}
              >
                <h2 style={{ color: '#CC0000' }}>The page cannot be displayed</h2>
                <p style={{ fontSize: 13 }}>
                  The web server at <strong>{url}</strong> has declined embedding inside the virtual desktop frame for security reasons.
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-default"
                  style={{ display: 'inline-block', marginTop: 12 }}
                >
                  Open {url} in New Window ↗
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Browser Statusbar */}
      <div className="window-statusbar">
        <div className="window-statusbar-section" style={{ flex: 1 }}>
          {statusText}
        </div>
        <div className="window-statusbar-section">
          {isLoading ? '⏳ Loading' : '🔒 Secure Zone'}
        </div>
      </div>
    </div>
  )
}
