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

async function seedUserFilesystem(userId: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) return

  try {
    const adminClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: existing } = await adminClient
      .from('filesystem')
      .select('name')
      .eq('user_id', userId)
      .is('parent_id', null)

    const existingNames = new Set((existing || []).map(item => item.name))
    const missingFolders = DEFAULT_FOLDERS.filter(name => !existingNames.has(name))

    if (missingFolders.length > 0) {
      await adminClient.from('filesystem').insert(
        missingFolders.map((name) => ({
          user_id: userId,
          parent_id: null,
          name,
          type: 'folder',
          is_deleted: false,
        }))
      )
    }

    await adminClient
      .from('user_settings')
      .upsert({ user_id: userId, wallpaper: 'bliss', theme: 'classic', sound_enabled: false, icon_size: 'medium' })
      .match({ user_id: userId })
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

  if (user) {
    await seedUserFilesystem(user.id)
  }

  const username = user
    ? user.user_metadata?.username || user.email?.split('@')[0] || 'User'
    : 'Harsh'

  const userId = user ? user.id : 'guest-user-session'

  return (
    <DesktopClient
      username={username}
      userId={userId}
      onLogout={handleLogout}
    />
  )
}
