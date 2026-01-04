import { supabase } from '../lib/supabase'

/**
 * Sign in with email and password using the Supabase client.
 * This wrapper normalizes errors and provides a small example of best-practice
 * error handling so callers can simply `await signInWithPassword(...)` and
 * catch a thrown Error with a friendly message.
 *
 * Example:
 * try {
 *   const session = await signInWithPassword(email, password)
 *   // proceed with session.data.user or session.data.session
 * } catch (err) {
 *   // show err.message to the user
 * }
 */
export async function signInWithPassword(email: string, password: string) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  try {
    const result = await supabase.auth.signInWithPassword({ email, password });

    // Supabase returns { data, error }. Prefer throwing the error so callers
    // can use try/catch rather than inspecting the return shape everywhere.
    if (result.error) {
      // The Supabase error may already be a friendly message; rethrow it.
      throw result.error;
    }

    return result.data;
  } catch (err: any) {
    // Normalize unknown errors to a simple Error with a string message
    const message = err && err.message ? err.message : 'Failed to sign in';
    throw new Error(message);
  }
}

export default {
  signInWithPassword
}
import { supabase } from '../lib/supabase'

export const authService = {
  async forgotPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://fanaticop.github.io/inventory-management-system/#/reset-password'
      })
      
      if (error) throw error
      return { error: null }
    } catch (error: any) {
      console.error('Password reset error:', error)
      return { error: error.message || 'Failed to send reset email' }
    }
  },

  async resetPassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  },

  async verifyPasswordResetToken(token: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery'
      })

      if (error) throw error
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }
}