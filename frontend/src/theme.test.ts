import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  getStoredTheme,
  getResolvedTheme,
  setTheme,
  applyTheme,
} from './theme'

const STORAGE_KEY = 'library_theme'

describe('theme', () => {
  let setAttributeSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    localStorage.clear()
    setAttributeSpy = vi.spyOn(document.documentElement, 'setAttribute')
  })

  afterEach(() => {
    setAttributeSpy.mockRestore()
  })

  describe('getStoredTheme', () => {
    it('returns light when nothing stored', () => {
      expect(getStoredTheme()).toBe('light')
    })
    it('returns stored theme when valid', () => {
      localStorage.setItem(STORAGE_KEY, 'dark')
      expect(getStoredTheme()).toBe('dark')
      localStorage.setItem(STORAGE_KEY, 'system')
      expect(getStoredTheme()).toBe('system')
    })
    it('returns light for invalid stored value', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid')
      expect(getStoredTheme()).toBe('light')
    })
  })

  describe('applyTheme', () => {
    it('sets data-theme to dark when theme is dark', () => {
      applyTheme('dark')
      expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'dark')
    })
    it('sets data-theme to light when theme is light', () => {
      applyTheme('light')
      expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'light')
    })
  })

  describe('setTheme', () => {
    it('saves theme to localStorage and applies it', () => {
      setTheme('dark')
      expect(localStorage.getItem(STORAGE_KEY)).toBe('dark')
      expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'dark')
    })
  })

  describe('getResolvedTheme', () => {
    it('returns dark when stored is dark', () => {
      localStorage.setItem(STORAGE_KEY, 'dark')
      expect(getResolvedTheme()).toBe('dark')
    })
    it('returns light when stored is light', () => {
      localStorage.setItem(STORAGE_KEY, 'light')
      expect(getResolvedTheme()).toBe('light')
    })
  })
})
