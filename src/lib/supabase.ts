import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kkrshiqqzrgbngczytrg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrcnNoaXFxenJnYm5nY3p5dHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk1MjgyODgsImV4cCI6MjAxNTEwNDI4OH0.cg_n0K8gz0agi0p0DbUXn-4XE5E8rsEQENrGodYE6tY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
