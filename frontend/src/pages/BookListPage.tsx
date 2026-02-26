import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getBooks, deleteBook } from '../services/bookService'
import type { Book } from '../types/book'
import './BookListPage.css'

const PAGE_SIZE = 10

export default function BookListPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAuthor, setFilterAuthor] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [debouncedAuthor, setDebouncedAuthor] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(t)
  }, [searchTerm])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedAuthor(filterAuthor), 300)
    return () => clearTimeout(t)
  }, [filterAuthor])

  const loadBooks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const search = debouncedSearch.trim() || undefined
      const author = debouncedAuthor.trim() || undefined
      const data = await getBooks(search, author)
      setBooks(data)
      setCurrentPage(1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load books.')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, debouncedAuthor])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  const filteredBooks = useMemo(() => books, [books])

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE))
  const start = (currentPage - 1) * PAGE_SIZE
  const paginatedBooks = filteredBooks.slice(start, start + PAGE_SIZE)

  async function handleDelete(id: number) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      return
    }
    setDeletingId(id)
    setError(null)
    try {
      await deleteBook(id)
      setBooks((prev) => prev.filter((b) => b.id !== id))
      setConfirmDeleteId(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete book.')
    } finally {
      setDeletingId(null)
    }
  }

  function cancelDelete() {
    setConfirmDeleteId(null)
  }

  function exportCsv() {
    const headers = ['Id', 'Title', 'Author', 'Description']
    const rows = filteredBooks.map((b) =>
      [b.id, `"${(b.title || '').replace(/"/g, '""')}"`, `"${(b.author || '').replace(/"/g, '""')}"`, `"${(b.description || '').replace(/"/g, '""')}"`].join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'books.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const recentBooks = useMemo(() => [...filteredBooks].slice(0, 5), [filteredBooks])

  if (loading && books.length === 0) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div className="breadcrumbs">Library System &gt; Books &gt; All Books</div>
        </div>
        <div className="dashboard-content">
          <p className="loading">Loading books…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="breadcrumbs">Library System &gt; Books &gt; All Books</div>
      </header>

      <div className="dashboard-content">
        <div className="content-main">
          <section className="book-management">
            <h1 className="section-title">Book Management</h1>
            <p className="section-desc">Manage library inventory, update records, and track availability.</p>

            <div className="metrics-row">
              <div className="metric-card">
                <span className="metric-label">TOTAL BOOKS</span>
                <span className="metric-value">{filteredBooks.length}</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">AVAILABLE</span>
                <span className="metric-value">{filteredBooks.length}</span>
                <span className="metric-hint">In inventory</span>
              </div>
            </div>

            <div className="toolbar">
              <div className="tabs">
                <span className="tab active">All Books ({filteredBooks.length})</span>
              </div>
              <div className="toolbar-right">
                <input
                  type="search"
                  className="search-input"
                  placeholder="Search by title, author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search books"
                />
                <div className="filter-wrap">
                  <button
                    type="button"
                    className="btn btn-filter"
                    onClick={() => setShowFilter(!showFilter)}
                    aria-expanded={showFilter}
                  >
                    <span className="btn-icon">▾</span> Filter
                  </button>
                  {showFilter && (
                    <div className="filter-dropdown">
                      <label>
                        Filter by author
                        <input
                          type="text"
                          placeholder="Author name"
                          value={filterAuthor}
                          onChange={(e) => setFilterAuthor(e.target.value)}
                          className="filter-input"
                        />
                      </label>
                      <button type="button" className="btn btn-sm" onClick={() => setFilterAuthor('')}>
                        Clear
                      </button>
                    </div>
                  )}
                </div>
                <button type="button" className="btn btn-export" onClick={exportCsv}>
                  Export
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-error" role="alert">
                {error}
              </div>
            )}

            {filteredBooks.length === 0 ? (
              <p className="empty-message">No books match your search. Try different terms or add a new book.</p>
            ) : (
              <>
                <div className="table-wrap">
                  <table className="books-table">
                    <thead>
                      <tr>
                        <th className="col-details">BOOK DETAILS</th>
                        <th className="col-id">ID</th>
                        <th className="col-desc">DESCRIPTION</th>
                        <th className="col-status">STATUS</th>
                        <th className="col-actions">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedBooks.map((book) => (
                        <tr key={book.id}>
                          <td className="col-details">
                            <div className="book-detail">
                              <span className="book-title">{book.title}</span>
                              <span className="book-author">{book.author}</span>
                            </div>
                          </td>
                          <td className="col-id">{book.id}</td>
                          <td className="col-desc">
                            {book.description ? (
                              <span title={book.description}>
                                {book.description.length > 50 ? `${book.description.slice(0, 50)}…` : book.description}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="col-status">
                            <span className="status-badge status-available">Available</span>
                          </td>
                          <td className="col-actions">
                            <Link to={`/books/${book.id}/edit`} className="btn-link">
                              Edit
                            </Link>
                            {confirmDeleteId === book.id ? (
                              <>
                                <button
                                  type="button"
                                  className="btn-link btn-danger"
                                  onClick={() => handleDelete(book.id)}
                                  disabled={deletingId === book.id}
                                >
                                  {deletingId === book.id ? 'Deleting…' : 'Confirm'}
                                </button>
                                <button type="button" className="btn-link" onClick={cancelDelete}>
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                className="btn-link btn-danger"
                                onClick={() => handleDelete(book.id)}
                                disabled={deletingId !== null}
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pagination">
                  <span className="pagination-info">
                    Showing {start + 1}-{Math.min(start + PAGE_SIZE, filteredBooks.length)} of {filteredBooks.length} results
                  </span>
                  <div className="pagination-buttons">
                    <button
                      type="button"
                      className="btn-pagination"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Previous
                    </button>
                    <span className="pagination-pages">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2))
                        .map((p, i, arr) => (
                          <span key={p}>
                            {i > 0 && arr[i - 1] !== p - 1 && ' … '}
                            <button
                              type="button"
                              className={`btn-pagination ${currentPage === p ? 'active' : ''}`}
                              onClick={() => setCurrentPage(p)}
                            >
                              {p}
                            </button>
                          </span>
                        ))}
                    </span>
                    <button
                      type="button"
                      className="btn-pagination"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
        <aside className="content-sidebar">
          <div className="panel">
            <h3 className="panel-title">Recent Activity</h3>
            <ul className="recent-list">
              {recentBooks.length === 0 ? (
                <li className="recent-item">No books yet.</li>
              ) : (
                recentBooks.map((book) => (
                  <li key={book.id} className="recent-item">
                    <Link to={`/books/${book.id}/edit`} className="recent-link">
                      {book.title}
                    </Link>
                    <span className="recent-meta">by {book.author}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="panel">
            <h3 className="panel-title">Books by Category</h3>
            <p className="panel-hint">Categories can be added in a future update.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
