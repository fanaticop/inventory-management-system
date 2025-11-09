import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Add auth methods to the client
export const auth = {
  from: (table: string) => ({
    select: () => ({
      data: [],
      error: null
    }),
    insert: (data: any) => ({
      data: { id: 'mock-id', ...data },
      error: null
    }),
    update: (data: any) => ({
      data: { id: 'mock-id', ...data },
      error: null
    }),
    delete: () => ({
      data: null,
      error: null
    }),
    eq: (field: string, value: any) => ({
      data: [],
      error: null
    }),
    order: (field: string, options?: any) => ({
      data: [],
      error: null
    })
  }),
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => ({
      data: { user: { id: 'mock-user-id', email } },
      error: null
    }),
    signOut: async () => ({
      error: null
    }),
    onAuthStateChange: (callback: any) => {
      // Mock auth state change
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
  },
  channel: (name: string) => ({
    on: (event: string, filter: any, callback: any) => ({
      subscribe: () => {}
    }),
    unsubscribe: () => {}
  })
}
