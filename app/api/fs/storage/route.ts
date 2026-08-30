import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getGuestStorageUsage } from '@/lib/guest-fs'

export async function GET() {
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      if (isGuest) {
        return NextResponse.json(getGuestStorageUsage())
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data } = await supabase
      .from('filesystem')
      .select('size')
      .eq('user_id', user.id)
      .eq('type', 'file')
      .eq('is_deleted', false)

    const used = ((data as { size: number | null }[]) || []).reduce(
      (sum: number, item: { size: number | null }) => sum + (item.size || 0),
      0
    )
    const total = 1 * 1024 * 1024 * 1024 // 1 GB (Supabase Free Tier)

    return NextResponse.json({ used, total })
  } catch (err) {
    if (isGuest) {
      return NextResponse.json(getGuestStorageUsage())
    }
    return NextResponse.json({ used: 0, total: 1 * 1024 * 1024 * 1024 })
  }
}
