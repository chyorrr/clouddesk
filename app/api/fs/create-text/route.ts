import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { addGuestFile, setGuestFileContent } from '@/lib/guest-fs'
import { v4 as uuid } from 'uuid'

// Create a text file with initial content
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'

  const { name, parentId: rawParentId, content = '' } = await request.json()
  if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 })

  const parentId = (rawParentId === 'root' || rawParentId === 'null' || rawParentId === '' || !rawParentId) ? null : rawParentId
  const fileName = name.includes('.') ? name : `${name}.txt`
  const base64Data = Buffer.from(content, 'utf-8').toString('base64')
  const dataUrl = `data:text/plain;charset=utf-8;base64,${base64Data}`

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      if (isGuest) {
        const guestItem = addGuestFile(fileName, parentId, Buffer.byteLength(content, 'utf-8'), 'text/plain', dataUrl)
        setGuestFileContent(guestItem.id, content)
        return NextResponse.json(guestItem, { status: 201 })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const storageKey = `${user.id}/${uuid()}.txt`
    let finalStoragePath = storageKey
    const buffer = Buffer.from(content, 'utf-8')

    const { error: uploadError } = await supabase.storage
      .from('user-files')
      .upload(storageKey, buffer, { contentType: 'text/plain', upsert: true })

    if (uploadError) {
      console.warn('Storage upload error in create-text, falling back to data URL:', uploadError.message)
      finalStoragePath = dataUrl
    }

    const { data, error } = await supabase
      .from('filesystem')
      .insert({
        user_id: user.id,
        parent_id: parentId,
        name: fileName,
        type: 'file',
        mime_type: 'text/plain',
        size: Buffer.byteLength(content, 'utf-8'),
        storage_path: finalStoragePath,
        is_deleted: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    if (isGuest) {
      const guestItem = addGuestFile(fileName, parentId, Buffer.byteLength(content, 'utf-8'), 'text/plain', dataUrl)
      setGuestFileContent(guestItem.id, content)
      return NextResponse.json(guestItem, { status: 201 })
    }
    return NextResponse.json({ error: 'Failed to create file' }, { status: 500 })
  }
}
