import React from 'react'
import { PanelShell } from './PanelShell'

const SHORTCUTS = [
  { category: 'Tabs' },
  { key: 'Ctrl + T',          desc: 'Open new tab' },
  { key: 'Ctrl + W',          desc: 'Close current tab' },
  { key: 'Ctrl + Tab',        desc: 'Next tab' },
  { key: 'Ctrl + Shift + Tab',desc: 'Previous tab' },

  { category: 'Navigation' },
  { key: 'Alt + ←',           desc: 'Go back' },
  { key: 'Alt + →',           desc: 'Go forward' },
  { key: 'F5 / Ctrl + R',     desc: 'Reload page' },
  { key: 'Ctrl + L',          desc: 'Focus address bar' },
  { key: 'Escape',            desc: 'Close panel / blur input' },

  { category: 'Bookmarks & History' },
  { key: 'Ctrl + D',          desc: 'Bookmark / unbookmark page' },
  { key: 'Ctrl + B',          desc: 'Toggle bookmarks panel' },
  { key: 'Ctrl + H',          desc: 'Toggle history panel' },

  { category: 'Developer Tools' },
  { key: 'Ctrl + `',          desc: 'Toggle terminal panel' },
  { key: 'F12',               desc: 'Toggle DevTools (Dev mode only)' },
  { key: 'F1',                desc: 'Show keyboard shortcuts' },
]

export default function KeyboardShortcutsHelp({ onClose }) {
  return (
    <PanelShell id="panel-shortcuts" title="Keyboard Shortcuts" icon="⌨" onClose={onClose}>
      <div style={{ padding: '8px 0' }}>
        {SHORTCUTS.map((s, i) => {
          if (s.category) {
            return (
              <div key={i} style={{
                padding: '10px 14px 4px',
                fontSize: 10, fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                {s.category}
              </div>
            )
          }
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 14px',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.desc}</span>
              <kbd style={{
                fontFamily: 'var(--font-mono)', fontSize: 10.5,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-dim)',
                borderRadius: 'var(--radius-sm)',
                padding: '2px 8px', color: 'var(--accent-primary)',
                whiteSpace: 'nowrap',
              }}>
                {s.key}
              </kbd>
            </div>
          )
        })}
      </div>
    </PanelShell>
  )
}
