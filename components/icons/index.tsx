'use client'

import React from 'react'

// CloudDesk Original Icon System
// Authentic bitmap / pixel-crafted SVG icons inspired by classic OS interfaces

export interface IconProps {
  size?: number
  className?: string
  style?: React.CSSProperties
}

export function FolderIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      {/* Folder Tab */}
      <polygon points="3,6 13,6 16,9 29,9 29,26 3,26" fill="#C49010" />
      <polygon points="4,7 12,7 15,10 28,10 28,25 4,25" fill="#D4A017" />
      {/* Folder Body Front */}
      <polygon points="2,11 30,11 28,27 2,27" fill="#F5C842" />
      {/* Bevel highlights */}
      <line x1="2" y1="11" x2="30" y2="11" stroke="#FFF0A0" strokeWidth="1" />
      <line x1="2" y1="11" x2="2" y2="27" stroke="#FFF0A0" strokeWidth="1" />
      <line x1="30" y1="11" x2="28" y2="27" stroke="#8B6010" strokeWidth="1" />
      <line x1="2" y1="27" x2="28" y2="27" stroke="#604008" strokeWidth="1" />
      {/* Interior shadow */}
      <line x1="5" y1="12" x2="27" y2="12" stroke="#E0A818" strokeWidth="1" />
    </svg>
  )
}

export function FolderSmallIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={style} fill="none">
      <polygon points="1,3 6,3 8,5 15,5 15,14 1,14" fill="#C49010" />
      <polygon points="1,6 15,6 14,14 1,14" fill="#F5C842" />
      <line x1="1" y1="6" x2="15" y2="6" stroke="#FFF0A0" strokeWidth="1" />
      <line x1="1" y1="14" x2="14" y2="14" stroke="#604008" strokeWidth="1" />
    </svg>
  )
}

export function FileIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      {/* White document body */}
      <polygon points="5,2 21,2 27,8 27,29 5,29" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
      {/* Dog-ear corner */}
      <polygon points="21,2 21,8 27,8" fill="#C0C0C0" stroke="#000000" strokeWidth="1" />
      {/* Content lines */}
      <line x1="8" y1="11" x2="22" y2="11" stroke="#808080" strokeWidth="1" strokeDasharray="3 1" />
      <line x1="8" y1="14" x2="24" y2="14" stroke="#808080" strokeWidth="1" strokeDasharray="2 1" />
      <line x1="8" y1="17" x2="20" y2="17" stroke="#808080" strokeWidth="1" strokeDasharray="3 1" />
      <line x1="8" y1="20" x2="23" y2="20" stroke="#808080" strokeWidth="1" strokeDasharray="2 1" />
      <line x1="8" y1="23" x2="16" y2="23" stroke="#808080" strokeWidth="1" strokeDasharray="1 1" />
    </svg>
  )
}

export function TextFileIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      <polygon points="5,2 21,2 27,8 27,29 5,29" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
      <polygon points="21,2 21,8 27,8" fill="#C0C0C0" stroke="#000000" strokeWidth="1" />
      {/* Blue header bar */}
      <rect x="8" y="10" width="10" height="2" fill="#000080" />
      {/* Text lines */}
      <rect x="8" y="14" width="15" height="1" fill="#404040" />
      <rect x="8" y="17" width="13" height="1" fill="#404040" />
      <rect x="8" y="20" width="16" height="1" fill="#404040" />
      <rect x="8" y="23" width="11" height="1" fill="#404040" />
      {/* Pencil accent in corner */}
      <polygon points="20,26 26,20 28,22 22,28" fill="#FFCC00" stroke="#000" strokeWidth="0.5" />
      <polygon points="19,27 20,26 22,28" fill="#000" />
    </svg>
  )
}

