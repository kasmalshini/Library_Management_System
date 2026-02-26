import { describe, it, expect, beforeEach } from 'vitest'
import {
  getStoredToken,
  getStoredEmail,
  setStoredAuth,
  clearStoredAuth,
  isAuthenticated,
} from './auth'

describe('auth', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getStoredToken', () => {
    it('returns null when no token is stored', () => {
      expect(getStoredToken()).toBeNull()
    })
    it('returns stored token', () => {
      setStoredAuth('jwt-123', 'user@example.com')
      expect(getStoredToken()).toBe('jwt-123')
    })
  })

  describe('getStoredEmail', () => {
    it('returns null when no email is stored', () => {
      expect(getStoredEmail()).toBeNull()
    })
    it('returns stored email', () => {
      setStoredAuth('token-abc', 'test@test.com')
      expect(getStoredEmail()).toBe('test@test.com')
    })
  })

  describe('setStoredAuth', () => {
    it('stores token and email', () => {
      setStoredAuth('token-abc', 'test@test.com')
      expect(getStoredToken()).toBe('token-abc')
      expect(getStoredEmail()).toBe('test@test.com')
    })
  })

  describe('clearStoredAuth', () => {
    it('removes token and email', () => {
      setStoredAuth('t', 'e')
      clearStoredAuth()
      expect(getStoredToken()).toBeNull()
      expect(getStoredEmail()).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('returns false when no token', () => {
      expect(isAuthenticated()).toBe(false)
    })
    it('returns true when token is present', () => {
      setStoredAuth('any-token', 'u@u.com')
      expect(isAuthenticated()).toBe(true)
    })
  })
})
