import { createClient } from '@supabase/supabase-js'

export type Database = {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string
          user_id: string
          amount: number
          category: string
          date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          category: string
          date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          category?: string
          date?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

/** Project root only — no /rest/v1 (the SDK adds paths for auth and REST). */
function normalizeSupabaseUrl(url: string): string {
  return url.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '')
}

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!rawSupabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local',
  )
}

const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl)

if (/\/rest\/v1/i.test(supabaseUrl)) {
  throw new Error(
    'VITE_SUPABASE_URL must be the project root (e.g. https://YOUR_PROJECT.supabase.co), not a /rest/v1 path.',
  )
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export { supabase }
export default supabase