export function ImageFileIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      <rect x="3" y="3" width="26" height="26" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
      <rect x="5" y="5" width="22" height="22" fill="#000000" />
      {/* Sky */}
      <rect x="6" y="6" width="20" height="11" fill="#1084D0" />
      {/* Sun */}
      <rect x="8" y="8" width="4" height="4" fill="#FFFF00" />
      {/* Hills with retro dither look */}
      <polygon points="6,17 14,11 20,16 26,12 26,20 6,20" fill="#008000" />
      <polygon points="10,18 16,13 22,17 26,14 26,20 6,20" fill="#00AA00" />
      {/* Frame border */}
      <rect x="4" y="4" width="24" height="24" stroke="#DFDFDF" strokeWidth="1" />
    </svg>
  )
}

export function PDFIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      <polygon points="5,2 21,2 27,8 27,29 5,29" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
      <polygon points="21,2 21,8 27,8" fill="#E0E0E0" stroke="#000000" strokeWidth="1" />
      {/* Red PDF banner */}
      <rect x="4" y="11" width="24" height="10" fill="#CC0000" />
      <rect x="4" y="11" width="24" height="1" fill="#FF6666" />
      <rect x="4" y="20" width="24" height="1" fill="#880000" />
      <text x="7" y="19" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="monospace">PDF</text>
      {/* Page preview lines */}
      <line x1="8" y1="24" x2="24" y2="24" stroke="#808080" strokeWidth="1" />
      <line x1="8" y1="26" x2="18" y2="26" stroke="#808080" strokeWidth="1" />
    </svg>
  )
}

export function AudioFileIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      {/* Cassette / Audio document */}
      <polygon points="5,2 21,2 27,8 27,29 5,29" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
      <polygon points="21,2 21,8 27,8" fill="#C0C0C0" stroke="#000000" strokeWidth="1" />
      {/* Musical note */}
      <circle cx="12" cy="22" r="3" fill="#000080" />
      <circle cx="21" cy="19" r="3" fill="#000080" />
      <rect x="14" y="11" width="2" height="11" fill="#000080" />
      <rect x="23" y="8" width="2" height="11" fill="#000080" />
      <polygon points="14,11 25,8 25,11 14,14" fill="#000080" />
    </svg>
  )
}

export function VideoFileIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      {/* Film strip */}
      <rect x="4" y="4" width="24" height="24" fill="#202020" stroke="#000000" strokeWidth="1" />
      {/* Perforations */}
      <rect x="6" y="6" width="3" height="3" fill="#FFFFFF" />
      <rect x="6" y="11" width="3" height="3" fill="#FFFFFF" />
      <rect x="6" y="17" width="3" height="3" fill="#FFFFFF" />
      <rect x="6" y="23" width="3" height="3" fill="#FFFFFF" />
      <rect x="23" y="6" width="3" height="3" fill="#FFFFFF" />
      <rect x="23" y="11" width="3" height="3" fill="#FFFFFF" />
      <rect x="23" y="17" width="3" height="3" fill="#FFFFFF" />
      <rect x="23" y="23" width="3" height="3" fill="#FFFFFF" />
      {/* Film frame */}
      <rect x="11" y="7" width="10" height="18" fill="#1084D0" />
      <polygon points="14,12 14,20 19,16" fill="#FFFFFF" />
    </svg>
  )
}

export function MyComputerIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      {/* CRT Monitor */}
      <rect x="3" y="2" width="26" height="20" rx="1" fill="#D4D0C8" stroke="#000000" strokeWidth="1" />
      {/* Screen Bevel */}
      <rect x="5" y="4" width="22" height="15" fill="#808080" />
      <rect x="6" y="5" width="20" height="13" fill="#000080" />
      {/* Desktop on screen */}
      <rect x="7" y="6" width="4" height="3" fill="#008080" />
      <rect x="7" y="10" width="4" height="3" fill="#008080" />
      <line x1="6" y1="17" x2="26" y2="17" stroke="#C0C0C0" strokeWidth="1" />
      {/* Power LED */}
      <rect x="24" y="19.5" width="2" height="1.5" fill="#00FF00" />
      {/* Stand Neck */}
      <rect x="13" y="22" width="6" height="3" fill="#A0A0A0" stroke="#000000" strokeWidth="1" />
      {/* Base */}
      <polygon points="8,25 24,25 26,29 6,29" fill="#D4D0C8" stroke="#000000" strokeWidth="1" />
      <line x1="7" y1="26" x2="25" y2="26" stroke="#FFFFFF" strokeWidth="1" />
    </svg>
  )
}

