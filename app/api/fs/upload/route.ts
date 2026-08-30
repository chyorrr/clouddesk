import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { addGuestFile } from '@/lib/guest-fs'
import { v4 as uuid } from 'uuid'

function getMimeType(name: string, fileType?: string): string {
  if (fileType && fileType !== 'application/octet-stream') return fileType
  const ext = name.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    m4a: 'audio/mp4',
    flac: 'audio/flac',
    aac: 'audio/aac',
    pdf: 'application/pdf',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
    txt: 'text/plain',
    md: 'text/markdown',
    json: 'application/json',
    csv: 'text/csv',
    zip: 'application/zip',
    py: 'text/x-python',
    js: 'text/javascript',
    ts: 'text/typescript',
    html: 'text/html',
    css: 'text/css',
    c: 'text/x-c',
    cpp: 'text/x-c++',
    java: 'text/x-java',
    rs: 'text/rust',
    go: 'text/x-go',
    sql: 'text/x-sql',
    sh: 'text/x-sh',
    bat: 'text/plain',
    ps1: 'text/plain',
  }
  return map[ext] || 'application/octet-stream'
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const rawParentId = formData.get('parentId') as string | null
  const parentId = (rawParentId === 'root' || rawParentId === 'null' || rawParentId === '' || !rawParentId) ? null : rawParentId

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const mimeType = getMimeType(file.name, file.type)

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      if (isGuest) {
        const base64 = buffer.toString('base64')
        const dataUrl = `data:${mimeType};base64,${base64}`
        const guestItem = addGuestFile(file.name, parentId, file.size, mimeType, dataUrl)
        return NextResponse.json(guestItem, { status: 201 })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build storage path
    const ext = file.name.includes('.') ? file.name.split('.').pop() : ''
    const storageKey = `${user.id}/${uuid()}${ext ? `.${ext}` : ''}`
    let finalStoragePath = storageKey

    const { error: uploadError } = await supabase.storage
      .from('user-files')
      .upload(storageKey, buffer, {
        contentType: mimeType,
        upsert: true,
      })

    if (uploadError) {
      console.warn('Supabase storage upload fallback to data URL:', uploadError.message)
      const base64 = buffer.toString('base64')
      finalStoragePath = `data:${mimeType};base64,${base64}`
    }

    const { data, error } = await supabase
      .from('filesystem')
      .insert({
        user_id: user.id,
        parent_id: parentId,
        name: file.name,
        type: 'file',
        mime_type: mimeType,
        size: file.size,
        storage_path: finalStoragePath,
        is_deleted: false,
      })
      .select()
      .single()

    if (error) {
      if (finalStoragePath === storageKey) {
        await supabase.storage.from('user-files').remove([storageKey])
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    if (isGuest) {
      const base64 = buffer.toString('base64')
      const dataUrl = `data:${mimeType};base64,${base64}`
      const guestItem = addGuestFile(file.name, parentId, file.size, mimeType, dataUrl)
      return NextResponse.json(guestItem, { status: 201 })
    }
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
