'use client'

import React, { useState } from 'react'
import { HelpIcon } from '@/components/icons'

interface Topic {
  id: string
  title: string
  category: string
  content: React.ReactNode
}

const TOPICS: Topic[] = [
  {
    id: 'intro',
    title: 'Welcome to CloudDesk',
    category: 'Getting Started',
    content: (
      <div>
        <h2 className="help-h1">Welcome to CloudDesk OS</h2>
        <p>
          CloudDesk is your personal computer running in the cloud. It provides a nostalgic, tactile desktop environment where you can organize, create, and access files from anywhere in the world.
        </p>
        <div style={{ background: '#FFFFE1', border: '1px solid #000', padding: 10, margin: '12px 0' }}>
          <strong>Tip:</strong> Everything inside CloudDesk behaves like a real personal computer. Double-click desktop icons to open apps, right-click files for context options, and drag windows around freely.
        </div>
      </div>
    ),
  },
  {
    id: 'files',
    title: 'Managing Files & Folders',
    category: 'File System',
    content: (
      <div>
        <h2 className="help-h1">Managing Files and Folders</h2>
        <p>
          Your files are organized on virtual drive <code>C:\</code> inside standard system folders such as <strong>Documents</strong>, <strong>Pictures</strong>, and <strong>Downloads</strong>.
        </p>
        <h3 style={{ fontSize: 13, color: '#000080', marginTop: 14 }}>To create a folder:</h3>
        <p>Open File Explorer, click <strong>File &rarr; New Folder</strong>, or right-click anywhere in the folder view and choose <strong>New Folder</strong>.</p>
        <h3 style={{ fontSize: 13, color: '#000080', marginTop: 14 }}>To upload files:</h3>
        <p>Drag files from your physical computer directly into any folder in File Explorer or onto the Desktop.</p>
      </div>
    ),
  },
  {
    id: 'paint',
    title: 'Drawing in Paint',
    category: 'Applications',
    content: (
      <div>
        <h2 className="help-h1">Using the Paint Program</h2>
        <p>
          Paint is a bitmap graphics tool. You can create diagrams, sketch pixel art, and save pictures directly to your cloud drive.
        </p>
        <ul>
          <li><strong>Pencil &amp; Brush:</strong> Draw freehand lines.</li>
          <li><strong>Fill Bucket:</strong> Flood fill contiguous areas with color.</li>
          <li><strong>Shapes:</strong> Draw lines, rectangles, and ellipses.</li>
          <li><strong>Color Palette:</strong> Left-click sets foreground color; right-click sets background color.</li>
          <li><strong>Save:</strong> Click <em>Save to Cloud</em> to store the picture into your <code>Pictures</code> folder.</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'media',
    title: 'Playing Music & Video',
    category: 'Applications',
    content: (
      <div>
        <h2 className="help-h1">Media Player Guide</h2>
        <p>
          The Media Player plays MP3, WAV, and video formats. It features an interactive frequency visualizer and customizable playlist.
        </p>
        <p>
          Double-clicking any audio or video file in File Explorer automatically opens Media Player and begins playback.
        </p>
      </div>
    ),
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts Reference',
    category: 'Reference',
    content: (
      <div>
        <h2 className="help-h1">Keyboard Shortcuts</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#E0E0E0', textAlign: 'left' }}>
              <th style={{ border: '1px solid #999', padding: 4 }}>Key</th>
              <th style={{ border: '1px solid #999', padding: 4 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #999', padding: 4 }}><code>Ctrl + C</code></td>
              <td style={{ border: '1px solid #999', padding: 4 }}>Copy file or text selection</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #999', padding: 4 }}><code>Ctrl + X</code></td>
              <td style={{ border: '1px solid #999', padding: 4 }}>Cut file</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #999', padding: 4 }}><code>Ctrl + V</code></td>
              <td style={{ border: '1px solid #999', padding: 4 }}>Paste file or text</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #999', padding: 4 }}><code>Ctrl + S</code></td>
              <td style={{ border: '1px solid #999', padding: 4 }}>Save document in Notepad</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #999', padding: 4 }}><code>F2</code></td>
              <td style={{ border: '1px solid #999', padding: 4 }}>Rename selected file</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #999', padding: 4 }}><code>Delete</code></td>
              <td style={{ border: '1px solid #999', padding: 4 }}>Move selected file to Recycle Bin</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #999', padding: 4 }}><code>Escape</code></td>
              <td style={{ border: '1px solid #999', padding: 4 }}>Close dialog or cancel operation</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: 'about',
    title: 'About Crete CloudDesk',
    category: 'System',
    content: (
      <div>
        <h2 className="help-h1">About Crete CloudDesk</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, background: '#F8F8F8', border: '1px solid #CCC', padding: 12 }}>
          <img src="/icons/crete-logo.png" alt="Crete" width={44} height={44} style={{ imageRendering: 'pixelated' }} />
          <div>
            <h3 style={{ margin: '0 0 4px', color: '#000080', fontSize: 15 }}>CloudDesk Personal Computer 2.0</h3>
            <p style={{ margin: 0, fontSize: 12, color: '#555' }}>
              Engineered and Developed by <strong>Crete</strong>
            </p>
          </div>
        </div>
        <p>
          CloudDesk is a tactile, retro cloud workstation crafted by <strong>Crete</strong>. It combines classic 90s personal computing aesthetics with modern cloud persistence, encrypted file storage, and real-time collaboration.
        </p>
        <div style={{ borderTop: '1px solid #CCC', marginTop: 16, paddingTop: 10, fontSize: 11, color: '#666' }}>
          &copy; 2026 Crete Corporation. All rights reserved.
        </div>
      </div>
    ),
  },
]

export default function HelpViewer() {
  const [selectedTopicId, setSelectedTopicId] = useState('intro')
  const currentTopic = TOPICS.find((t) => t.id === selectedTopicId) || TOPICS[0]

  return (
    <div className="help-frame os-chrome">
      {/* Topics Nav */}
      <div className="help-topics-nav">
        <div style={{ padding: '4px 6px', fontWeight: 'bold', borderBottom: '1px solid #DFDFDF', color: '#000080', display: 'flex', alignItems: 'center', gap: 4 }}>
          <HelpIcon size={16} /> Help Topics
        </div>
        <div style={{ marginTop: 4 }}>
          {TOPICS.map((topic) => (
            <div
              key={topic.id}
              className={`help-topic-item ${selectedTopicId === topic.id ? 'active' : ''}`}
              onClick={() => setSelectedTopicId(topic.id)}
            >
              <span>📄</span>
              <span>{topic.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Article Pane */}
      <div className="help-article-pane">{currentTopic.content}</div>
    </div>
  )
}