export function HardDriveIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      {/* 3.5 Drive Unit */}
      <rect x="3" y="8" width="26" height="16" rx="1" fill="#C0C0C0" stroke="#000" strokeWidth="1" />
      <line x1="4" y1="9" x2="28" y2="9" stroke="#FFF" strokeWidth="1" />
      <line x1="4" y1="23" x2="28" y2="23" stroke="#808080" strokeWidth="1" />
      {/* Drive slot */}
      <rect x="6" y="12" width="20" height="3" fill="#404040" stroke="#000" strokeWidth="0.5" />
      {/* Activity LED */}
      <rect x="7" y="18" width="3" height="2" fill="#00FF00" />
      <rect x="12" y="18" width="10" height="2" fill="#808080" />
      {/* C:\ Label text */}
      <text x="8" y="7" fill="#000080" fontSize="6" fontWeight="bold" fontFamily="monospace">C:\</text>
    </svg>
  )
}

export function RecycleBinIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      {/* Bin rim */}
      <rect x="6" y="6" width="20" height="3" rx="1" fill="#A0A0A0" stroke="#000000" strokeWidth="1" />
      {/* Bin body */}
      <polygon points="8,9 24,9 22,29 10,29" fill="#C0C0C0" stroke="#000000" strokeWidth="1" />
      {/* Wastebasket slats / mesh */}
      <line x1="12" y1="10" x2="13" y2="28" stroke="#808080" strokeWidth="1" />
      <line x1="16" y1="10" x2="16" y2="28" stroke="#808080" strokeWidth="1" />
      <line x1="20" y1="10" x2="19" y2="28" stroke="#808080" strokeWidth="1" />
      {/* Recycle arrows */}
      <path d="M13 16 L16 13 L19 16" stroke="#008000" strokeWidth="1.5" fill="none" />
      <path d="M19 18 L16 21 L13 18" stroke="#008000" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function NotepadIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      {/* Blue cover */}
      <rect x="4" y="3" width="22" height="26" fill="#000080" stroke="#000" strokeWidth="1" />
      {/* Spiral binding rings */}
      <rect x="2" y="6" width="5" height="2" fill="#E0E0E0" stroke="#000" strokeWidth="0.5" />
      <rect x="2" y="11" width="5" height="2" fill="#E0E0E0" stroke="#000" strokeWidth="0.5" />
      <rect x="2" y="16" width="5" height="2" fill="#E0E0E0" stroke="#000" strokeWidth="0.5" />
      <rect x="2" y="21" width="5" height="2" fill="#E0E0E0" stroke="#000" strokeWidth="0.5" />
      {/* White pad */}
      <rect x="7" y="5" width="17" height="22" fill="#FFFFF0" />
      {/* Notepad ruled lines */}
      <line x1="9" y1="9" x2="22" y2="9" stroke="#A0C0E0" strokeWidth="1" />
      <line x1="9" y1="13" x2="22" y2="13" stroke="#A0C0E0" strokeWidth="1" />
      <line x1="9" y1="17" x2="22" y2="17" stroke="#A0C0E0" strokeWidth="1" />
      <line x1="9" y1="21" x2="22" y2="21" stroke="#A0C0E0" strokeWidth="1" />
      {/* Pencil across pad */}
      <polygon points="16,28 28,14 30,16 18,30" fill="#FFCC00" stroke="#000" strokeWidth="0.5" />
      <polygon points="14,30 16,28 18,30" fill="#E0B080" stroke="#000" strokeWidth="0.5" />
      <polygon points="13,31 14,30 15,31" fill="#000" />
    </svg>
  )
}

