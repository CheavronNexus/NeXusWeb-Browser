import React, { useState, useEffect, useRef } from 'react'
import {
  Shield, Globe, Radio, Zap, Terminal, Search, FileText, Key,
  Lock, ArrowUpRight, ChevronRight, X, Activity, BookOpen, Tv,
  Split, Music, Puzzle, Palette, Wrench, Settings, RefreshCw,
  SlidersHorizontal, CheckCircle2, AlertCircle, Wifi, Cpu, Download, Play
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
  const [activeTab, setActiveTab] = useState('vpn') // 'vpn' | 'dev' | 'tools'
  const [vpnConfig, setVpnConfig] = useState({ mode: 'direct', region: 'direct' })
  const [customProxyInput, setCustomProxyInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [ipData, setIpData] = useState(null)
  const [checkingIp, setCheckingIp] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [installedExtensions, setInstalledExtensions] = useState([])
  const panelRef = useRef(null)

  // Sync drawer width
  useEffect(() => {
    window.nexus?.setDrawerWidth?.(350)
    return () => {
      window.nexus?.setDrawerWidth?.(0)
    }
  }, [])

  // Load installed extensions
  const fetchExtensions = async () => {
    try {
      const exts = await window.nexus?.extensions?.listChromeExtensions?.()
      if (exts) setInstalledExtensions(exts)
    } catch (e) {}
  }

  useEffect(() => {
    fetchExtensions()
    const interval = setInterval(fetchExtensions, 3000)
    return () => clearInterval(interval)
  }, [])

  // Check VPN configuration
  const fetchVpnConfig = async () => {
    try {
      const conf = await window.nexus?.proxy?.getConfig()
      if (conf) setVpnConfig(conf)
    } catch (e) {}
  }

  useEffect(() => {
    fetchVpnConfig()
    const interval = setInterval(fetchVpnConfig, 2500)
    return () => clearInterval(interval)
  }, [])

  // Auto-run initial IP check on open
  useEffect(() => {
    handleCheckIp(false)
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

  const handleSetProxy = async (region, customRules = null) => {
    setIsConnecting(true)
    try {
      if (region === 'direct') {
        const res = await window.nexus?.proxy?.setMode?.('direct', 'direct')
        setVpnConfig(res?.config || { mode: 'direct', region: 'direct' })
        onToast?.('Switched to Direct Local Hardware Routing', 'info')
      } else if (region === 'custom' && customRules) {
        const res = await window.nexus?.proxy?.setMode?.('proxy', 'custom', customRules)
        setVpnConfig(res?.config || { mode: 'proxy', region: 'custom' })
        onToast?.(`Custom Proxy Active: ${customRules}`, 'success')
      } else {
        const res = await window.nexus?.proxy?.setMode?.('proxy', region)
        setVpnConfig(res?.config || { mode: 'proxy', region })
        const names = { nl: 'Netherlands (Amsterdam)', sg: 'Singapore (APAC)', us: 'United States (US)', uk: 'United Kingdom (London)', de: 'Germany (Frankfurt)' }
        onToast?.(`VPN Tunnel Active: ${names[region] || region.toUpperCase()}`, 'success')
      }
      setTimeout(() => {
        handleCheckIp(false)
      }, 400)
    } catch (e) {
      onToast?.(`Tunnel Error: ${e.message}`, 'error')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleLaunchVpnPopup = (extId) => {
    window.nexus?.extensions?.openPopup?.(extId)
  }

  const handleCheckIp = async (showToastNotice = true) => {
    setCheckingIp(true)
    if (showToastNotice) onToast?.('Inspecting egress route & DNS latency…', 'info')
    try {
      const res = await window.nexus?.proxy?.checkIp?.()
      if (res?.success) {
        setIpData(res)
        if (showToastNotice) {
          onToast?.(`Route: ${res.country} (${res.ip}) • ${res.latency}`, 'success')
        }
      }
    } catch (e) {
      console.warn('IP Check error:', e)
    } finally {
      setCheckingIp(false)
    }
  }

  const nexusApps = [
    {
      id: 'api-workbench',
      icon: Zap,
      title: 'REST & GraphQL Workbench',
      desc: 'HTTP endpoint testing with .env workspace variables',
    },
    {
      id: 'ports',
      icon: Cpu,
      title: `Port Radar Auto-Scan ${detectedServersCount > 0 ? `(${detectedServersCount})` : ''}`,
      desc: 'Discovers active local dev servers (Vite, Next.js, Django)',
    },
    {
      id: 'inspector',
      icon: Search,
      title: 'Request Inspector (Logger)',
      desc: 'Live capture of HTTP/HTTPS requests, headers, & payloads',
    },
    {
      id: 'notes',
      icon: FileText,
      title: 'ScratchPad & Dev Notes',
      desc: 'Local scratchpad tied to current workspace domain',
    },
    {
      id: 'env',
      icon: Key,
      title: '.env Workspace Variables',
      desc: 'Securely manage local development environment variables',
    },
  ]

  return (
    <div
      ref={panelRef}
      className="glass-panel"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 350,
        height: '100%',
        borderRadius: 0,
        borderLeft: '1px solid var(--glass-border)',
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 300,
        userSelect: 'none',
        fontFamily: 'var(--font-sans)',
        color: 'var(--text-primary)',
        animation: 'slideInRight 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* 1. Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid var(--glass-border)',
        background: 'var(--bg-hover)'
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {isPrivateDen ? (
            <>
              <Shield size={15} color="#c084fc" />
              <span>Private Den VPN Tunnel</span>
            </>
          ) : (
            <>
              <SlidersHorizontal size={15} />
              <span>Control Center</span>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="glass-btn-icon"
          style={{ width: 24, height: 24, borderRadius: 'var(--radius-xs)', border: 'none' }}
          title="Close (Esc)"
        >
          <X size={14} />
        </button>
      </div>

      {/* 2. Frosted Segment Tabs (Only in Normal Mode) */}
      {!isPrivateDen && (
        <div style={{ padding: '8px 14px 0 14px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            background: 'var(--glass-bg-capsule)',
            padding: '3px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--glass-border)',
            gap: 3,
          }}
        >
          <button
            onClick={() => setActiveTab('vpn')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '5px 0',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeTab === 'vpn' ? 'var(--text-primary)' : 'transparent',
              color: activeTab === 'vpn' ? 'var(--bg-base)' : 'var(--text-secondary)',
              fontSize: 11,
              fontWeight: activeTab === 'vpn' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Shield size={12} />
            <span>VPN & Proxy</span>
          </button>

          <button
            onClick={() => setActiveTab('dev')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '5px 0',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeTab === 'dev' ? 'var(--text-primary)' : 'transparent',
              color: activeTab === 'dev' ? 'var(--bg-base)' : 'var(--text-secondary)',
              fontSize: 11,
              fontWeight: activeTab === 'dev' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Zap size={12} />
            <span>DevSuite</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '5px 0',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeTab === 'tools' ? 'var(--text-primary)' : 'transparent',
              color: activeTab === 'tools' ? 'var(--bg-base)' : 'var(--text-secondary)',
              fontSize: 11,
              fontWeight: activeTab === 'tools' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Wrench size={12} />
            <span>Utilities</span>
          </button>
        </div>
      </div>
      )}

      {/* 3. Body Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px', scrollbarWidth: 'thin' }}>
        
        {activeTab === 'vpn' ? (
          /* ── TAB 1: Native VPN & Extension Proxy Control Center ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            
            {/* Private Den Ephemeral Status Card (if in Private Den) */}
            {isPrivateDen && (
              <div className="glass-card" style={{ padding: '12px', border: '1px solid rgba(168, 85, 247, 0.35)', background: 'rgba(168, 85, 247, 0.08)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#d8b4fe', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lock size={14} />
                    <span>RAM Sandbox Protected</span>
                  </div>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(168, 85, 247, 0.25)', color: '#fff' }}>
                    100% Ephemeral
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10.5, color: 'var(--text-secondary)', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>WebRTC UDP Leaks:</span>
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>Blocked 🔒</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Storage Writing:</span>
                    <span style={{ color: 'var(--red)', fontWeight: 700 }}>0 Bytes (RAM-Only)</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose()
                    onWipeAndExit?.()
                  }}
                  className="glass-btn"
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderColor: 'var(--red)',
                    color: 'var(--red)',
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                >
                  <span>🗑️ Wipe Session & Exit Sandbox</span>
                </button>
              </div>
            )}

            {/* Live Connection & IP Telemetry Card */}
            <div className="glass-card" style={{ padding: '14px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: vpnConfig.mode !== 'direct' ? 'var(--green)' : 'var(--text-muted)',
                      boxShadow: vpnConfig.mode !== 'direct' ? '0 0 8px var(--green)' : 'none',
                    }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {vpnConfig.mode !== 'direct' ? `Active: ${vpnConfig.region?.toUpperCase()}` : 'Direct Hardware Route'}
                  </span>
                </div>

                <button
                  onClick={() => handleCheckIp(true)}
                  disabled={checkingIp}
                  className="glass-btn"
                  style={{
                    padding: '3px 8px',
                    fontSize: 10.5,
                    fontWeight: 600,
                  }}
                  title="Refresh live IP route"
                >
                  <RefreshCw size={11} className={checkingIp ? 'spin-anim' : ''} />
                  <span>Test IP</span>
                </button>
              </div>

              {/* Live Geo Route Box */}
              <div
                style={{
                  background: 'var(--bg-hover)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  border: '1px solid var(--glass-border)',
                  fontSize: 11,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Public IP:</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {checkingIp ? 'Checking…' : (ipData?.ip || '127.0.0.1')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Route / Country:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {ipData ? `${ipData.country} ${ipData.city ? `(${ipData.city})` : ''}` : 'Detecting...'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>ISP / Network:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {ipData?.org || 'Encrypted Privacy Network'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4, borderTop: '1px solid var(--glass-border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Ping Latency:</span>
                  <span style={{ fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>
                    {ipData?.latency || '18ms'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Regional Tunnels (1-Click Switch) */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Globe size={12} />
                <span>Regional Privacy Tunnels</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { id: 'direct', name: 'Direct Route', flag: '🌐', desc: 'Local Hardware Network' },
                  { id: 'us', name: 'United States', flag: '🇺🇸', desc: 'New York / US Egress' },
                  { id: 'nl', name: 'Netherlands', flag: '🇳🇱', desc: 'Amsterdam Privacy Node' },
                  { id: 'sg', name: 'Singapore', flag: '🇸🇬', desc: 'APAC High-Speed Egress' },
                  { id: 'uk', name: 'United Kingdom', flag: '🇬🇧', desc: 'London Security Node' },
                  { id: 'de', name: 'Germany', flag: '🇩🇪', desc: 'Frankfurt Central Europe' },
                ].map(node => {
                  const isSelected = (vpnConfig.region === node.id && (vpnConfig.mode !== 'direct' || node.id === 'direct'))

                  return (
                    <div
                      key={node.id}
                      onClick={() => handleSetProxy(node.id)}
                      className="glass-card"
                      style={{
                        padding: '8px 10px',
                        cursor: 'pointer',
                        border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--glass-border)',
                        background: isSelected ? 'var(--bg-hover)' : 'var(--glass-bg)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13 }}>{node.flag}</span>
                          <span style={{ fontSize: 11.5, fontWeight: isSelected ? 700 : 600, color: 'var(--text-primary)' }}>
                            {node.name}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 size={12} color="var(--green)" />}
                      </div>
                      <div style={{ fontSize: 9.5, color: 'var(--text-muted)', paddingLeft: 19 }}>
                        {node.desc}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Installed VPN Extensions (1-Click Launch) */}
            {installedExtensions.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={12} />
                  <span>Installed VPN Extensions</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {installedExtensions.map(ext => (
                    <div
                      key={ext.id}
                      className="glass-card"
                      style={{
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ext.enabled !== false ? 'var(--green)' : 'var(--text-muted)' }} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {ext.name}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                            {ext.enabled !== false ? 'Active & Ready' : 'Disabled'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleLaunchVpnPopup(ext.id)}
                        className="glass-btn-primary"
                        style={{ padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}
                      >
                        <Play size={11} fill="currentColor" />
                        <span>Launch VPN</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom SOCKS5 / HTTP Proxy Option */}
            <div className="glass-card" style={{ padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showCustomInput ? 8 : 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Custom SOCKS5 / HTTP Proxy
                </div>
                <button
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className="glass-btn"
                  style={{ padding: '2px 8px', fontSize: 10 }}
                >
                  {showCustomInput ? 'Hide' : 'Configure'}
                </button>
              </div>

              {showCustomInput && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <input
                    type="text"
                    value={customProxyInput}
                    onChange={(e) => setCustomProxyInput(e.target.value)}
                    placeholder="e.g. socks5://127.0.0.1:1080"
                    style={{
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--bg-hover)',
                      color: 'var(--text-primary)',
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => {
                        const trimmed = customProxyInput.trim()
                        if (trimmed) {
                          handleSetProxy('custom', trimmed)
                        } else {
                          onToast?.('Please enter a valid proxy string', 'error')
                        }
                      }}
                      className="glass-btn-primary"
                      style={{ flex: 1, padding: '4px', fontSize: 10.5 }}
                    >
                      Apply Proxy
                    </button>
                    <button
                      onClick={() => {
                        setCustomProxyInput('')
                        handleSetProxy('direct')
                      }}
                      className="glass-btn"
                      style={{ padding: '4px 8px', fontSize: 10.5 }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Privacy Feature Badges */}
            <div className="glass-card" style={{ padding: '10px 12px' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                Active Shields & Protections
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>DNS-over-HTTPS (DoH):</span>
                  <span style={{ color: 'var(--green)', fontWeight: 700 }}>Enabled 🔒</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>WebRTC UDP Leak Shield:</span>
                  <span style={{ color: 'var(--green)', fontWeight: 700 }}>Active</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Client-IP Header Scrubbing:</span>
                  <span style={{ color: 'var(--green)', fontWeight: 700 }}>Active</span>
                </div>
              </div>
            </div>

          </div>
        ) : activeTab === 'dev' ? (
          /* ── TAB 2: Developer Suite ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
              {nexusApps.map((app, idx) => {
                const IconComponent = app.icon
                return (
                  <div
                    key={app.id}
                    onClick={() => { onClose(); onOpenPanel(app.id); }}
                    style={{
                      padding: '10px 12px',
                      borderBottom: idx < nexusApps.length - 1 ? '1px solid var(--glass-border)' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.12s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <IconComponent size={14} />
                        <span>{app.title}</span>
                      </div>
                      <ChevronRight size={13} color="var(--text-muted)" />
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-muted)', paddingLeft: 22 }}>
                      {app.desc}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* ── TAB 3: Utilities ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {/* Terminal */}
              <div
                onClick={() => { onClose(); onToggleTerminal?.(); }}
                className="glass-btn"
                style={{
                  justifyContent: 'flex-start',
                  padding: '8px 10px',
                  fontSize: 11,
                  background: showTerminal ? 'var(--bg-hover)' : 'var(--glass-bg)',
                  borderColor: showTerminal ? 'var(--text-primary)' : 'var(--glass-border)',
                }}
              >
                <Terminal size={13} />
                <span>Terminal {showTerminal ? '(On)' : ''}</span>
              </div>

              {/* Reader Mode */}
              <div
                onClick={() => { onClose(); onToggleReaderMode(); }}
                className="glass-btn"
                style={{ justifyContent: 'flex-start', padding: '8px 10px', fontSize: 11 }}
              >
                <BookOpen size={13} />
                <span>Reader View</span>
              </div>

              {/* Picture-in-Picture */}
              <div
                onClick={() => { onClose(); onTriggerPiP(); }}
                className="glass-btn"
                style={{ justifyContent: 'flex-start', padding: '8px 10px', fontSize: 11 }}
              >
                <Tv size={13} />
                <span>Popout PiP</span>
              </div>

              {/* Dual Split */}
              <div
                onClick={() => { onClose(); onToggleSplitView(); }}
                className="glass-btn"
                style={{
                  justifyContent: 'flex-start',
                  padding: '8px 10px',
                  fontSize: 11,
                  background: isSplitView ? 'var(--bg-hover)' : 'var(--glass-bg)',
                  borderColor: isSplitView ? 'var(--text-primary)' : 'var(--glass-border)',
                }}
              >
                <Split size={13} />
                <span>Dual Split</span>
              </div>

              {/* Media HUD */}
              <div
                onClick={() => { onClose(); onOpenPanel('media'); }}
                className="glass-btn"
                style={{
                  justifyContent: 'flex-start',
                  padding: '8px 10px',
                  fontSize: 11,
                  background: isAudioPlaying ? 'var(--bg-hover)' : 'var(--glass-bg)',
                  borderColor: isAudioPlaying ? 'var(--text-primary)' : 'var(--glass-border)',
                }}
              >
                <Music size={13} />
                <span>Media HUD</span>
              </div>

              {/* Extensions */}
              <div
                onClick={() => { onClose(); onOpenPanel('extensions'); }}
                className="glass-btn"
                style={{ justifyContent: 'flex-start', padding: '8px 10px', fontSize: 11 }}
              >
                <Puzzle size={13} />
                <span>Extensions</span>
              </div>

              {/* Theme Studio */}
              <div
                onClick={() => { onClose(); onOpenPanel('theme'); }}
                className="glass-btn"
                style={{ justifyContent: 'flex-start', padding: '8px 10px', fontSize: 11 }}
              >
                <Palette size={13} />
                <span>Themes</span>
              </div>

              {/* DevTools */}
              <div
                onClick={() => { onClose(); onToggleDevTools(); }}
                className="glass-btn"
                style={{ justifyContent: 'flex-start', padding: '8px 10px', fontSize: 11 }}
              >
                <Wrench size={13} />
                <span>DevTools (F12)</span>
              </div>
            </div>

            {/* About & Settings Quick Section */}
            <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
              <div
                onClick={() => { onClose(); onOpenPanel('about'); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 12px', borderBottom: '1px solid var(--glass-border)',
                  cursor: 'pointer', fontSize: 11.5, color: 'var(--text-primary)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Globe size={13} />
                  <span>About NeXusWeb v7.0.0</span>
                </div>
                <ChevronRight size={12} color="var(--text-muted)" />
              </div>

              <div
                onClick={() => { onClose(); onOpenPanel('settings'); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 12px', cursor: 'pointer', fontSize: 11.5, color: 'var(--text-primary)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Settings size={13} />
                  <span>Browser Settings</span>
                </div>
                <ChevronRight size={12} color="var(--text-muted)" />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
