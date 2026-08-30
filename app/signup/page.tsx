'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/desktop`,
        data: { username: email.split('@')[0] }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  return (
    <div className="auth-desktop" role="main">
      <div className="auth-window">
        <div className="window-titlebar os-chrome" style={{ cursor: 'default' }}>
          <span style={{ fontSize: 10, marginRight: 4 }}>🖥</span>
          <span className="window-title-text">CloudDesk — Create Account</span>
        </div>

        {success ? (
          <div className="auth-body">
            <div style={{
              textAlign: 'center',
              padding: '8px 0 12px',
              borderBottom: '1px solid var(--bevel-mid-dark)',
            }}>
              <div style={{ fontWeight: 'bold', fontSize: 13 }}>Account Created</div>
            </div>
            <div className="bevel-group" style={{ padding: '10px 12px', fontSize: 11, lineHeight: 1.6 }}>
              Check your email (<strong>{email}</strong>) for a confirmation link.
              <br /><br />
              Click the link to activate your account and access your CloudDesk.
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Link href="/login" className="btn">
                ← Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form className="auth-body" onSubmit={handleSignup} aria-label="Sign up form">
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
              Set up your personal computer &middot; Powered by <strong>Crete</strong>
            </div>
          </div>

            {error && (
              <div className="auth-error" role="alert">{error}</div>
            )}

            <div>
              <label className="auth-field-label" htmlFor="signup-email">
                E-mail address:
              </label>
              <input
                id="signup-email"
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                aria-required="true"
                autoFocus
              />
            </div>

            <div>
              <label className="auth-field-label" htmlFor="signup-password">
                Password:
              </label>
              <input
                id="signup-password"
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                aria-required="true"
              />
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                At least 6 characters
              </div>
            </div>

            <div>
              <label className="auth-field-label" htmlFor="signup-confirm">
                Confirm password:
              </label>
              <input
                id="signup-confirm"
                className="input"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                aria-required="true"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-default"
                disabled={loading || !email || !password || !confirmPassword}
              >
                {loading ? 'Creating...' : '→ Create Account'}
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Already have an account? </span>
          <Link href="/login" style={{ color: 'var(--accent-blue)', fontSize: 11 }}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