export function PaintIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      {/* Wooden Palette */}
      <path
        d="M 6,18 C 4,12 8,5 16,5 C 24,5 28,10 27,17 C 26,23 20,27 15,27 C 13,27 11,25 12,23 C 13,21 11,19 9,20 C 7,21 6,20 6,18 Z"
        fill="#D2A679"
        stroke="#593E1A"
        strokeWidth="1.5"
      />
      {/* Thumb Hole */}
      <ellipse cx="14" cy="22" rx="2" ry="1.5" fill="#808080" stroke="#593E1A" strokeWidth="1" />
      {/* Color Blobs */}
      <circle cx="10" cy="11" r="2" fill="#FF0000" />
      <circle cx="16" cy="9" r="2" fill="#FFFF00" />
      <circle cx="22" cy="11" r="2" fill="#008000" />
      <circle cx="23" cy="17" r="2" fill="#0000FF" />
      {/* Brush dipping */}
      <polygon points="18,29 27,15 29,16 20,30" fill="#996633" stroke="#000" strokeWidth="0.5" />
      <polygon points="16,31 18,29 20,30" fill="#D0D0D0" stroke="#000" strokeWidth="0.5" />
      <polygon points="14,32 16,31 17,32" fill="#FF0000" />
    </svg>
  )
}

export function MediaPlayerIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      {/* Compact metallic body */}
      <rect x="3" y="4" width="26" height="24" rx="2" fill="#3A3A3A" stroke="#000000" strokeWidth="1" />
      <rect x="4" y="5" width="24" height="1" fill="#707070" />
      {/* LCD display screen */}
      <rect x="6" y="8" width="20" height="9" fill="#0A1A0A" stroke="#202020" strokeWidth="1" />
      <rect x="7" y="10" width="18" height="5" fill="#183818" />
      <text x="8" y="14" fill="#00FF66" fontSize="4.5" fontFamily="monospace" fontWeight="bold">01 02:45</text>
      {/* Spectrum meter dots */}
      <rect x="18" y="11" width="1" height="3" fill="#00FF66" />
      <rect x="20" y="12" width="1" height="2" fill="#00FF66" />
      <rect x="22" y="10" width="1" height="4" fill="#FFCC00" />
      {/* Play/Control buttons */}
      <circle cx="9" cy="22" r="2.5" fill="#505050" stroke="#000" strokeWidth="0.5" />
      <polygon points="8,20.5 8,23.5 10.5,22" fill="#00FF00" />
      <circle cx="16" cy="22" r="2.5" fill="#505050" stroke="#000" strokeWidth="0.5" />
      <rect x="14.5" y="20.5" width="3" height="3" fill="#FFCC00" />
      <circle cx="23" cy="22" r="2.5" fill="#505050" stroke="#000" strokeWidth="0.5" />
      <rect x="22" y="21" width="2" height="2" fill="#FF3333" />
    </svg>
  )
}

