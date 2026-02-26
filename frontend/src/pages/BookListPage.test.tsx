import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BookListPage from './BookListPage'

vi.mock('../services/bookService', () => ({
  getBooks: vi.fn(),
  deleteBook: vi.fn(),
}))

const { getBooks } = await import('../services/bookService')

const mockBooks = [
  { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', description: 'A novel about the American dream.' },
  { id: 2, title: '1984', author: 'George Orwell', description: 'A dystopian novel.' },
]

function renderBookListPage() {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <BookListPage />
    </MemoryRouter>
  )
}

describe('BookListPage', () => {
  beforeEach(() => {
    vi.mocked(getBooks).mockResolvedValue([])
  })

  it('shows loading then section title when books load', async () => {
    vi.mocked(getBooks).mockImplementation(() => new Promise((r) => setTimeout(() => r([]), 50)))
    renderBookListPage()
    expect(screen.getByText(/Loading books/)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Book Management')).toBeInTheDocument()
    })
  })

  it('shows empty message when no books', async () => {
    vi.mocked(getBooks).mockResolvedValue([])
    renderBookListPage()
    await waitFor(() => {
      expect(screen.getByText(/No books match your search/)).toBeInTheDocument()
    })
  })

  it('renders book table when books are returned', async () => {
    vi.mocked(getBooks).mockResolvedValue(mockBooks as any)
    renderBookListPage()
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
    const table = screen.getByRole('table')
    expect(within(table).getByText('The Great Gatsby')).toBeInTheDocument()
    expect(within(table).getByText('1984')).toBeInTheDocument()
    expect(within(table).getByText('F. Scott Fitzgerald')).toBeInTheDocument()
    expect(within(table).getByText('George Orwell')).toBeInTheDocument()
  })

  it('shows Edit links and Delete buttons for each book', async () => {
    vi.mocked(getBooks).mockResolvedValue(mockBooks as any)
    renderBookListPage()
    await waitFor(() => {
      const table = screen.getByRole('table')
      expect(within(table).getByText('The Great Gatsby')).toBeInTheDocument()
    })
    const editLinks = screen.getAllByRole('link', { name: /Edit/i })
    expect(editLinks).toHaveLength(2)
    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i })
    expect(deleteButtons).toHaveLength(2)
  })

  it('displays total books count in metrics', async () => {
    vi.mocked(getBooks).mockResolvedValue(mockBooks as any)
    renderBookListPage()
    await waitFor(() => {
      const table = screen.getByRole('table')
      expect(within(table).getByText('The Great Gatsby')).toBeInTheDocument()
    })
    expect(screen.getByText('TOTAL BOOKS')).toBeInTheDocument()
    const metrics = screen.getAllByText('2')
    expect(metrics.length).toBeGreaterThanOrEqual(1)
  })
})
