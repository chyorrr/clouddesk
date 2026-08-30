'use client'

import React, { useRef } from 'react'
import { useDesktopStore, WallpaperKey } from '@/store/desktop'
import { updateUserSettings } from '@/lib/fs-api'

const WALLPAPERS: { key: WallpaperKey; label: string; preview: string }[] = [
  { key: 'bliss',    label: 'Retro Bliss',       preview: 'url(/wallpapers/bliss_pixel.jpg) center/cover' },
  { key: 'skyhill',  label: 'Pixel Hills',       preview: 'linear-gradient(180deg, #5CA0D3 0%, #87CEEB 60%, #4A8505 60%, #2E5802 100%)' },
  { key: 'teal',     label: 'Classic Teal',      preview: '#008080' },
  { key: 'abstract', label: 'Retro Matrix Grid', preview: '#1B263B' },
  { key: 'slate',    label: 'Starry Slate',      preview: '#2B3A4A' },
  { key: 'dusk',     label: 'Purple Dusk',       preview: 'linear-gradient(180deg, #2D3561 0%, #7B5EA7 100%)' },
]

interface SettingsWindowProps {
  onWallpaperChange?: () => void
}

export default function SettingsWindow({ onWallpaperChange }: SettingsWindowProps) {
  const { settings, updateSettings } = useDesktopStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleWallpaper = async (key: WallpaperKey) => {
    updateSettings({ wallpaper: key, customWallpaperUrl: undefined })
    await updateUserSettings({ wallpaper: key }).catch(() => {})
    onWallpaperChange?.()
  }

  const handleCustomWallpaper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    updateSettings({ wallpaper: 'custom', customWallpaperUrl: url })
    onWallpaperChange?.()
  }

  const handleIconSize = async (size: 'small' | 'medium' | 'large') => {
    updateSettings({ iconSize: size })
    await updateUserSettings({ icon_size: size }).catch(() => {})
  }

  const handleSound = async (enabled: boolean) => {
    updateSettings({ soundEnabled: enabled })
    await updateUserSettings({ sound_enabled: enabled }).catch(() => {})
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--sys-bg)',
        overflow: 'auto',
      }}
      className="os-chrome"
    >
      <div style={{ padding: '12px 16px' }}>
        {/* Wallpaper section */}
        <fieldset className="bevel-group" style={{ padding: '8px 12px', marginBottom: 12 }}>
          <legend style={{ padding: '0 4px', fontSize: 11, fontWeight: 'bold' }}>
            Desktop Wallpaper &amp; Atmosphere
          </legend>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {WALLPAPERS.map((wp) => (
              <div
                key={wp.key}
                onClick={() => handleWallpaper(wp.key)}
                style={{
                  width: 76,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <div
                  style={{
                    width: 68,
                    height: 44,
                    background: wp.preview,
                    border:
                      settings.wallpaper === wp.key
                        ? '2px solid var(--select-bg)'
                        : '1px solid var(--bevel-mid-dark)',
                    outline: settings.wallpaper === wp.key ? '1px solid white' : 'none',
                    boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.3)',
                  }}
                />
                <div
                  style={{
                    fontSize: 10,
                    color: settings.wallpaper === wp.key ? 'var(--accent-blue)' : 'var(--text-primary)',
                    fontWeight: settings.wallpaper === wp.key ? 'bold' : 'normal',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  {wp.label}
                </div>
              </div>
            ))}

            {/* Custom */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 76,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <div
                style={{
                  width: 68,
                  height: 44,
                  border:
                    settings.wallpaper === 'custom'
                      ? '2px solid var(--select-bg)'
                      : '1px dashed var(--bevel-mid-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  color: 'var(--text-muted)',
                  background: settings.customWallpaperUrl
                    ? `url(${settings.customWallpaperUrl}) center/cover`
                    : 'var(--content-bg)',
                }}
              >
                {!settings.customWallpaperUrl && '+'}
              </div>
              <div style={{ fontSize: 10, textAlign: 'center', lineHeight: 1.2 }}>
                Custom Image
              </div>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleCustomWallpaper}
            aria-label="Upload custom wallpaper"
          />
        </fieldset>

        {/* Icon size */}
        <fieldset className="bevel-group" style={{ padding: '8px 12px', marginBottom: 12 }}>
          <legend style={{ padding: '0 4px', fontSize: 11, fontWeight: 'bold' }}>
            Desktop Icon Grid
          </legend>
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            {(['small', 'medium', 'large'] as const).map((size) => (
              <label
                key={size}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, cursor: 'pointer' }}
              >
                <input
                  type="radio"
                  name="iconSize"
                  checked={settings.iconSize === size}
                  onChange={() => handleIconSize(size)}
                />
                {size.charAt(0).toUpperCase() + size.slice(1)} (
                {size === 'small' ? '24px' : size === 'medium' ? '32px' : '48px'})
              </label>
            ))}
          </div>
        </fieldset>

        {/* Sound */}
        <fieldset className="bevel-group" style={{ padding: '8px 12px', marginBottom: 12 }}>
          <legend style={{ padding: '0 4px', fontSize: 11, fontWeight: 'bold' }}>
            Sound Scheme
          </legend>
          <label
            style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 11, cursor: 'pointer' }}
          >
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => handleSound(e.target.checked)}
            />
            Enable system audio events &amp; chimes
          </label>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            Plays authentic click and window notification sounds
          </div>
        </fieldset>

        {/* About */}
        <fieldset className="bevel-group" style={{ padding: '8px 12px' }}>
          <legend style={{ padding: '0 4px', fontSize: 11, fontWeight: 'bold' }}>
            About CloudDesk OS
          </legend>
          <div style={{ fontSize: 11, lineHeight: 1.6, marginTop: 4, color: 'var(--text-muted)' }}>
            <strong>CloudDesk Operating System 2.0</strong>
            <br />
            &ldquo;Your computer. In the cloud.&rdquo;
            <br />
            <span style={{ fontSize: 10 }}>Personal Virtual PC &middot; Fully Persistent</span>
          </div>
        </fieldset>
      </div>
    </div>
  )
}
