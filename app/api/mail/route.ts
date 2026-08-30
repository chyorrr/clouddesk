import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getGuestEmails, addGuestEmail } from '@/lib/guest-mail'
import { EmailMessage } from '@/lib/mail-api'

export async function GET() {
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      if (isGuest) {
        return NextResponse.json(getGuestEmails())
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(getGuestEmails())
    }

    interface EmailDbRow {
      id: string
      folder: 'inbox' | 'sent' | 'drafts' | 'trash'
      from_address: string
      to_address: string
      subject: string
      body: string
      read: boolean
      attachment_name?: string | null
      attachment_size?: number | null
      attachment_mime?: string | null
      attachment_data?: string | null
      created_at: string
    }

    const mapped: EmailMessage[] = ((data || []) as EmailDbRow[]).map((row) => ({
      id: row.id,
      folder: row.folder,
      from: row.from_address,
      to: row.to_address,
      subject: row.subject,
      body: row.body,
      date: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      read: row.read,
      attachment: row.attachment_name
        ? {
            name: row.attachment_name,
            size: row.attachment_size || 0,
            mimeType: row.attachment_mime || 'application/octet-stream',
            dataUrl: row.attachment_data || '',
          }
        : null,
    }))

    return NextResponse.json(mapped)
  } catch {
    return NextResponse.json(getGuestEmails())
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('clouddesk_guest')?.value === '1'
  const body = await request.json()
  const { to, subject, body: msgBody, attachment } = body

  if (!to || !subject) {
    return NextResponse.json({ error: 'Recipient and Subject are required' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const senderAddress = user?.email || 'user@clouddesk.net'

    if (!user) {
      if (isGuest) {
        const sent = addGuestEmail(senderAddress, to, subject, msgBody || '', attachment)
        return NextResponse.json(sent, { status: 201 })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Insert into sender's 'sent' folder
    const { data: sentRow, error: sentError } = await supabase
      .from('emails')
      .insert({
        user_id: user.id,
        folder: 'sent',
        from_address: senderAddress,
        to_address: to,
        subject,
        body: msgBody || '',
        read: true,
        attachment_name: attachment?.name || null,
        attachment_size: attachment?.size || null,
        attachment_mime: attachment?.mimeType || null,
        attachment_data: attachment?.dataUrl || null,
      })
      .select()
      .single()

    if (sentError) {
      const sent = addGuestEmail(senderAddress, to, subject, msgBody || '', attachment)
      return NextResponse.json(sent, { status: 201 })
    }

    // 2. Deliver to recipient inbox
    // Check if recipient is a registered user
    const cleanTo = to.toLowerCase().trim()
    const { data: recipientUser } = await supabase
      .from('filesystem')
      .select('user_id')
      .limit(1)

    if (recipientUser?.user_id) {
      // Store in recipient's inbox
      await supabase.from('emails').insert({
        user_id: recipientUser.user_id,
        folder: 'inbox',
        from_address: senderAddress,
        to_address: to,
        subject,
        body: msgBody || '',
        read: false,
        attachment_name: attachment?.name || null,
        attachment_size: attachment?.size || null,
        attachment_mime: attachment?.mimeType || null,
        attachment_data: attachment?.dataUrl || null,
      })
    }

    const createdMsg: EmailMessage = {
      id: sentRow.id,
      folder: 'sent',
      from: senderAddress,
      to,
      subject,
      body: msgBody || '',
      date: 'Just now',
      read: true,
      attachment: attachment || null,
    }

    return NextResponse.json(createdMsg, { status: 201 })
  } catch {
    const sent = addGuestEmail('user@clouddesk.net', to, subject, msgBody || '', attachment)
    return NextResponse.json(sent, { status: 201 })
  }
}
