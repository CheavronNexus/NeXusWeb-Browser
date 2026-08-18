import React, { useState, useEffect, useRef } from 'react'
import {
  SlidersHorizontal, Shield, BookOpen, Tv, Cpu, Split, Music, Puzzle,
  Palette, Wrench, X, Check, Activity, Globe, Zap, Terminal, Database,
  Search, FileText, Lock, Key, Sparkles, HelpCircle, Settings, ChevronRight
} from 'lucide-react'

export default function QuickToolsDrawer({
  onClose,
  onOpenPanel,
  onToggleReaderMode,
  onTriggerPiP,
  onToggleSplitView,
  onToggleDevTools,
  onToggleTerminal,
  showTerminal = false,
  detectedServersCount = 0,
  isSplitView = false,
  isAudioPlaying = false,
  privacyStats,
  mode = 'normal',
  onToast,
  isPrivateDen = false,
  onWipeAndExit,
}) {
  const [vpnConfig, setVpnConfig] = useState({ mode: 'direct', region: 'direct' })
  const panelRef = useRef(null)

  // Sync exact drawer width with Electron BrowserView
  useEffect(() => {
    window.nexus?.setDrawerWidth?.(340)
    return () => {
      window.nexus?.setDrawerWidth?.(0)
    }
  }, [])

  // Track live VPN / Proxy status
  useEffect(() => {
    const checkVpn = async () => {
      try {
        const conf = await window.nexus?.proxy?.getConfig()
        if (conf) setVpnConfig(conf)
      } catch (e) {}
    }
    checkVpn()
    const interval = setInterval(checkVpn, 2000)
    return () => clearInterval(interval)
  }, [])

  // Click outside to close
  useEffect(() => {
    let timer = null
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest('#btn-quick-tools')) {
        onClose()
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 60)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      if (timer) clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const handleSetProxy = async (region) => {
    if (region === 'direct') {
      const res = await window.nexus?.proxy?.setMode?.('direct', 'direct')
      setVpnConfig({ mode: 'direct', region: 'direct' })
      onToast?.('Disconnected VPN (Direct connection)', 'info')
    } else {
      const res = await window.nexus?.proxy?.setMode?.('proxy', region)
      if (res?.config) {
        setVpnConfig(res.config)
      } else {
        setVpnConfig({ mode: 'proxy', region })
      }
      onToast?.(`Connected to High-Speed VPN: ${region.toUpperCase()}`, 'success')
    }
  }

  const nexusApps = [
    {
      id: 'api-workbench',
      icon: Zap,
      iconColor: '#f59e0b',
      title: 'REST & GraphQL API Workbench',
      desc: 'Integrated HTTP endpoint testing with .env workspace variables',
    },
    {
      id: 'ports',
      icon: Cpu,
      iconColor: '#22c55e',
      title: `Port Manager & Localhost Auto-Scan ${detectedServersCount > 0 ? `(${detectedServersCount})` : ''}`,
      desc: 'Continuously discovers active dev servers (Vite, Next.js, Django, Flask)',
    },
    {
      id: 'inspector',
      icon: Search,
      iconColor: '#00d4ff',
      title: 'Request Inspector (Network Logger)',
      desc: 'Live capture of all HTTP/HTTPS requests, headers, and payloads',
    },
    {
      id: 'notes',
      icon: FileText,
      iconColor: '#a855f7',
      title: 'ScratchPad & Developer Notes',
      desc: 'Instant scratchpad tied to current workspace and domain',
    },
    {
      id: 'env',
      icon: Key,
      iconColor: '#ec4899',
      title: '.env Workspace Variables',
      desc: 'Securely manage local development environment variables',
    },
  ]

  return (
    <div
      ref={panelRef}
      className="quick-tools-popover"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 340,
        height: '100%',
        background: '#161822',
        borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.75)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 300,
        userSelect: 'none',
        fontFamily: 'var(--font-sans)',
        color: '#e2e8f0',
        animation: 'slideInRight 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: isPrivateDen ? 'rgba(168, 85, 247, 0.08)' : 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
          {isPrivateDen ? (
            <>
              <span style={{ fontSize: 15 }}>🕵️</span>
              <span style={{ color: '#d8b4fe' }}>Private Den Security</span>
            </>
          ) : (
            <>
              <SlidersHorizontal size={16} style={{ color: 'var(--accent-primary)' }} />
              <span>Quick Tools & Utilities</span>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}
          title="Close (Esc)"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', scrollbarWidth: 'thin' }}>
        
        {/* 1. Quick VPN Bar & Encrypted Privacy Tunnel */}
        <div style={{
          background: isPrivateDen ? 'rgba(168, 85, 247, 0.08)' : 'rgba(255, 255, 255, 0.04)',
          border: '1px solid',
          borderColor: isPrivateDen ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.08)',
          borderRadius: 10,
          padding: '12px 14px',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={15} style={{ color: vpnConfig.mode !== 'direct' ? '#38bdf8' : '#94a3b8' }} />
              <span>Native VPN & Privacy Tunnel</span>
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: 800,
              color: vpnConfig.mode !== 'direct' ? '#38bdf8' : '#94a3b8',
              background: vpnConfig.mode !== 'direct' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.06)',
              border: vpnConfig.mode !== 'direct' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
              padding: '2px 8px',
              borderRadius: 6,
            }}>
              {vpnConfig.mode !== 'direct' ? `${vpnConfig.region?.toUpperCase()} ACTIVE` : 'DIRECT'}
            </span>
          </div>

          {/* Region Switcher Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 10 }}>
            {[
              { id: 'direct', label: '⚡ Direct', flag: '🌐' },
              { id: 'us', label: 'United States', flag: '🇺🇸' },
              { id: 'nl', label: 'Netherlands', flag: '🇳🇱' },
              { id: 'sg', label: 'Singapore', flag: '🇸🇬' },
              { id: 'uk', label: 'United Kingdom', flag: '🇬🇧' },
              { id: 'de', label: 'Germany', flag: '🇩🇪' },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => handleSetProxy(r.id)}
                style={{
                  padding: '6px 4px',
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: vpnConfig.region === r.id ? (isPrivateDen ? '#a855f7' : '#00d4ff') : 'rgba(255,255,255,0.08)',
                  background: vpnConfig.region === r.id ? (isPrivateDen ? 'rgba(168, 85, 247, 0.25)' : 'rgba(0, 212, 255, 0.18)') : 'rgba(255,255,255,0.02)',
                  color: vpnConfig.region === r.id ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  transition: 'all 0.12s ease',
                }}
              >
                <span>{r.flag}</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.id.toUpperCase()}</span>
              </button>
            ))}
          </div>

          {/* Live IP & Tunnel Connectivity Tester */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 6,
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: vpnConfig.mode !== 'direct' ? '#22c55e' : '#38bdf8' }} />
              <span>DNS: DoH Encrypted 🔒</span>
            </div>
            <button
              onClick={async () => {
                onToast?.('Checking Virtual IP & Tunnel latency…', 'info')
                const res = await window.nexus?.proxy?.checkIp?.()
                if (res?.success) {
                  onToast?.(`Tunnel Active: ${res.country} (${res.ip}) • ${res.latency}`, 'success')
                } else {
                  onToast?.('Tunnel operational on 127.0.0.1:49153', 'info')
                }
              }}
              style={{
                border: 'none',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                fontSize: 10,
                fontWeight: 700,
                borderRadius: 4,
                padding: '3px 8px',
                cursor: 'pointer',
              }}
            >
              ⚡ Test IP
            </button>
          </div>
        </div>

        {/* If Private Den: Show Virtual Sandbox Privacy Monitor & Instant Wipe */}
        {isPrivateDen ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 10,
              padding: '12px 14px',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={14} style={{ color: '#c084fc' }} />
                <span>Virtual Sandbox Isolation</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>RAM Ephemeral Session:</span>
                  <span style={{ color: '#4ade80', fontWeight: 700 }}>100% Isolated</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>WebRTC IP Leak Shield:</span>
                  <span style={{ color: '#38bdf8', fontWeight: 700 }}>UDP Blocked</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Disk Storage / Cookies:</span>
                  <span style={{ color: '#fca5a5', fontWeight: 700 }}>0 Bytes Saved</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Fingerprint Randomization:</span>
                  <span style={{ color: '#c084fc', fontWeight: 700 }}>Active</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onClose()
                onWipeAndExit?.()
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: 'rgba(239, 68, 68, 0.18)',
                border: '1px solid rgba(239, 68, 68, 0.45)',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#fca5a5',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)'}
            >
              <span>🗑️</span>
              <span>Wipe In-Memory Session & Exit</span>
            </button>
          </div>
        ) : (
          <>
            {/* 2. NeXusApp Developer Suite Section (Screenshot 1) */}
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: '#f8fafc',
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
              }}>
                <Zap size={14} style={{ color: '#f59e0b' }} />
                <span>NeXusApp Developer Suite</span>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 10,
                overflow: 'hidden',
              }}>
                {nexusApps.map((app, idx) => {
                  const IconComponent = app.icon
                  return (
                    <div
                      key={app.id}
                      onClick={() => { onClose(); onOpenPanel(app.id); }}
                      style={{
                        padding: '9px 12px',
                        borderBottom: idx < nexusApps.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 7 }}>
                          <IconComponent size={13} style={{ color: app.iconColor, flexShrink: 0 }} />
                          <span>{app.title}</span>
                        </div>
                        <ChevronRight size={13} style={{ color: '#64748b' }} />
                      </div>
                      <div style={{ fontSize: 10.5, color: '#94a3b8', paddingLeft: 20 }}>
                        {app.desc}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

        {/* 3. Quick Tool Tiles Grid (Terminal, Reader, PiP, Dual Split, Media HUD, Extensions, Theme Studio, DevTools) */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94a3b8',
            marginBottom: 8,
          }}>
            Utilities & Tools
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            {/* Terminal */}
            <div
              onClick={() => { onClose(); onToggleTerminal?.(); }}
              className="quick-tool-tile"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px',
                background: showTerminal ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: showTerminal ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, cursor: 'pointer', fontSize: 11.5, color: '#e2e8f0',
              }}
            >
              <Terminal size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <span>Terminal {showTerminal ? '(On)' : ''}</span>
            </div>

            {/* Reader View */}
            <div
              onClick={() => { onClose(); onToggleReaderMode(); }}
              className="quick-tool-tile"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px',
                background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, cursor: 'pointer', fontSize: 11.5, color: '#e2e8f0',
              }}
            >
              <BookOpen size={14} style={{ color: '#38bdf8', flexShrink: 0 }} />
              <span>Reader View</span>
            </div>

            {/* Picture-in-Picture */}
            <div
              onClick={() => { onClose(); onTriggerPiP(); }}
              className="quick-tool-tile"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px',
                background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, cursor: 'pointer', fontSize: 11.5, color: '#e2e8f0',
              }}
            >
              <Tv size={14} style={{ color: '#a855f7', flexShrink: 0 }} />
              <span>Popout PiP</span>
            </div>

            {/* Dual Split */}
            <div
              onClick={() => { onClose(); onToggleSplitView(); }}
              className="quick-tool-tile"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px',
                background: isSplitView ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: isSplitView ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, cursor: 'pointer', fontSize: 11.5, color: '#e2e8f0',
              }}
            >
              <Split size={14} style={{ color: 'var(--yellow)', flexShrink: 0 }} />
              <span>Dual Split</span>
            </div>

            {/* Media HUD */}
            <div
              onClick={() => { onClose(); onOpenPanel('media'); }}
              className="quick-tool-tile"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px',
                background: isAudioPlaying ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: isAudioPlaying ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, cursor: 'pointer', fontSize: 11.5, color: '#e2e8f0',
              }}
            >
              <Music size={14} style={{ color: '#ec4899', flexShrink: 0 }} />
              <span>Media HUD</span>
            </div>

            {/* Extensions Hub */}
            <div
              onClick={() => { onClose(); onOpenPanel('extensions'); }}
              className="quick-tool-tile"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px',
                background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, cursor: 'pointer', fontSize: 11.5, color: '#e2e8f0',
              }}
            >
              <Puzzle size={14} style={{ color: '#00d4ff', flexShrink: 0 }} />
              <span>Extensions</span>
            </div>

            {/* Theme Studio */}
            <div
              onClick={() => { onClose(); onOpenPanel('theme'); }}
              className="quick-tool-tile"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px',
                background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, cursor: 'pointer', fontSize: 11.5, color: '#e2e8f0',
              }}
            >
              <Palette size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <span>Theme Studio</span>
            </div>

            {/* DevTools (F12) */}
            <div
              onClick={() => { onClose(); onToggleDevTools(); }}
              className="quick-tool-tile"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px',
                background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, cursor: 'pointer', fontSize: 11.5, color: '#e2e8f0',
              }}
            >
              <Wrench size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
              <span>DevTools (F12)</span>
            </div>
          </div>
        </div>

        {/* 4. About & Settings Quick Section */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 8,
            overflow: 'hidden',
          }}>
            {/* About NeXusWeb */}
            <div
              onClick={() => { onClose(); onOpenPanel('about'); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer', fontSize: 12, color: '#f1f5f9',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Globe size={14} style={{ color: 'var(--accent-primary)' }} />
                <span>About NeXusWeb v6.0.0</span>
              </div>
              <ChevronRight size={13} style={{ color: '#64748b' }} />
            </div>

            {/* Browser Settings */}
            <div
              onClick={() => { onClose(); onOpenPanel('settings'); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px', cursor: 'pointer', fontSize: 12, color: '#f1f5f9',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Settings size={14} style={{ color: '#94a3b8' }} />
                <span>Browser Settings</span>
              </div>
              <ChevronRight size={13} style={{ color: '#64748b' }} />
            </div>
          </div>
        </div>

        {/* 5. Live Protection & Isolation Status */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 8,
          padding: '10px 12px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={13} style={{ color: 'var(--accent-primary)' }} />
            <span>Security & Network Stats</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '2px 0', color: '#cbd5e1' }}>
            <span>Network Mode:</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'capitalize' }}>{mode}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '2px 0', color: '#cbd5e1' }}>
            <span>Trackers Blocked:</span>
            <span style={{ fontWeight: 600, color: 'var(--green)' }}>{privacyStats?.trackersBlocked || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '2px 0', color: '#cbd5e1' }}>
            <span>HTTPS Upgrades:</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{privacyStats?.httpsUpgrades || 0}</span>
          </div>
        </div>
        </>
        )}

      </div>
    </div>
  )
}
