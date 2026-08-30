'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/desktop`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="auth-desktop" role="main">
      <div className="auth-window">
        <div className="window-titlebar os-chrome" style={{ cursor: 'default' }}>
          <span style={{ fontSize: 10, marginRight: 4 }}>🖥</span>
          <span className="window-title-text">CloudDesk — Reset Password</span>
        </div>

        {sent ? (
          <div className="auth-body">
            <div className="bevel-group" style={{ padding: '10px 12px', fontSize: 11, lineHeight: 1.6 }}>
              A password reset link has been sent to <strong>{email}</strong>.
              <br /><br />
              Check your inbox and follow the instructions.
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Link href="/login" className="btn">← Back to Login</Link>
            </div>
          </div>
        ) : (
          <form className="auth-body" onSubmit={handleSubmit} aria-label="Reset password form">
            <div style={{
              paddingBottom: 8,
              borderBottom: '1px solid var(--bevel-mid-dark)',
              fontSize: 11,
              lineHeight: 1.5,
            }}>
              Enter your e-mail address and we'll send you a link to reset your password.
            </div>

            {error && <div className="auth-error" role="alert">{error}</div>}

            <div>
              <label className="auth-field-label" htmlFor="reset-email">
                E-mail address:
              </label>
              <input
                id="reset-email"
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                aria-required="true"
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-default"
                disabled={loading || !email}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          <Link href="/login" style={{ color: 'var(--accent-blue)', fontSize: 11 }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
