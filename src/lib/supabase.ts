import { createClient } from '@supabase/supabase-js'

// Trim so whitespace-only values (or the empty string a missing GitHub secret
// expands to) count as "not set" rather than a valid-but-broken value.
const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

/** True when both env vars are present — the app degrades gracefully otherwise. */
export const isSupabaseConfigured = Boolean(url && anonKey)

// When unconfigured we still create a client against a dummy URL so imports
// don't throw (createClient rejects an empty URL); the auth gate shows a setup
// screen instead of using it. Use `||` so an empty string also falls back.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
