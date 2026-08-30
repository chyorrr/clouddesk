import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DesktopClient from '@/components/os/Desktop'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// Default folders every new user gets
const DEFAULT_FOLDERS = [
  'Documents',
  'Downloads',
  'Pictures',
  'Music',
]

async function seedUserFilesystem(userId: string, email?: string, username?: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) return

  try {
    const adminClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Ensure user_settings has email and username recorded for mail lookup
    await adminClient
      .from('user_settings')
      .upsert({
        user_id: userId,
        email: email || null,
        username: username || (email ? email.split('@')[0] : null),
        wallpaper: 'bliss',
        theme: 'classic',
        sound_enabled: false,
        icon_size: 'medium'
      }, { onConflict: 'user_id' })

    // Check existing root items
    const { data: existing } = await adminClient
      .from('filesystem')
      .select('id, name')
      .eq('user_id', userId)
      .is('parent_id', null)

    if (existing && existing.length > 0) {
      // User is already seeded! Clean up any duplicates if any exist
      const seen = new Set<string>()
      const duplicateIds: string[] = []
      for (const item of existing) {
        const lower = item.name.toLowerCase()
        if (seen.has(lower)) {
          duplicateIds.push(item.id)
        } else {
          seen.add(lower)
        }
      }
      if (duplicateIds.length > 0) {
        await adminClient.from('filesystem').delete().in('id', duplicateIds)
      }
      return
    }

    // Brand new user: insert default root folders once
    await adminClient.from('filesystem').insert(
      DEFAULT_FOLDERS.map((name) => ({
        user_id: userId,
        parent_id: null,
        name,
        type: 'folder',
        is_deleted: false,
      }))
    )
  } catch (err) {
    console.error('Seed user error:', err)
  }
}

async function handleLogout() {
  'use server'
  const cookieStore = await cookies()
  cookieStore.delete('clouddesk_guest')
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {}
  redirect('/login')
}

export default async function DesktopPage() {
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !isGuest) {
    redirect('/login')
  }

  const username = user
    ? user.user_metadata?.username || user.email?.split('@')[0] || 'User'
    : 'Harsh'

  if (user) {
    await seedUserFilesystem(user.id, user.email, username)
  }

  const userId = user ? user.id : 'guest-user-session'

  return (
    <DesktopClient
      username={username}
      userId={userId}
      onLogout={handleLogout}
    />
  )
}