export function CalculatorIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      {/* Calculator Body */}
      <rect x="5" y="2" width="22" height="28" rx="2" fill="#D4D0C8" stroke="#000000" strokeWidth="1" />
      <rect x="6" y="3" width="20" height="1" fill="#FFFFFF" />
      {/* LCD Screen */}
      <rect x="7" y="5" width="18" height="6" fill="#A4B4A4" stroke="#404040" strokeWidth="1" />
      <text x="21" y="10" fill="#000000" fontSize="5" fontFamily="monospace" textAnchor="end">1337.</text>
      {/* Keypad Grid (vintage buttons) */}
      <rect x="7" y="13" width="3.5" height="3" fill="#E0E0E0" stroke="#404040" strokeWidth="0.5" />
      <rect x="11.5" y="13" width="3.5" height="3" fill="#E0E0E0" stroke="#404040" strokeWidth="0.5" />
      <rect x="16" y="13" width="3.5" height="3" fill="#E0E0E0" stroke="#404040" strokeWidth="0.5" />
      <rect x="20.5" y="13" width="4.5" height="3" fill="#C04040" stroke="#404040" strokeWidth="0.5" />

      <rect x="7" y="17" width="3.5" height="3" fill="#FFFFFF" stroke="#404040" strokeWidth="0.5" />
      <rect x="11.5" y="17" width="3.5" height="3" fill="#FFFFFF" stroke="#404040" strokeWidth="0.5" />
      <rect x="16" y="17" width="3.5" height="3" fill="#FFFFFF" stroke="#404040" strokeWidth="0.5" />
      <rect x="20.5" y="17" width="4.5" height="3" fill="#8080C0" stroke="#404040" strokeWidth="0.5" />

      <rect x="7" y="21" width="3.5" height="3" fill="#FFFFFF" stroke="#404040" strokeWidth="0.5" />
      <rect x="11.5" y="21" width="3.5" height="3" fill="#FFFFFF" stroke="#404040" strokeWidth="0.5" />
      <rect x="16" y="21" width="3.5" height="3" fill="#FFFFFF" stroke="#404040" strokeWidth="0.5" />
      <rect x="20.5" y="21" width="4.5" height="3" fill="#8080C0" stroke="#404040" strokeWidth="0.5" />

      <rect x="7" y="25" width="8" height="3" fill="#FFFFFF" stroke="#404040" strokeWidth="0.5" />
      <rect x="16" y="25" width="3.5" height="3" fill="#FFFFFF" stroke="#404040" strokeWidth="0.5" />
      <rect x="20.5" y="25" width="4.5" height="3" fill="#408040" stroke="#404040" strokeWidth="0.5" />
    </svg>
  )
}

export function BrowserIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      {/* Globe */}
      <circle cx="16" cy="16" r="12" fill="#1084D0" stroke="#000000" strokeWidth="1" />
      {/* Latitudes & Longitudes */}
      <ellipse cx="16" cy="16" rx="6" ry="12" fill="none" stroke="#FFFFFF" strokeWidth="1" />
      <line x1="4" y1="16" x2="28" y2="16" stroke="#FFFFFF" strokeWidth="1" />
      <line x1="6" y1="10" x2="26" y2="10" stroke="#FFFFFF" strokeWidth="0.8" />
      <line x1="6" y1="22" x2="26" y2="22" stroke="#FFFFFF" strokeWidth="0.8" />
      {/* Continents pixel hint */}
      <polygon points="11,8 14,9 13,13 9,12" fill="#00AA00" opacity="0.8" />
      <polygon points="17,11 22,12 21,17 17,15" fill="#00AA00" opacity="0.8" />
      <polygon points="12,18 16,19 14,24 11,22" fill="#00AA00" opacity="0.8" />
      {/* Golden orbit ring */}
      <path d="M 4,24 C 8,28 24,28 28,8" stroke="#FFCC00" strokeWidth="2" fill="none" />
      <polygon points="28,8 24,10 27,13" fill="#FFCC00" />
    </svg>
  )
}

export function EmailIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      {/* Envelope Back */}
      <rect x="3" y="7" width="26" height="18" fill="#FFF8DC" stroke="#000000" strokeWidth="1" />
      {/* Letter inside */}
      <rect x="6" y="4" width="20" height="12" fill="#FFFFFF" stroke="#000080" strokeWidth="0.5" />
      <line x1="8" y1="7" x2="18" y2="7" stroke="#808080" strokeWidth="1" />
      <line x1="8" y1="10" x2="22" y2="10" stroke="#808080" strokeWidth="1" />
      <line x1="8" y1="13" x2="16" y2="13" stroke="#808080" strokeWidth="1" />
      {/* Envelope Flaps */}
      <polygon points="3,7 16,17 29,7" fill="#F5DEB3" stroke="#000000" strokeWidth="1" opacity="0.9" />
      <line x1="3" y1="25" x2="12" y2="15" stroke="#D2B48C" strokeWidth="1" />
      <line x1="29" y1="25" x2="20" y2="15" stroke="#D2B48C" strokeWidth="1" />
      {/* Stamp */}
      <rect x="22" y="9" width="4" height="5" fill="#CC0000" stroke="#880000" strokeWidth="0.5" />
    </svg>
  )
}

