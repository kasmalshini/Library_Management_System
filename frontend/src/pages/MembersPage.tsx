import './BookListPage.css'

export default function MembersPage() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="breadcrumbs">Library System &gt; Members</div>
      </header>
      <div className="dashboard-content">
        <div className="content-main">
          <section className="book-management">
            <h1 className="section-title">Members</h1>
            <p className="section-desc">Manage library members and patrons. This feature can be added in a future update.</p>
            <p className="empty-message">Members management is coming soon. You can track borrowers and memberships here.</p>
          </section>
        </div>
        <aside className="content-sidebar">
          <div className="panel">
            <h3 className="panel-title">About Members</h3>
            <p className="panel-hint">Manage member accounts, contact details, and borrowing history.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
