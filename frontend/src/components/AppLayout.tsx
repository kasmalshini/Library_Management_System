import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { getStoredEmail, clearStoredAuth } from '../types/auth'
import './AppLayout.css'

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  function handleLogout() {
    clearStoredAuth()
    navigate('/login', { replace: true })
  }

  const isBooks = location.pathname === '/' || location.pathname.startsWith('/books')

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">LibManager</div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">MAIN</span>
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              <span className="nav-icon">◉</span>
              Dashboard
            </Link>
            <div className="nav-group">
              <span className={`nav-link ${isBooks ? 'active' : ''}`}>
                <span className="nav-icon">📚</span>
                Books
              </span>
              <Link to="/" className={`nav-link sub ${location.pathname === '/' ? 'active' : ''}`}>
                All Books
              </Link>
              <Link to="/books/new" className={`nav-link sub ${location.pathname === '/books/new' ? 'active' : ''}`}>
                Add New Book
              </Link>
            </div>
            <Link to="/categories" className={`nav-link ${location.pathname === '/categories' ? 'active' : ''}`}>
              <span className="nav-icon">📁</span>
              Categories
            </Link>
            <Link to="/members" className={`nav-link ${location.pathname === '/members' ? 'active' : ''}`}>
              <span className="nav-icon">👥</span>
              Members
            </Link>
            <Link to="/transactions" className={`nav-link ${location.pathname === '/transactions' ? 'active' : ''}`}>
              <span className="nav-icon">↔</span>
              Transactions
            </Link>
          </div>
          <div className="nav-section">
            <span className="nav-section-title">SYSTEM</span>
            <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
              Profile
            </Link>
            <Link to="/settings" className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}>
              Settings
            </Link>
            <Link to="/" className="nav-link">Help Center</Link>
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-user-name">{getStoredEmail() || 'User'}</span>
            <span className="sidebar-user-role">Librarian</span>
          </div>
          <button type="button" className="btn btn-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>
      <div className="app-main">
        <Outlet />
      </div>
    </div>
  )
}
