import { describe, it, expect, vi } from 'vitest'
import * as authService from '../authService'

// Mock the Supabase client module used by authService
vi.mock('../../lib/supabase', () => {
  return {
    supabase: {
      auth: {
        signInWithPassword: vi.fn()
      }
    }
  }
})

import { supabase } from '../../lib/supabase'

describe('authService.signInWithPassword', () => {
  it('returns session data on successful sign in', async () => {
    ;(supabase.auth.signInWithPassword as any).mockResolvedValueOnce({ data: { user: { id: 'u1', email: 'a@b.com' } }, error: null })

    const data = await authService.signInWithPassword('a@b.com', 'pass')
    expect(data).toBeDefined()
    expect(data.user).toBeDefined()
    expect(data.user.email).toBe('a@b.com')
  })

  it('throws an error when Supabase returns error', async () => {
    ;(supabase.auth.signInWithPassword as any).mockResolvedValueOnce({ data: null, error: new Error('Invalid credentials') })

    await expect(authService.signInWithPassword('a@b.com', 'wrong')).rejects.toThrow('Invalid credentials')
  })
})
