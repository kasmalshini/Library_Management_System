import type { Book, CreateBookInput, UpdateBookInput } from '../types/book'
import { getStoredToken } from '../types/auth'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5170'

function authHeaders(): HeadersInit {
  const token = getStoredToken()
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  return headers
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    const { clearStoredAuth } = await import('../types/auth')
    clearStoredAuth()
    window.location.href = '/login'
    throw new Error('Session expired. Please log in again.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      data?.error ||
      data?.title ||
      (data?.errors && Object.values(data.errors).flat().join(' ')) ||
      `Request failed: ${res.status}`
    throw new Error(message)
  }
  return data as T
}

export async function getBooks(search?: string, author?: string): Promise<Book[]> {
  const url = new URL(`${API_BASE}/api/books`)
  if (search?.trim()) url.searchParams.set('search', search.trim())
  if (author?.trim()) url.searchParams.set('author', author.trim())
  const res = await fetch(String(url), { headers: authHeaders() })
  return handleResponse<Book[]>(res)
}

export async function getBook(id: number): Promise<Book> {
  const res = await fetch(`${API_BASE}/api/books/${id}`, { headers: authHeaders() })
  return handleResponse<Book>(res)
}

export async function createBook(input: CreateBookInput): Promise<Book> {
  const res = await fetch(`${API_BASE}/api/books`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input),
  })
  return handleResponse<Book>(res)
}

export async function updateBook(id: number, input: UpdateBookInput): Promise<Book> {
  const res = await fetch(`${API_BASE}/api/books/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(input),
  })
  return handleResponse<Book>(res)
}

export async function deleteBook(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/books/${id}`, { method: 'DELETE', headers: authHeaders() })
  if (res.status === 401) {
    const { clearStoredAuth } = await import('../types/auth')
    clearStoredAuth()
    window.location.href = '/login'
    throw new Error('Session expired. Please log in again.')
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error || `Delete failed: ${res.status}`)
  }
}

