import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { FormSkeleton } from '../components/Skeleton';
import AuthExample from '../components/AuthExample';

interface SocialLoginModalState {
  show: boolean;
  provider: string;
  data?: any;
}

export function Login() {
  const navigate = useNavigate();
  const { login, signup, resetPassword, socialLogin } = useStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    department: '',
    role: 'staff' as 'admin' | 'manager' | 'staff'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [socialLoginModal, setSocialLoginModal] = useState<SocialLoginModalState>({
    show: false,
    provider: '',
    data: null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isForgotPassword) {
        if (!formData.email || !formData.email.includes('@')) {
          throw new Error('Please enter a valid email address');
        }
        const msg = await resetPassword(formData.email);
        // show success inline
        setSuccess(msg || 'A password reset link has been sent to your email address.');
        setIsForgotPassword(false);
      } else if (isSignup) {
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some((u: any) => u.email === formData.email)) {
          alert('User already exists. Please sign in.');
          setIsSignup(false);
          setIsLoading(false);
          return;
        }
        await signup(formData);
      } else {
        // Check if user exists before attempting login
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (!users.some((u: any) => u.email === formData.email)) {
          setError('No account found with this email. Please sign up.');
          setIsLoading(false);
          return;
        }
        await login(formData.email, formData.password);
      }
      navigate('/');
      } catch (err) {
      const message = err instanceof Error ? err.message : null;
      if (message) setError(message);
      else setError(isForgotPassword ? 'Password reset failed' : isSignup ? 'Signup failed' : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = (provider: 'google' | 'github' | 'facebook' | 'twitter' | 'instagram') => {
    // In a real app, this would initiate OAuth flow
    // For demo, we'll simulate getting profile data
    const mockSocialData = {
      id: `${provider}_${Date.now()}`,
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      email: `user_${Date.now()}@${provider}.com`
    };

    setSocialLoginModal({
      show: true,
      provider,
      data: mockSocialData
    });
  };

  const handleSocialLogin = async (action: 'link' | 'create') => {
    if (!socialLoginModal.provider || !socialLoginModal.data) return;

    setIsLoading(true);
    setError(null);

    try {
      if (action === 'link') {
        // Verify existing account before linking
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find((u: any) => u.email === formData.email);

        if (!existingUser) {
          throw new Error('No account found with this email');
        }

        if (formData.password) {
          // Verify password before linking
          await login(formData.email, formData.password);
        }

        // Link social account to existing account
        await socialLogin(socialLoginModal.provider, {
          ...socialLoginModal.data,
          email: formData.email
        });
      } else {
        // Create new account with social data
        await socialLogin(socialLoginModal.provider, socialLoginModal.data);
      }

      setSocialLoginModal({ show: false, provider: '', data: null });
      navigate('/');
    } catch (err) {
      setError(action === 'link' ? 'Account linking failed' : 'Social signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.preventDefault();
    const { name, value } = e.target;
    console.log('Input change:', name, value); // Debug log
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [name]: value
      };
      console.log('New form data:', newData); // Debug log
      return newData;
    });
  };

  return (
    <div className="login-bg">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="login-container max-w-lg w-full space-y-8 p-10 rounded-2xl">
          <div className="text-center">
            <h2 className="mt-4 text-4xl font-extrabold text-white">
              {isForgotPassword ? "Reset Password" : isSignup ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="mt-2 text-sm text-neutral-300">
              {isForgotPassword
                ? "Enter your email to receive a password reset link"
                : isSignup
                  ? "Sign up to get started"
                  : "Sign in to continue"}
            </p>
          </div>
          {isLoading ? (
            <FormSkeleton />
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6 relative" style={{ zIndex: 5 }}>
              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}
              {success && (
                <div className="rounded-md bg-green-50 p-4 mb-4">
                  <div className="text-sm text-green-700">{success}</div>
                </div>
              )}

              {socialLoginModal.show ? (
                <div className="space-y-4">
                  <p className="text-center text-neutral-400">
                    An account with email <strong>{formData.email}</strong> already exists.
                    Would you like to link your {socialLoginModal.provider} account to it?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('link')}
                      className="flex-1 btn-primary"
                    >
                      Yes, Link Account
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('create')}
                      className="flex-1 btn-secondary"
                    >
                      No, Create New
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSocialLoginModal({ show: false, provider: '', data: null })}
                    className="w-full btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {isSignup && (
                    <>
                      <div className="relative">
                        <label htmlFor="name" className="sr-only">Name</label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Full Name"
                          style={{ position: 'relative', zIndex: 10 }}
                        />
                      </div>
                      <div className="relative">
                        <label htmlFor="department" className="sr-only">Department</label>
                        <input
                          id="department"
                          name="department"
                          type="text"
                          required
                          value={formData.department}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Department"
                          style={{ position: 'relative', zIndex: 10 }}
                        />
                      </div>
                      <div className="relative">
                        <label htmlFor="role" className="sr-only">Role</label>
                        <select
                          id="role"
                          name="role"
                          required
                          value={formData.role}
                          onChange={handleChange}
                          className="input-field"
                          style={{ position: 'relative', zIndex: 10, backgroundColor: 'rgba(38, 38, 38, 0.9)' }}
                        >
                          <option value="staff">Staff</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </>
                  )}
                  <div>
                    <label htmlFor="email" className="sr-only">Email address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Email address"
                      style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}
                    />
                  </div>
                  {!isForgotPassword && (
                    <div className="mb-4">
                      <label htmlFor="password" className="sr-only">Password</label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete={isSignup ? 'new-password' : 'current-password'}
                        required={!isForgotPassword}
                        value={formData.password}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Password"
                        style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}
                      />
                    </div>
                  )}
                </div>
              )}

              {!socialLoginModal.show && (
                <>
                  <div>
                    <button type="submit" className="w-full btn-primary">
                      {isForgotPassword ? "Send Reset Link" : isSignup ? "Sign up" : "Sign in"}
                    </button>
                  </div>

                  {!isSignup && !isForgotPassword && (
                    <div className="flex flex-col gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-neutral-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-neutral-900 text-neutral-400">
                            Or continue with
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleSocialAuth('google')}
                          className="btn-secondary"
                        >
                          Google
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSocialAuth('github')}
                          className="btn-secondary"
                        >
                          GitHub
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSocialAuth('facebook')}
                          className="btn-secondary"
                        >
                          Facebook
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {!socialLoginModal.show && (
                <div className="mt-6 space-y-2">
                  {!isForgotPassword && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignup(!isSignup);
                        setFormData(prev => ({
                          ...prev,
                          name: '',
                          department: '',
                          role: 'staff'
                        }));
                        setError(null);
                      }}
                      className="link-text"
                    >
                      {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                    </button>
                  )}

                  {/* Use a proper Link to the reset page so direct navigation works and is accessible */}
                  {!isForgotPassword ? (
                    <Link to="/reset-password" className="link-text" onClick={() => setError(null)}>
                      Forgot your password?
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setError(null);
                      }}
                      className="link-text"
                    >
                      Back to Sign In
                    </button>
                  )}
                </div>
              )}

              {/* Small auth example for manual testing in the browser */}
              <div className="mt-6">
                <AuthExample />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}