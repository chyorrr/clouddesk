import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

export async function createClient() {
  if (!isValidUrl(SUPABASE_URL) || !SUPABASE_ANON_KEY) {
    // Return a stub when not configured
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), limit: () => ({ data: [], error: null }) }) }),
        insert: () => ({ select: () => ({ single: async () => ({ data: null, error: { message: 'Not configured' } }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: { message: 'Not configured' } }) }) }) }),
        delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
        upsert: () => ({ select: () => ({ single: async () => ({ data: null, error: { message: 'Not configured' } }) }), match: () => Promise.resolve({ error: null }) }),
      }),
      storage: {
        from: () => ({
          upload: async () => ({ error: { message: 'Not configured' } }),
          download: async () => ({ data: null, error: { message: 'Not configured' } }),
          remove: async () => ({ error: null }),
          createSignedUrl: async () => ({ data: null, error: { message: 'Not configured' } }),
        }),
      },
    } as unknown as ReturnType<typeof createServerClient>
  }

  const cookieStore = await cookies()

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component — read only
          }
        },
      },
    }
  )
}
