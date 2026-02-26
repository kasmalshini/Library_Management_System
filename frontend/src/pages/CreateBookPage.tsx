import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { createBook, getBooks, deleteBook } from '../services/bookService'
import type { Book, CreateBookInput } from '../types/book'
import './CreateBookPage.css'

const TITLE_MAX = 500
const AUTHOR_MAX = 300
const DESCRIPTION_MAX = 2000

export default function CreateBookPage() {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof CreateBookInput, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [books, setBooks] = useState<Book[]>([])
  const [loadingBooks, setLoadingBooks] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function loadBooks() {
    setLoadingBooks(true)
    try {
      const data = await getBooks()
      setBooks(data)
    } catch {
      setBooks([])
    } finally {
      setLoadingBooks(false)
    }
  }

  useEffect(() => {
    loadBooks()
  }, [])

  function validate(): boolean {
    const next: Partial<Record<keyof CreateBookInput, string>> = {}
    if (!title.trim()) next.title = 'Title is required.'
    else if (title.length > TITLE_MAX) next.title = `Title must not exceed ${TITLE_MAX} characters.`
    if (!author.trim()) next.author = 'Author is required.'
    else if (author.length > AUTHOR_MAX) next.author = `Author must not exceed ${AUTHOR_MAX} characters.`
    if (description.length > DESCRIPTION_MAX) {
      next.description = `Description must not exceed ${DESCRIPTION_MAX} characters.`
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) return
    setSubmitting(true)
    try {
      await createBook({
        title: title.trim(),
        author: author.trim(),
        description: description.trim() || null,
      })
      setTitle('')
      setAuthor('')
      setDescription('')
      setErrors({})
      await loadBooks()
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to create book.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await deleteBook(id)
      setBooks((prev) => prev.filter((b) => b.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="add-book-page">
      <div className="breadcrumbs add-book-breadcrumbs">
        Library System &gt; Books &gt; Add New Book
      </div>

      <section className="manage-library-section">
        <h2 className="manage-library-title">Manage Your Library</h2>
        <div className="add-book-card">
          {submitError && (
            <div className="alert alert-error" role="alert">
              {submitError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="add-book-form" noValidate>
            <input
              type="text"
              placeholder="Book Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={TITLE_MAX + 1}
              className={errors.title ? 'input-invalid' : ''}
              aria-invalid={!!errors.title}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
            <input
              type="text"
              placeholder="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={AUTHOR_MAX + 1}
              className={errors.author ? 'input-invalid' : ''}
              aria-invalid={!!errors.author}
            />
            {errors.author && <span className="form-error">{errors.author}</span>}
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={DESCRIPTION_MAX + 1}
              className={errors.description ? 'input-invalid' : ''}
              aria-invalid={!!errors.description}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
            <button type="submit" className="btn-add-book" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add Book'}
            </button>
          </form>
        </div>
      </section>

      <section className="existing-books-section">
        <h3 className="existing-books-title">Your Books</h3>
        {loadingBooks ? (
          <p className="add-book-loading">Loading books…</p>
        ) : books.length === 0 ? (
          <p className="add-book-empty">No books yet. Add one above.</p>
        ) : (
          <div className="book-cards-grid">
            {books.map((book) => (
              <div key={book.id} className="book-card">
                <h4 className="book-card-title">{book.title}</h4>
                <p className="book-card-author">{book.author}</p>
                {book.description && (
                  <p className="book-card-desc">{book.description}</p>
                )}
                <div className="book-card-actions">
                  <Link to={`/books/${book.id}/edit`} className="btn-update">
                    Update
                  </Link>
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => handleDelete(book.id)}
                    disabled={deletingId === book.id}
                  >
                    {deletingId === book.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
