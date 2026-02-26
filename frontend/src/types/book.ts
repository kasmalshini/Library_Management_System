/** Book as returned by the API */
export interface Book {
  id: number
  title: string
  author: string
  description: string | null
}

/** Input for creating a new book */
export interface CreateBookInput {
  title: string
  author: string
  description?: string | null
}

/** Input for updating an existing book */
export interface UpdateBookInput {
  title: string
  author: string
  description?: string | null
}

/** API error response shape */
export interface ApiError {
  error?: string
  title?: string
  errors?: Record<string, string[]>
}
