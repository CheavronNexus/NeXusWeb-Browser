import React, { useEffect, useState, useCallback } from 'react'
import { PanelShell } from './PanelShell'

function SettingRow({ label, desc, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)',
      gap: 12,
    }}>
      <div>
        <div style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 500 }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange, id }) {
  return (
    <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
      <div style={{
        width: 36, height: 20, borderRadius: 100,
        background: checked ? 'var(--accent-primary)' : 'var(--border-dim)',
        position: 'relative', transition: 'background 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: 3, left: checked ? 18 : 3,
          width: 14, height: 14, borderRadius: '50%',
          background: 'white', transition: 'left 0.2s',
        }} />
      </div>
    </label>
  )
}

const MODE_OPTIONS = [
  { value: 'strict', label: '🔒 Strict Offline' },
  { value: 'lan',    label: '📡 Local Network' },
  { value: 'dev',    label: '⚡ Developer Mode' },
]

export default function SettingsPanel({ onClose, onModeChange, currentMode }) {
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    window.nexus?.settings.get().then(setSettings)
  }, [])

  const update = useCallback(async (patch) => {
    const updated = await window.nexus?.settings.update(patch)
    setSettings(updated)
    // Apply live changes
    if (patch.defaultMode) onModeChange(patch.defaultMode)
  }, [onModeChange])

  if (!settings) return null

  return (
    <PanelShell id="panel-settings" title="Settings" icon="⚙" onClose={onClose}>
      {/* Section: Network */}
      <div style={{ padding: '8px 14px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Network
      </div>

      <SettingRow label="Default Network Mode" desc="Mode used when NeXusWeb starts">
        <select
          id="setting-default-mode"
          value={settings.defaultMode}
          onChange={e => update({ defaultMode: e.target.value })}
          style={{
            background: 'var(--bg-base)', border: '1px solid var(--border-dim)',
            color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
            padding: '4px 8px', fontSize: 12, fontFamily: 'var(--font-sans)', cursor: 'pointer',
          }}
        >
          {MODE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </SettingRow>

      {/* Section: Appearance */}
      <div style={{ padding: '12px 14px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        New Tab
      </div>

      <SettingRow label="New Tab Page" desc="What to show when opening a new tab">
        <select
          id="setting-new-tab"
          value={settings.newTabPage}
          onChange={e => update({ newTabPage: e.target.value })}
          style={{
            background: 'var(--bg-base)', border: '1px solid var(--border-dim)',
            color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
            padding: '4px 8px', fontSize: 12, fontFamily: 'var(--font-sans)', cursor: 'pointer',
          }}
        >
          <option value="home">⌂ NeXusWeb Home</option>
          <option value="blank">Blank Page</option>
        </select>
      </SettingRow>

      {/* Section: Terminal */}
      <div style={{ padding: '12px 14px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Terminal
      </div>

      <SettingRow label="Shell" desc="Terminal shell to use (leave blank for auto)">
        <input
          id="setting-shell"
          type="text"
          value={settings.terminalShell}
          onChange={e => update({ terminalShell: e.target.value })}
          placeholder="Auto (PowerShell)"
          style={{
            background: 'var(--bg-base)', border: '1px solid var(--border-dim)',
            color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
            padding: '4px 8px', fontSize: 12, fontFamily: 'var(--font-mono)',
            width: 160, outline: 'none',
          }}
        />
      </SettingRow>

      {/* Section: About */}
      <div style={{ padding: '12px 14px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        About
      </div>

      <div style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        <div><strong style={{ color: 'var(--accent-primary)' }}>NeXusWeb</strong> — Local Developer Browser</div>
        <div>Version: <span style={{ fontFamily: 'var(--font-mono)' }}>1.0.0</span></div>
        <div>Built with Electron 28 · React 18 · xterm.js 5</div>
      </div>
    </PanelShell>
  )
}
