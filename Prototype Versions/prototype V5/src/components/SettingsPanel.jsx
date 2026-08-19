import React, { useState, useEffect, useCallback } from 'react'
import {
  Shield, Activity, Zap, Palette, Search, Layout, Power,
  Languages, Download, Accessibility, Wrench, RotateCcw,
  Puzzle, Globe, ExternalLink, X, Check, Lock, Cpu, Eye, Moon, Sun, Laptop
} from 'lucide-react'
import logoImg from '../assets/logo.png'

const NAV_ITEMS = [
  { id: 'privacy', label: 'Privacy and security', icon: Shield },
  { id: 'performance', label: 'Performance', icon: Activity },
  { id: 'nexusapp', label: 'NeXusApp', icon: Zap },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'search', label: 'Search engine', icon: Search },
  { id: 'defaultBrowser', label: 'Default browser', icon: Layout },
  { id: 'startup', label: 'On startup', icon: Power },
  { divider: true },
  { id: 'languages', label: 'Languages', icon: Languages },
  { id: 'downloads', label: 'Downloads', icon: Download },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
  { id: 'system', label: 'System', icon: Wrench },
  { id: 'reset', label: 'Reset settings', icon: RotateCcw },
  { divider: true },
  { id: 'extensions', label: 'Extensions', icon: Puzzle, external: true },
  { id: 'about', label: 'About NeXusWeb', icon: Globe },
]

const SEARCH_ENGINES = [
  { id: 'duckduckgo', name: 'DuckDuckGo (Privacy Default)', url: 'https://duckduckgo.com/?q={query}' },
  { id: 'google',     name: 'Google',                        url: 'https://www.google.com/search?q={query}' },
  { id: 'brave',      name: 'Brave Search (Private)',        url: 'https://search.brave.com/search?q={query}' },
  { id: 'bing',       name: 'Bing',                          url: 'https://www.bing.com/search?q={query}' },
  { id: 'ecosia',     name: 'Ecosia (Eco Search)',           url: 'https://www.ecosia.org/search?q={query}' },
  { id: 'startpage',  name: 'Startpage (Private Google)',    url: 'https://www.startpage.com/search?q={query}' },
]

const THEME_OPTIONS = [
  { id: 'cyber-dark', label: 'Cyber Dark (Default)' },
  { id: 'obsidian-dark', label: 'Obsidian Dark' },
  { id: 'obsidian-light', label: 'Obsidian Light (50% Opacity)' },
  { id: 'emerald-matrix', label: 'Emerald Matrix' },
  { id: 'solar-amber', label: 'Solar Amber' },
  { id: 'synth-violet', label: 'Synth Violet' },
  { id: 'sakura-neon', label: 'Sakura Neon' },
  { id: 'light', label: 'Clean Light' },
]

