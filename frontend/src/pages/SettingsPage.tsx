import { useState, useEffect } from 'react'
import { getStoredTheme, setTheme } from '../theme'
import type { Theme } from '../theme'
import './BookListPage.css'

export default function SettingsPage() {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme())
  const [emailNotifications, setEmailNotifications] = useState(true)

  function handleThemeChange(value: Theme) {
    setThemeState(value)
    setTheme(value)
  }

  useEffect(() => {
    setThemeState(getStoredTheme())
  }, [])

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="breadcrumbs">Library System &gt; Settings</div>
      </header>
      <div className="dashboard-content">
        <div className="content-main">
          <section className="book-management">
            <h1 className="section-title">Settings</h1>
            <p className="section-desc">Configure your preferences.</p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9375rem', color: '#0f172a' }}>
                Theme
              </label>
              <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value as Theme)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9375rem',
                  minWidth: 160,
                }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
              <p className="section-desc" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                Choose Light, Dark, or System (follows your device preference).
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500, fontSize: '0.9375rem', color: '#0f172a' }}>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
                Email notifications
              </label>
              <p className="section-desc" style={{ marginTop: '0.25rem', marginBottom: 0, marginLeft: '1.5rem' }}>
                Receive emails about library updates (when enabled in a future update).
              </p>
            </div>

            <p className="section-desc" style={{ marginBottom: 0 }}>
              More settings can be added here as the application grows.
            </p>
          </section>
        </div>
        <aside className="content-sidebar">
          <div className="panel">
            <h3 className="panel-title">Preferences</h3>
            <p className="panel-hint">Your choices are stored in this browser. Clearing site data will reset them.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
