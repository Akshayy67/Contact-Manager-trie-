import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock IndexedDB for tests
const mockIndexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
  cmp: vi.fn(),
}

Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB,
  writable: true,
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
