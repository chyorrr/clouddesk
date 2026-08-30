import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { updateGuestEmail, deleteGuestEmail } from '@/lib/guest-mail'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'
  const body = await request.json()

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      if (isGuest) {
        updateGuestEmail(id, body)
        return NextResponse.json({ ok: true })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('emails')
      .update(body)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      updateGuestEmail(id, body)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch {
    updateGuestEmail(id, body)
    return NextResponse.json({ ok: true })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      if (isGuest) {
        deleteGuestEmail(id)
        return NextResponse.json({ ok: true })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await supabase
      .from('emails')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    deleteGuestEmail(id)
    return NextResponse.json({ ok: true })
  } catch {
    deleteGuestEmail(id)
    return NextResponse.json({ ok: true })
  }
}
