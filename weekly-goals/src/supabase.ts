import { createClient } from '@supabase/supabase-js'

// Set these in .env.local (computer) and in Vercel > Project > Settings > Environment Variables.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const isConfigured = Boolean(url && key)

export const supabase = createClient(url ?? 'http://localhost', key ?? 'missing', {
  auth: { persistSession: true, autoRefreshToken: true },
})

export type GoalStatus = 'open' | 'done' | 'failed'

export type Goal = {
  id: string
  day: string // YYYY-MM-DD
  title: string
  status: GoalStatus
  created_at: string
}
