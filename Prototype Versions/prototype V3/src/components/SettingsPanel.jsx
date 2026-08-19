import React, { useEffect, useState, useCallback } from 'react'
import { PanelShell } from './PanelShell'
import logoImg from '../assets/logo.png'

function SettingRow({ label, desc, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)',
      gap: 12,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 500 }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

const MODE_OPTIONS = [
  { value: 'normal', label: '🛡️ Normal Web (Privacy Shield)' },
  { value: 'strict', label: '🔒 Strict Offline (Localhost Only)' },
  { value: 'lan',    label: '📡 Local Network (LAN Only)' },
  { value: 'dev',    label: '⚡ Developer Mode (Unrestricted)' },
]

const THEME_OPTIONS = [
  { value: 'dark',   label: '🌙 Dark Theme (Developer)' },
  { value: 'light',  label: '☀️ Light Theme (Clean)' },
]

const SEARCH_ENGINES = [
  { id: 'duckduckgo', name: 'DuckDuckGo (Privacy Default)', url: 'https://duckduckgo.com/?q={query}', homeUrl: 'https://duckduckgo.com', icon: '🦆' },
  { id: 'google',     name: 'Google',                        url: 'https://www.google.com/search?q={query}', homeUrl: 'https://www.google.com', icon: '🔍' },
  { id: 'brave',      name: 'Brave Search (Private)',        url: 'https://search.brave.com/search?q={query}', homeUrl: 'https://search.brave.com', icon: '🦁' },
  { id: 'bing',       name: 'Bing',                          url: 'https://www.bing.com/search?q={query}', homeUrl: 'https://www.bing.com', icon: '🔵' },
  { id: 'ecosia',     name: 'Ecosia (Eco Search)',           url: 'https://www.ecosia.org/search?q={query}', homeUrl: 'https://www.ecosia.org', icon: '🌲' },
  { id: 'startpage',  name: 'Startpage (Private Google)',    url: 'https://www.startpage.com/search?q={query}', homeUrl: 'https://www.startpage.com', icon: '🐸' },
  { id: 'kagi',       name: 'Kagi Search',                   url: 'https://kagi.com/search?q={query}', homeUrl: 'https://kagi.com', icon: '🔴' },
  { id: 'custom',     name: 'Custom Template URL',           url: 'https://duckduckgo.com/?q={query}', homeUrl: 'https://duckduckgo.com', icon: '⚙️' },
]

