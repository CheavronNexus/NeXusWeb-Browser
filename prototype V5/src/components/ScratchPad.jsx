import React, { useEffect, useState, useCallback, useRef } from 'react'
import { PanelShell } from './PanelShell'
import { FileText } from 'lucide-react'

export default function ScratchPad({ onClose, currentUrl, onToast }) {
  const [isPerUrl, setIsPerUrl] = useState(false)
  const [content, setContent] = useState('')
  const [savedStatus, setSavedStatus] = useState('Saved')
  const saveTimeoutRef = useRef(null)

  const urlKey = isPerUrl ? (currentUrl || 'global') : 'global'

  useEffect(() => {
    window.nexus?.notes.get(urlKey).then(res => {
      setContent(res?.content || '')
      setSavedStatus('Loaded')
    })
  }, [urlKey])

  const handleTextChange = (e) => {
    const val = e.target.value
    setContent(val)
    setSavedStatus('Typing…')

    clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(async () => {
      await window.nexus?.notes.save(urlKey, val)
      setSavedStatus('Saved')
    }, 600)
  }

  const insertSnippet = (snippet) => {
    const next = content ? `${content}\n${snippet}` : snippet
    setContent(next)
    window.nexus?.notes.save(urlKey, next)
    setSavedStatus('Saved')
  }

  return (
    <PanelShell id="panel-scratchpad" title="Scratch Pad / Notes" icon={<FileText size={16} style={{ color: 'var(--accent-primary)' }} />} onClose={onClose}>
      {/* Scope Selector */}
      <div style={{
        padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg-elevated)',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setIsPerUrl(false)}
            style={{
              padding: '3px 8px', fontSize: 11, fontWeight: 500,
              background: !isPerUrl ? 'var(--accent-primary)' : 'transparent',
              color: !isPerUrl ? '#0a0d14' : 'var(--text-muted)',
              border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            }}
          >
            Global Notes
          </button>
          <button
            onClick={() => setIsPerUrl(true)}
            style={{
              padding: '3px 8px', fontSize: 11, fontWeight: 500,
              background: isPerUrl ? 'var(--accent-primary)' : 'transparent',
              color: isPerUrl ? '#0a0d14' : 'var(--text-muted)',
              border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            }}
          >
            This URL
          </button>
        </div>

        <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {savedStatus}
        </span>
      </div>

      {/* Snippet bar */}
      <div style={{
        padding: '6px 14px', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', gap: 6, flexWrap: 'wrap',
      }}>
        <button
          onClick={() => insertSnippet('## API Endpoint\n- **Method**: POST\n- **URL**: http://localhost:5000/api/\n- **Payload**: `{}`')}
          style={{ fontSize: 10, padding: '2px 6px', background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-muted)', borderRadius: 3, cursor: 'pointer' }}
        >
          + API Note
        </button>
        <button
          onClick={() => insertSnippet('```json\n{\n  "key": "value"\n}\n```')}
          style={{ fontSize: 10, padding: '2px 6px', background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-muted)', borderRadius: 3, cursor: 'pointer' }}
        >
          + JSON
        </button>
        <button
          onClick={() => insertSnippet('- [ ] Task: ')}
          style={{ fontSize: 10, padding: '2px 6px', background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-muted)', borderRadius: 3, cursor: 'pointer' }}
        >
          + Todo
        </button>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 14px' }}>
        <textarea
          id="scratchpad-textarea"
          value={content}
          onChange={handleTextChange}
          placeholder="Write temporary code snippets, curl commands, JSON payloads, or dev notes here…"
          style={{
            flex: 1,
            width: '100%',
            minHeight: 340,
            background: 'var(--bg-base)',
            border: '1px solid var(--border-dim)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            lineHeight: 1.6,
            padding: 12,
            resize: 'none',
            outline: 'none',
          }}
        />
      </div>
    </PanelShell>
  )
}
