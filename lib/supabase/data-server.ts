import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const DATA_URL = process.env.DATA_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const DATA_KEY = process.env.DATA_SUPABASE_SERVICE_ROLE_KEY || process.env.DATA_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let _dataClient: ReturnType<typeof createSupabaseClient> | null = null

export function createDataClient() {
  if (!DATA_URL || !DATA_KEY) {
    throw new Error('Data Supabase credentials not configured')
  }

  if (!_dataClient) {
    _dataClient = createSupabaseClient(DATA_URL, DATA_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return _dataClient
}
