'use client'

import React, { useState, useEffect } from 'react'
import { MyComputerIcon } from '@/components/icons'
import { getStorageUsage, formatSize } from '@/lib/fs-api'

interface SystemInfoProps {
  username: string
}

export default function SystemInfo({ username }: SystemInfoProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'hardware' | 'network'>('general')
  const [storage, setStorage] = useState<{ used: number; total: number }>({
    used: 2450000,
    total: 10 * 1024 * 1024 * 1024,
  })

  useEffect(() => {
    getStorageUsage()
      .then((data) => setStorage(data))
      .catch(() => {})
  }, [])

  return (
    <div className="properties-dialog os-chrome">
      <div className="properties-tabs">
        <button
          className={`properties-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`properties-tab-btn ${activeTab === 'hardware' ? 'active' : ''}`}
          onClick={() => setActiveTab('hardware')}
        >
          Hardware
        </button>
        <button
          className={`properties-tab-btn ${activeTab === 'network' ? 'active' : ''}`}
          onClick={() => setActiveTab('network')}
        >
          Computer Name
        </button>
      </div>

      <div className="properties-card" style={{ padding: 14 }}>
        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--bevel-mid-dark)', paddingBottom: 10 }}>
              <MyComputerIcon size={48} />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 14, color: '#000080' }}>
                  CloudDesk Operating System
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Release 2.0 (Build 2026.08)
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Personal Cloud Edition
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 6, fontSize: 11 }}>
              <span className="text-muted">Registered to:</span>
              <strong>{username}</strong>

              <span className="text-muted">Computer Name:</span>
              <span>{username.toUpperCase()}-PC</span>

              <span className="text-muted">Primary Drive:</span>
              <span>C:\ ({formatSize(storage.used)} used / {formatSize(storage.total)})</span>

              <span className="text-muted">Cloud Kernel:</span>
              <span>Supabase Distributed FS (Multi-Region)</span>
            </div>
          </div>
        )}

        {activeTab === 'hardware' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 11 }}>
            <div style={{ fontWeight: 'bold', borderBottom: '1px solid var(--bevel-mid-dark)', paddingBottom: 4 }}>
              VIRTUAL HARDWARE SPECIFICATIONS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 6 }}>
              <span className="text-muted">Processor:</span>
              <span>CloudDesk vCPU @ 3.40 GHz (64-bit)</span>

              <span className="text-muted">System Memory:</span>
              <span>16,384 MB Virtual RAM</span>

              <span className="text-muted">Display Adapter:</span>
              <span>Standard 256-Color VGA / SVGA Virtual Controller</span>

              <span className="text-muted">Audio Adapter:</span>
              <span>Sound Blaster 16 Compatible Virtual Synthesizer</span>
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 11 }}>
            <div style={{ fontWeight: 'bold', borderBottom: '1px solid var(--bevel-mid-dark)', paddingBottom: 4 }}>
              NETWORK IDENTIFICATION
            </div>
            <p style={{ margin: 0 }}>
              CloudDesk uses the following information to identify your computer on the virtual network.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 6 }}>
              <span className="text-muted">Full Computer Name:</span>
              <strong>{username.toUpperCase()}-PC.clouddesk.net</strong>

              <span className="text-muted">Workgroup:</span>
              <span>WORKGROUP</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
