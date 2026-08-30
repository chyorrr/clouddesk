export interface EmailAttachment {
  name: string
  size: number
  mimeType: string
  dataUrl: string
}

export interface EmailMessage {
  id: string
  folder: 'inbox' | 'sent' | 'drafts' | 'trash'
  from: string
  to: string
  subject: string
  body: string
  date: string
  read: boolean
  attachment?: EmailAttachment | null
}

export async function fetchEmails(): Promise<EmailMessage[]> {
  const res = await fetch('/api/mail')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function sendEmail(payload: {
  to: string
  subject: string
  body: string
  attachment?: EmailAttachment | null
}): Promise<EmailMessage> {
  const res = await fetch('/api/mail', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateEmailFolder(id: string, folder: 'inbox' | 'sent' | 'drafts' | 'trash'): Promise<void> {
  await fetch(`/api/mail/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder }),
  })
}

export async function markEmailRead(id: string, read: boolean = true): Promise<void> {
  await fetch(`/api/mail/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ read }),
  })
}

export async function deleteEmail(id: string): Promise<void> {
  await fetch(`/api/mail/${id}`, {
    method: 'DELETE',
  })
}
