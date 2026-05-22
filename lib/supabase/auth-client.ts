'use client'

import { createBrowserClient } from '@supabase/ssr'

const FALLBACK_URL = 'https://placeholder.supabase.co'
const FALLBACK_KEY = 'placeholder-key'

export function createAuthBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL,
    process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY,
  )
}

export const createClient = createAuthBrowserClient
