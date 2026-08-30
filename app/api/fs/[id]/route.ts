import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deleteGuestItem } from '@/lib/guest-fs'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      if (isGuest) return NextResponse.json({ id, ok: true })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('filesystem')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 404 })
    return NextResponse.json(data)
  } catch {
    if (isGuest) return NextResponse.json({ id, ok: true })
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'

  const body = await request.json()
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (body.name !== undefined) updates.name = body.name
  if (body.parentId !== undefined) updates.parent_id = body.parentId

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      if (isGuest) return NextResponse.json({ id, ...updates })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('filesystem')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    if (isGuest) return NextResponse.json({ id, ...updates })
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

// Soft delete
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      if (isGuest) {
        deleteGuestItem(id)
        return NextResponse.json({ ok: true })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: item } = await supabase
      .from('filesystem')
      .select('parent_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    const { error } = await supabase
      .from('filesystem')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        original_parent_id: item?.parent_id,
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    if (isGuest) {
      deleteGuestItem(id)
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
