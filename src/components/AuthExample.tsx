import React, { useState } from 'react'
import { signInWithPassword } from '../services/authService'

export function AuthExample() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      await signInWithPassword(email, password)
      setMessage('Signed in successfully')
    } catch (err: any) {
      setMessage(err.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-neutral-800 rounded">
      <h3 className="text-white mb-2">Auth Example</h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
        <input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="input-field"
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      {message && <div className="mt-2 text-sm text-neutral-300">{message}</div>}
    </div>
  )
}

export default AuthExample
