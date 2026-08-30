import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getGuestDownloadUrl } from '@/lib/guest-fs'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      if (isGuest) {
        const guestData = getGuestDownloadUrl(id)
        if (guestData) return NextResponse.json(guestData)
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: item } = await supabase
      .from('filesystem')
      .select('storage_path, name')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!item?.storage_path) {
      // Check if it's a guest-seeded fallback item
      const guestData = getGuestDownloadUrl(id)
      if (guestData) return NextResponse.json(guestData)
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const { data } = await supabase.storage
      .from('user-files')
      .createSignedUrl(item.storage_path, 3600) // 1 hour

    if (!data?.signedUrl) {
      return NextResponse.json({ error: 'Could not generate URL' }, { status: 500 })
    }

    return NextResponse.json({ url: data.signedUrl, name: item.name })
  } catch {
    const guestData = getGuestDownloadUrl(id)
    if (guestData) return NextResponse.json(guestData)
    return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 })
  }
}
