import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getGuestFiles, addGuestFolder } from '@/lib/guest-fs'

const TOTAL_STORAGE = 1 * 1024 * 1024 * 1024 // 1 GB (Supabase free tier)

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'

  const { searchParams } = new URL(request.url)
  const parentIdParam = searchParams.get('parentId')
  const deleted = searchParams.get('deleted') === 'true'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      if (isGuest) {
        return NextResponse.json(getGuestFiles(parentIdParam, deleted))
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('filesystem')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_deleted', deleted)

    if (deleted) {
      // Recycle bin: all deleted items
    } else if (parentIdParam === 'root' || parentIdParam === null) {
      query = query.is('parent_id', null)
    } else {
      query = query.eq('parent_id', parentIdParam)
    }

    query = query.order('type', { ascending: false }).order('name', { ascending: true })

    const { data, error } = await query
    if (error) throw error

    // Deduplicate any duplicate folders/files with the exact same name
    const seen = new Set<string>()
    const duplicateIds: string[] = []
    const uniqueItems = (data || []).filter((item: { id: string; name: string; type: string }) => {
      const key = `${item.type}:${item.name.toLowerCase()}`
      if (seen.has(key)) {
        duplicateIds.push(item.id)
        return false
      }
      seen.add(key)
      return true
    })

    // Asynchronously delete duplicate records from database
    if (duplicateIds.length > 0) {
      supabase
        .from('filesystem')
        .delete()
        .in('id', duplicateIds)
        .eq('user_id', user.id)
        .then(() => {})
        .catch(() => {})
    }

    return NextResponse.json(uniqueItems)
  } catch (err) {
    if (isGuest) {
      return NextResponse.json(getGuestFiles(parentIdParam, deleted))
    }
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'

  const body = await request.json()
  const { type, name, parentId } = body

  if (!name || !type) {
    return NextResponse.json({ error: 'Missing name or type' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      if (isGuest) {
        const folder = addGuestFolder(name, parentId || null)
        return NextResponse.json(folder, { status: 201 })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('filesystem')
      .insert({
        user_id: user.id,
        parent_id: parentId || null,
        name,
        type,
        is_deleted: false,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    if (isGuest) {
      const folder = addGuestFolder(name, parentId || null)
      return NextResponse.json(folder, { status: 201 })
    }
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 })
  }
}
