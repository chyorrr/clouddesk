import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { copyGuestItem } from '@/lib/guest-fs'
import { v4 as uuid } from 'uuid'

// Copy a file to a new parent
type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'
  const { parentId } = await request.json()

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      if (isGuest) {
        const item = copyGuestItem(id, parentId || null)
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(item, { status: 201 })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: original } = await supabase
      .from('filesystem')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!original) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let newStoragePath = original.storage_path
    
    // If it's a file, copy the storage object
    if (original.type === 'file' && original.storage_path) {
      const ext = original.name.includes('.') ? original.name.split('.').pop() : ''
      newStoragePath = `${user.id}/${uuid()}${ext ? `.${ext}` : ''}`

      const { data: fileData } = await supabase.storage
        .from('user-files')
        .download(original.storage_path)

      if (fileData) {
        const buffer = Buffer.from(await fileData.arrayBuffer())
        await supabase.storage
          .from('user-files')
          .upload(newStoragePath, buffer, {
            contentType: original.mime_type || 'application/octet-stream',
            upsert: false,
          })
      }
    }

    // Generate a copy name
    const copyName = original.name.includes('.')
      ? original.name.replace(/(\.[^.]+)$/, ' - Copy$1')
      : `${original.name} - Copy`

    const { data, error } = await supabase
      .from('filesystem')
      .insert({
        user_id: user.id,
        parent_id: parentId || null,
        name: copyName,
        type: original.type,
        mime_type: original.mime_type,
        size: original.size,
        storage_path: newStoragePath,
        is_deleted: false,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    if (isGuest) {
      const item = copyGuestItem(id, parentId || null)
      if (item) return NextResponse.json(item, { status: 201 })
    }
    return NextResponse.json({ error: 'Failed to copy item' }, { status: 500 })
  }
}