export default function SettingsPanel({ onClose, onModeChange, currentMode, currentTheme, onThemeChange }) {
  const [settings, setSettings] = useState(null)
  const [customSearchUrl, setCustomSearchUrl] = useState('')

  useEffect(() => {
    window.nexus?.settings.get().then(s => {
      setSettings(s)
      if (s?.searchEngine?.id === 'custom') {
        setCustomSearchUrl(s.searchEngine.url || '')
      }
    })
  }, [])

  const update = useCallback(async (patch) => {
    const updated = await window.nexus?.settings.update(patch)
    setSettings(updated)
    if (patch.defaultMode && onModeChange) onModeChange(patch.defaultMode)
    if (patch.theme && onThemeChange) onThemeChange(patch.theme)
  }, [onModeChange, onThemeChange])

  const handleSearchEngineChange = (engineId) => {
    const found = SEARCH_ENGINES.find(e => e.id === engineId)
    if (found) {
      if (found.id === 'custom') {
        update({ searchEngine: { ...found, url: customSearchUrl || found.url } })
      } else {
        update({ searchEngine: found })
      }
    }
  }

  const handleCustomSearchBlur = () => {
    if (settings?.searchEngine?.id === 'custom' && customSearchUrl) {
      update({ searchEngine: { id: 'custom', name: 'Custom Template', url: customSearchUrl, icon: '⚙️' } })
    }
  }

  if (!settings) return null

  const selectedEngineId = settings.searchEngine?.id || 'duckduckgo'

  return (
    <PanelShell id="panel-settings" title="Settings & Privacy" icon="⚙" onClose={onClose}>
      
      {/* Section: Search Engine */}
      <div style={{ padding: '10px 14px 4px', fontSize: 10, fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        🔍 Search Engine
      </div>

      <SettingRow label="Default Search Engine" desc="Engine used when searching from address bar">
        <select
          id="setting-search-engine"
          value={selectedEngineId}
          onChange={e => handleSearchEngineChange(e.target.value)}
          style={{
            background: 'var(--bg-base)', border: '1px solid var(--border-dim)',
            color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
            padding: '5px 10px', fontSize: 12, fontFamily: 'var(--font-sans)', cursor: 'pointer',
          }}
        >
          {SEARCH_ENGINES.map(e => (
            <option key={e.id} value={e.id}>{e.icon} {e.name}</option>
          ))}
        </select>
      </SettingRow>

      {selectedEngineId === 'custom' && (
        <SettingRow label="Custom Query URL" desc="Use {query} as search term placeholder">
          <input
            type="text"
            value={customSearchUrl}
            onChange={e => setCustomSearchUrl(e.target.value)}
            onBlur={handleCustomSearchBlur}
            placeholder="https://example.com/?q={query}"
            style={{
              background: 'var(--bg-base)', border: '1px solid var(--border-dim)',
              color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
              padding: '5px 8px', fontSize: 11, fontFamily: 'var(--font-mono)',
              width: 180, outline: 'none',
            }}
          />
        </SettingRow>
      )}

      {/* Section: Privacy & Security (DuckDuckGo-Style) */}
      <div style={{ padding: '14px 14px 4px', fontSize: 10, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        🛡️ Privacy Shield & Security
      </div>

      <SettingRow label="Tracker & Ad Blocking" desc="Block telemetry, ad pixels, and tracking domains">
        <input
          type="checkbox"
          checked={settings.privacyShield?.blockTrackers ?? true}
          onChange={e => update({ privacyShield: { ...settings.privacyShield, blockTrackers: e.target.checked } })}
          style={{ accentColor: 'var(--green)', cursor: 'pointer', transform: 'scale(1.2)' }}
        />
      </SettingRow>

      <SettingRow label="Anti-Fingerprinting Noise" desc="Randomize canvas, audio, and navigator fingerprints">
        <input
          type="checkbox"
          checked={settings.privacyShield?.fingerprintProtect ?? true}
          onChange={e => update({ privacyShield: { ...settings.privacyShield, fingerprintProtect: e.target.checked } })}
          style={{ accentColor: 'var(--green)', cursor: 'pointer', transform: 'scale(1.2)' }}
        />
      </SettingRow>

      <SettingRow label="HTTPS Auto-Upgrade" desc="Automatically redirect non-secure HTTP web links to HTTPS">
        <input
          type="checkbox"
          checked={settings.privacyShield?.httpsUpgrade ?? true}
          onChange={e => update({ privacyShield: { ...settings.privacyShield, httpsUpgrade: e.target.checked } })}
          style={{ accentColor: 'var(--green)', cursor: 'pointer', transform: 'scale(1.2)' }}
        />
      </SettingRow>

      {/* Section: Media & Video */}
      <div style={{ padding: '14px 14px 4px', fontSize: 10, fontWeight: 700, color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        📺 Media & Playback
      </div>

      <SettingRow label="Background Audio Play" desc="Keep video and audio playing when switching tabs">
        <input
          type="checkbox"
          checked={settings.media?.backgroundPlay ?? true}
          onChange={e => update({ media: { ...settings.media, backgroundPlay: e.target.checked } })}
          style={{ accentColor: 'var(--accent-secondary)', cursor: 'pointer', transform: 'scale(1.2)' }}
        />
      </SettingRow>

      <SettingRow label="Picture-in-Picture Support" desc="Enable floating PiP video player for YouTube & media sites">
        <input
          type="checkbox"
          checked={settings.media?.floatingVideoPiP ?? true}
          onChange={e => update({ media: { ...settings.media, floatingVideoPiP: e.target.checked } })}
          style={{ accentColor: 'var(--accent-secondary)', cursor: 'pointer', transform: 'scale(1.2)' }}
        />
      </SettingRow>

      {/* Section: Appearance & Themes */}
      <div style={{ padding: '14px 14px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        🎨 Appearance & Theme
      </div>

      <SettingRow label="Color Theme" desc="Choose between Dark and Light interface">
        <select
          id="setting-theme"
          value={settings.theme || currentTheme || 'dark'}
          onChange={e => update({ theme: e.target.value })}
          style={{
            background: 'var(--bg-base)', border: '1px solid var(--border-dim)',
            color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
            padding: '5px 10px', fontSize: 12, fontFamily: 'var(--font-sans)', cursor: 'pointer',
          }}
        >
          {THEME_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </SettingRow>

      {/* Section: Network Isolation */}
      <div style={{ padding: '14px 14px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        🌐 Default Startup Mode
      </div>

      <SettingRow label="Default Network Mode" desc="Applied when opening NeXusWeb">
        <select
          id="setting-default-mode"
          value={settings.defaultMode}
          onChange={e => update({ defaultMode: e.target.value })}
          style={{
            background: 'var(--bg-base)', border: '1px solid var(--border-dim)',
            color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
            padding: '5px 10px', fontSize: 12, fontFamily: 'var(--font-sans)', cursor: 'pointer',
          }}
        >
          {MODE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </SettingRow>

      {/* Section: About */}
      <div style={{ padding: '14px 14px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        About NeXusWeb
      </div>

      <div style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <img src={logoImg} alt="Logo" style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)' }} />
          <div>
            <strong style={{ color: 'var(--accent-primary)', fontSize: 14 }}>NeXusWeb Developer Browser</strong>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Version 3.0.0 · Localhost & Privacy Web</div>
          </div>
        </div>
        <div>Engine: <span style={{ fontFamily: 'var(--font-mono)' }}>Chromium / Electron 28</span></div>
        <div>Search: <span style={{ color: 'var(--accent-primary)' }}>{settings.searchEngine?.name || 'DuckDuckGo'}</span></div>
        <div>Built with DuckDuckGo-inspired privacy shield & developer tools.</div>
      </div>
    </PanelShell>
  )
}
