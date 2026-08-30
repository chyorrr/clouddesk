'use client'

import React, { useState, useRef, useEffect } from 'react'
import { uploadFile } from '@/lib/fs-api'
import { useNotificationStore } from '@/store/notifications'

type ToolType = 'pencil' | 'brush' | 'eraser' | 'fill' | 'line' | 'rect' | 'ellipse' | 'picker' | 'text'

const PALETTE = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
  '#808040', '#004040', '#0080FF', '#004080', '#8000FF', '#804000', '#FFFFFF', '#C0C0C0',
  '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FFFF80', '#00FF80',
  '#80FFFF', '#7F80FF', '#FF0080', '#FF8040',
]

interface PaintProps {
  onSaveFile?: (filename: string) => void
}

export default function Paint({ onSaveFile }: PaintProps) {
  const [tool, setTool] = useState<ToolType>('pencil')
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [brushSize, setBrushSize] = useState(2)
  const [canvasWidth, setCanvasWidth] = useState(500)
  const [canvasHeight, setCanvasHeight] = useState(360)
  const [statusText, setStatusText] = useState('For Help, click Help Topics on the Help Menu.')
  const [isSaving, setIsSaving] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawing = useRef(false)
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const snapshot = useRef<ImageData | null>(null)
  const history = useRef<ImageData[]>([])
  const historyIndex = useRef<number>(-1)

  const { notify } = useNotificationStore()

  // Initialize canvas background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveHistory()
  }, [])

  const saveHistory = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
    history.current = history.current.slice(0, historyIndex.current + 1)
    history.current.push(data)
    historyIndex.current = history.current.length - 1
  }

  const undo = () => {
    if (historyIndex.current > 0) {
      historyIndex.current--
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (ctx && history.current[historyIndex.current]) {
        ctx.putImageData(history.current[historyIndex.current], 0, 0)
      }
    }
  }

  const redo = () => {
    if (historyIndex.current < history.current.length - 1) {
      historyIndex.current++
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (ctx && history.current[historyIndex.current]) {
        ctx.putImageData(history.current[historyIndex.current], 0, 0)
      }
    }
  }

  // Flood fill algorithm
  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imgData.data

    // Parse target color
    const fillR = parseInt(fillColor.slice(1, 3), 16)
    const fillG = parseInt(fillColor.slice(3, 5), 16)
    const fillB = parseInt(fillColor.slice(5, 7), 16)

    const pixelPos = (startY * canvas.width + startX) * 4
    const startR = data[pixelPos]
    const startG = data[pixelPos + 1]
    const startB = data[pixelPos + 2]

    if (startR === fillR && startG === fillG && startB === fillB) return

    const queue: [number, number][] = [[startX, startY]]

    while (queue.length > 0) {
      const [x, y] = queue.pop()!
      const pos = (y * canvas.width + x) * 4

      if (
        x < 0 ||
        x >= canvas.width ||
        y < 0 ||
        y >= canvas.height ||
        data[pos] !== startR ||
        data[pos + 1] !== startG ||
        data[pos + 2] !== startB
      ) {
        continue
      }

      data[pos] = fillR
      data[pos + 1] = fillG
      data[pos + 2] = fillB
      data[pos + 3] = 255

      queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
    }

    ctx.putImageData(imgData, 0, 0)
    saveHistory()
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor(e.clientX - rect.left)
    const y = Math.floor(e.clientY - rect.top)

    isDrawing.current = true
    startPos.current = { x, y }
    snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height)

    const drawColor = e.button === 2 ? bgColor : fgColor

    if (tool === 'picker') {
      const p = ctx.getImageData(x, y, 1, 1).data
      const hex = `#${((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1)}`
      if (e.button === 2) setBgColor(hex)
      else setFgColor(hex)
      isDrawing.current = false
      return
    }

    if (tool === 'fill') {
      floodFill(x, y, drawColor)
      isDrawing.current = false
      return
    }

    if (tool === 'text') {
      const text = prompt('Enter text to stamp on drawing:', 'CloudDesk')
      if (text) {
        ctx.font = '14px Tahoma, sans-serif'
        ctx.fillStyle = drawColor
        ctx.fillText(text, x, y)
        saveHistory()
      }
      isDrawing.current = false
      return
    }

    ctx.fillStyle = drawColor
    ctx.strokeStyle = drawColor
    ctx.lineWidth = tool === 'eraser' ? brushSize * 4 : brushSize
    ctx.lineCap = 'square'

    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      ctx.beginPath()
      ctx.moveTo(x, y)
      if (tool === 'eraser') {
        ctx.strokeStyle = bgColor
      }
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor(e.clientX - rect.left)
    const y = Math.floor(e.clientY - rect.top)

    setStatusText(`${x}, ${y}px`)

    if (!isDrawing.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx || !snapshot.current) return

    const drawColor = e.buttons === 2 ? bgColor : fgColor

    if (tool === 'pencil' || tool === 'brush') {
      ctx.strokeStyle = drawColor
      ctx.lineWidth = tool === 'brush' ? brushSize * 2 : 1
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (tool === 'eraser') {
      ctx.strokeStyle = bgColor
      ctx.lineWidth = brushSize * 4
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (tool === 'line') {
      ctx.putImageData(snapshot.current, 0, 0)
      ctx.strokeStyle = drawColor
      ctx.lineWidth = brushSize
      ctx.beginPath()
      ctx.moveTo(startPos.current.x, startPos.current.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (tool === 'rect') {
      ctx.putImageData(snapshot.current, 0, 0)
      ctx.strokeStyle = drawColor
      ctx.lineWidth = brushSize
      ctx.strokeRect(
        startPos.current.x,
        startPos.current.y,
        x - startPos.current.x,
        y - startPos.current.y
      )
    } else if (tool === 'ellipse') {
      ctx.putImageData(snapshot.current, 0, 0)
      ctx.strokeStyle = drawColor
      ctx.lineWidth = brushSize
      const rx = Math.abs(x - startPos.current.x) / 2
      const ry = Math.abs(y - startPos.current.y) / 2
      const cx = Math.min(startPos.current.x, x) + rx
      const cy = Math.min(startPos.current.y, y) + ry
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  const handleMouseUp = () => {
    if (isDrawing.current) {
      isDrawing.current = false
      saveHistory()
    }
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveHistory()
  }

  const handleSaveCloud = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setIsSaving(true)

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsSaving(false)
        return
      }

      try {
        const filename = `Drawing_${new Date().toISOString().slice(0, 10)}_${Math.floor(Math.random() * 1000)}.png`
        const file = new File([blob], filename, { type: 'image/png' })
        await uploadFile(file, null)
        notify({
          title: 'Paint Document Saved',
          message: `${filename} successfully saved to CloudDesk.`,
          type: 'success',
        })
        if (onSaveFile) onSaveFile(filename)
      } catch (err) {
        console.error(err)
        notify({
          title: 'Save Failed',
          message: 'Could not write image to cloud filesystem.',
          type: 'error',
        })
      } finally {
        setIsSaving(false)
      }
    }, 'image/png')
  }

  return (
    <div className="paint-layout os-chrome">
      {/* Menubar */}
      <div className="window-menubar">
        <div className="window-menubar-item" onClick={handleSaveCloud}>
          {isSaving ? 'Saving...' : '💾 Save to Cloud'}
        </div>
        <div className="window-menubar-item" onClick={handleClear}>
          New / Clear
        </div>
        <div className="window-menubar-item" onClick={undo}>
          Undo (Ctrl+Z)
        </div>
        <div className="window-menubar-item" onClick={redo}>
          Redo
        </div>
      </div>

      <div className="paint-workspace">
        {/* Left Toolbar */}
        <div className="paint-toolbox">
          <button
            className={`paint-tool-btn ${tool === 'pencil' ? 'active' : ''}`}
            onClick={() => setTool('pencil')}
            title="Pencil"
          >
            ✏️
          </button>
          <button
            className={`paint-tool-btn ${tool === 'brush' ? 'active' : ''}`}
            onClick={() => setTool('brush')}
            title="Brush"
          >
            🖌️
          </button>
          <button
            className={`paint-tool-btn ${tool === 'eraser' ? 'active' : ''}`}
            onClick={() => setTool('eraser')}
            title="Eraser"
          >
            🧼
          </button>
          <button
            className={`paint-tool-btn ${tool === 'fill' ? 'active' : ''}`}
            onClick={() => setTool('fill')}
            title="Fill With Color"
          >
            🪣
          </button>
          <button
            className={`paint-tool-btn ${tool === 'line' ? 'active' : ''}`}
            onClick={() => setTool('line')}
            title="Line"
          >
            ╱
          </button>
          <button
            className={`paint-tool-btn ${tool === 'rect' ? 'active' : ''}`}
            onClick={() => setTool('rect')}
            title="Rectangle"
          >
            ▭
          </button>
          <button
            className={`paint-tool-btn ${tool === 'ellipse' ? 'active' : ''}`}
            onClick={() => setTool('ellipse')}
            title="Ellipse"
          >
            ○
          </button>
          <button
            className={`paint-tool-btn ${tool === 'picker' ? 'active' : ''}`}
            onClick={() => setTool('picker')}
            title="Pick Color"
          >
            💧
          </button>
          <button
            className={`paint-tool-btn ${tool === 'text' ? 'active' : ''}`}
            onClick={() => setTool('text')}
            title="Text Stamp"
          >
            A
          </button>
        </div>

        {/* Canvas Area */}
        <div className="paint-canvas-frame">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="paint-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      </div>

      {/* Bottom Color Palette */}
      <div className="paint-palette-dock">
        {/* Active FG/BG Box */}
        <div className="paint-active-colors" title="Left-click: FG, Right-click: BG">
          <div className="paint-fg-color-box" style={{ background: fgColor }} />
          <div className="paint-bg-color-box" style={{ background: bgColor }} />
        </div>

        {/* Color Grid Swatches */}
        <div className="paint-color-grid">
          {PALETTE.map((color, i) => (
            <div
              key={i}
              className="paint-swatch"
              style={{ background: color }}
              onClick={() => setFgColor(color)}
              onContextMenu={(e) => {
                e.preventDefault()
                setBgColor(color)
              }}
              title={`${color} (Left: FG / Right: BG)`}
            />
          ))}
        </div>

        {/* Line Thickness */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', fontSize: 10 }}>
          <span>Size:</span>
          {[1, 2, 4, 8].map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${brushSize === s ? 'pressed' : ''}`}
              style={{ minWidth: 20, padding: 0 }}
              onClick={() => setBrushSize(s)}
            >
              {s}px
            </button>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="window-statusbar">
        <div className="window-statusbar-section" style={{ flex: 1 }}>
          {statusText}
        </div>
        <div className="window-statusbar-section">
          {canvasWidth} × {canvasHeight}px
        </div>
      </div>
    </div>
  )
}
