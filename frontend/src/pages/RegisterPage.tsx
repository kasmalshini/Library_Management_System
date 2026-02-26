import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/authService'
import { setStoredAuth, isAuthenticated } from '../types/auth'
import './AuthPage.css'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated()) navigate('/', { replace: true })
  }, [navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError('Email and password are required.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      const data = await register({ email: email.trim(), password })
      setStoredAuth(data.token, data.email)
      navigate('/', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-layout">
      <header className="auth-header">
        <Link to="/" className="auth-brand">
          Expernetic Library
        </Link>
        <nav className="auth-nav">
          <Link to="/">Home</Link>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main className="auth-main">
        <div className="auth-card">
          <h1 className="auth-card-title">Sign up</h1>
          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="new-password"
                minLength={6}
                required
              />
              <span className="form-hint">At least 6 characters</span>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-login" disabled={submitting}>
                {submitting ? 'Creating account…' : 'Sign up'}
              </button>
            </div>
          </form>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </main>

      <footer className="auth-footer">
        <Link to="/">Privacy Policy</Link>
        <Link to="/">Terms of Service</Link>
        <a href="#contact">Contact Us</a>
      </footer>
    </div>
  )
}