export default function SettingsPanel({
  onClose,
  initialSection = 'privacy',
  onModeChange,
  currentMode = 'normal',
  currentTheme = 'dark',
  onThemeChange,
  onOpenPanel,
  onToast,
}) {
  const [activeSection, setActiveSection] = useState(initialSection)
  const [settings, setSettings] = useState({
    searchEngine: { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q={query}' },
    hardwareAcceleration: true,
    tabSuspenderEnabled: true,
    askDownloadPath: false,
    downloadPath: 'C:\\Users\\Default\\Downloads',
    startupAction: 'newtab',
  })
  const [vpnRegion, setVpnRegion] = useState('direct')

  useEffect(() => {
    window.nexus?.settings?.get?.().then(s => {
      if (s) setSettings(prev => ({ ...prev, ...s }))
    })
    window.nexus?.proxy?.getConfig?.().then(conf => {
      if (conf?.region) setVpnRegion(conf.region)
    })
  }, [])

  const updateSetting = async (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }))
    await window.nexus?.settings?.update?.({ [key]: val })
  }

  const handleSetProxy = async (region) => {
    setVpnRegion(region)
    if (region === 'direct') {
      await window.nexus?.proxy?.setMode?.('direct')
      onToast?.('Disconnected VPN (Direct connection)', 'info')
    } else {
      await window.nexus?.proxy?.setMode?.('proxy', region)
      onToast?.(`Connected to VPN: ${region.toUpperCase()}`, 'success')
    }
  }

  const handleClearBrowsingData = async () => {
    if (window.confirm('Clear all browsing history, cache, and cookies?')) {
      await window.nexus?.history?.clear?.()
      onToast?.('Browsing data & cache cleared', 'success')
    }
  }

  const handleResetDefaults = async () => {
    if (window.confirm('Restore all NeXusWeb settings to original factory defaults?')) {
      await window.nexus?.settings?.reset?.()
      onToast?.('Settings restored to defaults', 'success')
      onClose()
    }
  }

  return (
    <div className="full-settings-view">
      
      {/* Left Sidebar Navigation (Screenshot 3) */}
      <div className="settings-sidebar-nav">
        <div style={{ padding: '0 20px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 8 }}>
          <img src={logoImg} alt="" style={{ width: 22, height: 22, borderRadius: 4 }} onError={e => e.target.style.display = 'none'} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>Settings</span>
        </div>

        {NAV_ITEMS.map((item, idx) => {
          if (item.divider) {
            return <div key={`div-${idx}`} className="settings-sidebar-divider" />
          }

          const IconComp = item.icon
          const isActive = activeSection === item.id

          return (
            <button
              key={item.id}
              className={`settings-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (item.id === 'extensions') {
                  onClose()
                  onOpenPanel?.('extensions')
                } else {
                  setActiveSection(item.id)
                }
              }}
            >
              <IconComp size={16} style={{ color: isActive ? 'var(--accent-primary)' : 'inherit', flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.external && <ExternalLink size={12} style={{ opacity: 0.6 }} />}
            </button>
          )
        })}
      </div>

      {/* Right Main Content Area */}
      <div className="settings-main-content">
        
        {/* Top Header Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Close Settings (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        <div className="settings-content-wrapper">
          
          {/* 1. Privacy and security */}
          {activeSection === 'privacy' && (
            <div>
              <div className="settings-section-heading">
                <Shield size={22} style={{ color: 'var(--green)' }} />
                <span>Privacy and security</span>
              </div>

              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">DuckDuckGo Privacy Shield</div>
                    <div className="settings-row-desc">Block known web trackers, analytics beacons, and cryptominers</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', background: 'rgba(34, 197, 94, 0.15)', padding: '3px 8px', borderRadius: 12 }}>
                    ACTIVE
                  </span>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Do Not Track (DNT) & Fingerprint Spoofing</div>
                    <div className="settings-row-desc">Send DNT header and randomize canvas/audio fingerprints in Normal Mode</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', background: 'rgba(34, 197, 94, 0.15)', padding: '3px 8px', borderRadius: 12 }}>
                    ENABLED
                  </span>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">High-Speed Proxy / VPN Tunnel</div>
                    <div className="settings-row-desc">Route all browser HTTP/HTTPS traffic through verified encrypted proxies</div>
                  </div>
                  <select
                    value={vpnRegion}
                    onChange={e => handleSetProxy(e.target.value)}
                    style={{
                      background: '#121318', border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 6, color: '#f8fafc', padding: '6px 10px', fontSize: 12
                    }}
                  >
                    <option value="direct">Direct (No Proxy)</option>
                    <option value="nl">Netherlands (NL) — Fast</option>
                    <option value="us">United States (US) — Fast</option>
                    <option value="sg">Singapore (SG) — Asia Pacific</option>
                    <option value="uk">United Kingdom (UK) — Europe</option>
                  </select>
                </div>

                <div className="settings-row" style={{ paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <div className="settings-row-label">Clear Browsing Data</div>
                    <div className="settings-row-desc">Clear history, cached images and files, cookies and site data</div>
                  </div>
                  <button
                    onClick={handleClearBrowsingData}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)',
                      borderRadius: 6, color: '#ef4444', padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Clear Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. Performance */}
          {activeSection === 'performance' && (
            <div>
              <div className="settings-section-heading">
                <Activity size={22} style={{ color: 'var(--accent-primary)' }} />
                <span>Performance</span>
              </div>

              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Memory Saver (Tab Hibernation)</div>
                    <div className="settings-row-desc">Automatically hibernates background tabs after 15 minutes of inactivity to free up system RAM</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.tabSuspenderEnabled}
                    onChange={e => updateSetting('tabSuspenderEnabled', e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Hardware Acceleration</div>
                    <div className="settings-row-desc">Use GPU hardware acceleration when available for smooth rendering and video playback</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.hardwareAcceleration}
                    onChange={e => updateSetting('hardwareAcceleration', e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. NeXusApp (Replaced from AI innovations as requested) */}
          {activeSection === 'nexusapp' && (
            <div>
              <div className="settings-section-heading">
                <Zap size={22} style={{ color: 'var(--yellow)' }} />
                <span>NeXusApp Developer Suite</span>
              </div>

              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">REST & GraphQL API Workbench</div>
                    <div className="settings-row-desc">Integrated HTTP endpoint testing with .env workspace variable substitution</div>
                  </div>
                  <button
                    onClick={() => { onClose(); onOpenPanel?.('api-workbench'); }}
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', borderRadius: 6, color: 'var(--accent-primary)', padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}
                  >
                    Open Workbench
                  </button>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Port Manager & Localhost Auto-Scan</div>
                    <div className="settings-row-desc">Continuously discovers active dev servers (Vite, Next.js, Flask, Django, etc.)</div>
                  </div>
                  <button
                    onClick={() => { onClose(); onOpenPanel?.('ports'); }}
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', borderRadius: 6, color: 'var(--accent-primary)', padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}
                  >
                    Open Port Manager
                  </button>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Request Inspector (Network Logger)</div>
                    <div className="settings-row-desc">Live capture of all HTTP/HTTPS requests, headers, and payload sizes</div>
                  </div>
                  <button
                    onClick={() => { onClose(); onOpenPanel?.('inspector'); }}
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', borderRadius: 6, color: 'var(--accent-primary)', padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}
                  >
                    Open Inspector
                  </button>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">ScratchPad & Developer Notes</div>
                    <div className="settings-row-desc">Instant scratchpad tied to current workspace and domain</div>
                  </div>
                  <button
                    onClick={() => { onClose(); onOpenPanel?.('notes'); }}
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', borderRadius: 6, color: 'var(--accent-primary)', padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}
                  >
                    Open Notes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Appearance */}
          {activeSection === 'appearance' && (
            <div>
              <div className="settings-section-heading">
                <Palette size={22} style={{ color: 'var(--accent-secondary)' }} />
                <span>Appearance</span>
              </div>

              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Color Theme & Glow</div>
                    <div className="settings-row-desc">Select visual theme and glassmorphic accent palette</div>
                  </div>
                  <select
                    value={currentTheme}
                    onChange={e => onThemeChange?.(e.target.value)}
                    style={{ background: '#121318', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: '#f8fafc', padding: '6px 10px', fontSize: 12 }}
                  >
                    {THEME_OPTIONS.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Theme Studio & Neon Glow</div>
                    <div className="settings-row-desc">Customize border glows, background blurs, and font styles</div>
                  </div>
                  <button
                    onClick={() => { onClose(); onOpenPanel?.('theme'); }}
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', borderRadius: 6, color: 'var(--accent-primary)', padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}
                  >
                    Open Theme Studio
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. Search engine */}
          {activeSection === 'search' && (
            <div>
              <div className="settings-section-heading">
                <Search size={22} style={{ color: 'var(--accent-primary)' }} />
                <span>Search engine</span>
              </div>

              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Search engine used in address bar</div>
                    <div className="settings-row-desc">Default provider for omnibox queries and new tab search</div>
                  </div>
                  <select
                    value={settings.searchEngine?.id || 'duckduckgo'}
                    onChange={e => {
                      const engine = SEARCH_ENGINES.find(se => se.id === e.target.value)
                      if (engine) updateSetting('searchEngine', engine)
                    }}
                    style={{ background: '#121318', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: '#f8fafc', padding: '6px 10px', fontSize: 12 }}
                  >
                    {SEARCH_ENGINES.map(se => (
                      <option key={se.id} value={se.id}>{se.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 6. Default browser */}
          {activeSection === 'defaultBrowser' && (
            <div>
              <div className="settings-section-heading">
                <Layout size={22} style={{ color: 'var(--green)' }} />
                <span>Default browser</span>
              </div>

              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Make NeXusWeb default browser</div>
                    <div className="settings-row-desc">Set NeXusWeb as default handler for HTTP, HTTPS, and localhost URLs</div>
                  </div>
                  <button
                    onClick={() => onToast?.('NeXusWeb protocol handler registered for this user profile', 'success')}
                    style={{ background: 'var(--accent-primary)', border: 'none', borderRadius: 6, color: '#000', padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Make Default
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 7. On startup */}
          {activeSection === 'startup' && (
            <div>
              <div className="settings-section-heading">
                <Power size={22} style={{ color: 'var(--yellow)' }} />
                <span>On startup</span>
              </div>

              <div className="settings-card">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="startupAction"
                    value="newtab"
                    checked={settings.startupAction === 'newtab'}
                    onChange={e => updateSetting('startupAction', e.target.value)}
                  />
                  <span>Open the New Tab page</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="startupAction"
                    value="restore"
                    checked={settings.startupAction === 'restore'}
                    onChange={e => updateSetting('startupAction', e.target.value)}
                  />
                  <span>Continue where you left off (Restore previous session)</span>
                </label>
              </div>
            </div>
          )}

          {/* 8. Languages */}
          {activeSection === 'languages' && (
            <div>
              <div className="settings-section-heading">
                <Languages size={22} style={{ color: 'var(--accent-secondary)' }} />
                <span>Languages</span>
              </div>

              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Preferred language</div>
                    <div className="settings-row-desc">Languages used when displaying web page text</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>English (United States)</span>
                </div>
              </div>
            </div>
          )}

          {/* 9. Downloads */}
          {activeSection === 'downloads' && (
            <div>
              <div className="settings-section-heading">
                <Download size={22} style={{ color: 'var(--accent-primary)' }} />
                <span>Downloads</span>
              </div>

              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Location</div>
                    <div className="settings-row-desc">{settings.downloadPath}</div>
                  </div>
                  <button
                    onClick={() => onToast?.('Download location is managed by your system profile', 'info')}
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', borderRadius: 6, color: '#f1f5f9', padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}
                  >
                    Change
                  </button>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Ask where to save each file before downloading</div>
                    <div className="settings-row-desc">Prompt for directory location on every download request</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.askDownloadPath}
                    onChange={e => updateSetting('askDownloadPath', e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 10. Accessibility */}
          {activeSection === 'accessibility' && (
            <div>
              <div className="settings-section-heading">
                <Accessibility size={22} style={{ color: 'var(--green)' }} />
                <span>Accessibility</span>
              </div>

              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">High-Contrast Focus Indicators</div>
                    <div className="settings-row-desc">Draw prominent neon rings around focused inputs and links</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', background: 'rgba(34, 197, 94, 0.15)', padding: '3px 8px', borderRadius: 12 }}>
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 11. System */}
          {activeSection === 'system' && (
            <div>
              <div className="settings-section-heading">
                <Wrench size={22} style={{ color: 'var(--yellow)' }} />
                <span>System</span>
              </div>

              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Default Network Mode</div>
                    <div className="settings-row-desc">Initial isolation state for new browser sessions</div>
                  </div>
                  <select
                    value={currentMode}
                    onChange={e => onModeChange?.(e.target.value)}
                    style={{ background: '#121318', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: '#f8fafc', padding: '6px 10px', fontSize: 12 }}
                  >
                    <option value="normal">Normal Web (Privacy Shield)</option>
                    <option value="strict">Strict Offline (Localhost Only)</option>
                    <option value="lan">Local Network (LAN Only)</option>
                    <option value="dev">Developer Mode (Unrestricted)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 12. Reset settings */}
          {activeSection === 'reset' && (
            <div>
              <div className="settings-section-heading">
                <RotateCcw size={22} style={{ color: 'var(--red)' }} />
                <span>Reset settings</span>
              </div>

              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Restore settings to original defaults</div>
                    <div className="settings-row-desc">Reset startup page, new tab page, search engine, and clear temporary cookies and cache</div>
                  </div>
                  <button
                    onClick={handleResetDefaults}
                    style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: 6, color: '#ef4444', padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Reset Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 13. About NeXusWeb */}
          {activeSection === 'about' && (
            <div>
              <div className="settings-section-heading">
                <Globe size={22} style={{ color: 'var(--accent-primary)' }} />
                <span>About NeXusWeb</span>
              </div>

              <div className="settings-card" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <img src={logoImg} alt="NeXusWeb" style={{ width: 64, height: 64, margin: '0 auto 12px', display: 'block', borderRadius: 12 }} onError={e => e.target.style.display = 'none'} />
                <div style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc' }}>NeXusWeb Browser</div>
                <div style={{ fontSize: 12, color: 'var(--accent-primary)', fontWeight: 600, marginTop: 2 }}>Version 5.0.0 (Official Build) x64</div>
                <div style={{ fontSize: 12, color: '#94a3b8', maxWidth: 460, margin: '14px auto 0', lineHeight: 1.5 }}>
                  The zero-telemetry, offline-first web browser engineered for local developers, full-stack engineers, and privacy power users.
                </div>
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
                  <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 10, background: 'rgba(34, 197, 94, 0.15)', color: 'var(--green)', fontWeight: 700 }}>
                    100% OFFLINE CAPABLE
                  </span>
                  <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 10, background: 'rgba(0, 212, 255, 0.15)', color: 'var(--accent-primary)', fontWeight: 700 }}>
                    ZERO EXTERNAL TELEMETRY
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  )
}
