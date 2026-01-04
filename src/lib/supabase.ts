import { createClient } from '@supabase/supabase-js'

// Prefer Vite environment variables for deploy-time configuration. These should be set
// as repository secrets (SUPABASE_URL, SUPABASE_ANON_KEY) and exposed to the build
// as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const fallbackUrl = 'https://kkrshiqqzrgbngczytrg.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrcnNoaXFxenJnYm5nY3p5dHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk1MjgyODgsImV4cCI6MjAxNTEwNDI4OH0.cg_n0K8gz0agi0p0DbUXn-4XE5E8rsEQENrGodYE6tY';

function isValidHttpUrl(url?: string | null) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const useEnvUrl = isValidHttpUrl(envUrl) ? envUrl : null;
const useEnvKey = envKey && envKey.length > 10 ? envKey : null;

if (!useEnvUrl || !useEnvKey) {
  const baseMsg = envUrl && !isValidHttpUrl(envUrl)
    ? 'Supabase URL appears invalid (must be an HTTP/HTTPS URL). Using demo mode instead.'
    : 'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set — running in demo mode.';

  const help = ' See SUPABASE_SETUP.md for setup steps.';

  // In development, surface as an error to make the problem obvious; in production use a warning.
  if (import.meta.env.DEV) {
    console.error(baseMsg + help);
  } else {
    console.warn(baseMsg + help);
  }
}

let supabaseClient: any = null;
if (useEnvUrl && useEnvKey) {
  supabaseClient = createClient(useEnvUrl, useEnvKey);
} else if (isValidHttpUrl(fallbackUrl) && fallbackKey) {
  // If env not configured but a fallback exists (useful for local demos), try fallback safely
  try {
    supabaseClient = createClient(fallbackUrl, fallbackKey);
  } catch (e) {
    // If fallback is somehow invalid, we'll provide a safe mock instead of throwing
    console.warn('Fallback Supabase client initialization failed, enabling mock supabase.');
    supabaseClient = null;
  }
}

// Minimal mock supabase client to avoid runtime crashes when config is missing
const mockSupabase = {
  auth: {
    resetPasswordForEmail: async (_email: string, _opts?: any) => ({ error: new Error('Supabase not configured') }),
    updateUser: async (_attrs: any) => ({ error: new Error('Supabase not configured') }),
    signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
    signOut: async () => ({ error: new Error('Supabase not configured') }),
    onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  functions: {
    invoke: async () => ({ error: new Error('Supabase functions not configured') })
  },
  from: (_table: string) => ({ select: async () => ({ data: [], error: null }) }),
  channel: (_name: string) => ({ on: () => ({ subscribe: () => ({}) }), unsubscribe: () => {} })
};

export const supabase = supabaseClient || mockSupabase;

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
