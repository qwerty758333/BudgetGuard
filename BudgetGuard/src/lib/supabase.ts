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

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Supabase project URL only (no /rest/v1 suffix). */
function normalizeSupabaseUrl(url: string | undefined): string {
  if (!url) return ''
  return url.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '')
}

const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl)

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (isSupabaseConfigured && /\/rest\/v1/i.test(supabaseUrl)) {
  throw new Error(
    'VITE_SUPABASE_URL must be the project root (e.g. https://YOUR_PROJECT.supabase.co), not a /rest/v1 path.',
  )
}

const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
)

export { supabase }
export default supabase
