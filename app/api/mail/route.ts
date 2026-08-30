import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getGuestEmails, addGuestEmail } from '@/lib/guest-mail'
import { EmailMessage } from '@/lib/mail-api'

function getAdminClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    )
  }
  return null
}

async function resolveRecipientId(
  adminClient: ReturnType<typeof getAdminClient>,
  userClient: any,
  cleanAddress: string
): Promise<string | null> {
  const prefix = cleanAddress.split('@')[0]
  const client = adminClient || userClient

  // 1. Try RPC function
  try {
    const { data: rpcId } = await client.rpc('get_user_id_by_address', { target_address: cleanAddress })
    if (rpcId) return rpcId
  } catch {}

  // 2. Try user_settings table
  try {
    const { data: row } = await client
      .from('user_settings')
      .select('user_id')
      .or(`email.ilike.${cleanAddress},username.ilike.${prefix},username.ilike.${cleanAddress}`)
      .limit(1)
      .maybeSingle()
    if (row?.user_id) return row.user_id
  } catch {}

  // 3. Try auth.admin.listUsers with service role
  if (adminClient) {
    try {
      const { data: { users } } = await adminClient.auth.admin.listUsers()
      if (users && users.length > 0) {
        const matched = users.find((u) => {
          const uEmail = u.email?.toLowerCase() || ''
          const uName = (u.user_metadata?.username as string)?.toLowerCase() || ''
          const uPrefix = uEmail.split('@')[0]
          return (
            uEmail === cleanAddress ||
            uName === prefix ||
            uName === cleanAddress ||
            uPrefix === prefix
          )
        })
        if (matched) return matched.id
      }
    } catch {}
  }

  return null
}

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
    const adminClient = getAdminClient()

    const senderAddress = user?.email || 'user@clouddesk.net'

    if (!user) {
      if (isGuest) {
        const sent = addGuestEmail(senderAddress, to, subject, msgBody || '', attachment)
        return NextResponse.json(sent, { status: 201 })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Insert into sender's 'sent' folder
    const dbClient = adminClient || supabase
    const { data: sentRow, error: sentError } = await dbClient
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
      console.error('Failed to save to sent folder:', sentError)
      const sent = addGuestEmail(senderAddress, to, subject, msgBody || '', attachment)
      return NextResponse.json(sent, { status: 201 })
    }

    // 2. Resolve recipient user ID
    const cleanTo = to.toLowerCase().trim()
    const recipientUserId = await resolveRecipientId(adminClient, supabase, cleanTo)

    // 3. Deliver to recipient's inbox
    if (recipientUserId && recipientUserId !== user.id) {
      const { error: inboxError } = await dbClient.from('emails').insert({
        user_id: recipientUserId,
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

      if (inboxError) {
        console.error('Failed to deliver email to recipient inbox:', inboxError)
      } else {
        console.log(`Successfully delivered email to user ${recipientUserId}`)
      }
    } else {
      console.warn(`Could not find recipient matching "${to}"`)
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
  } catch (err) {
    console.error('Mail POST exception:', err)
    const sent = addGuestEmail('user@clouddesk.net', to, subject, msgBody || '', attachment)
    return NextResponse.json(sent, { status: 201 })
  }
}
