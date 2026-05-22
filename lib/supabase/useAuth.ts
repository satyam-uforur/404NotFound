'use client'

import { useEffect, useState } from 'react'
import { createAuthBrowserClient } from './auth-client'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createAuthBrowserClient()

    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        if (error) throw error
        setUser(user)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  return { user, loading, error }
}
