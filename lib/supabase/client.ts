import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function createClient() {
  if (!isValidUrl(SUPABASE_URL) || !SUPABASE_ANON_KEY) {
    // Return a minimal stub so pages can render their "not configured" state
    return {
      auth: {
        signInWithPassword: async () => ({ error: new Error('Supabase not configured') }),
        signUp: async () => ({ error: new Error('Supabase not configured') }),
        signOut: async () => ({ error: null }),
        resetPasswordForEmail: async () => ({ error: new Error('Supabase not configured') }),
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }) }),
    } as unknown as ReturnType<typeof createBrowserClient>
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
