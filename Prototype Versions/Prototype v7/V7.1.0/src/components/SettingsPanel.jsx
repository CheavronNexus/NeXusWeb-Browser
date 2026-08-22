import React, { useState, useEffect, useCallback } from 'react'
import {
  Shield, Activity, Zap, Palette, Search, Layout, Power,
  Languages, Download, Accessibility, Wrench, RotateCcw,
  Puzzle, Globe, ExternalLink, X, Check, Lock, Cpu, Eye, Moon, Sun, Laptop,
  Sliders, HardDrive, RefreshCw, Layers, Sparkles, Volume2, HelpCircle,
  FolderOpen, AlertTriangle, Monitor, SlidersHorizontal, Terminal
} from 'lucide-react'
import logoImg from '../assets/logo.png'

const NAV_ITEMS = [
  { id: 'privacy', label: 'Privacy and security', icon: Shield },
  { id: 'performance', label: 'Performance & Memory', icon: Activity },
  { id: 'nexusapp', label: 'NeXusApp & Localhost', icon: Zap },
  { id: 'appearance', label: 'Appearance & Themes', icon: Palette },
  { id: 'search', label: 'Search engine', icon: Search },
  { id: 'startup', label: 'On startup', icon: Power },
  { id: 'downloads', label: 'Downloads', icon: Download },
  { divider: true },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility, badge: 'New' },
  { id: 'system', label: 'System & Diagnostics', icon: Wrench, badge: 'New' },
  { id: 'reset', label: 'Reset settings', icon: RotateCcw },
  { divider: true },
  { id: 'extensions', label: 'Extensions', icon: Puzzle, external: true },
  { id: 'about', label: 'About NeXusWeb', icon: Globe },
]

const SEARCH_ENGINES = [
  { id: 'duckduckgo', name: 'DuckDuckGo (Privacy Default)', url: 'https://duckduckgo.com/?q={query}' },
  { id: 'brave',      name: 'Brave Search (Private)',        url: 'https://search.brave.com/search?q={query}' },
  { id: 'google',     name: 'Google',                        url: 'https://www.google.com/search?q={query}' },
  { id: 'bing',       name: 'Bing',                          url: 'https://www.bing.com/search?q={query}' },
  { id: 'startpage',  name: 'Startpage (Private Google)',    url: 'https://www.startpage.com/search?q={query}' },
  { id: 'ecosia',     name: 'Ecosia (Eco Search)',           url: 'https://www.ecosia.org/search?q={query}' },
  { id: 'custom',     name: 'Custom Query Template',         url: '' },
]

const THEME_OPTIONS = [
  { id: 'cyber-dark', label: 'Cyber Dark (Default)' },
  { id: 'obsidian-dark', label: 'Obsidian Dark' },
  { id: 'obsidian-light', label: 'Obsidian Light (Frost Glass)' },
  { id: 'emerald-matrix', label: 'Emerald Matrix' },
  { id: 'solar-amber', label: 'Solar Amber' },
  { id: 'synth-violet', label: 'Synth Violet' },
  { id: 'sakura-neon', label: 'Sakura Neon' },
  { id: 'light', label: 'Clean Light' },
]

