import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { restoreGuestItem } from '@/lib/guest-fs'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      if (isGuest) {
        const item = restoreGuestItem(id)
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(item)
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: item } = await supabase
      .from('filesystem')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data, error } = await supabase
      .from('filesystem')
      .update({
        is_deleted: false,
        deleted_at: null,
        parent_id: item.original_parent_id,
        original_parent_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    if (isGuest) {
      const item = restoreGuestItem(id)
      if (item) return NextResponse.json(item)
    }
    return NextResponse.json({ error: 'Failed to restore item' }, { status: 500 })
  }
}
