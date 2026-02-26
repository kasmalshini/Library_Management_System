import './BookListPage.css'

export default function CategoriesPage() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="breadcrumbs">Library System &gt; Categories</div>
      </header>
      <div className="dashboard-content">
        <div className="content-main">
          <section className="book-management">
            <h1 className="section-title">Categories</h1>
            <p className="section-desc">Manage book categories and genres. This feature can be added in a future update.</p>
            <p className="empty-message">Categories management is coming soon. You can organize books by category here.</p>
          </section>
        </div>
        <aside className="content-sidebar">
          <div className="panel">
            <h3 className="panel-title">About Categories</h3>
            <p className="panel-hint">Use categories to group books by genre, subject, or type.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
