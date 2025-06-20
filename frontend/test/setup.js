// Test setup file for frontend unit tests
import { beforeEach, vi } from 'vitest';

// Mock global objects that aren't available in jsdom
beforeEach(() => {
  // Mock the crypto.subtle API for password hashing tests
  if (!globalThis.crypto) {
    globalThis.crypto = {
      subtle: {
        digest: vi.fn()
      }
    };
  }

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  globalThis.localStorage = localStorageMock;

  // Mock fetch for API calls
  globalThis.fetch = vi.fn();

  // Mock window.location
  Object.defineProperty(window, 'location', {
    value: {
      href: '',
      assign: vi.fn(),
      reload: vi.fn(),
    },
    writable: true,
  });

  // Mock alert
  globalThis.alert = vi.fn();

  // Mock console.log/error to reduce noise in tests
  globalThis.console.log = vi.fn();
  globalThis.console.error = vi.fn();
});
