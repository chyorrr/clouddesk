'use client'

import React from 'react'
import { WallpaperKey } from '@/store/desktop'

interface WallpaperProps {
  wallpaper: WallpaperKey
  customUrl?: string
}

export default function Wallpaper({ wallpaper, customUrl }: WallpaperProps) {
  if (wallpaper === 'custom' && customUrl) {
    return (
      <div
        className="desktop-wallpaper-layer"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${customUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
    )
  }

  return (
    <div
      className="desktop-wallpaper-layer"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {/* 1. Bliss: The Iconic Pixel Rolling Hills & Cloud Landscape */}
      {(wallpaper === 'bliss' || !wallpaper) && (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: 'url("/wallpapers/bliss_pixel.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
            imageRendering: 'pixelated',
          }}
        />
      )}

      {/* 2. Pixel Hills: 16-bit Sunny Valley */}
      {(wallpaper === 'skyhill' || wallpaper === 'sky') && <SkyHillWallpaper />}

      {/* 3. Classic Teal: Windows 95/98 Heritage with Fine Dither */}
      {wallpaper === 'teal' && <TealWallpaper />}

      {/* 4. Starry Slate: Retro Midnight Sky */}
      {wallpaper === 'slate' && <SlateWallpaper />}

      {/* 5. Retro Matrix: Sunset Wireframe Grid */}
      {wallpaper === 'abstract' && <AbstractWallpaper />}

      {/* 6. Purple Dusk */}
      {wallpaper === 'dusk' && <DuskWallpaper />}
    </div>
  )
}

/* ============================================================
   PIXEL SKY & HILLS (16-bit Landscape)
   ============================================================ */
function SkyHillWallpaper() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 320 200"
      preserveAspectRatio="none"
      style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated' }}
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3070B8" />
          <stop offset="50%" stopColor="#68A8E8" />
          <stop offset="68%" stopColor="#98D0F8" />
          <stop offset="100%" stopColor="#D8F0FF" />
        </linearGradient>
      </defs>

      <rect width="320" height="200" fill="url(#skyGrad)" />

      {/* Pixel Sun */}
      <rect x="250" y="25" width="22" height="22" fill="#FFF488" />
      <rect x="248" y="28" width="26" height="16" fill="#FFF488" />
      <rect x="253" y="22" width="16" height="28" fill="#FFF488" />
      <rect x="254" y="29" width="14" height="14" fill="#FFFFFF" />

      {/* Stepped Pixel Cloud Left */}
      <g fill="#FFFFFF" opacity="0.9">
        <rect x="30" y="42" width="60" height="14" />
        <rect x="42" y="34" width="36" height="12" />
        <rect x="50" y="28" width="20" height="8" />
        <rect x="24" y="48" width="72" height="8" />
        <rect x="32" y="54" width="56" height="4" fill="#C4D8EC" />
      </g>

      {/* Stepped Pixel Cloud Right */}
      <g fill="#FFFFFF" opacity="0.85">
        <rect x="150" y="55" width="70" height="14" />
        <rect x="162" y="45" width="46" height="12" />
        <rect x="172" y="38" width="26" height="10" />
        <rect x="144" y="62" width="82" height="8" />
        <rect x="152" y="68" width="66" height="4" fill="#C4D8EC" />
      </g>

      {/* Horizon Hills Layer 1 */}
      <polygon
        points="0,128 45,116 95,124 150,112 210,122 270,110 320,120 320,200 0,200"
        fill="#265818"
      />

      {/* Layer 2 Mid Hills */}
      <polygon
        points="0,138 60,126 130,136 195,124 265,134 320,122 320,200 0,200"
        fill="#3A8222"
      />

      {/* Layer 3 Foreground Grass */}
      <polygon
        points="0,152 75,138 160,150 245,136 320,148 320,200 0,200"
        fill="#55A830"
      />

      {/* Front Hill */}
      <polygon
        points="0,168 110,152 220,166 320,156 320,200 0,200"
        fill="#66C038"
      />
    </svg>
  )
}

/* ============================================================
   CLASSIC TEAL (Windows 95/98 Heritage with Emblem)
   ============================================================ */
function TealWallpaper() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#008080',
        backgroundImage: `
          radial-gradient(#009090 15%, transparent 16%),
          radial-gradient(#007070 15%, transparent 16%)
        `,
        backgroundSize: '4px 4px',
        backgroundPosition: '0 0, 2px 2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          opacity: 0.22,
          userSelect: 'none',
        }}
      >
        <svg width="120" height="90" viewBox="0 0 80 60" fill="none">
          <rect x="8" y="6" width="64" height="42" fill="#FFFFFF" stroke="#004040" strokeWidth="2" />
          <rect x="14" y="12" width="52" height="30" fill="#008080" />
          <rect x="34" y="48" width="12" height="6" fill="#FFFFFF" />
          <polygon points="24,54 56,54 60,58 20,58" fill="#FFFFFF" />
        </svg>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: 'bold',
            color: '#FFFFFF',
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          CloudDesk
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   STARRY SLATE (Midnight Retro PC Sky)
   ============================================================ */
