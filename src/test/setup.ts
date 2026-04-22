import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Silence noisy act() warnings in tests that use async state updates
const consoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('act(')) return;
  consoleError(...args);
};

// jsdom's localStorage can be degraded (--localstorage-file warning); provide a
// reliable in-memory implementation that includes .clear()
const _ls: Record<string, string> = {};
const localStorageMock: Storage = {
  getItem: (k) => _ls[k] ?? null,
  setItem: (k, v) => { _ls[k] = String(v); },
  removeItem: (k) => { delete _ls[k]; },
  clear: () => { Object.keys(_ls).forEach((k) => delete _ls[k]); },
  get length() { return Object.keys(_ls).length; },
  key: (i) => Object.keys(_ls)[i] ?? null,
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
beforeEach(() => localStorageMock.clear());

// jsdom does not implement matchMedia — provide a no-op stub
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
