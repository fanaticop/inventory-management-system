import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // States for the request password reset form
  const [requestEmail, setRequestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // States for the reset password form
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  // Get token and email from URL params
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  const resetEmail = searchParams.get('email');

  useEffect(() => {
    if (token && resetEmail) {
      // We're in reset password mode
      validateResetToken();
    }
  }, [token, resetEmail]);

  const validateResetToken = async () => {
    try {
      // Here you would typically validate the token with Supabase
      // For now, we'll just check if they exist
      if (!token || !resetEmail) {
        setError('Invalid or expired reset link. Please request a new one.');
        setIsValid(false);
      } else {
        setIsValid(true);
      }
    } catch (err) {
      setError('Error validating reset token');
      setIsValid(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(requestEmail, {
        redirectTo: `${window.location.origin}/#/reset-password`
      });
      
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

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !token || !resetEmail) return;

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });
      
      if (error) throw error;
      
      alert('Password has been successfully reset');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="auth-page">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg">
          {token && resetEmail ? (
            <>
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
                Reset Password
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Enter your new password below
              </p>

              {error && (
                <div className="mb-4 p-4 rounded bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="space-y-6">
                <div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="New Password"
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm New Password"
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !isValid}
                  className={`w-full py-3 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700 focus:outline-none transition duration-150 ${
                    (loading || !isValid) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
                Reset Password
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Enter your email to receive a password reset link
              </p>

              <form onSubmit={handleRequestReset} className="space-y-6">
                <div>
                  <input
                    type="email"
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                {message && (
                  <div className={`p-4 rounded text-center ${
                    message.type === 'success' 
                      ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-100' 
                      : 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-100'
                  }`}>
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700 focus:outline-none transition duration-150 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}