import React, { useState, useEffect } from 'react'
import {
  HelpCircle, Compass, Shield, Lock, Cpu, Terminal, Keyboard,
  FileQuestion, Search, Zap, ExternalLink, X, ChevronRight, Info,
  Settings, Wrench, Check, Globe, RefreshCw, Eye, Sparkles, Layers, Sliders
} from 'lucide-react'

export default function HelpPanel({ onClose, onOpenSettings, onOpenAbout }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('getting-started')

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const CATEGORIES = [
    { id: 'getting-started', label: 'Getting Started', icon: Compass },
    { id: 'privacy-modes', label: 'Network & Privacy Modes', icon: Shield },
    { id: 'vpn-tunnels', label: 'VPN & Encrypted Tunnels', icon: Lock },
    { id: 'developer-suite', label: 'Developer Suite & Tools', icon: Cpu },
    { id: 'private-den', label: 'Private Den Sandbox', icon: Eye },
    { id: 'shortcuts', label: 'Keyboard Shortcuts Matrix', icon: Keyboard },
    { id: 'troubleshooting', label: 'FAQ & Diagnostics', icon: FileQuestion },
  ]

  const SHORTCUTS = [
    { key: 'Ctrl + T', desc: 'Open a new browser tab', group: 'Navigation' },
    { key: 'Ctrl + W', desc: 'Close active tab', group: 'Navigation' },
    { key: 'Ctrl + Shift + T', desc: 'Reopen last closed tab', group: 'Navigation' },
    { key: 'Ctrl + N', desc: 'Open a new browser window', group: 'Navigation' },
    { key: 'Ctrl + Shift + P', desc: 'Open Private Den RAM sandbox window', group: 'Privacy' },
    { key: 'Ctrl + L / Alt + D', desc: 'Focus and select URL Address Bar', group: 'Navigation' },
    { key: 'Ctrl + \\', desc: 'Toggle Dual Split View (Side-by-side)', group: 'Productivity' },
    { key: 'Ctrl + `', desc: 'Toggle Integrated Multi-Tab Terminal Shell', group: 'Developer' },
    { key: 'F12 / Ctrl+Shift+I', desc: 'Open Chromium DevTools / Request Inspector', group: 'Developer' },
    { key: 'Ctrl + Shift + L', desc: 'Auto-scan and detect active localhost ports', group: 'Developer' },
    { key: 'Ctrl + Shift + B', desc: 'Toggle Bookmarks Bar visibility', group: 'Navigation' },
    { key: 'Ctrl + H', desc: 'Open Browsing History drawer', group: 'Navigation' },
    { key: 'Ctrl + J', desc: 'Open Downloads drawer', group: 'Navigation' },
    { key: 'Ctrl + F', desc: 'Find in current webpage', group: 'Navigation' },
    { key: 'F9 / Ctrl+Shift+S', desc: 'Capture full page screenshot', group: 'Productivity' },
    { key: 'Ctrl + + / - / 0', desc: 'Zoom in, Zoom out, Reset zoom to 100%', group: 'Productivity' },
    { key: 'F11', desc: 'Toggle Fullscreen Mode', group: 'Productivity' },
    { key: 'F1', desc: 'Open NeXusWeb Help Center', group: 'Help' },
    { key: 'Ctrl + Shift + Q', desc: 'Exit NeXusWeb browser safely', group: 'System' },
  ]

  return (
    <div
      id="help-modal-backdrop"
      onClick={(e) => {
        if (e.target.id === 'help-modal-backdrop') onClose?.()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 950,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px',
        animation: 'helpFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        id="panel-help-dialog"
        style={{
          width: 860,
          maxWidth: '96vw',
          height: 620,
          maxHeight: '92vh',
          backgroundColor: 'var(--bg-base)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--glass-shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'helpZoomIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Top Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 22px',
          borderBottom: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-hover)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}>
              <HelpCircle size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                NeXusWeb Documentation & Help Center
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                User Guide, Privacy Specifications & Developer Manual
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Search Omnibox */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              borderRadius: 8,
              padding: '4px 10px',
              width: 220,
            }}>
              <Search size={13} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search help topics..."
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

            <button
              onClick={onClose}
              className="glass-btn-icon"
              style={{ width: 30, height: 30 }}
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Two-Column Body: Navigation Sidebar + Scroll Content */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          
          {/* Left Category Sidebar */}
          <div style={{
            width: 240,
            borderRight: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            padding: '12px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            overflowY: 'auto',
          }}>
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id)
                    setSearchQuery('')
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: isActive ? '1px solid var(--glass-border-hover)' : '1px solid transparent',
                    background: isActive ? 'var(--bg-active)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 500,
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--bg-hover)'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }
                  }}
                >
                  <IconComp size={15} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cat.label}
                  </span>
                  {isActive && <ChevronRight size={13} />}
                </button>
              )
            })}

            {/* Quick Links at Sidebar Bottom */}
            <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--glass-border)' }}>
              <button
                onClick={() => { onClose?.(); onOpenSettings?.(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: 11.5,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <Settings size={13} />
                <span>Open Preferences</span>
              </button>
              <button
                onClick={() => { onClose?.(); onOpenAbout?.(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: 11.5,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <Info size={13} />
                <span>About NeXusWeb</span>
              </button>
            </div>
          </div>

          {/* Right Content Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            scrollbarWidth: 'thin',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            background: 'var(--bg-base)',
          }}>

            {/* 1. Getting Started Guide */}
            {activeCategory === 'getting-started' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                  <Compass size={18} />
                  <span style={{ fontSize: 15, fontWeight: 800 }}>Getting Started with NeXusWeb</span>
                </div>

                <div className="glass-card">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Tabs & Workspace Management
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Open new tabs with <kbd className="glass-pill">Ctrl+T</kbd>, close tabs with <kbd className="glass-pill">Ctrl+W</kbd>, or restore closed tabs with <kbd className="glass-pill">Ctrl+Shift+T</kbd>. Tabs feature live resource indicators and automatic inactive suspension to conserve system RAM.
                  </div>
                </div>

                <div className="glass-card">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Dual Split View Multitasking
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Press <kbd className="glass-pill">Ctrl+\</kbd> or click the Split View icon in the address bar to run two websites or dev dashboards side-by-side. Drag the center divider (10% to 90%) to resize panes dynamically, or double-click the splitter handle to restore the 50/50 balanced layout.
                  </div>
                </div>

                <div className="glass-card">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Side Drawers & Synchronized Scaling
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Open Bookmarks, History, Downloads, or ScratchPad. You can resize side drawers seamlessly by dragging their left border (115px to 880px); the active webpage viewport resizes smoothly in real-time with zero overlay gap.
                  </div>
                </div>
              </div>
            )}

            {/* 2. Network & Privacy Modes Guide */}
            {activeCategory === 'privacy-modes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                  <Shield size={18} style={{ color: 'var(--green)' }} />
                  <span style={{ fontSize: 15, fontWeight: 800 }}>Multi-Engine Network & Privacy Modes</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                  <div className="glass-card">
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                      Normal Mode (Privacy Shield)
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Full web connectivity with built-in tracker and ad blocking, HTTPS auto-upgrades, anti-fingerprinting noise injection, and WebRTC non-proxied UDP leak prevention.
                    </div>
                  </div>

                  <div className="glass-card">
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', marginBottom: 3 }}>
                      Localhost & LAN Mode
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Zero-delay network routing optimized for internal development subnets (127.0.0.1, 192.168.x.x, 10.x.x.x), microservices, Docker clusters, and LAN services.
                    </div>
                  </div>

                  <div className="glass-card">
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--yellow)', marginBottom: 3 }}>
                      Strict Privacy Mode
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Hardened sandbox that blocks third-party cookies, eliminates all background telemetry, disables WebRTC entirely, and forces strict DoH encryption.
                    </div>
                  </div>

                  <div className="glass-card">
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 3 }}>
                      Developer Mode
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Unrestricted mode with zero CORS limitations for localhost API testing, background server auto-detection, and deep HTTP packet introspection.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. VPN & Encrypted Tunnels Guide */}
            {activeCategory === 'vpn-tunnels' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                  <Lock size={18} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ fontSize: 15, fontWeight: 800 }}>Native High-Speed VPN & Encrypted Tunnels</span>
                </div>

                <div className="glass-card">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Verified Regional Egress Nodes
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    NeXusWeb includes built-in high-speed regional egress nodes in <strong>Netherlands (NL)</strong>, <strong>Singapore (SG)</strong>, <strong>United States (US)</strong>, <strong>United Kingdom (UK)</strong>, and <strong>Germany (DE)</strong>. Connect in 1-click via the Control Center or the Private Den address bar.
                  </div>
                </div>

                <div className="glass-card">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Encrypted DNS-over-HTTPS (DoH)
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    All domain name resolution is routed through secure, encrypted DNS servers (Cloudflare, Quad9, or custom upstream servers) to prevent ISP eavesdropping and DNS spoofing.
                  </div>
                </div>

                <div className="glass-card">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Header Sanitization & Leak Shield
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Outbound requests automatically have identifying tracking headers (<code>X-Forwarded-For</code>, <code>Client-IP</code>, <code>True-Client-IP</code>) stripped. WebRTC non-proxied UDP traffic is disabled to ensure zero IP address leaks.
                  </div>
                </div>
              </div>
            )}

            {/* 4. Developer Suite & Tools Guide */}
            {activeCategory === 'developer-suite' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                  <Cpu size={18} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ fontSize: 15, fontWeight: 800 }}>Developer Suite & Workbenches</span>
                </div>

                <div className="glass-card">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    REST & GraphQL API Workbench
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Test endpoints directly inside the browser. Supports GET, POST, PUT, DELETE, custom request headers, JSON formatting, response time measurements, and .env environment variable interpolation.
                  </div>
                </div>

                <div className="glass-card">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Port Manager & Localhost Scanner
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Background daemon automatically discovers active dev servers (Vite, Next.js, Django, Flask, Express, Rails) on ports 3000-8080. Features 1-click PID termination to free blocked ports.
                  </div>
                </div>

                <div className="glass-card">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Integrated Multi-Tab Terminal Shell
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Press <kbd className="glass-pill">Ctrl+`</kbd> to open the embedded terminal. Powered by full PTY terminal emulation with persistent shell sessions.
                  </div>
                </div>
              </div>
            )}

            {/* 5. Private Den Sandbox Guide */}
            {activeCategory === 'private-den' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                  <Eye size={18} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ fontSize: 15, fontWeight: 800 }}>Private Den Ephemeral RAM Sandbox</span>
                </div>

                <div className="glass-card">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    RAM-Only Ephemeral Partition (partition: memory)
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Private Den runs in an isolated in-memory browser partition. No cookies, local storage, indexedDB, cache files, or browsing history are ever written to physical disk.
                  </div>
                </div>

                <div className="glass-card">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Dedicated 1-Click VPN Integration
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Private Den includes a dedicated <strong>[ VPN ]</strong> button directly in the address bar. Switch regional egress tunnels (Netherlands, USA, Singapore, UK) instantly while browsing in RAM sandbox mode.
                  </div>
                </div>

                <div className="glass-card">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    1-Click Wipe & Exit
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Clicking <strong>Wipe & Exit</strong> or closing the Private Den window completely purges all in-memory cryptographic state and closes the sandbox session immediately.
                  </div>
                </div>
              </div>
            )}

            {/* 6. Keyboard Shortcuts Matrix */}
            {activeCategory === 'shortcuts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                  <Keyboard size={18} />
                  <span style={{ fontSize: 15, fontWeight: 800 }}>Complete Keyboard Shortcuts Matrix</span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: 8,
                }}>
                  {SHORTCUTS.filter(s =>
                    !searchQuery || s.key.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((s, idx) => (
                    <div
                      key={idx}
                      className="glass-card"
                      style={{
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}
                    >
                      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{s.desc}</div>
                      <kbd className="glass-pill" style={{
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        padding: '2px 8px',
                        whiteSpace: 'nowrap',
                      }}>
                        {s.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. FAQ & Diagnostics */}
            {activeCategory === 'troubleshooting' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                  <FileQuestion size={18} style={{ color: 'var(--yellow)' }} />
                  <span style={{ fontSize: 15, fontWeight: 800 }}>Frequently Asked Questions & Diagnostics</span>
                </div>

                <div className="glass-card">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    How do I verify my VPN tunnel is working?
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Open the Control Center or Private Den VPN panel to see the live ping latency indicator. You can also visit external IP checking tools to confirm your exit IP is in Netherlands, USA, Singapore, UK, or Germany.
                  </div>
                </div>

                <div className="glass-card">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Why is my local dev server not connecting in Normal Mode?
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Switch the Network Mode pill to <strong>Localhost & LAN Mode</strong> or <strong>Developer Mode</strong>. These modes eliminate CORS restrictions and enable direct zero-delay socket connections to your local development environment.
                  </div>
                </div>

                <div className="glass-card">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    How do in-place updates preserve my data?
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    NeXusWeb delta upgrader replaces application binaries while preserving 100% of your local user profile database, bookmarks, search engine templates, and configuration stored on your device.
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        @keyframes helpFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes helpZoomIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