export function HelpIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      {/* Blue Book */}
      <polygon points="5,5 23,3 27,6 9,8" fill="#1084D0" stroke="#000" strokeWidth="1" />
      <polygon points="5,5 9,8 9,28 5,25" fill="#004080" stroke="#000" strokeWidth="1" />
      <polygon points="9,8 27,6 27,26 9,28" fill="#1084D0" stroke="#000" strokeWidth="1" />
      {/* Pages edge */}
      <polygon points="27,6 29,8 29,28 27,26" fill="#FFFFF0" stroke="#000" strokeWidth="0.5" />
      <polygon points="9,28 27,26 29,28 11,30" fill="#E8E8D0" stroke="#000" strokeWidth="0.5" />
      {/* Yellow Question Mark */}
      <text x="18" y="21" fill="#FFFF00" fontSize="13" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">?</text>
    </svg>
  )
}

export function SystemInfoIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      {/* Computer */}
      <rect x="4" y="4" width="24" height="18" rx="1" fill="#D4D0C8" stroke="#000" strokeWidth="1" />
      <rect x="6" y="6" width="20" height="12" fill="#000080" />
      {/* Gear / Properties overlay */}
      <circle cx="22" cy="22" r="6" fill="#C0C0C0" stroke="#000" strokeWidth="1" />
      <circle cx="22" cy="22" r="2.5" fill="#404040" />
      {/* Gear teeth */}
      <rect x="21" y="14.5" width="2" height="3" fill="#000" />
      <rect x="21" y="26.5" width="2" height="3" fill="#000" />
      <rect x="14.5" y="21" width="3" height="2" fill="#000" />
      <rect x="26.5" y="21" width="3" height="2" fill="#000" />
    </svg>
  )
}

export function SearchIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      {/* Magnifying Glass */}
      <circle cx="14" cy="14" r="8" fill="#87CEEB" stroke="#000000" strokeWidth="1.5" />
      <circle cx="14" cy="14" r="6" fill="#B0E0E6" />
      <ellipse cx="12" cy="11" rx="2" ry="1" fill="#FFFFFF" opacity="0.8" />
      {/* Handle */}
      <polygon points="20,20 28,28 26,30 18,22" fill="#8B4513" stroke="#000000" strokeWidth="1" />
    </svg>
  )
}

export function StorageIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      {/* Server / Cloud Storage Tower */}
      <rect x="6" y="3" width="20" height="26" rx="1" fill="#D4D0C8" stroke="#000000" strokeWidth="1" />
      <rect x="9" y="6" width="14" height="4" fill="#404040" stroke="#000" strokeWidth="0.5" />
      <rect x="19" y="8" width="2" height="1" fill="#00FF00" />
      <rect x="9" y="13" width="14" height="4" fill="#404040" stroke="#000" strokeWidth="0.5" />
      <rect x="19" y="15" width="2" height="1" fill="#00FF00" />
      <rect x="9" y="20" width="14" height="4" fill="#404040" stroke="#000" strokeWidth="0.5" />
      <rect x="19" y="22" width="2" height="1" fill="#FFCC00" />
    </svg>
  )
}

