import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'

export default function Login() {
  const navigate = useNavigate()
  const { setCurrentUser } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const demos = [
    { email: 'admin@vaultix.com',   label: 'Alice Admin',   role: 'ADMIN' },
    { email: 'manager@vaultix.com', label: 'Mark Manager',  role: 'MANAGER' },
    { email: 'clerk@vaultix.com',   label: 'Carol Clerk',   role: 'INVENTORY_CLERK' },
    { email: 'tech@vaultix.com',    label: 'Tom Tech',      role: 'TECHNICIAN' },
    { email: 'auditor@vaultix.com', label: 'Amy Auditor',   role: 'AUDITOR' },
  ]

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    console.log('[Login] Starting handleLogin')
    try {
      console.log('[Login] Calling signInWithPassword...')
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      console.log('[Login] signInWithPassword returned', { data, authError })
      if (authError) throw authError
      if (data.user) {
        console.log('[Login] Fetching profile for user', data.user.id)
        const { data: profile, error: profError } = await supabase.from('profiles').select('*, department:departments(*)').eq('id', data.user.id).single()
        console.log('[Login] Fetching profile returned', { profile, profError })
        if (profError) {
           console.error('[Login] Profile fetch failed:', profError)
           throw profError
        }
        console.log('[Login] Setting current user and navigating')
        setCurrentUser(profile)
        navigate('/dashboard')
      }
    } catch (err: any) {
      console.error('[Login] Catch block hit:', err)
      setError(err.message || 'Invalid email or password')
    } finally {
      console.log('[Login] Finally block hit')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Vaultix</h1>
          <p className="text-gray-500 mt-1">Smart Inventory & Asset Tracking</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign in</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"/>
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Demo accounts</p>
          <div className="space-y-1.5">
            {demos.map(d => (
              <button key={d.email} onClick={() => { setEmail(d.email); setPassword('Vaultix@123') }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-left">
                <span className="text-sm font-medium text-gray-700">{d.label}</span>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{d.role}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">Password: <span className="font-mono text-gray-600">Vaultix@123</span></p>
        </div>
      </div>
    </div>
  )
}
