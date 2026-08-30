'use client'

// Authentic Vintage Web Audio Synthesizer
// Generates nostalgic 80s/90s PC chimes, clicks, beeps, and dialog sounds without external assets

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export function playClickSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.03)

    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.03)
  } catch {}
}

export function playOpenWindowSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.linearRampToValueAtTime(640, now + 0.08)

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(now + 0.09)
  } catch {}
}

export function playCloseWindowSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(560, now)
    osc.frequency.linearRampToValueAtTime(240, now + 0.07)

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(now + 0.08)
  } catch {}
}

export function playStartupChime() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const chords = [
      { freq: 261.63, delay: 0.0, dur: 0.8 },  // C4
      { freq: 329.63, delay: 0.12, dur: 0.8 }, // E4
      { freq: 392.00, delay: 0.24, dur: 1.0 }, // G4
      { freq: 523.25, delay: 0.38, dur: 1.4 }, // C5
    ]

    chords.forEach(({ freq, delay, dur }) => {
      const now = ctx.currentTime + delay
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)

      gain.gain.setValueAtTime(0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + dur)
    })
  } catch {}
}

export function playErrorSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(150, now)
    osc.frequency.setValueAtTime(120, now + 0.08)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(now + 0.16)
  } catch {}
}
