import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getGuestFileContent, setGuestFileContent } from '@/lib/guest-fs'
import { v4 as uuid } from 'uuid'

type Params = { params: Promise<{ id: string }> }

// GET: fetch text file content
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      if (isGuest) {
        const text = getGuestFileContent(id)
        return new NextResponse(text, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: item } = await supabase
      .from('filesystem')
      .select('storage_path, mime_type')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!item?.storage_path) {
      return new NextResponse('', { status: 200 })
    }

    const { data, error } = await supabase.storage
      .from('user-files')
      .download(item.storage_path)

    if (error) return new NextResponse('', { status: 200 })

    const text = await data.text()
    return new NextResponse(text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  } catch (err) {
    if (isGuest) {
      const text = getGuestFileContent(id)
      return new NextResponse(text, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      })
    }
    return new NextResponse('', { status: 200 })
  }
}

// PUT: save text file content
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'

  const content = await request.text()

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      if (isGuest) {
        setGuestFileContent(id, content)
        return NextResponse.json({ id, ok: true })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

  const { data: item } = await supabase
    .from('filesystem')
    .select('storage_path, name')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  let storagePath = item?.storage_path

  if (!storagePath) {
    // Create new storage object
    storagePath = `${user.id}/${uuid()}.txt`
  }

  const blob = new Blob([content], { type: 'text/plain' })
  const buffer = Buffer.from(await blob.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from('user-files')
    .upload(storagePath, buffer, {
      contentType: 'text/plain',
      upsert: true,
    })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data, error } = await supabase
    .from('filesystem')
    .update({
      storage_path: storagePath,
      size: content.length,
      mime_type: 'text/plain',
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
      setGuestFileContent(id, content)
      return NextResponse.json({ id, ok: true })
    }
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 })
  }
}
