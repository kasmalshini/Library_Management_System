import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getBook, updateBook } from '../services/bookService'
import type { UpdateBookInput } from '../types/book'
import './CreateBookPage.css'

const TITLE_MAX = 500
const AUTHOR_MAX = 300
const DESCRIPTION_MAX = 2000

export default function EditBookPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateBookInput, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const numId = id ? parseInt(id, 10) : NaN
    if (Number.isNaN(numId)) {
      setLoadError('Invalid book id.')
      setLoading(false)
      return
    }
    let cancelled = false
    getBook(numId)
      .then((book) => {
        if (!cancelled) {
          setTitle(book.title)
          setAuthor(book.author)
          setDescription(book.description ?? '')
        }
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Book not found.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  function validate(): boolean {
    const next: Partial<Record<keyof UpdateBookInput, string>> = {}
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
    const numId = id ? parseInt(id, 10) : NaN
    if (Number.isNaN(numId)) return
    setSubmitError(null)
    if (!validate()) return
    setSubmitting(true)
    try {
      await updateBook(numId, {
        title: title.trim(),
        author: author.trim(),
        description: description.trim() || null,
      })
      navigate('/', { replace: true })
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to update book.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="add-book-page">
        <div className="add-book-breadcrumbs">Library System &gt; Books &gt; Edit Book</div>
        <section className="manage-library-section">
          <h2 className="manage-library-title">Update Book</h2>
          <p className="add-book-loading">Loading book…</p>
        </section>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="add-book-page">
        <div className="add-book-breadcrumbs">Library System &gt; Books &gt; Edit Book</div>
        <section className="manage-library-section">
          <h2 className="manage-library-title">Update Book</h2>
          <div className="alert alert-error" role="alert">{loadError}</div>
          <Link to="/" className="btn-cancel-secondary">Back to list</Link>
        </section>
      </div>
    )
  }

  return (
    <div className="add-book-page">
      <div className="add-book-breadcrumbs">
        Library System &gt; Books &gt; Edit Book
      </div>

      <section className="manage-library-section">
        <h2 className="manage-library-title">Update Book</h2>
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
              {submitting ? 'Saving…' : 'Update'}
            </button>
            <Link to="/" className="btn-cancel-secondary">
              Cancel
            </Link>
          </form>
        </div>
      </section>
    </div>
  )
}
