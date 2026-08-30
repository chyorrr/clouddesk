import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { emptyGuestRecycleBin } from '@/lib/guest-fs'

// Empty recycle bin — permanently delete all user's deleted items
export async function DELETE() {
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      if (isGuest) {
        emptyGuestRecycleBin()
        return NextResponse.json({ ok: true })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all deleted files' storage paths
    const { data: deletedFiles } = await supabase
      .from('filesystem')
      .select('id, storage_path')
      .eq('user_id', user.id)
      .eq('is_deleted', true)
      .not('storage_path', 'is', null)

    // Remove from storage
    if (deletedFiles && deletedFiles.length > 0) {
      const paths = (deletedFiles as { storage_path: string | null }[])
        .map((f) => f.storage_path)
        .filter(Boolean) as string[]
      if (paths.length > 0) {
        await supabase.storage.from('user-files').remove(paths)
      }
    }

    // Delete all from DB
    const { error } = await supabase
      .from('filesystem')
      .delete()
      .eq('user_id', user.id)
      .eq('is_deleted', true)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (isGuest) {
      emptyGuestRecycleBin()
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Failed to empty recycle bin' }, { status: 500 })
  }
}
