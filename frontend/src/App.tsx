import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { Profile } from './lib/database.types'
import { AppProvider } from './context/AppContext'
import { ToastProvider } from './context/ToastContext'
import { Layout } from './components/Layout'
import Login from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Inventory } from './pages/Inventory'
import { AssetsList } from './pages/AssetsList'
import { AssetDetail } from './pages/AssetDetail'
import { Maintenance } from './pages/Maintenance'
import { Reports } from './pages/Reports'
import { Users } from './pages/Users'
import { ActivityLog } from './pages/ActivityLog'
import { NotFound } from './pages/NotFound'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    console.log('[ProtectedRoute] Starting session check...')
    
    // Fallback timeout in case getSession hangs forever
    const timeout = setTimeout(() => {
      console.log('[ProtectedRoute] Session check timed out after 5s')
      setChecking(false)
      supabase.auth.signOut()
    }, 5000)

    supabase.auth.getSession().then(({ data, error }) => {
      clearTimeout(timeout)
      console.log('[ProtectedRoute] getSession returned:', { data, error })
      if (error) {
        console.error('Session error:', error)
        supabase.auth.signOut()
      }
      setAuthed(!!data?.session)
      setChecking(false)
    }).catch((err) => {
      clearTimeout(timeout)
      console.error('Session catch error:', err)
      setAuthed(false)
      setChecking(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[ProtectedRoute] Auth state changed:', event, !!session)
      setAuthed(!!session)
    })
    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
        <p className="text-sm text-gray-500">Loading Vaultix...</p>
      </div>
    </div>
  )

  return authed ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*, department:departments(*)').eq('id', session.user.id).single()
        setCurrentUser(data)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*, department:departments(*)').eq('id', session.user.id).single()
        setCurrentUser(data)
      } else {
        setCurrentUser(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <ToastProvider>
        <AppProvider currentUser={currentUser} setCurrentUser={setCurrentUser}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard"   element={<Dashboard />} />
              <Route path="/inventory"   element={<Inventory />} />
              <Route path="/assets"      element={<AssetsList />} />
              <Route path="/assets/:id"  element={<AssetDetail />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/reports"     element={<Reports />} />
              <Route path="/users"       element={<Users />} />
              <Route path="/activity"    element={<ActivityLog />} />
              <Route path="*"            element={<NotFound />} />
            </Route>
          </Routes>
        </AppProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
