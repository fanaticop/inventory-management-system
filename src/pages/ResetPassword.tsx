import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      setMessage({
        text: 'Password reset instructions have been sent to your email.',
        type: 'success'
      });

      // Redirect to login after success message
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      setMessage({
        text: error.message || 'Failed to send reset email',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get token and email from URL params
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    // Validate token when component mounts
    if (!token || !email || !validateResetToken(token, email)) {
      setError('Invalid or expired reset link. Please request a new one.');
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !token || !email) return;

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await completePasswordReset(token, email, formData.password);
      alert('Password has been successfully reset');
      navigate('/login');
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="login-bg">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="login-container max-w-md w-full space-y-8 p-8 rounded-xl">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-white">Reset Password</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Enter your new password below
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-500 bg-opacity-10 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="text-sm font-medium text-neutral-300">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={!isValid}
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-300">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  disabled={!isValid}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !isValid}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-blue-500 hover:text-blue-400"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}