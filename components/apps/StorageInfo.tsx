'use client'

import React, { useState, useEffect } from 'react'
import { getStorageUsage, formatSize } from '@/lib/fs-api'

export default function StorageInfo() {
  const [usage, setUsage] = useState<{ used: number; total: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStorageUsage()
      .then(data => setUsage(data))
      .catch(() => setUsage({ used: 0, total: 1 * 1024 * 1024 * 1024 }))
      .finally(() => setLoading(false))
  }, [])

  const pct = usage ? Math.min(100, (usage.used / usage.total) * 100) : 0
  const segmentCount = 24
  const filledSegments = Math.round((pct / 100) * segmentCount)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--sys-bg)',
    }}>
      <div style={{ padding: '16px 20px', flex: 1 }}>
        <div style={{
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: '1px solid var(--bevel-mid-dark)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>
            Cloud Storage
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            Your personal CloudDesk storage
          </div>
        </div>

        {loading ? (
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Calculating...</div>
        ) : usage && (
          <>
            {/* Classic segmented progress bar */}
            <div style={{ marginBottom: 8 }}>
              <div className="storage-bar-track">
                <div
                  className="storage-bar-fill"
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${pct.toFixed(1)}% storage used`}
                />
              </div>
            </div>

            {/* Segmented visual (classic Windows style) */}
            <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
              {Array.from({ length: segmentCount }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 8,
                    height: 14,
                    background: i < filledSegments
                      ? 'var(--titlebar-active)'
                      : 'var(--sys-bg-dark)',
                    border: '1px solid',
                    borderTopColor: i < filledSegments ? 'var(--titlebar-active-end)' : 'var(--bevel-light)',
                    borderLeftColor: i < filledSegments ? 'var(--titlebar-active-end)' : 'var(--bevel-light)',
                    borderBottomColor: i < filledSegments ? '#000060' : 'var(--bevel-dark)',
                    borderRightColor: i < filledSegments ? '#000060' : 'var(--bevel-dark)',
                  }}
                />
              ))}
            </div>

            {/* Numbers */}
            <div className="bevel-group" style={{ padding: '8px 12px', marginBottom: 12 }}>
              <table style={{ fontSize: 11, width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '2px 0', color: 'var(--text-muted)' }}>Used:</td>
                    <td style={{ padding: '2px 0', textAlign: 'right', fontWeight: 'bold' }}>
                      {formatSize(usage.used)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', color: 'var(--text-muted)' }}>Available:</td>
                    <td style={{ padding: '2px 0', textAlign: 'right' }}>
                      {formatSize(usage.total - usage.used)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', color: 'var(--text-muted)' }}>Total:</td>
                    <td style={{ padding: '2px 0', textAlign: 'right' }}>
                      {formatSize(usage.total)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', color: 'var(--text-muted)' }}>Used %:</td>
                    <td style={{ padding: '2px 0', textAlign: 'right' }}>
                      {pct.toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              CloudDesk provides 1 GB of personal cloud storage per account (Supabase free tier).
              Upgrade to Supabase Pro for up to 100 GB. Files in the Recycle Bin do not count toward your usage.
            </div>
          </>
        )}
      </div>
    </div>
  )
}
