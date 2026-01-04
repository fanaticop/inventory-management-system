import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useStore } from '../useStore'

vi.mock('../../services/authService', () => ({
  signInWithPassword: vi.fn()
}))

import { signInWithPassword as mockedSignIn } from '../../services/authService'

beforeEach(() => {
  // Reset store to initial state between tests
  useStore.setState({ currentUser: null, isAuthenticated: false, error: null, loading: false })
  // Ensure a localStorage mock exists in the test environment
  if (typeof localStorage === 'undefined' || localStorage === null) {
    const createLocalStorageMock = () => {
      let store: Record<string, string> = {}
      return {
        getItem: (key: string) => (store[key] === undefined ? null : store[key]),
        setItem: (key: string, value: string) => { store[key] = String(value) },
        removeItem: (key: string) => { delete store[key] },
        clear: () => { store = {} }
      }
    }

    vi.stubGlobal('localStorage', createLocalStorageMock())
  } else {
    localStorage.clear()
  }
  vi.clearAllMocks()
})

describe('useStore.login', () => {
  it('uses Supabase when available and sets currentUser', async () => {
    ;(mockedSignIn as any).mockResolvedValueOnce({ user: { id: 'sup1', email: 's@x.com' } })

    await useStore.getState().login('s@x.com', 'password')

    const state = useStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.currentUser).toBeDefined()
    expect(state.currentUser?.email).toBe('s@x.com')
  })

  it('falls back to localStorage demo auth when Supabase fails', async () => {
    ;(mockedSignIn as any).mockRejectedValueOnce(new Error('Supabase not configured'))

    const demoUser = { id: 'u0', name: 'Demo', email: 'demo@x.com', role: 'staff', department: 'General', password: 'pw' }
    localStorage.setItem('users', JSON.stringify([demoUser]))

    await useStore.getState().login('demo@x.com', 'pw')

    const state = useStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.currentUser?.email).toBe('demo@x.com')
  })
})
