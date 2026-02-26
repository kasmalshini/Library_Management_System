import { getStoredEmail } from '../types/auth'
import './BookListPage.css'

export default function ProfilePage() {
  const email = getStoredEmail()

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="breadcrumbs">Library System &gt; Profile</div>
      </header>
      <div className="dashboard-content">
        <div className="content-main">
          <section className="book-management">
            <h1 className="section-title">Profile</h1>
            <p className="section-desc">Your account information.</p>
            <div className="metrics-row" style={{ marginBottom: '1.5rem' }}>
              <div className="metric-card" style={{ minWidth: '200px' }}>
                <span className="metric-label">EMAIL</span>
                <span className="metric-value" style={{ fontSize: '1rem', wordBreak: 'break-all' }}>
                  {email || '—'}
                </span>
              </div>
              <div className="metric-card" style={{ minWidth: '140px' }}>
                <span className="metric-label">ROLE</span>
                <span className="metric-value">Librarian</span>
              </div>
            </div>
            <p className="section-desc" style={{ marginBottom: 0 }}>
              To change your email or password, log out and use the registration or login page. Profile editing can be added in a future update.
            </p>
          </section>
        </div>
        <aside className="content-sidebar">
          <div className="panel">
            <h3 className="panel-title">Account</h3>
            <p className="panel-hint">You are signed in as a librarian. Use the sidebar to manage books, categories, and transactions.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
