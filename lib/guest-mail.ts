import { EmailMessage, EmailAttachment } from './mail-api'

const DEFAULT_GUEST_EMAILS: EmailMessage[] = [
  {
    id: 'msg-welcome',
    folder: 'inbox',
    from: 'admin@clouddesk.net',
    to: 'user@clouddesk.net',
    subject: 'Welcome to CloudDesk Mail & File Transfer',
    date: 'Aug 30, 2026',
    read: false,
    body: `Hello and welcome to CloudDesk Mail!

You can now compose emails and attach files (Python scripts, documents, pictures, audio, etc.) to transfer them username-to-username across any computer in the cloud.

Try creating a new email, clicking "📎 Attach File", and sending it to another username.

Regards,
CloudDesk System Administrator`,
    attachment: {
      name: 'Welcome_Package.txt',
      size: 512,
      mimeType: 'text/plain',
      dataUrl: 'data:text/plain;charset=utf-8;base64,' + Buffer.from('Welcome to CloudDesk File Transfer System!\nAttached files can be saved directly to your CloudDrive or downloaded to your PC.').toString('base64'),
    },
  },
  {
    id: 'msg-tips',
    folder: 'inbox',
    from: 'alex@clouddesk.net',
    to: 'user@clouddesk.net',
    subject: 'Python file transfer test: script.py',
    date: 'Aug 29, 2026',
    read: true,
    body: `Hey Harsh!

Here is the sample Python script we discussed for automated cloud backups. You can open it in Notepad, copy it to your PC clipboard, or save it directly into your CloudDesk Documents folder.

Let me know what you think!`,
    attachment: {
      name: 'backup_script.py',
      size: 340,
      mimeType: 'text/x-python',
      dataUrl: 'data:text/plain;charset=utf-8;base64,' + Buffer.from('# CloudDesk Sample Python Backup Script\nimport os\nimport sys\n\ndef sync_cloud():\n    print("Syncing files to CloudDesk...")\n    print("Status: 100% complete.")\n\nif __name__ == "__main__":\n    sync_cloud()\n').toString('base64'),
    },
  },
]

let guestEmails: EmailMessage[] = [...DEFAULT_GUEST_EMAILS]

export function getGuestEmails(): EmailMessage[] {
  return [...guestEmails]
}

export function addGuestEmail(
  from: string,
  to: string,
  subject: string,
  body: string,
  attachment?: EmailAttachment | null
): EmailMessage {
  const newId = `msg-${Date.now()}`
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  
  const sentMsg: EmailMessage = {
    id: newId,
    folder: 'sent',
    from,
    to,
    subject,
    body,
    date: dateStr,
    read: true,
    attachment: attachment || null,
  }

  // Also simulate delivery to inbox
  const inboxMsg: EmailMessage = {
    id: `msg-${Date.now() + 1}`,
    folder: 'inbox',
    from,
    to,
    subject,
    body,
    date: dateStr,
    read: false,
    attachment: attachment || null,
  }

  guestEmails = [sentMsg, inboxMsg, ...guestEmails]
  return sentMsg
}

export function updateGuestEmail(id: string, updates: Partial<EmailMessage>): void {
  guestEmails = guestEmails.map(m => m.id === id ? { ...m, ...updates } : m)
}

export function deleteGuestEmail(id: string): void {
  guestEmails = guestEmails.filter(m => m.id !== id)
}
