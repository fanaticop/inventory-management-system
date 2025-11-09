import { supabase } from '../lib/supabase'

export const authService = {
  async forgotPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      
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