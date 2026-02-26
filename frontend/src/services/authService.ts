import type { AuthResponse, LoginInput, RegisterInput } from '../types/auth'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5170'

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      (data as { error?: string })?.error ||
      (data as { title?: string })?.title ||
      `Request failed: ${res.status}`
    throw new Error(message)
  }
  return data as T
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: input.email, password: input.password }),
  })
  return handleResponse<AuthResponse>(res)
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: input.email, password: input.password }),
  })
  return handleResponse<AuthResponse>(res)
}
