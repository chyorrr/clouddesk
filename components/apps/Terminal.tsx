'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { listFolder, createFolder, deleteItem, uploadFile, getFileContent, renameItem } from '@/lib/fs-api'
import { FsItem } from '@/store/filesystem'
import { AppId, useWindowStore } from '@/store/windows'

interface TerminalProps {
  onLaunchApp?: (appId: AppId, data?: Record<string, unknown>) => void
  onClose?: () => void
}

interface HistoryItem {
  id: string
  command?: string
  output?: React.ReactNode
  path: string
}

export default function Terminal({ onLaunchApp, onClose }: TerminalProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState<string>('C:\\')
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 'init-1',
      output: (
        <div>
          <div>CloudDesk Personal Computer (TM)</div>
          <div>MS-DOS Version 6.22 (CloudDesk Emulation 2.0)</div>
          <div>(C)Copyright Microsoft Corp 1981-1994. All rights reserved.</div>
          <div style={{ marginTop: 6, color: '#A0A0A0' }}>
            Type <span style={{ color: '#FFF' }}>HELP</span> for a list of available commands.
          </div>
          <div style={{ marginBottom: 6 }} />
        </div>
      ),
      path: 'C:\\',
    },
  ])
  const [inputVal, setInputVal] = useState('')
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState<number>(-1)
  const [textColor, setTextColor] = useState('#00FF66') // Matrix green default
  const [bgColor, setBgColor] = useState('#0C0C0C')

  const inputRef = useRef<HTMLInputElement>(null)
  const terminalEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const focusInput = () => {
    inputRef.current?.focus()
  }

  const executeCommand = async (rawCmd: string) => {
    const trimmed = rawCmd.trim()
    const parts = trimmed.split(/\s+/)
    const cmd = parts[0]?.toLowerCase() || ''
    const args = parts.slice(1)

    if (trimmed) {
      setCmdHistory(prev => [...prev, trimmed])
      setHistoryIdx(-1)
    }

    const currentPromptPath = currentPath

    if (!cmd) {
      setHistory(prev => [
        ...prev,
        { id: String(Date.now()), command: '', path: currentPromptPath },
      ])
      return
    }

    let outputContent: React.ReactNode = null

    switch (cmd) {
      case 'cls':
      case 'clear':
        setHistory([])
        return

      case 'ver':
        outputContent = <div>CloudDesk Personal Computer OS [Version 2.0.2400]</div>
        break

      case 'help':
        outputContent = (
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '2px 12px' }}>
            <span style={{ color: '#FFFF00' }}>DIR, LS</span><span>List files and directories in current folder</span>
            <span style={{ color: '#FFFF00' }}>CD &lt;dir&gt;</span><span>Change current directory (e.g. CD Documents, CD ..)</span>
            <span style={{ color: '#FFFF00' }}>MKDIR, MD</span><span>Create a new directory (e.g. MKDIR MyFolder)</span>
            <span style={{ color: '#FFFF00' }}>TYPE, CAT</span><span>Display contents of a text file</span>
            <span style={{ color: '#FFFF00' }}>ECHO &gt;</span><span>Write text into a file (e.g. ECHO hello &gt; note.txt)</span>
            <span style={{ color: '#FFFF00' }}>DEL, RM</span><span>Delete a file</span>
            <span style={{ color: '#FFFF00' }}>CLS, CLEAR</span><span>Clear screen</span>
            <span style={{ color: '#FFFF00' }}>VER</span><span>Display OS version</span>
            <span style={{ color: '#FFFF00' }}>DATE, TIME</span><span>Display current date and time</span>
            <span style={{ color: '#FFFF00' }}>COLOR &lt;c&gt;</span><span>Change text color (green, amber, cyan, white)</span>
            <span style={{ color: '#FFFF00' }}>CALC, PAINT</span><span>Launch Calculator, Paint</span>
            <span style={{ color: '#FFFF00' }}>NOTEPAD</span><span>Launch Notepad text editor</span>
            <span style={{ color: '#FFFF00' }}>BROWSER</span><span>Launch Web Browser</span>
            <span style={{ color: '#FFFF00' }}>EXIT</span><span>Close terminal window</span>
          </div>
        )
        break

      case 'date':
        outputContent = <div>Current date is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        break

      case 'time':
        outputContent = <div>Current time is {new Date().toLocaleTimeString()}</div>
        break

      case 'color': {
        const c = args[0]?.toLowerCase()
        if (c === 'green' || c === '0a') setTextColor('#00FF66')
        else if (c === 'amber' || c === '06' || c === 'yellow') setTextColor('#FFB000')
        else if (c === 'cyan' || c === '0b' || c === 'blue') setTextColor('#00E5FF')
        else if (c === 'white' || c === '07') setTextColor('#FFFFFF')
        else outputContent = <div>Valid colors: green, amber, cyan, white</div>
        break
      }

      case 'dir':
      case 'ls': {
        try {
          const items = await listFolder(currentFolderId)
          let totalBytes = 0
          let fileCount = 0
          let dirCount = 0

          const rows = items.map((item) => {
            const dateStr = new Date(item.created_at).toLocaleDateString()
            const timeStr = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            const isDir = item.type === 'folder'
            if (isDir) dirCount++
            else {
              fileCount++
              totalBytes += item.size || 0
            }

            return (
              <div key={item.id} style={{ display: 'flex', gap: 14 }}>
                <span style={{ width: 85 }}>{dateStr}</span>
                <span style={{ width: 70 }}>{timeStr}</span>
                <span style={{ width: 70, color: isDir ? '#FFFF77' : '#FFFFFF' }}>{isDir ? '<DIR>' : (item.size || 0).toLocaleString()}</span>
                <span style={{ fontWeight: isDir ? 'bold' : 'normal' }}>{item.name}</span>
              </div>
            )
          })

          outputContent = (
            <div>
              <div> Volume in drive C has no label.</div>
              <div> Volume Serial Number is 1337-4200</div>
              <div> Directory of {currentPath}</div>
              <div style={{ marginTop: 4, marginBottom: 4 }}>
                {rows.length === 0 ? <div style={{ color: '#888' }}>(Directory is empty)</div> : rows}
              </div>
              <div>{fileCount} File(s)  {totalBytes.toLocaleString()} bytes</div>
              <div>{dirCount} Dir(s)   10,737,418,240 bytes free</div>
            </div>
          )
        } catch {
          outputContent = <div style={{ color: '#FF5555' }}>Error reading directory.</div>
        }
        break
      }

      case 'cd': {
        const target = args[0]
        if (!target || target === '.') {
          outputContent = <div>{currentPath}</div>
        } else if (target === '..' || target === '\\') {
          setCurrentFolderId(null)
          setCurrentPath('C:\\')
        } else {
          try {
            const items = await listFolder(currentFolderId)
            const found = items.find(
              i => i.type === 'folder' && i.name.toLowerCase() === target.toLowerCase()
            )
            if (found) {
              setCurrentFolderId(found.id)
              setCurrentPath(`C:\\${found.name}`)
            } else {
              outputContent = <div style={{ color: '#FF5555' }}>The system cannot find the path specified.</div>
            }
          } catch {
            outputContent = <div style={{ color: '#FF5555' }}>Error changing directory.</div>
          }
        }
        break
      }

      case 'mkdir':
      case 'md': {
        const folderName = args[0]
        if (!folderName) {
          outputContent = <div>The syntax of the command is incorrect. Usage: MKDIR &lt;folder_name&gt;</div>
        } else {
          try {
            await createFolder(folderName, currentFolderId)
            outputContent = <div>Directory created: {folderName}</div>
          } catch {
            outputContent = <div style={{ color: '#FF5555' }}>A subdirectory or file {folderName} already exists.</div>
          }
        }
        break
      }

      case 'type':
      case 'cat': {
        const filename = args[0]
        if (!filename) {
          outputContent = <div>Usage: TYPE &lt;filename&gt;</div>
        } else {
          try {
            const items = await listFolder(currentFolderId)
            const found = items.find(
              i => i.type === 'file' && i.name.toLowerCase() === filename.toLowerCase()
            )
            if (found) {
              if (found.storage_path) {
                const text = await getFileContent(found.id)
                outputContent = <pre style={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{text || '(empty file)'}</pre>
              } else {
                outputContent = <div>(File has no text content)</div>
              }
            } else {
              outputContent = <div style={{ color: '#FF5555' }}>The system cannot find the file specified.</div>
            }
          } catch {
            outputContent = <div style={{ color: '#FF5555' }}>Error reading file.</div>
          }
        }
        break
      }

      case 'calc':
      case 'calculator':
        onLaunchApp?.('calculator')
        outputContent = <div>Starting Calculator...</div>
        break

      case 'paint':
      case 'mspaint':
        onLaunchApp?.('paint')
        outputContent = <div>Starting Paint...</div>
        break

      case 'notepad':
        onLaunchApp?.('notepad')
        outputContent = <div>Starting Notepad...</div>
        break

      case 'browser':
      case 'iexplore':
        onLaunchApp?.('browser')
        outputContent = <div>Starting Internet Explorer...</div>
        break

      case 'mail':
      case 'email':
        onLaunchApp?.('email')
        outputContent = <div>Starting CloudDesk Mail...</div>
        break

      case 'media':
      case 'mplayer':
        onLaunchApp?.('media-player')
        outputContent = <div>Starting Media Player...</div>
        break

      case 'del':
      case 'rm': {
        const filename = args[0]
        if (!filename) {
          outputContent = <div>Usage: DEL &lt;filename&gt;</div>
        } else {
          try {
            const items = await listFolder(currentFolderId)
            const found = items.find(i => i.name.toLowerCase() === filename.toLowerCase())
            if (found) {
              await deleteItem(found.id)
              outputContent = <div>{filename} deleted.</div>
            } else {
              outputContent = <div style={{ color: '#FF5555' }}>Could not find file: {filename}</div>
            }
          } catch {
            outputContent = <div style={{ color: '#FF5555' }}>Error deleting file.</div>
          }
        }
        break
      }

      case 'ren':
      case 'rename': {
        const oldName = args[0]
        const newName = args[1]
        if (!oldName || !newName) {
          outputContent = <div>Usage: REN &lt;oldname&gt; &lt;newname&gt;</div>
        } else {
          try {
            const items = await listFolder(currentFolderId)
            const found = items.find(i => i.name.toLowerCase() === oldName.toLowerCase())
            if (found) {
              await renameItem(found.id, newName)
              outputContent = <div>File renamed from {oldName} to {newName}.</div>
            } else {
              outputContent = <div style={{ color: '#FF5555' }}>Could not find file: {oldName}</div>
            }
          } catch {
            outputContent = <div style={{ color: '#FF5555' }}>Error renaming file.</div>
          }
        }
        break
      }

      case 'ipconfig': {
        outputContent = (
          <div style={{ lineHeight: 1.8 }}>
            <div>Windows IP Configuration</div>
            <div style={{ marginTop: 6 }}>Ethernet adapter CloudDesk Virtual LAN:</div>
            <div style={{ paddingLeft: 16 }}>Connection-specific DNS Suffix: clouddesk.local</div>
            <div style={{ paddingLeft: 16 }}>IP Address. . . . . . . . . : 10.0.0.{Math.floor(Math.random() * 254) + 1}</div>
            <div style={{ paddingLeft: 16 }}>Subnet Mask . . . . . . . . : 255.255.255.0</div>
            <div style={{ paddingLeft: 16 }}>Default Gateway . . . . . . : 10.0.0.1</div>
            <div style={{ marginTop: 6 }}>C:\&gt; Connection to cloud storage: <span style={{ color: '#00FF66' }}>ACTIVE</span></div>
          </div>
        )
        break
      }

      case 'ping': {
        const host = args[0] || 'clouddesk.local'
        outputContent = (
          <div style={{ lineHeight: 1.8 }}>
            <div>Pinging {host} with 32 bytes of data:</div>
            <div>Reply from 10.0.0.1: bytes=32 time=1ms TTL=128</div>
            <div>Reply from 10.0.0.1: bytes=32 time=1ms TTL=128</div>
            <div>Reply from 10.0.0.1: bytes=32 time=1ms TTL=128</div>
            <div>Reply from 10.0.0.1: bytes=32 time=1ms TTL=128</div>
            <div style={{ marginTop: 6 }}>Ping statistics for {host}:</div>
            <div style={{ paddingLeft: 16 }}>Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)</div>
          </div>
        )
        break
      }

      case 'systeminfo': {
        outputContent = (
          <div style={{ lineHeight: 1.8 }}>
            <div>Host Name:       CLOUDDESK-PC</div>
            <div>OS Name:         CloudDesk PC OS Version 2.0 (MS-DOS 6.22 Compatible)</div>
            <div>OS Version:      2.0.2400 Build 2400</div>
            <div>Processor:       CloudDesk Virtual x86 CPU @ 3.40GHz</div>
            <div>Total RAM:       640 KB (conventional) + unlimited cloud</div>
            <div>Storage:         1 GB Cloud Object Storage (Supabase)</div>
            <div>Network:         CloudDesk Virtual LAN, 1 Gbps</div>
          </div>
        )
        break
      }

      case 'exit':
        onClose?.()
        return

      default:
        outputContent = (
          <div style={{ color: '#FF5555' }}>
            &apos;{cmd}&apos; is not recognized as an internal or external command, operable program or batch file.
          </div>
        )
    }

    setHistory(prev => [
      ...prev,
      {
        id: String(Date.now()),
        command: rawCmd,
        output: outputContent,
        path: currentPromptPath,
      },
    ])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal)
      setInputVal('')
    } else if (e.key === 'ArrowUp') {
      if (cmdHistory.length > 0) {
        const nextIdx = historyIdx + 1 < cmdHistory.length ? historyIdx + 1 : historyIdx
        setHistoryIdx(nextIdx)
        setInputVal(cmdHistory[cmdHistory.length - 1 - nextIdx] || '')
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1
        setHistoryIdx(nextIdx)
        setInputVal(cmdHistory[cmdHistory.length - 1 - nextIdx] || '')
      } else {
        setHistoryIdx(-1)
        setInputVal('')
      }
    }
  }

  return (
    <div
      onClick={focusInput}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: 13,
        padding: '8px 12px',
        overflowY: 'auto',
        cursor: 'text',
        userSelect: 'text',
        lineHeight: 1.35,
        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.8)',
      }}
    >
      {history.map(item => (
        <div key={item.id} style={{ marginBottom: 4 }}>
          {item.command !== undefined && (
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{item.path}&gt;</span>
              <span>{item.command}</span>
            </div>
          )}
          {item.output && <div style={{ marginTop: 2 }}>{item.output}</div>}
        </div>
      ))}

      {/* Active input line */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{currentPath}&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: textColor,
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 13,
            padding: 0,
            caretColor: textColor,
          }}
        />
      </div>
      <div ref={terminalEndRef} />
    </div>
  )
}