export function SettingsIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      {/* Control Panel: Hammer & Screwdriver / Gears */}
      <rect x="4" y="4" width="24" height="24" rx="2" fill="#D4D0C8" stroke="#000" strokeWidth="1" />
      <rect x="5" y="5" width="22" height="1" fill="#FFF" />
      {/* Sliders and knobs */}
      <line x1="8" y1="10" x2="24" y2="10" stroke="#808080" strokeWidth="2" />
      <rect x="12" y="8" width="4" height="5" fill="#000080" stroke="#FFF" strokeWidth="0.5" />
      <line x1="8" y1="16" x2="24" y2="16" stroke="#808080" strokeWidth="2" />
      <rect x="18" y="14" width="4" height="5" fill="#000080" stroke="#FFF" strokeWidth="0.5" />
      <line x1="8" y1="22" x2="24" y2="22" stroke="#808080" strokeWidth="2" />
      <rect x="10" y="20" width="4" height="5" fill="#000080" stroke="#FFF" strokeWidth="0.5" />
    </svg>
  )
}

export function ImageViewerIcon({ size = 32, className, style }: IconProps) {
  return <ImageFileIcon size={size} className={className} style={style} />
}

export function FilePropertiesIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      <polygon points="4,2 18,2 24,8 24,28 4,28" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
      <polygon points="18,2 18,8 24,8" fill="#C0C0C0" stroke="#000000" strokeWidth="1" />
      <circle cx="21" cy="21" r="6" fill="#87CEEB" stroke="#000000" strokeWidth="1" />
      <line x1="25" y1="25" x2="29" y2="29" stroke="#8B4513" strokeWidth="2" />
    </svg>
  )
}

export function ShareIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={style} fill="none">
      <circle cx="12" cy="4" r="2.5" fill="#1084D0" stroke="#000" strokeWidth="0.5" />
      <circle cx="4" cy="8" r="2.5" fill="#1084D0" stroke="#000" strokeWidth="0.5" />
      <circle cx="12" cy="12" r="2.5" fill="#1084D0" stroke="#000" strokeWidth="0.5" />
      <line x1="4" y1="8" x2="12" y2="4" stroke="#000" strokeWidth="1" />
      <line x1="4" y1="8" x2="12" y2="12" stroke="#000" strokeWidth="1" />
    </svg>
  )
}

export function CheckIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={style} fill="none">
      <polygon points="2,8 6,12 14,3 12,2 6,9 4,7" fill="#008000" stroke="#004000" strokeWidth="0.5" />
    </svg>
  )
}

export function WarningIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      <polygon points="16,3 30,27 2,27" fill="#FFCC00" stroke="#000000" strokeWidth="1.5" />
      <polygon points="16,7 27,25 5,25" fill="#FFD700" />
      <text x="16" y="23" fill="#000000" fontSize="14" fontWeight="bold" fontFamily="monospace" textAnchor="middle">!</text>
    </svg>
  )
}

export function ErrorIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      <circle cx="16" cy="16" r="13" fill="#CC0000" stroke="#000000" strokeWidth="1.5" />
      <line x1="10" y1="10" x2="22" y2="22" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="square" />
      <line x1="22" y1="10" x2="10" y2="22" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="square" />
    </svg>
  )
}

export function InfoIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      <circle cx="16" cy="16" r="13" fill="#1084D0" stroke="#000000" strokeWidth="1.5" />
      <circle cx="16" cy="10" r="2" fill="#FFFFFF" />
      <rect x="14" y="14" width="4" height="9" fill="#FFFFFF" />
    </svg>
  )
}

export function TerminalIcon({ size = 32, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style} fill="none">
      <rect x="2" y="4" width="28" height="24" rx="1" fill="#000000" stroke="#808080" strokeWidth="1" />
      <rect x="3" y="5" width="26" height="4" fill="#000080" />
      <rect x="25" y="6" width="3" height="2" fill="#C0C0C0" />
      <text x="5" y="8" fill="#FFFFFF" fontSize="3" fontFamily="monospace">MS-DOS</text>
      <text x="5" y="15" fill="#00FF00" fontSize="5" fontFamily="monospace" fontWeight="bold">C:\&gt;_</text>
      <rect x="5" y="18" width="14" height="1" fill="#00FF00" opacity="0.6" />
      <rect x="5" y="21" width="10" height="1" fill="#00FF00" opacity="0.4" />
    </svg>
  )
}
