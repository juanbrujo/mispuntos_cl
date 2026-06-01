// Mock localStorage para happy-dom
if (typeof window !== 'undefined') {
  const store: Record<string, string> = {}
  const mockLS = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = String(value) },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { Object.keys(store).forEach(k => delete store[k]) },
    get length() { return Object.keys(store).length },
    key: (i: number) => Object.keys(store)[i] ?? null,
  }
  Object.defineProperty(window, 'localStorage', {
    value: mockLS,
    writable: true,
    configurable: true,
  })
}
