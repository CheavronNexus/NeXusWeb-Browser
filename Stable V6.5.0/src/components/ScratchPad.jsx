import React, { useEffect, useState, useCallback, useRef } from 'react'
import { PanelShell } from './PanelShell'
import {
  FileText, Plus, Trash2, Download, Copy, Check, Eye, Edit3, Columns,
  Code, CheckSquare, Clock, Sparkles, Search, Braces, RefreshCw, Hash, List
} from 'lucide-react'

export default function ScratchPad({ onClose, currentUrl, onToast }) {
  // Scopes: 'global' | 'url'
  const [scope, setScope] = useState('global')
  const [activeNoteId, setActiveNoteId] = useState('note-1')
  
  // Note list structure
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_scratchpad_notes_v6')
      return saved ? JSON.parse(saved) : [
        { id: 'note-1', title: 'General Notes', scope: 'global', content: '# Welcome to NeXusWeb ScratchPad\n\n- [ ] Test local API endpoints\n- [x] Launch NeXusWeb V6\n\n```json\n{\n  "status": "ready",\n  "version": "6.0.0"\n}\n```' },
        { id: 'note-2', title: 'API Endpoints', scope: 'global', content: '## API Specs\n\n- **Base URL**: `http://localhost:5000/api`\n- **Method**: `POST /v1/auth`\n\n```bash\ncurl -X POST http://localhost:5000/api/v1/auth \\\n  -H "Content-Type: application/json" \\\n  -d \'{"user":"admin"}\'\n```' }
      ]
    } catch (e) {
      return [{ id: 'note-1', title: 'General Notes', scope: 'global', content: '' }]
    }
  })

  // View modes: 'edit' | 'preview' | 'split'
  const [viewMode, setViewMode] = useState('edit')
  const [savedStatus, setSavedStatus] = useState('Saved')
  const [copied, setCopied] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const saveTimeoutRef = useRef(null)

  // Current active note
  const currentNote = notes.find(n => n.id === activeNoteId) || notes[0]
  const content = currentNote?.content || ''

  // Sync to backend and localStorage
  const saveNotesState = useCallback((updatedNotes) => {
    setNotes(updatedNotes)
    localStorage.setItem('nexus_scratchpad_notes_v6', JSON.stringify(updatedNotes))
    
    // Also save active note to backend IPC notes store
    const cur = updatedNotes.find(n => n.id === activeNoteId)
    if (cur) {
      const storageKey = cur.scope === 'url' ? (currentUrl || 'global') : `global_${cur.id}`
      window.nexus?.notes?.save?.(storageKey, cur.content).catch(() => {})
    }
  }, [activeNoteId, currentUrl])

  const handleContentChange = (newText) => {
    setSavedStatus('Typing…')
    const updated = notes.map(n => n.id === activeNoteId ? { ...n, content: newText } : n)
    setNotes(updated)

    clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveNotesState(updated)
      setSavedStatus('Saved')
    }, 500)
  }

  // Add new note
  const handleAddNote = () => {
    const newId = `note-${Date.now()}`
    const newTitle = scope === 'url' ? `Page Note ${notes.filter(n => n.scope === 'url').length + 1}` : `Note ${notes.length + 1}`
    const newNote = { id: newId, title: newTitle, scope: scope, content: '' }
    const updated = [...notes, newNote]
    saveNotesState(updated)
    setActiveNoteId(newId)
    onToast?.(`Created "${newTitle}"`, 'success')
  }

  // Delete note
  const handleDeleteNote = (id, e) => {
    e.stopPropagation()
    if (notes.length <= 1) {
      handleContentChange('')
      return
    }
    const updated = notes.filter(n => n.id !== id)
    saveNotesState(updated)
    if (activeNoteId === id) {
      setActiveNoteId(updated[0]?.id || 'note-1')
    }
    onToast?.('Note deleted', 'info')
  }

  // Insert code snippet
  const handleInsertSnippet = (snippet) => {
    const next = content ? `${content}\n\n${snippet}` : snippet
    handleContentChange(next)
    onToast?.('Snippet inserted', 'info')
  }

  // JSON Formatter
  const handleFormatJson = () => {
    try {
      // Find JSON block or entire text
      const trimmed = content.trim()
      const parsed = JSON.parse(trimmed)
      const formatted = JSON.stringify(parsed, null, 2)
      handleContentChange(formatted)
      onToast?.('JSON formatted successfully!', 'success')
    } catch (e) {
      onToast?.('Invalid JSON format: ' + e.message, 'error')
    }
  }

  // Copy Content
  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
    onToast?.('Copied to clipboard ★', 'success')
  }

  // Export File
  const handleExport = (format = 'md') => {
    const blob = new Blob([content], { type: format === 'md' ? 'text/markdown' : 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentNote?.title || 'note'}_${Date.now()}.${format}`
    a.click()
    URL.revokeObjectURL(url)
    onToast?.(`Exported as .${format}`, 'success')
  }

  // Simple Markdown Parser with Checkbox Interaction
  const renderMarkdown = (text) => {
    if (!text) return <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Empty note… start typing!</div>

    const lines = text.split('\n')
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('# ')) return <h1 key={idx} style={{ fontSize: 18, fontWeight: 800, color: '#00d4ff', margin: '10px 0 6px' }}>{line.slice(2)}</h1>
      if (line.startsWith('## ')) return <h2 key={idx} style={{ fontSize: 15, fontWeight: 700, color: '#38bdf8', margin: '8px 0 4px' }}>{line.slice(3)}</h2>
      if (line.startsWith('### ')) return <h3 key={idx} style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', margin: '6px 0 4px' }}>{line.slice(4)}</h3>

      // Interactive Todo Checkboxes: - [ ] or - [x]
      if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
        const isChecked = line.startsWith('- [x] ')
        const taskText = line.slice(6)
        return (
          <div
            key={idx}
            onClick={() => {
              const newLines = [...lines]
              newLines[idx] = isChecked ? `- [ ] ${taskText}` : `- [x] ${taskText}`
              handleContentChange(newLines.join('\n'))
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '3px 0',
              cursor: 'pointer',
              color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: isChecked ? 'line-through' : 'none',
              fontSize: 12,
            }}
          >
            <input
              type="checkbox"
              checked={isChecked}
              readOnly
              style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
            <span>{taskText}</span>
          </div>
        )
      }

      // Bullet points
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '2px 0', fontSize: 12, color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--accent-primary)', marginTop: 2 }}>•</span>
            <span>{line.slice(2)}</span>
          </div>
        )
      }

      // Code blocks (simple formatting)
      if (line.startsWith('```')) {
        return <div key={idx} style={{ fontSize: 10, color: '#38bdf8', fontWeight: 600, marginTop: 4 }}>{line}</div>
      }

      // Empty line
      if (!line.trim()) {
        return <div key={idx} style={{ height: 6 }} />
      }

      return (
        <div key={idx} style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
          {line}
        </div>
      )
    })
  }

  // Metrics
  const wordsCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const charsCount = content.length
  const linesCount = content ? content.split('\n').length : 0

  const filteredNotes = notes.filter(n => {
    if (scope === 'url' && n.scope !== 'url') return false
    if (scope === 'global' && n.scope !== 'global') return false
    if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase()) && !n.content.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <PanelShell
      id="panel-scratchpad"
      title="ScratchPad & Developer Notes"
      icon={<FileText size={16} style={{ color: '#00d4ff' }} />}
      onClose={onClose}
      defaultWidth={480}
      minWidth={115}
      maxWidth={880}
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={handleCopy}
            title="Copy Note Content"
            style={{
              border: 'none',
              background: 'rgba(255,255,255,0.06)',
              color: copied ? '#22c55e' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      }
    >
      {/* 1. Top Controls: Scope Toggle & Search Bar */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(15, 20, 36, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        flexWrap: 'wrap',
      }}>
        {/* Scope selector */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', padding: 2, borderRadius: 6 }}>
          <button
            onClick={() => setScope('global')}
            style={{
              padding: '3px 9px',
              fontSize: 11,
              fontWeight: 600,
              background: scope === 'global' ? '#00d4ff' : 'transparent',
              color: scope === 'global' ? '#000' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            🌐 Global
          </button>
          <button
            onClick={() => setScope('url')}
            style={{
              padding: '3px 9px',
              fontSize: 11,
              fontWeight: 600,
              background: scope === 'url' ? '#00d4ff' : 'transparent',
              color: scope === 'url' ? '#000' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={currentUrl || 'Current Tab URL'}
          >
            🔗 This Page
          </button>
        </div>

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', gap: 2, background: 'rgba(0,0,0,0.3)', padding: 2, borderRadius: 6 }}>
          <button
            onClick={() => setViewMode('edit')}
            title="Edit Mode"
            style={{
              padding: '3px 8px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              background: viewMode === 'edit' ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: viewMode === 'edit' ? '#00d4ff' : 'var(--text-muted)',
            }}
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={() => setViewMode('split')}
            title="Split Edit & Live Preview"
            style={{
              padding: '3px 8px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              background: viewMode === 'split' ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: viewMode === 'split' ? '#00d4ff' : 'var(--text-muted)',
            }}
          >
            <Columns size={12} />
          </button>
          <button
            onClick={() => setViewMode('preview')}
            title="Preview Rendered Markdown"
            style={{
              padding: '3px 8px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              background: viewMode === 'preview' ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: viewMode === 'preview' ? '#00d4ff' : 'var(--text-muted)',
            }}
          >
            <Eye size={12} />
          </button>
        </div>

        <span style={{ fontSize: 10.5, color: savedStatus === 'Saved' ? '#22c55e' : '#f59e0b', fontFamily: 'var(--font-mono)' }}>
          ● {savedStatus}
        </span>
      </div>

      {/* 2. Note Tabs Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(8, 12, 22, 0.8)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {filteredNotes.map(n => {
          const isActive = n.id === activeNoteId
          return (
            <div
              key={n.id}
              onClick={() => setActiveNoteId(n.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: isActive ? 600 : 400,
                background: isActive ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: isActive ? '1px solid rgba(0, 212, 255, 0.35)' : '1px solid transparent',
                color: isActive ? '#00d4ff' : 'var(--text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <span>{n.title}</span>
              {filteredNotes.length > 1 && (
                <button
                  onClick={(e) => handleDeleteNote(n.id, e)}
                  title="Delete Note"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'inherit',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    opacity: 0.6,
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          )
        })}

        <button
          onClick={handleAddNote}
          title="Create New Note"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            borderRadius: 6,
            fontSize: 11,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px dashed rgba(255, 255, 255, 0.2)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#00d4ff'; e.currentTarget.style.borderColor = '#00d4ff' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)' }}
        >
          <Plus size={12} />
          <span>New</span>
        </button>
      </div>

      {/* 3. Developer Snippet & Formatting Action Bar */}
      <div style={{
        padding: '6px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: 6,
        alignItems: 'center',
        flexWrap: 'wrap',
        background: 'rgba(12, 16, 28, 0.5)',
      }}>
        <button
          onClick={handleFormatJson}
          title="Format and Beautify JSON"
          style={{
            fontSize: 10.5,
            padding: '3px 7px',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: '#38bdf8',
            borderRadius: 4,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Braces size={11} />
          <span>Format JSON</span>
        </button>

        <button
          onClick={() => handleInsertSnippet('- [ ] Task item')}
          style={{
            fontSize: 10.5,
            padding: '3px 7px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-dim)',
            color: 'var(--text-muted)',
            borderRadius: 4,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <CheckSquare size={11} />
          <span>+ Todo</span>
        </button>

        <button
          onClick={() => handleInsertSnippet('```js\n// JavaScript snippet\nconsole.log("Hello from NeXusWeb");\n```')}
          style={{
            fontSize: 10.5,
            padding: '3px 7px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-dim)',
            color: 'var(--text-muted)',
            borderRadius: 4,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Code size={11} />
          <span>+ Code</span>
        </button>

        <button
          onClick={() => handleInsertSnippet(`## API Endpoint\n- **Method**: \`POST\`\n- **URL**: \`http://localhost:5000/api\`\n- **Headers**: \`{"Content-Type": "application/json"}\``)}
          style={{
            fontSize: 10.5,
            padding: '3px 7px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-dim)',
            color: 'var(--text-muted)',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          + API
        </button>

        <button
          onClick={() => handleInsertSnippet(`> Timestamp: ${new Date().toLocaleString()}`)}
          style={{
            fontSize: 10.5,
            padding: '3px 7px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-dim)',
            color: 'var(--text-muted)',
            borderRadius: 4,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Clock size={11} />
          <span>Timestamp</span>
        </button>
      </div>

      {/* 4. Main Body: Editor / Preview / Split */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden', padding: '10px 12px', gap: 10 }}>
        {/* Editor Pane */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}>
            <textarea
              id="scratchpad-textarea"
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Write temporary code snippets, cURL commands, JSON payloads, or dev notes here…"
              style={{
                flex: 1,
                width: '100%',
                background: 'rgba(10, 14, 26, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 12,
                lineHeight: 1.6,
                padding: 12,
                resize: 'none',
                outline: 'none',
                scrollbarWidth: 'thin',
              }}
            />
          </div>
        )}

        {/* Markdown Rendered Preview Pane */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div style={{
            flex: 1,
            minWidth: 0,
            background: 'rgba(15, 20, 36, 0.75)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            borderRadius: 8,
            padding: '12px 14px',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Rendered Preview
            </div>
            {renderMarkdown(content)}
          </div>
        )}
      </div>

      {/* 5. Bottom Status Bar & Export Actions */}
      <div style={{
        padding: '6px 12px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(8, 12, 22, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 11,
        color: 'var(--text-muted)',
      }}>
        <div style={{ display: 'flex', gap: 10, fontFamily: 'var(--font-mono)' }}>
          <span>{wordsCount} words</span>
          <span>•</span>
          <span>{charsCount} chars</span>
          <span>•</span>
          <span>{linesCount} lines</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => handleExport('md')}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Download size={11} />
            <span>.md</span>
          </button>
          <button
            onClick={() => handleExport('txt')}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Download size={11} />
            <span>.txt</span>
          </button>
        </div>
      </div>
    </PanelShell>
  )
}