function SlateWallpaper() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 320 200"
      preserveAspectRatio="none"
      style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated' }}
    >
      <defs>
        <linearGradient id="slateSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B1320" />
          <stop offset="45%" stopColor="#1C2D44" />
          <stop offset="80%" stopColor="#304460" />
          <stop offset="100%" stopColor="#4B6584" />
        </linearGradient>
      </defs>

      <rect width="320" height="200" fill="url(#slateSky)" />

      {/* Star Grid */}
      <rect x="25" y="18" width="2" height="2" fill="#FFFFFF" opacity="0.9" />
      <rect x="70" y="42" width="1" height="1" fill="#FFFFFF" opacity="0.8" />
      <rect x="115" y="14" width="2" height="2" fill="#99CCFF" opacity="0.9" />
      <rect x="160" y="35" width="1" height="1" fill="#FFFFFF" opacity="0.7" />
      <rect x="210" y="20" width="2" height="2" fill="#FFFFFF" opacity="0.9" />
      <rect x="265" y="48" width="1" height="1" fill="#FFFFFF" opacity="0.8" />
      <rect x="295" y="15" width="2" height="2" fill="#FFEEAA" opacity="0.9" />
      <rect x="45" y="70" width="1" height="1" fill="#FFFFFF" opacity="0.6" />
      <rect x="140" y="65" width="2" height="2" fill="#FFFFFF" opacity="0.8" />
      <rect x="240" y="75" width="1" height="1" fill="#99CCFF" opacity="0.7" />

      {/* Distant Mountains */}
      <polygon
        points="0,170 40,150 90,165 140,142 190,158 240,138 290,155 320,145 320,200 0,200"
        fill="#141E2C"
      />
      <polygon
        points="0,182 60,168 130,178 180,160 250,172 320,162 320,200 0,200"
        fill="#0E1622"
      />
    </svg>
  )
}

/* ============================================================
   ABSTRACT CYBERSPACE (Sunset Wireframe Grid)
   ============================================================ */
function AbstractWallpaper() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 400 250"
      preserveAspectRatio="none"
      style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated' }}
    >
      <defs>
        <linearGradient id="cyberSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#08020F" />
          <stop offset="50%" stopColor="#1E0836" />
          <stop offset="68%" stopColor="#3D145E" />
          <stop offset="70%" stopColor="#E93B81" />
          <stop offset="100%" stopColor="#0B061A" />
        </linearGradient>
      </defs>

      <rect width="400" height="250" fill="url(#cyberSky)" />

      {/* Synthwave Neon Sun */}
      <circle cx="200" cy="140" r="45" fill="#FFAA00" />
      <rect x="150" y="125" width="100" height="2" fill="#1E0836" />
      <rect x="150" y="132" width="100" height="3" fill="#1E0836" />
      <rect x="150" y="140" width="100" height="4" fill="#1E0836" />
      <rect x="150" y="148" width="100" height="5" fill="#1E0836" />

      {/* Perspective Ground Floor */}
      <rect y="170" width="400" height="80" fill="#0A0414" />

      {/* Perspective Grid Lines */}
      <line x1="200" y1="170" x2="-50" y2="250" stroke="#00FFFF" strokeWidth="1.5" opacity="0.6" />
      <line x1="200" y1="170" x2="20" y2="250" stroke="#00FFFF" strokeWidth="1.5" opacity="0.6" />
      <line x1="200" y1="170" x2="90" y2="250" stroke="#00FFFF" strokeWidth="1.5" opacity="0.6" />
      <line x1="200" y1="170" x2="150" y2="250" stroke="#00FFFF" strokeWidth="1.5" opacity="0.6" />
      <line x1="200" y1="170" x2="200" y2="250" stroke="#00FFFF" strokeWidth="1.5" opacity="0.6" />
      <line x1="200" y1="170" x2="250" y2="250" stroke="#00FFFF" strokeWidth="1.5" opacity="0.6" />
      <line x1="200" y1="170" x2="310" y2="250" stroke="#00FFFF" strokeWidth="1.5" opacity="0.6" />
      <line x1="200" y1="170" x2="380" y2="250" stroke="#00FFFF" strokeWidth="1.5" opacity="0.6" />
      <line x1="200" y1="170" x2="450" y2="250" stroke="#00FFFF" strokeWidth="1.5" opacity="0.6" />

      {/* Horizontal Horizon Grid Lines */}
      <line x1="0" y1="175" x2="400" y2="175" stroke="#FF00AA" strokeWidth="1" opacity="0.5" />
      <line x1="0" y1="183" x2="400" y2="183" stroke="#FF00AA" strokeWidth="1" opacity="0.6" />
      <line x1="0" y1="195" x2="400" y2="195" stroke="#FF00AA" strokeWidth="1.2" opacity="0.7" />
      <line x1="0" y1="212" x2="400" y2="212" stroke="#FF00AA" strokeWidth="1.5" opacity="0.8" />
      <line x1="0" y1="236" x2="400" y2="236" stroke="#FF00AA" strokeWidth="2" opacity="0.9" />
    </svg>
  )
}

/* ============================================================
   PURPLE DUSK
   ============================================================ */
function DuskWallpaper() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 320 200"
      preserveAspectRatio="none"
      style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated' }}
    >
      <defs>
        <linearGradient id="duskGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#181438" />
          <stop offset="40%" stopColor="#3C2462" />
          <stop offset="70%" stopColor="#7A3D78" />
          <stop offset="100%" stopColor="#B86574" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#duskGrad)" />
      <rect x="40" y="110" width="80" height="8" fill="#D48A96" opacity="0.5" />
      <rect x="180" y="125" width="100" height="10" fill="#E8A2AD" opacity="0.6" />
    </svg>
  )
}
