import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Profile } from '../lib/database.types'

export function useAuth() {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) setUser(await fetchProfile(session.user.id))
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) setUser(await fetchProfile(session.user.id))
      else setUser(null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string): Promise<Profile | null> {
    const { data } = await supabase.from('profiles').select('*, department:departments(*)').eq('id', userId).single()
    return data
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, loading, login, logout }
}
