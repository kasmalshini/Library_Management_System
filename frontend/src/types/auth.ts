export interface AuthResponse {
  token: string
  email: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
}

const AUTH_TOKEN_KEY = 'library_auth_token'
const AUTH_EMAIL_KEY = 'library_auth_email'

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function getStoredEmail(): string | null {
  return localStorage.getItem(AUTH_EMAIL_KEY)
}

export function setStoredAuth(token: string, email: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  localStorage.setItem(AUTH_EMAIL_KEY, email)
}

export function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_EMAIL_KEY)
}

export function isAuthenticated(): boolean {
  return !!getStoredToken()
}
