import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'

// Create a text file with initial content
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, parentId, content = '' } = await request.json()
  if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 })

  const storageKey = `${user.id}/${uuid()}.txt`
  const blob = new Blob([content], { type: 'text/plain' })
  const buffer = Buffer.from(await blob.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from('user-files')
    .upload(storageKey, buffer, { contentType: 'text/plain' })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data, error } = await supabase
    .from('filesystem')
    .insert({
      user_id: user.id,
      parent_id: parentId || null,
      name: name.endsWith('.txt') ? name : `${name}.txt`,
      type: 'file',
      mime_type: 'text/plain',
      size: content.length,
      storage_path: storageKey,
      is_deleted: false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
