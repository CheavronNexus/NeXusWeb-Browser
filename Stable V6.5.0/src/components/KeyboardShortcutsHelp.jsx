import React from 'react'
import { PanelShell } from './PanelShell'

const SHORTCUTS = [
  { category: 'Tabs & Navigation' },
  { key: 'Ctrl + T',          desc: 'Open new tab' },
  { key: 'Ctrl + W',          desc: 'Close current tab' },
  { key: 'Ctrl + Shift + T',  desc: 'Reopen last closed tab' },
  { key: 'Ctrl + Tab',        desc: 'Next tab' },
  { key: 'Ctrl + Shift + Tab',desc: 'Previous tab' },
  { key: 'Alt + ←',           desc: 'Go back' },
  { key: 'Alt + →',           desc: 'Go forward' },
  { key: 'F5 / Ctrl + R',     desc: 'Reload page' },
  { key: 'Ctrl + L',          desc: 'Focus address bar / web search' },
  { key: 'Escape',            desc: 'Close panel / blur input' },

  { category: 'Quick Launch & Command Bar' },
  { key: 'Ctrl + K',          desc: 'Command Palette / Quick Launcher' },
  { key: 'Ctrl + Shift + B',  desc: 'Toggle Quick Bookmarks Bar' },
  { key: 'Ctrl + Shift + R',  desc: 'Distraction-Free Reader View' },
  { key: 'Ctrl + Shift + I',  desc: 'Request Inspector (Network Logs)' },

  { category: 'Media & Web Privacy (V3 New)' },
  { key: 'Ctrl + Shift + P',  desc: 'Float Video (Picture-in-Picture)' },
  { key: 'F9 / Ctrl + Shift + S', desc: 'Capture page screenshot (PNG to Desktop)' },
  { key: 'Ctrl + F',          desc: 'Find in page' },
  { key: 'Ctrl + Shift + L',  desc: 'Auto-detect localhost servers' },
  { key: 'Ctrl + \\',         desc: 'Toggle split view (2 apps side-by-side)' },
  { key: 'Ctrl + = / +',      desc: 'Zoom in' },
  { key: 'Ctrl + -',          desc: 'Zoom out' },
  { key: 'Ctrl + 0',          desc: 'Reset zoom (100%)' },

  { category: 'Developer Drawers' },
  { key: 'Ctrl + J',          desc: 'Download Manager' },
  { key: 'Ctrl + Shift + N',  desc: 'Scratch Pad / Dev Notes' },
  { key: 'Ctrl + `',          desc: 'Toggle multi-session terminal' },
  { key: 'Ctrl + D',          desc: 'Bookmark current page' },
  { key: 'Ctrl + B',          desc: 'Bookmarks drawer' },
  { key: 'Ctrl + H',          desc: 'History drawer' },
  { key: 'F12',               desc: 'DevTools (Dev / Normal mode)' },
  { key: 'F1',                desc: 'Show keyboard shortcuts' },
]

export default function KeyboardShortcutsHelp({ onClose }) {
  return (
    <PanelShell id="panel-shortcuts" title="Keyboard Shortcuts (V3)" icon="⌨" onClose={onClose}>
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
              padding: '8px 14px',
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
