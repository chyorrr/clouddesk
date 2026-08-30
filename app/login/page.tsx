'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const SUPABASE_CONFIGURED =
  typeof process !== 'undefined' &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'

// Boot screen → login flow
const BOOT_BLOCKS = 20

export default function LoginPage() {
  const [phase, setPhase] = useState<'boot' | 'login'>('boot')
  const [bootProgress, setBootProgress] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()
  const emailRef = useRef<HTMLInputElement>(null)

  // Subtle boot sequence
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setBootProgress(i)
      if (i >= BOOT_BLOCKS) {
        clearInterval(interval)
        setTimeout(() => setPhase('login'), 200)
      }
    }, 40)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (phase === 'login') {
      setTimeout(() => emailRef.current?.focus(), 100)
    }
  }, [phase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/desktop')
    }
  }

  if (phase === 'boot') {
    return (
      <div
        className="boot-screen"
        aria-label="CloudDesk loading"
        aria-busy="true"
        role="status"
      >
        <div className="boot-logo">
          Cloud<span>Desk</span>
        </div>
        <div className="boot-loading-text">LOADING PERSONAL COMPUTER...</div>
        <div className="boot-bar-track" role="progressbar" aria-valuenow={bootProgress} aria-valuemax={BOOT_BLOCKS}>
          {Array.from({ length: bootProgress }).map((_, i) => (
            <div key={i} className="boot-bar-block" style={{ animationDelay: `${i * 0.02}s` }} />
          ))}
        </div>
      </div>
    )
  }

  if (!SUPABASE_CONFIGURED) {
    return (
      <div className="auth-desktop" role="main">
        <div className="auth-window" style={{ width: 400 }}>
          <div className="window-titlebar os-chrome" style={{ cursor: 'default' }}>
            <span style={{ fontSize: 10, marginRight: 4 }}>⚙</span>
            <span className="window-title-text">CloudDesk — Setup Required</span>
          </div>
          <div className="auth-body">
            <div style={{
              fontWeight: 'bold',
              fontSize: 13,
              paddingBottom: 8,
              borderBottom: '1px solid var(--bevel-mid-dark)',
            }}>
              Supabase Configuration Required
            </div>
            <div className="bevel-group" style={{ padding: '10px 12px', fontSize: 11, lineHeight: 1.7 }}>
              <strong>1.</strong> Create a Supabase project at{' '}
              <a href="https://supabase.com" target="_blank" rel="noreferrer"
                style={{ color: 'var(--accent-blue)' }}>supabase.com</a>
              <br />
              <strong>2.</strong> Copy your URL and anon key into{' '}
              <code style={{ background: '#E0E0E0', padding: '1px 4px', fontSize: 10 }}>.env.local</code>
              <br />
              <strong>3.</strong> Run the SQL schema from{' '}
              <code style={{ background: '#E0E0E0', padding: '1px 4px', fontSize: 10 }}>supabase-schema.sql</code>
              <br />
              <strong>4.</strong> Create a <code style={{ background: '#E0E0E0', padding: '1px 4px', fontSize: 10 }}>user-files</code> storage bucket
              <br />
              <strong>5.</strong> Restart the dev server
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              See <strong>SETUP.md</strong> for complete instructions.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-desktop" role="main">
      <div className="auth-window">
        {/* Title bar */}
        <div className="window-titlebar os-chrome" style={{ cursor: 'default' }}>
          <span style={{ fontSize: 10, marginRight: 4 }}>🖥</span>
          <span className="window-title-text">CloudDesk — User Login</span>
        </div>

        {/* Body */}
        <form className="auth-body" onSubmit={handleLogin} aria-label="Login form">
          <div style={{
            textAlign: 'center',
            paddingBottom: 8,
            borderBottom: '1px solid var(--bevel-mid-dark)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
              <img src="/icons/crete-logo.png" alt="Crete" width={22} height={22} style={{ imageRendering: 'pixelated' }} />
              <span style={{ fontWeight: 'bold', fontSize: 14, letterSpacing: -0.3 }}>CloudDesk</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              Your computer in the cloud &middot; Powered by <strong>Crete</strong>
            </div>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <div>
            <label className="auth-field-label" htmlFor="login-email">
              Username or e-mail address:
            </label>
            <input
              ref={emailRef}
              id="login-email"
              className="input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              aria-required="true"
              placeholder=""
            />
          </div>

          <div>
            <label className="auth-field-label" htmlFor="login-password">
              Password:
            </label>
            <input
              id="login-password"
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              aria-required="true"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                document.cookie = 'clouddesk_guest=1; path=/; max-age=86400'
                router.push('/desktop')
              }}
              title="Enter desktop directly as Guest"
            >
              👤 Guest Session
            </button>
            <button
              type="submit"
              className="btn btn-default"
              disabled={loading || !email || !password}
              aria-label="Log in"
            >
              {loading ? 'Logging in...' : '→ Log In'}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <div>
            <Link href="/forgot-password" style={{ color: 'var(--accent-blue)', fontSize: 11 }}>
              Forgot password?
            </Link>
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>New user? </span>
            <Link href="/signup" style={{ color: 'var(--accent-blue)', fontSize: 11 }}>
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