const DOH_PROVIDERS = [
  { id: 'cloudflare', name: 'Cloudflare (1.1.1.1 / 1.0.0.1)', url: 'https://cloudflare-dns.com/dns-query' },
  { id: 'quad9',      name: 'Quad9 (9.9.9.9 — Threat Blocking)', url: 'https://dns.quad9.net/dns-query' },
  { id: 'google',     name: 'Google Public DNS (8.8.8.8)', url: 'https://dns.google/dns-query' },
  { id: 'adguard',    name: 'AdGuard Privacy DNS', url: 'https://dns.adguard.com/dns-query' },
  { id: 'custom',     name: 'Custom Upstream DoH URL', url: '' },
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
  const [searchQuery, setSearchQuery] = useState('')
  const [settings, setSettings] = useState({
    searchEngine: { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q={query}' },
    customSearchUrl: '',
    hardwareAcceleration: true,
    tabSuspenderEnabled: true,
    tabSuspenderMinutes: 30,
    tabSuspenderWhitelist: 'localhost, 127.0.0.1',
    askDownloadPath: false,
    downloadPath: 'C:\\Users\\Default\\Downloads',
    autoOpenDownloads: false,
    startupAction: 'newtab',
    customStartupUrl: '',
    dohProvider: 'cloudflare',
    customDohUrl: '',
    webrtcShieldEnabled: true,
    fingerprintLevel: 'standard',
    adblockLevel: 'strict',
    cookiePolicy: 'block-third-party',
    httpsOnly: true,
    // Accessibility
    highContrastMode: false,
    textScalePercent: 100,
    dyslexicFont: false,
    reduceMotion: false,
    neonFocusRings: true,
    colorFilter: 'none',
    screenReaderOptimized: false,
    // System
    backgroundWatcher: true,
    portScanInterval: 5,
    portScanRange: 'web',
    portNotifyToast: true,
    blurIntensity: 'medium',
  })
  const [vpnRegion, setVpnRegion] = useState('direct')
  const [showClearModal, setShowClearModal] = useState(false)
  const [clearOptions, setClearOptions] = useState({
    history: true,
    cache: true,
    cookies: true,
    downloads: false,
    storage: false,
  })

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

    if (key === 'highContrastMode') {
      document.documentElement.classList.toggle('high-contrast-mode', !!val)
    }
    if (key === 'textScalePercent') {
      document.documentElement.style.fontSize = `${(val / 100) * 16}px`
    }
    if (key === 'reduceMotion') {
      document.documentElement.classList.toggle('reduce-motion-mode', !!val)
    }
    if (key === 'dyslexicFont') {
      document.documentElement.classList.toggle('dyslexic-font-mode', !!val)
    }
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
    await window.nexus?.history?.clear?.()
    setShowClearModal(false)
    onToast?.('Browsing data and selected cache purged successfully', 'success')
  }

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(settings, null, 2))
    const dlAnchor = document.createElement('a')
    dlAnchor.setAttribute('href', dataStr)
    dlAnchor.setAttribute('download', `NeXusWeb-Preferences-Backup-${new Date().toISOString().slice(0,10)}.json`)
    document.body.appendChild(dlAnchor)
    dlAnchor.click()
    dlAnchor.remove()
    onToast?.('Configuration exported to JSON', 'success')
  }

  const handleResetDefaults = async () => {
    if (window.confirm('Restore all NeXusWeb settings to original factory defaults?')) {
      await window.nexus?.settings?.reset?.()
      onToast?.('Settings restored to defaults', 'success')
      onClose()
    }
  }

  const inputSelectStyle = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--glass-border)',
    borderRadius: 6,
    color: 'var(--text-primary)',
    padding: '6px 10px',
    fontSize: 12,
    outline: 'none',
    transition: 'all 0.15s ease',
  }

  return (
    <div className="full-settings-view">
      
      {/* Left Sidebar Navigation */}
      <div className="settings-sidebar-nav">
        <div style={{ padding: '0 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={logoImg} alt="" style={{ width: 22, height: 22, borderRadius: 4 }} onError={e => e.target.style.display = 'none'} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Settings</span>
          </div>
          <span className="glass-pill" style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)' }}>
            v7.1.0
          </span>
        </div>

        {/* Omnibox Filter Search in Settings */}
        <div style={{ padding: '0 8px 10px 8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--bg-surface)',
            border: '1px solid var(--glass-border)',
            borderRadius: 8,
            padding: '5px 8px',
          }}>
            <Search size={13} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: 11.5,
                width: '100%',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                <X size={12} />
              </button>
            )}
          </div>
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
                } else if (item.id === 'about') {
                  onClose()
                  onOpenPanel?.('about')
                } else {
                  setActiveSection(item.id)
                  setSearchQuery('')
                }
              }}
            >
              <IconComp size={16} style={{ color: isActive ? 'var(--accent-primary)' : 'inherit', flexShrink: 0 }} />
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {item.badge && (
                <span className="glass-pill" style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px' }}>
                  {item.badge}
                </span>
              )}
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
            className="glass-btn-icon"
            style={{ width: 32, height: 32, borderRadius: '50%' }}
            title="Close Settings (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        <div className="settings-content-wrapper">
          
          {/* 1. Privacy and Security */}
          {activeSection === 'privacy' && (
            <div>
              <div className="settings-section-heading">
                <Shield size={20} style={{ color: 'var(--green)' }} />
                <span>Privacy and security</span>
              </div>

              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">DuckDuckGo Privacy Shield & AdBlock</div>
                    <div className="settings-row-desc">Block known web trackers, analytics beacons, intrusive advertising, and cryptominers</div>
                  </div>
                  <select
                    value={settings.adblockLevel}
                    onChange={e => updateSetting('adblockLevel', e.target.value)}
                    style={inputSelectStyle}
                  >
                    <option value="strict">Strict (Blocks Ads & Trackers)</option>
                    <option value="balanced">Balanced (Standard)</option>
                    <option value="off">Off (Developer Pass-through)</option>
                  </select>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">DNS-over-HTTPS (DoH) Encryption</div>
                    <div className="settings-row-desc">Encrypt domain queries to prevent ISP surveillance and DNS tampering</div>
                  </div>
                  <select
                    value={settings.dohProvider}
                    onChange={e => updateSetting('dohProvider', e.target.value)}
                    style={inputSelectStyle}
                  >
                    {DOH_PROVIDERS.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">WebRTC IP Leak Shield</div>
                    <div className="settings-row-desc">Disable non-proxied WebRTC UDP packets to prevent real local/public IP leaks</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.webrtcShieldEnabled}
                    onChange={e => updateSetting('webrtcShieldEnabled', e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Canvas & Audio Fingerprint Randomization</div>
                    <div className="settings-row-desc">Inject subtle noise into HTML5 Canvas, WebGL, and AudioContext APIs to defeat fingerprinting</div>
                  </div>
                  <select
                    value={settings.fingerprintLevel}
                    onChange={e => updateSetting('fingerprintLevel', e.target.value)}
                    style={inputSelectStyle}
                  >
                    <option value="standard">Standard Noise (Recommended)</option>
                    <option value="aggressive">Aggressive Noise</option>
                    <option value="off">Disabled</option>
                  </select>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">HTTPS-Only Auto-Upgrade</div>
                    <div className="settings-row-desc">Automatically rewrite insecure HTTP URLs to encrypted HTTPS connections</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.httpsOnly}
                    onChange={e => updateSetting('httpsOnly', e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Native VPN & Egress Tunnel Node</div>
                    <div className="settings-row-desc">Route outbound HTTP/HTTPS web traffic through high-speed encrypted endpoints</div>
                  </div>
                  <select
                    value={vpnRegion}
                    onChange={e => handleSetProxy(e.target.value)}
                    style={inputSelectStyle}
                  >
                    <option value="direct">Direct (No VPN)</option>
                    <option value="nl">Netherlands (NL) — Fast</option>
                    <option value="us">United States (US) — Fast</option>
                    <option value="sg">Singapore (SG) — Asia Pacific</option>
                    <option value="uk">United Kingdom (UK) — Europe</option>
                    <option value="de">Germany / EU (DE) — Fast</option>
                  </select>
                </div>

                <div className="settings-row" style={{ paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
                  <div>
                    <div className="settings-row-label">Clear Browsing Data & Cache</div>
                    <div className="settings-row-desc">Purge history, cached images, cookies, session tokens, and local sandboxes</div>
                  </div>
                  <button
                    onClick={() => setShowClearModal(true)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      borderRadius: 6,
                      color: 'var(--red)',
                      padding: '6px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Clear Browsing Data...
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. Performance & Memory */}
          {activeSection === 'performance' && (
            <div>
              <div className="settings-section-heading">
                <Activity size={20} style={{ color: 'var(--accent-primary)' }} />
                <span>Performance & Memory Saver</span>
              </div>

              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Memory Saver (Inactive Tab Suspender)</div>
                    <div className="settings-row-desc">Automatically suspend background tabs to reclaim system RAM for the active window</div>
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
                    <div className="settings-row-label">Tab Suspension Timeout</div>
                    <div className="settings-row-desc">Inactivity duration before background tabs are placed into sleep state</div>
                  </div>
                  <select
                    value={settings.tabSuspenderMinutes}
                    onChange={e => updateSetting('tabSuspenderMinutes', Number(e.target.value))}
                    disabled={!settings.tabSuspenderEnabled}
                    style={inputSelectStyle}
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes (Recommended)</option>
                    <option value={60}>1 Hour</option>
                    <option value={120}>2 Hours</option>
                  </select>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Memory Saver Domain Whitelist</div>
                    <div className="settings-row-desc">Comma-separated domains that must never be suspended (e.g. localhost, figma.com)</div>
                  </div>
                  <input
                    type="text"
                    value={settings.tabSuspenderWhitelist}
                    onChange={e => updateSetting('tabSuspenderWhitelist', e.target.value)}
                    style={{ ...inputSelectStyle, width: 220 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. NeXusApp & Localhost */}
          {activeSection === 'nexusapp' && (
            <div>
              <div className="settings-section-heading">
                <Zap size={20} style={{ color: 'var(--yellow)' }} />
                <span>NeXusApp & Localhost Engine</span>
              </div>

              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Zero-Restriction CORS in Dev Mode</div>
                    <div className="settings-row-desc">Permit cross-origin requests to any localhost API port during local development</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', background: 'rgba(34, 197, 94, 0.15)', padding: '3px 8px', borderRadius: 12 }}>
                    ACTIVE IN DEV MODE
                  </span>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Localhost Port Discovery Daemon</div>
                    <div className="settings-row-desc">Auto-discover active dev servers (Vite, Next.js, Flask, Django, Express) on ports 3000-8080</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.backgroundWatcher}
                    onChange={e => updateSetting('backgroundWatcher', e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Appearance & Themes */}
          {activeSection === 'appearance' && (
            <div>
              <div className="settings-section-heading">
                <Palette size={20} style={{ color: 'var(--accent-secondary)' }} />
                <span>Appearance & Themes</span>
              </div>

              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Frosted Glass Theme Preset</div>
                    <div className="settings-row-desc">Select active color scheme and translucent glass styling</div>
                  </div>
                  <select
                    value={currentTheme}
                    onChange={e => onThemeChange?.(e.target.value)}
                    style={inputSelectStyle}
                  >
                    {THEME_OPTIONS.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Glass Blur Shader Intensity</div>
                    <div className="settings-row-desc">Adjust backdrop-filter blur level for sidebars and menu drawers</div>
                  </div>
                  <select
                    value={settings.blurIntensity}
                    onChange={e => updateSetting('blurIntensity', e.target.value)}
                    style={inputSelectStyle}
                  >
                    <option value="low">Subtle (12px Blur)</option>
                    <option value="medium">Medium (24px Blur — Recommended)</option>
                    <option value="high">High Glass (36px Deep Blur)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 5. Search Engine */}
          {activeSection === 'search' && (
            <div>
              <div className="settings-section-heading">
                <Search size={20} style={{ color: 'var(--accent-primary)' }} />
                <span>Search engine</span>
              </div>

              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Search engine used in the address bar</div>
                    <div className="settings-row-desc">Default search query provider for omnibox queries</div>
                  </div>
                  <select
                    value={settings.searchEngine?.id || 'duckduckgo'}
                    onChange={e => {
                      const engine = SEARCH_ENGINES.find(s => s.id === e.target.value)
                      if (engine) updateSetting('searchEngine', engine)
                    }}
                    style={inputSelectStyle}
                  >
                    {SEARCH_ENGINES.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {settings.searchEngine?.id === 'custom' && (
                  <div className="settings-row">
                    <div>
                      <div className="settings-row-label">Custom Search Query URL</div>
                      <div className="settings-row-desc">Use {'{query}'} as placeholder for search terms</div>
                    </div>
                    <input
                      type="text"
                      placeholder="https://example.com/search?q={query}"
                      value={settings.customSearchUrl}
                      onChange={e => updateSetting('customSearchUrl', e.target.value)}
                      style={{ ...inputSelectStyle, width: 240 }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. On Startup */}
          {activeSection === 'startup' && (
            <div>
              <div className="settings-section-heading">
                <Power size={20} style={{ color: 'var(--accent-primary)' }} />
                <span>On startup</span>
              </div>

              <div className="settings-card">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer', marginBottom: 10 }}>
                  <input
                    type="radio"
                    name="startupAction"
                    value="newtab"
                    checked={settings.startupAction === 'newtab'}
                    onChange={e => updateSetting('startupAction', e.target.value)}
                  />
                  <span>Open the New Tab page (Home Dashboard)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="startupAction"
                    value="restore"
                    checked={settings.startupAction === 'restore'}
                    onChange={e => updateSetting('startupAction', e.target.value)}
                  />
                  <span>Continue where you left off (Restore previous session tabs)</span>
                </label>
              </div>
            </div>
          )}

          {/* 7. Downloads */}
          {activeSection === 'downloads' && (
            <div>
              <div className="settings-section-heading">
                <Download size={20} style={{ color: 'var(--accent-primary)' }} />
                <span>Downloads & Acceleration</span>
              </div>

              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Download directory location</div>
                    <div className="settings-row-desc">{settings.downloadPath || 'Default OS Downloads Folder'}</div>
                  </div>
                  <button
                    onClick={async () => {
                      const res = await window.nexus?.downloads?.selectFolder?.()
                      if (res?.success && res.path) {
                        updateSetting('downloadPath', res.path)
                        onToast?.(`Downloads directory updated to: ${res.path}`, 'success')
                      }
                    }}
                    className="glass-btn"
                    style={{ fontSize: 12, padding: '5px 12px' }}
                  >
                    Change Directory
                  </button>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Speed Limiter (Bandwidth Throttle)</div>
                    <div className="settings-row-desc">Throttle bandwidth usage so active downloads do not interrupt streaming, browsing, or gaming</div>
                  </div>
                  <select
                    value={settings.downloadSpeedLimitKB || 0}
                    onChange={e => updateSetting('downloadSpeedLimitKB', Number(e.target.value))}
                    style={inputSelectStyle}
                  >
                    <option value={0}>Unlimited (Maximum Line Speed)</option>
                    <option value={512}>500 KB/s (Ultra Low Impact)</option>
                    <option value={1024}>1 MB/s (Low Impact)</option>
                    <option value={2048}>2 MB/s (Balanced — Streaming Safe)</option>
                    <option value={5120}>5 MB/s (High Speed)</option>
                    <option value={10240}>10 MB/s (Turbo Cap)</option>
                  </select>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Dynamic Multi-Part Segmentation Engine</div>
                    <div className="settings-row-desc">Dynamically splits files into parallel chunks and re-splits the largest chunk in half when connections finish early</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.multiPartEnabled !== false}
                    onChange={e => updateSetting('multiPartEnabled', e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Max Concurrent Connections per File</div>
                    <div className="settings-row-desc">Maximum parallel HTTP keep-alive segment workers per download task</div>
                  </div>
                  <select
                    value={settings.maxDownloadConnections || 8}
                    onChange={e => updateSetting('maxDownloadConnections', Number(e.target.value))}
                    style={inputSelectStyle}
                  >
                    <option value={4}>4 Connections (Standard)</option>
                    <option value={8}>8 Connections (Turbo — Recommended)</option>
                    <option value={16}>16 Connections (Maximum Velocity)</option>
                  </select>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Ask where to save each file before downloading</div>
                    <div className="settings-row-desc">Show file save location dialog on every outbound download request</div>
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

          {/* 8. Accessibility (Upgraded) */}
          {activeSection === 'accessibility' && (
            <div>
              <div className="settings-section-heading">
                <Accessibility size={20} style={{ color: 'var(--accent-primary)' }} />
                <span>Accessibility & Visual Ergonomics</span>
              </div>

              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">High-Contrast OLED Mode</div>
                    <div className="settings-row-desc">Apply pure pitch-black background with ultra-high contrast neon cyan outlines and text</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.highContrastMode}
                    onChange={e => updateSetting('highContrastMode', e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Text & UI Scale ({settings.textScalePercent}%)</div>
                    <div className="settings-row-desc">Scale typography and layout elements for comfortable viewing</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="range"
                      min={80}
                      max={150}
                      step={5}
                      value={settings.textScalePercent}
                      onChange={e => updateSetting('textScalePercent', Number(e.target.value))}
                      style={{ width: 130, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', minWidth: 40, textAlign: 'right' }}>
                      {settings.textScalePercent}%
                    </span>
                  </div>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Dyslexic-Friendly Typography</div>
                    <div className="settings-row-desc">Enhance letterform distinction with high-legibility typographic fonts</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.dyslexicFont}
                    onChange={e => updateSetting('dyslexicFont', e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Reduce Motion & Animations</div>
                    <div className="settings-row-desc">Disable translucent glass blur shaders and slide animations to reduce motion sensitivity</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.reduceMotion}
                    onChange={e => updateSetting('reduceMotion', e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">High-Visibility Focus Rings</div>
                    <div className="settings-row-desc">Draw prominent neon borders around currently focused inputs and buttons during keyboard navigation</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.neonFocusRings}
                    onChange={e => updateSetting('neonFocusRings', e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Color Vision Simulation Filters</div>
                    <div className="settings-row-desc">Simulate color-blindness palettes (Daltonism filters) for accessibility testing</div>
                  </div>
                  <select
                    value={settings.colorFilter}
                    onChange={e => updateSetting('colorFilter', e.target.value)}
                    style={inputSelectStyle}
                  >
                    <option value="none">Normal (Standard Full Color)</option>
                    <option value="protanopia">Protanopia (Red-Weak)</option>
                    <option value="deuteranopia">Deuteranopia (Green-Weak)</option>
                    <option value="tritanopia">Tritanopia (Blue-Weak)</option>
                    <option value="monochrome">Monochrome (Grayscale)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 9. System (Upgraded) */}
          {activeSection === 'system' && (
            <div>
              <div className="settings-section-heading">
                <Wrench size={20} style={{ color: 'var(--yellow)' }} />
                <span>System & Diagnostics</span>
              </div>

              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Default Network Mode for New Windows</div>
                    <div className="settings-row-desc">Initial isolation state for newly spawned browser sessions</div>
                  </div>
                  <select
                    value={currentMode}
                    onChange={e => onModeChange?.(e.target.value)}
                    style={inputSelectStyle}
                  >
                    <option value="normal">Normal Web (Privacy Shield)</option>
                    <option value="strict">Strict Offline (Localhost Only)</option>
                    <option value="lan">Local Network (LAN Only)</option>
                    <option value="dev">Developer Mode (Unrestricted)</option>
                  </select>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Hardware Acceleration (GPU)</div>
                    <div className="settings-row-desc">Use GPU rasterization when available for high-speed page rendering</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.hardwareAcceleration}
                    onChange={e => updateSetting('hardwareAcceleration', e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Port Scanner Daemon Interval</div>
                    <div className="settings-row-desc">Frequency for scanning active local development web services</div>
                  </div>
                  <select
                    value={settings.portScanInterval}
                    onChange={e => updateSetting('portScanInterval', Number(e.target.value))}
                    style={inputSelectStyle}
                  >
                    <option value={5}>Every 5 Seconds (High Frequency)</option>
                    <option value={10}>Every 10 Seconds (Balanced)</option>
                    <option value={30}>Every 30 Seconds (Low Power)</option>
                    <option value={0}>Manual Scanning Only</option>
                  </select>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Notify on New Port Detected</div>
                    <div className="settings-row-desc">Show non-intrusive toast alert when a new localhost server starts up</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.portNotifyToast}
                    onChange={e => updateSetting('portNotifyToast', e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                </div>

                <div className="settings-row" style={{ paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
                  <div>
                    <div className="settings-row-label">Export Preferences Backup</div>
                    <div className="settings-row-desc">Download a complete JSON snapshot of your current settings and configuration</div>
                  </div>
                  <button
                    onClick={handleExportBackup}
                    className="glass-btn"
                    style={{ fontSize: 12, padding: '6px 14px' }}
                  >
                    Export JSON
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 10. Reset Settings */}
          {activeSection === 'reset' && (
            <div>
              <div className="settings-section-heading">
                <RotateCcw size={20} style={{ color: 'var(--red)' }} />
                <span>Reset settings</span>
              </div>

              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">Restore settings to original factory defaults</div>
                    <div className="settings-row-desc">This action will reset search engines, themes, permissions, and network preferences. Your bookmarks and history will be preserved.</div>
                  </div>
                  <button
                    onClick={handleResetDefaults}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      borderRadius: 6,
                      color: 'var(--red)',
                      padding: '8px 16px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Reset Settings
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Clear Browsing Data Modal */}
      {showClearModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'var(--glass-blur)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}>
          <div style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            borderRadius: 16,
            width: 440,
            padding: '20px 24px',
            boxShadow: 'var(--glass-shadow-lg)',
            color: 'var(--text-primary)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={18} color="var(--red)" />
                <span>Clear Browsing Data</span>
              </div>
              <button onClick={() => setShowClearModal(false)} className="glass-btn-icon" style={{ width: 28, height: 28 }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={clearOptions.history}
                  onChange={e => setClearOptions(p => ({ ...p, history: e.target.checked }))}
                />
                <span>Browsing History & Omnibox URL suggestions</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={clearOptions.cache}
                  onChange={e => setClearOptions(p => ({ ...p, cache: e.target.checked }))}
                />
                <span>Cached Webpages, Images & Asset files</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={clearOptions.cookies}
                  onChange={e => setClearOptions(p => ({ ...p, cookies: e.target.checked }))}
                />
                <span>Cookies and active site session tokens</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={clearOptions.storage}
                  onChange={e => setClearOptions(p => ({ ...p, storage: e.target.checked }))}
                />
                <span>LocalStorage & IndexedDB client databases</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setShowClearModal(false)}
                className="glass-btn"
                style={{ fontSize: 12, padding: '6px 14px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearBrowsingData}
                style={{ background: 'var(--red)', border: 'none', borderRadius: 8, color: '#fff', padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Purge Selected Data
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
