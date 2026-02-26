import './BookListPage.css'

export default function TransactionsPage() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="breadcrumbs">Library System &gt; Transactions</div>
      </header>
      <div className="dashboard-content">
        <div className="content-main">
          <section className="book-management">
            <h1 className="section-title">Transactions</h1>
            <p className="section-desc">Track book check-outs, returns, and lending history. This feature can be added in a future update.</p>
            <p className="empty-message">Transactions management is coming soon. You can record borrows and returns here.</p>
          </section>
        </div>
        <aside className="content-sidebar">
          <div className="panel">
            <h3 className="panel-title">About Transactions</h3>
            <p className="panel-hint">Track who borrowed which book and when it was returned.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
