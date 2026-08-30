'use client'

import React, { useState } from 'react'

const BOOKMARKS = [
  { title: 'CloudDesk Home', url: 'home' },
  { title: 'Wikipedia', url: 'https://en.m.wikipedia.org' },
  { title: 'Hacker News', url: 'https://news.ycombinator.com' },
  { title: 'Internet Archive', url: 'https://archive.org' },
  { title: 'W3C Standards', url: 'https://www.w3.org' },
]

export default function Browser() {
  const [currentDestination, setCurrentDestination] = useState('home')
  const [inputUrl, setInputUrl] = useState('http://clouddesk.internal/portal')
  const [history, setHistory] = useState<string[]>(['home'])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [statusText, setStatusText] = useState('Ready')
  const [searchQuery, setSearchQuery] = useState('')

  const getIframeSrc = (dest: string) => {
    if (dest === 'home') return ''
    return `/api/proxy?url=${encodeURIComponent(dest)}`
  }

  const navigateTo = (destination: string) => {
    let target = destination.trim()
    if (!target) return

    if (target === 'home') {
      setCurrentDestination('home')
      setInputUrl('http://clouddesk.internal/portal')
    } else {
      // If user typed a search query rather than a URL
      if (!target.includes('.') || target.includes(' ')) {
        target = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(target)}`
      } else if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = 'https://' + target
      }
      setCurrentDestination(target)
      setInputUrl(target)
    }

    setIsLoading(true)
    setStatusText(`Connecting to ${target === 'home' ? 'CloudDesk Portal' : target}...`)

    const updatedHistory = history.slice(0, historyIndex + 1)
    updatedHistory.push(target)
    setHistory(updatedHistory)
    setHistoryIndex(updatedHistory.length - 1)

    setTimeout(() => {
      setIsLoading(false)
      setStatusText('Done')
    }, 800)
  }

  const handleBack = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1]
      setHistoryIndex(historyIndex - 1)
      setCurrentDestination(prev)
      setInputUrl(prev === 'home' ? 'http://clouddesk.internal/portal' : prev)
    }
  }

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1]
      setHistoryIndex(historyIndex + 1)
      setCurrentDestination(next)
      setInputUrl(next === 'home' ? 'http://clouddesk.internal/portal' : next)
    }
  }

  const handleReload = () => {
    setIsLoading(true)
    setStatusText('Reloading page...')
    const iframe = document.getElementById('browser-active-iframe') as HTMLIFrameElement | null
    if (iframe && currentDestination !== 'home') {
      iframe.src = getIframeSrc(currentDestination)
    }
    setTimeout(() => {
      setIsLoading(false)
      setStatusText('Done')
    }, 600)
  }

  const handleHome = () => {
    navigateTo('home')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigateTo(inputUrl)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigateTo(searchQuery)
    setSearchQuery('')
  }

  return (
    <div className="browser-frame os-chrome" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Browser Menubar */}
      <div className="window-menubar">
        <div className="window-menubar-item" onClick={handleHome}>File</div>
        <div className="window-menubar-item">Edit</div>
        <div className="window-menubar-item">View</div>
        <div className="window-menubar-item">Favorites</div>
        <div className="window-menubar-item">Help</div>
      </div>

      {/* Navigation Toolbar */}
      <div className="browser-bar" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 6px', background: '#ECE9D8', borderBottom: '1px solid #AAA' }}>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flex: 1, gap: 4, marginLeft: 4 }}>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', alignSelf: 'center' }}>
            Address:
          </span>
          <input
            type="text"
            className="browser-url-input input"
            style={{ flex: 1, height: 22, fontSize: 11 }}
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
          />
          <button type="submit" className="btn btn-sm">
            Go
          </button>
          {currentDestination !== 'home' && (
            <a
              href={currentDestination}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm"
              title="Open website in new browser tab"
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
            >
              ↗
            </a>
          )}
        </form>
      </div>

      {/* Bookmarks Bar */}
      <div className="browser-bookmarks" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 8px', background: '#F4F2E8', borderBottom: '1px solid #CCC', fontSize: 11 }}>
        <span style={{ fontWeight: 'bold', color: '#606060' }}>Links:</span>
        {BOOKMARKS.map((bm, i) => (
          <button
            key={i}
            className="btn btn-sm"
            style={{ padding: '1px 6px', fontSize: 10 }}
            onClick={() => navigateTo(bm.url)}
          >
            {bm.title}
          </button>
        ))}
      </div>

      {/* Browser Viewport */}
      <div className="browser-viewport" style={{ flex: 1, position: 'relative', background: '#FFF', overflow: 'hidden' }}>
        {currentDestination === 'home' ? (
          <div className="browser-home" style={{ padding: 24, height: '100%', overflowY: 'auto' }}>
            <div style={{ textAlign: 'center', borderBottom: '3px double #000080', paddingBottom: 16, marginBottom: 20 }}>
              <h1 style={{ color: '#000080', fontSize: 24, margin: '0 0 6px' }}>
                🌐 CloudDesk World Wide Web
              </h1>
              <p style={{ fontSize: 12, fontStyle: 'italic', margin: 0, color: '#444' }}>
                Internet Portal &middot; Web Search &middot; Global Directory
              </p>
            </div>

            {/* Retro Web Search Bar */}
            <div className="bevel-raised" style={{ background: '#E6F0FA', padding: 14, marginBottom: 20, textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 13, color: '#000080' }}>🔍 Web Search Engine</h3>
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', maxWidth: 460, margin: '0 auto', gap: 6 }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Search websites or enter keyword (e.g. Python, Linux)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, fontSize: 12 }}
                />
                <button type="submit" className="btn btn-default" style={{ fontWeight: 'bold' }}>
                  Search Web
                </button>
              </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div className="bevel-sunken" style={{ padding: 12, background: '#FFFFF8' }}>
                <h3 style={{ fontSize: 13, color: '#800000', marginTop: 0, borderBottom: '1px solid #CCC', paddingBottom: 4 }}>
                  🌟 Featured Websites
                </h3>
                <ul style={{ paddingLeft: 18, fontSize: 11, lineHeight: 1.9, margin: '6px 0 0' }}>
                  <li>
                    <a href="#wiki" onClick={(e) => { e.preventDefault(); navigateTo('https://en.m.wikipedia.org') }} style={{ color: '#0000FF', fontWeight: 'bold' }}>
                      Wikipedia (Free Encyclopedia)
                    </a>
                  </li>
                  <li>
                    <a href="#hn" onClick={(e) => { e.preventDefault(); navigateTo('https://news.ycombinator.com') }} style={{ color: '#0000FF' }}>
                      Hacker News (Tech Discussions)
                    </a>
                  </li>
                  <li>
                    <a href="#archive" onClick={(e) => { e.preventDefault(); navigateTo('https://archive.org') }} style={{ color: '#0000FF' }}>
                      Internet Archive (Wayback Machine)
                    </a>
                  </li>
                  <li>
                    <a href="#w3c" onClick={(e) => { e.preventDefault(); navigateTo('https://www.w3.org') }} style={{ color: '#0000FF' }}>
                      W3C Standards Organization
                    </a>
                  </li>
                </ul>
              </div>

              <div className="bevel-sunken" style={{ padding: 12, background: '#F0F8FF' }}>
                <h3 style={{ fontSize: 13, color: '#004080', marginTop: 0, borderBottom: '1px solid #CCC', paddingBottom: 4 }}>
                  💻 CloudDesk System Info
                </h3>
                <p style={{ fontSize: 11, lineHeight: 1.5, margin: '6px 0' }}>
                  Web browser connects through CloudDesk proxy gateway. You can enter any HTTP/HTTPS URL in the address bar above to browse live pages.
                </p>
                <div style={{ fontSize: 10, color: '#666', borderTop: '1px dotted #888', paddingTop: 6, marginTop: 10 }}>
                  Active Gateway: CloudDesk Fast HTTP Relay &middot; Online
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <iframe
              id="browser-active-iframe"
              src={getIframeSrc(currentDestination)}
              title="CloudDesk Web Browser Viewport"
              style={{ width: '100%', height: '100%', border: 'none', background: '#FFF' }}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          </div>
        )}
      </div>

      {/* Browser Statusbar */}
      <div className="window-statusbar">
        <div className="window-statusbar-section" style={{ flex: 1 }}>
          {statusText}
        </div>
        <div className="window-statusbar-section">
          {isLoading ? '⏳ Loading...' : '🔒 Online'}
        </div>
      </div>
    </div>
  )
}
