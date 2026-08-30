'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { FsItem } from '@/store/filesystem'
import { getDownloadUrl } from '@/lib/fs-api'

interface MediaPlayerProps {
  initialFile?: FsItem | { id: string; name: string; url?: string }
}

interface Track {
  id: string
  title: string
  artist: string
  url: string
  duration?: string
  isVideo?: boolean
}

const SAMPLE_TRACKS: Track[] = [
  {
    id: 'sample-1',
    title: 'CloudDesk_Startup_Chime.mp3',
    artist: 'System Audio',
    url: 'https://cdn.freesound.org/previews/274/274178_5121236-lq.mp3',
    duration: '0:05',
    isVideo: false,
  },
  {
    id: 'sample-2',
    title: 'Retro_Synth_Groove.mp3',
    artist: 'CloudDesk Soundbank',
    url: 'https://cdn.freesound.org/previews/469/469279_6890478-lq.mp3',
    duration: '0:34',
    isVideo: false,
  },
  {
    id: 'sample-3',
    title: 'Nostalgia_DialUp_Ambience.mp3',
    artist: 'Vintage Modem',
    url: 'https://cdn.freesound.org/previews/16/16475_52554-lq.mp3',
    duration: '0:22',
    isVideo: false,
  },
]

export default function MediaPlayer({ initialFile }: MediaPlayerProps) {
  const [playlist, setPlaylist] = useState<Track[]>(SAMPLE_TRACKS)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)

  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeBlobUrls = useRef<string[]>([])

  // Load initial file if provided
  useEffect(() => {
    if (!initialFile) return
    const loadFile = async () => {
      try {
        let url = 'url' in initialFile && initialFile.url ? initialFile.url : ''
        if (!url && initialFile.id) {
          url = await getDownloadUrl(initialFile.id)
        }
        if (url) {
          // If it's a data URL, convert to Blob URL for clean media element playback
          if (url.startsWith('data:')) {
            const parts = url.split(',')
            const mimeMatch = parts[0].match(/:(.*?);/)
            const mime = mimeMatch ? mimeMatch[1] : 'audio/mpeg'
            const byteString = atob(parts[1])
            const ab = new ArrayBuffer(byteString.length)
            const ia = new Uint8Array(ab)
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i)
            }
            const blob = new Blob([ab], { type: mime })
            const bUrl = URL.createObjectURL(blob)
            activeBlobUrls.current.push(bUrl)
            url = bUrl
          }

          const isVideo = /\.(mp4|webm|mov|mkv)$/i.test(initialFile.name)
          const newTrack: Track = {
            id: initialFile.id || `file-${Date.now()}`,
            title: initialFile.name,
            artist: isVideo ? 'CloudDesk Video' : 'CloudDesk Audio',
            url,
            isVideo,
          }
          setPlaylist((prev) => [newTrack, ...prev.filter((t) => t.title !== newTrack.title)])
          setCurrentTrackIndex(0)
          setIsPlaying(true)
        }
      } catch (err) {
        console.error('Failed to load media file:', err)
      }
    }
    loadFile()

    return () => {
      activeBlobUrls.current.forEach((u) => URL.revokeObjectURL(u))
      activeBlobUrls.current = []
    }
  }, [initialFile])

  const handleOpenLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const bUrl = URL.createObjectURL(file)
    activeBlobUrls.current.push(bUrl)
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name)
    const newTrack: Track = {
      id: `local-${Date.now()}`,
      title: file.name,
      artist: 'Local Media',
      url: bUrl,
      isVideo,
    }
    setPlaylist((prev) => [newTrack, ...prev])
    setCurrentTrackIndex(0)
    setIsPlaying(true)
  }

  const currentTrack = playlist[currentTrackIndex] || playlist[0]

  // Audio / Video element volume control
  useEffect(() => {
    if (!mediaRef.current) return
    mediaRef.current.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  useEffect(() => {
    if (!mediaRef.current) return
    if (isPlaying) {
      mediaRef.current.play().catch(() => setIsPlaying(false))
    } else {
      mediaRef.current.pause()
    }
  }, [isPlaying, currentTrackIndex])

  // Vintage Spectrum Visualizer Canvas Animation
  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    ctx.fillStyle = '#081008'
    ctx.fillRect(0, 0, width, height)

    const numBars = 24
    const barWidth = Math.floor(width / numBars) - 1

    for (let i = 0; i < numBars; i++) {
      let barHeight = 0
      if (isPlaying) {
        const t = Date.now() / 150
        const sinVal = Math.sin(t + i * 0.4)
        const cosVal = Math.cos(t * 0.8 + i * 0.2)
        const rand = (Math.random() - 0.5) * 6
        barHeight = Math.max(3, Math.min(height - 4, (sinVal + cosVal + 2) * 8 + rand))
      } else {
        barHeight = 2
      }

      const x = i * (barWidth + 1)
      const y = height - barHeight

      for (let by = height; by >= y; by -= 3) {
        const segPct = (height - by) / height
        if (segPct > 0.8) {
          ctx.fillStyle = '#FF3333'
        } else if (segPct > 0.5) {
          ctx.fillStyle = '#FFCC00'
        } else {
          ctx.fillStyle = '#00FF66'
        }
        ctx.fillRect(x, by - 2, barWidth, 2)
      }
    }

    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(drawVisualizer)
    }
  }, [isPlaying])

  useEffect(() => {
    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(drawVisualizer)
    } else {
      drawVisualizer()
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isPlaying, drawVisualizer])

  const handlePlayPause = () => setIsPlaying(!isPlaying)
  const handleStop = () => {
    setIsPlaying(false)
    if (mediaRef.current) mediaRef.current.currentTime = 0
    setCurrentTime(0)
  }
  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev > 0 ? prev - 1 : playlist.length - 1))
    setIsPlaying(true)
  }
  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev < playlist.length - 1 ? prev + 1 : 0))
    setIsPlaying(true)
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="player-container os-chrome" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,video/*"
        style={{ display: 'none' }}
        onChange={handleOpenLocalFile}
      />

      {/* Media elements */}
      {currentTrack?.isVideo ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={currentTrack?.url}
          style={{ width: '100%', maxHeight: 180, background: '#000', objectFit: 'contain' }}
          onTimeUpdate={() => {
            if (mediaRef.current) setCurrentTime(mediaRef.current.currentTime)
          }}
          onLoadedMetadata={() => {
            if (mediaRef.current) setDuration(mediaRef.current.duration)
          }}
          onEnded={handleNext}
          playsInline
        />
      ) : (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={currentTrack?.url}
          onTimeUpdate={() => {
            if (mediaRef.current) setCurrentTime(mediaRef.current.currentTime)
          }}
          onLoadedMetadata={() => {
            if (mediaRef.current) setDuration(mediaRef.current.duration)
          }}
          onEnded={handleNext}
        />
      )}

      {/* Retro LCD Display Screen (shown for audio) */}
      {!currentTrack?.isVideo && (
        <div className="player-lcd-screen">
          <div className="player-lcd-top">
            <span>TRACK [{(currentTrackIndex + 1).toString().padStart(2, '0')}]</span>
            <span>{isPlaying ? '▶ PLAYING' : '■ STOPPED'}</span>
            <span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <div className="player-lcd-track" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            ♪ {currentTrack?.title || 'No Media Selected'}
          </div>
          <canvas ref={canvasRef} width={280} height={38} className="player-vis-canvas" />
        </div>
      )}

      {/* Seek Track */}
      <div className="player-seek-bar">
        <span>{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={(e) => {
            const time = Number(e.target.value)
            setCurrentTime(time)
            if (mediaRef.current) mediaRef.current.currentTime = time
          }}
          className="player-slider"
        />
        <span>{formatTime(duration)}</span>
      </div>

      {/* Control Buttons */}
      <div className="player-controls-strip">
        <div className="player-btn-group">
          <button className="player-ctrl-btn" onClick={handlePrev} title="Previous Track">
            |◀◀
          </button>
          <button className="player-ctrl-btn" onClick={handlePlayPause} title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <button className="player-ctrl-btn" onClick={handleStop} title="Stop">
            ■
          </button>
          <button className="player-ctrl-btn" onClick={handleNext} title="Next Track">
            ▶▶|
          </button>
          <button
            className="player-ctrl-btn"
            style={{ width: 'auto', padding: '0 6px', fontSize: 10 }}
            onClick={() => fileInputRef.current?.click()}
            title="Open Audio / Video File"
          >
            📂 Open...
          </button>
        </div>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            className="player-ctrl-btn"
            style={{ width: 24, padding: 0 }}
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value))
              setIsMuted(false)
            }}
            style={{ width: 60 }}
            className="player-slider"
          />
        </div>
      </div>

      {/* Playlist Header & List */}
      <div style={{ padding: '4px 8px 0', fontSize: 10, fontWeight: 'bold', color: '#AAA' }}>
        PLAYLIST ({playlist.length} TRACKS)
      </div>

      <div className="player-playlist-area" style={{ flex: 1, overflowY: 'auto' }}>
        {playlist.map((track, idx) => (
          <div
            key={track.id || idx}
            className={`player-playlist-item ${idx === currentTrackIndex ? 'active' : ''}`}
            onClick={() => {
              setCurrentTrackIndex(idx)
              setIsPlaying(true)
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {idx === currentTrackIndex ? '► ' : '  '}
              {(idx + 1).toString().padStart(2, '0')}. {track.title}
            </span>
            <span style={{ fontFamily: 'monospace', marginLeft: 8 }}>{track.duration || '0:30'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
