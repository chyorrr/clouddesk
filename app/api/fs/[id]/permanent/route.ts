import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { permanentlyDeleteGuestItem } from '@/lib/guest-fs'

type Params = { params: Promise<{ id: string }> }

// Permanent delete
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      if (isGuest) {
        permanentlyDeleteGuestItem(id)
        return NextResponse.json({ ok: true })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get storage path to delete from storage
    const { data: item } = await supabase
      .from('filesystem')
      .select('storage_path')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (item?.storage_path) {
      await supabase.storage.from('user-files').remove([item.storage_path])
    }

    const { error } = await supabase
      .from('filesystem')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (isGuest) {
      permanentlyDeleteGuestItem(id)
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
