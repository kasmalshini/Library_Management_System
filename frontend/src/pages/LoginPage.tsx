import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/authService'
import { setStoredAuth, isAuthenticated } from '../types/auth'
import './AuthPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    setSubmitting(true)
    try {
      const data = await login({ email: email.trim(), password })
      setStoredAuth(data.token, data.email)
      navigate('/', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed.')
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
          <h1 className="auth-card-title">User Authentication</h1>
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
                autoComplete="current-password"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-login" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Login'}
              </button>
            </div>
          </form>
          <p className="auth-switch">
            Don't have an account? <Link to="/register">Sign up</Link>
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
