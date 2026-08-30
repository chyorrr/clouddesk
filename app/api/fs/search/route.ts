import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { searchGuestFiles } from '@/lib/guest-fs'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'
  const q = request.nextUrl.searchParams.get('q') || ''

  if (!q.trim()) return NextResponse.json([])

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      if (isGuest) {
        return NextResponse.json(searchGuestFiles(q))
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('filesystem')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .ilike('name', `%${q}%`)
      .order('name')
      .limit(50)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    if (isGuest) {
      return NextResponse.json(searchGuestFiles(q))
    }
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
