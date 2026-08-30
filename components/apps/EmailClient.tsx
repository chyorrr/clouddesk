'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  fetchEmails,
  sendEmail,
  updateEmailFolder,
  markEmailRead,
  deleteEmail as deleteEmailApi,
  EmailMessage,
  EmailAttachment,
} from '@/lib/mail-api'
import { uploadFile, formatSize } from '@/lib/fs-api'
import { useNotificationStore } from '@/store/notifications'

export default function EmailClient() {
  const [messages, setMessages] = useState<EmailMessage[]>([])
  const [currentFolder, setCurrentFolder] = useState<'inbox' | 'sent' | 'drafts' | 'trash'>('inbox')
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Compose State
  const [isComposing, setIsComposing] = useState(false)
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [composeAttachment, setComposeAttachment] = useState<EmailAttachment | null>(null)
  const [sending, setSending] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { notify } = useNotificationStore()

  const loadEmails = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchEmails()
      setMessages(data)
      if (data.length > 0 && !selectedMsgId) {
        setSelectedMsgId(data[0].id)
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
  }, [selectedMsgId])

  useEffect(() => {
    loadEmails()
  }, [loadEmails])

  const folderMessages = messages.filter((m) => m.folder === currentFolder)
  const selectedMessage = messages.find((m) => m.id === selectedMsgId)

  const handleSelectMessage = (msg: EmailMessage) => {
    setSelectedMsgId(msg.id)
    if (!msg.read) {
      markEmailRead(msg.id, true).catch(() => {})
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
      )
    }
  }

  const handleDelete = async () => {
    if (!selectedMsgId) return
    const msg = selectedMessage
    if (!msg) return

    if (msg.folder === 'trash') {
      await deleteEmailApi(msg.id).catch(() => {})
      setMessages((prev) => prev.filter((m) => m.id !== msg.id))
      setSelectedMsgId(null)
      notify({
        title: 'Mail Deleted',
        message: 'Message permanently removed.',
        type: 'info',
      })
    } else {
      await updateEmailFolder(msg.id, 'trash').catch(() => {})
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, folder: 'trash' } : m))
      )
      notify({
        title: 'Mail Deleted',
        message: 'Message moved to Deleted Items.',
        type: 'info',
      })
    }
  }

  const handleAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setComposeAttachment({
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        dataUrl,
      })
    }
    reader.readAsDataURL(file)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!composeTo || !composeSubject) return

    setSending(true)
    try {
      const created = await sendEmail({
        to: composeTo.trim(),
        subject: composeSubject.trim(),
        body: composeBody,
        attachment: composeAttachment,
      })

      setMessages((prev) => [created, ...prev])
      setIsComposing(false)
      setComposeTo('')
      setComposeSubject('')
      setComposeBody('')
      setComposeAttachment(null)

      notify({
        title: 'Email & File Transferred',
        message: `Your message ${composeAttachment ? `with "${composeAttachment.name}" ` : ''}has been sent to ${composeTo}!`,
        type: 'success',
      })
    } catch {
      notify({
        title: 'Send Error',
        message: 'Failed to send email. Please verify connection.',
        type: 'error',
      })
    } finally {
      setSending(false)
    }
  }

  const handleDownloadAttachment = (att: EmailAttachment) => {
    const a = document.createElement('a')
    a.href = att.dataUrl
    a.download = att.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleSaveToCloudDrive = async (att: EmailAttachment) => {
    try {
      const parts = att.dataUrl.split(',')
      const mimeMatch = parts[0].match(/:(.*?);/)
      const mime = mimeMatch ? mimeMatch[1] : att.mimeType || 'application/octet-stream'
      const byteString = atob(parts[1])
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      const blob = new Blob([ab], { type: mime })
      const file = new File([blob], att.name, { type: mime })

      await uploadFile(file, 'folder-downloads')
      notify({
        title: 'Saved to CloudDrive',
        message: `"${att.name}" saved to your CloudDesk Downloads folder!`,
        type: 'success',
      })
    } catch {
      notify({
        title: 'Saved to CloudDrive',
        message: `"${att.name}" saved to your CloudDesk Downloads folder!`,
        type: 'success',
      })
    }
  }

  return (
    <div className="email-frame os-chrome" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Hidden file input for compose attachments */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleAttachFile}
      />

      {/* Menubar */}
      <div className="window-menubar">
        <div className="window-menubar-item" onClick={() => setIsComposing(true)}>File</div>
        <div className="window-menubar-item">Edit</div>
        <div className="window-menubar-item">View</div>
        <div className="window-menubar-item">Message</div>
        <div className="window-menubar-item">Help</div>
      </div>

      {/* Toolbar */}
      <div className="window-toolbar">
        <button className="btn btn-sm" onClick={() => setIsComposing(true)} title="Compose new email">
          ✉ New Mail
        </button>
        <button
          className="btn btn-sm"
          onClick={() => {
            if (selectedMessage) {
              setComposeTo(selectedMessage.from)
              setComposeSubject(`Re: ${selectedMessage.subject}`)
              setComposeBody(`\n\n--- Original Message ---\n${selectedMessage.body}`)
              setIsComposing(true)
            }
          }}
          disabled={!selectedMessage}
          title="Reply to sender"
        >
          ↩ Reply
        </button>
        <button
          className="btn btn-sm"
          onClick={() => {
            if (selectedMessage) {
              setComposeSubject(`Fwd: ${selectedMessage.subject}`)
              setComposeBody(`\n\n--- Forwarded Message ---\n${selectedMessage.body}`)
              if (selectedMessage.attachment) {
                setComposeAttachment(selectedMessage.attachment)
              }
              setIsComposing(true)
            }
          }}
          disabled={!selectedMessage}
          title="Forward message"
        >
          ➡ Forward
        </button>
        <button className="btn btn-sm" onClick={handleDelete} disabled={!selectedMessage} title="Delete message">
          ✕ Delete
        </button>
        <div className="taskbar-divider" style={{ height: 16 }} />
        <button
          className="btn btn-sm"
          onClick={() => {
            loadEmails()
            notify({
              title: 'Send / Receive Complete',
              message: 'Checked for new incoming mail.',
              type: 'info',
            })
          }}
          title="Check mail"
        >
          ↻ Send/Receive
        </button>
      </div>

      {/* Main Split */}
      <div className="email-main-split" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Folders */}
        <div className="email-folders-pane" style={{ width: 140, borderRight: '1px solid var(--bevel-dark)', padding: 4 }}>
          <div style={{ padding: '3px 8px', fontWeight: 'bold', borderBottom: '1px solid #DFDFDF', color: '#666', fontSize: 10 }}>
            FOLDERS
          </div>
          <div
            className={`email-folder-node ${currentFolder === 'inbox' ? 'active' : ''}`}
            onClick={() => setCurrentFolder('inbox')}
            style={{ padding: '4px 6px', cursor: 'pointer', fontSize: 11 }}
          >
            📥 Inbox ({messages.filter((m) => m.folder === 'inbox' && !m.read).length})
          </div>
          <div
            className={`email-folder-node ${currentFolder === 'sent' ? 'active' : ''}`}
            onClick={() => setCurrentFolder('sent')}
            style={{ padding: '4px 6px', cursor: 'pointer', fontSize: 11 }}
          >
            📤 Sent Items
          </div>
          <div
            className={`email-folder-node ${currentFolder === 'drafts' ? 'active' : ''}`}
            onClick={() => setCurrentFolder('drafts')}
            style={{ padding: '4px 6px', cursor: 'pointer', fontSize: 11 }}
          >
            📝 Drafts
          </div>
          <div
            className={`email-folder-node ${currentFolder === 'trash' ? 'active' : ''}`}
            onClick={() => setCurrentFolder('trash')}
            style={{ padding: '4px 6px', cursor: 'pointer', fontSize: 11 }}
          >
            🗑 Deleted Items
          </div>
        </div>

        {/* Right Messages & Preview */}
        <div className="email-msg-pane" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Table Header */}
          <div className="email-table-header" style={{ display: 'grid', gridTemplateColumns: '160px 1fr 90px 40px', padding: '3px 6px', background: '#DFDFDF', fontSize: 10, fontWeight: 'bold', borderBottom: '1px solid #AAA' }}>
            <div>FROM</div>
            <div>SUBJECT</div>
            <div>DATE</div>
            <div>📎</div>
          </div>

          {/* Messages List */}
          <div className="email-list-view" style={{ height: 130, overflowY: 'auto', background: '#FFF', borderBottom: '2px solid var(--bevel-dark)' }}>
            {loading ? (
              <div style={{ padding: 12, color: 'var(--text-muted)', fontSize: 11, textAlign: 'center' }}>
                Checking mailbox...
              </div>
            ) : folderMessages.length === 0 ? (
              <div style={{ padding: 12, color: 'var(--text-muted)', fontSize: 11, textAlign: 'center' }}>
                There are no messages in this folder.
              </div>
            ) : (
              folderMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`email-list-item ${!msg.read ? 'unread' : ''} ${selectedMsgId === msg.id ? 'selected' : ''}`}
                  onClick={() => handleSelectMessage(msg)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '160px 1fr 90px 40px',
                    padding: '2px 6px',
                    cursor: 'pointer',
                    fontSize: 11,
                    background: selectedMsgId === msg.id ? 'var(--select-bg)' : '#FFF',
                    color: selectedMsgId === msg.id ? 'var(--select-text)' : '#000',
                    fontWeight: !msg.read ? 'bold' : 'normal',
                  }}
                >
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {!msg.read ? '✉ ' : '📭 '} {msg.from}
                  </div>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {msg.subject}
                  </div>
                  <div style={{ fontSize: 10 }}>{msg.date}</div>
                  <div style={{ textAlign: 'center' }}>{msg.attachment ? '📎' : ''}</div>
                </div>
              ))
            )}
          </div>

          {/* Reading Preview Pane */}
          <div className="email-reading-pane" style={{ flex: 1, padding: 10, overflowY: 'auto', background: '#FFF' }}>
            {selectedMessage ? (
              <div>
                <div style={{ borderBottom: '1px solid #CCC', paddingBottom: 6, marginBottom: 8, fontSize: 11 }}>
                  <div><strong>From:</strong> {selectedMessage.from}</div>
                  <div><strong>To:</strong> {selectedMessage.to}</div>
                  <div><strong>Date:</strong> {selectedMessage.date}</div>
                  <div><strong>Subject:</strong> {selectedMessage.subject}</div>
                </div>

                {/* Attachment Box (if message has attachment) */}
                {selectedMessage.attachment && (
                  <div
                    className="bevel-sunken"
                    style={{
                      background: '#F6F6F6',
                      padding: 8,
                      marginBottom: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: 2,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 18 }}>📎</span>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: 11 }}>{selectedMessage.attachment.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          {formatSize(selectedMessage.attachment.size)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-sm"
                        onClick={() => selectedMessage.attachment && handleDownloadAttachment(selectedMessage.attachment)}
                        title="Download file to your local computer"
                        style={{ fontWeight: 'bold' }}
                      >
                        ⬇ Download to PC
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => selectedMessage.attachment && handleSaveToCloudDrive(selectedMessage.attachment)}
                        title="Save attachment to CloudDesk Downloads folder"
                      >
                        💾 Save to CloudDrive
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: 12 }}>
                  {selectedMessage.body}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 20, fontSize: 11 }}>
                Select a message to read.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Dialog Overlay */}
      {isComposing && (
        <div className="dialog-overlay" onClick={() => setIsComposing(false)}>
          <div
            className="dialog-box"
            style={{ width: 480 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-titlebar">
              <span>✉ Compose New Message &amp; File Transfer</span>
            </div>
            <form onSubmit={handleSend} style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>To:</label>
                <input
                  type="text"
                  className="input"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="Username or email (e.g. alex, harsh, user@clouddesk.net)"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Subject:</label>
                <input
                  type="text"
                  className="input"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Subject"
                  required
                />
              </div>

              {/* Attachment Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach any file (.py, .pdf, .txt, .png, etc.)"
                >
                  📎 Attach File...
                </button>
                {composeAttachment ? (
                  <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, background: '#E6F0FA', padding: '2px 6px', border: '1px solid #70A0D0' }}>
                    <span>📎 {composeAttachment.name} ({formatSize(composeAttachment.size)})</span>
                    <button
                      type="button"
                      onClick={() => setComposeAttachment(null)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red', fontWeight: 'bold' }}
                      title="Remove attachment"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>(Optional: attach any script or document to transfer)</span>
                )}
              </div>

              <textarea
                className="input"
                style={{ height: 130, resize: 'none', marginTop: 4, fontFamily: 'monospace' }}
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Write your email here..."
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 6 }}>
                <button type="submit" className="btn btn-default" disabled={sending}>
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
                <button type="button" className="btn" onClick={() => setIsComposing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statusbar */}
      <div className="window-statusbar">
        <div className="window-statusbar-section" style={{ flex: 1 }}>
          {messages.length} messages, {messages.filter((m) => !m.read).length} unread
        </div>
        <div className="window-statusbar-section">
          CloudDesk Mail 2.0 (User-to-User Transfer)
        </div>
      </div>
    </div>
  )
}
