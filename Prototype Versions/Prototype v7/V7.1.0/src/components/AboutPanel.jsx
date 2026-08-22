import React, { useState, useEffect } from 'react'
import chevronLogoImg from '../assets/chevron_nexus_logo.jpg'
import nexuswebLogoImg from '../assets/nexusweb_logo.jpg'
import {
  Info, Sparkles, Shield, Lock, Zap, Settings, Keyboard,
  Globe, Check, RefreshCw, Star, Home, ArrowRight, ExternalLink,
  Cpu, Terminal, Layers, Heart, Download, X, Play, Sliders, Activity,
  Maximize2, Eye, Server, Compass, Puzzle
} from 'lucide-react'

export default function AboutPanel({ onClose, onOpenShortcuts, onOpenSettings }) {
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [updateStatus, setUpdateStatus] = useState(null)

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true)
    setUpdateStatus('checking')
    try {
      const res = await window.nexus?.updater?.check?.()
      setTimeout(() => {
        setCheckingUpdate(false)
        setUpdateStatus(res?.isUpdateAvailable ? 'available' : 'latest')
      }, 700)
    } catch (e) {
      setTimeout(() => {
        setCheckingUpdate(false)
        setUpdateStatus('latest')
      }, 700)
    }
  }

  const handleLaunchUpgrader = async () => {
    setUpdateStatus('installing')
    try {
      await window.nexus?.updater?.install?.()
    } catch (e) {
      console.warn('Error launching setup upgrader:', e)
    }
  }

  const philosophyPillars = [
    {
      icon: Home,
      title: 'Local-First',
      desc: 'Your software runs directly on your computer and local network. It continues to work even if you have no internet access.',
      color: 'var(--accent-primary)',
    },
    {
      icon: Lock,
      title: 'True Privacy',
      desc: 'We never collect, store, or sell your data. Everything is end-to-end encrypted and kept inside your physical devices.',
      color: 'var(--accent-primary)',
    },
    {
      icon: Star,
      title: 'One-Time Buy',
      desc: 'No subscriptions. Pay once, own the software forever. Get updates and features included in your major version.',
      color: 'var(--accent-primary)',
    },
  ]

  return (
    <div
      id="about-modal-backdrop"
      onClick={(e) => {
        if (e.target.id === 'about-modal-backdrop') onClose?.()
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
        padding: '24px 16px',
        animation: 'modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        id="panel-about-dialog"
        style={{
          width: 820,
          maxWidth: '96vw',
          maxHeight: '92vh',
          backgroundColor: 'var(--bg-base)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--glass-shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalZoomIn 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 22px',
          borderBottom: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-hover)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}>
              <Info size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                About NeXusWeb & Chevron Nexus
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                Local-First Decentralized Web Infrastructure
              </div>
            </div>
          </div>

          <button
            id="panel-about-close"
            onClick={onClose}
            className="glass-btn-icon"
            style={{ width: 30, height: 30 }}
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '22px 24px',
          scrollbarWidth: 'thin',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          
          {/* 1. Hero Showcase Banner */}
          <div style={{
            background: 'var(--glass-bg-card)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '22px 24px',
            position: 'relative',
            boxShadow: 'var(--glass-shadow-sm)',
          }}>
            {/* Top Row: Logos & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              {/* Dual Brand Logos */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--glass-border)',
                  boxShadow: 'var(--glass-shadow-sm)',
                  backgroundColor: 'var(--bg-surface)',
                }}>
                  <img
                    src={chevronLogoImg}
                    alt="Chevron Nexus Emblem"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--glass-border)',
                  boxShadow: 'var(--glass-shadow-sm)',
                  backgroundColor: 'var(--bg-surface)',
                }}>
                  <img
                    src={nexuswebLogoImg}
                    alt="NeXusWeb Emblem"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
              </div>

              {/* Headline & Badges */}
              <div style={{ flex: 1, minWidth: 260 }}>
                <div className="glass-pill" style={{
                  fontSize: 10,
                  fontWeight: 700,
                  marginBottom: 8,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
                  <span>Privacy-First Personal Infrastructure</span>
                </div>

                <h1 style={{
                  fontSize: 23,
                  fontWeight: 800,
                  margin: '0 0 4px 0',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}>
                  Take Back Your <span style={{ color: 'var(--accent-primary)' }}>Digital Sovereignty.</span>
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span className="glass-pill" style={{
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    NeXusWeb v7.1.0 Production Release
                  </span>

                  <a
                    href="https://www.ChevronNexus.com"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--accent-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      textDecoration: 'none',
                    }}
                  >
                    <Globe size={13} /> www.ChevronNexus.com <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* Mission Statement */}
            <div style={{
              marginTop: 16,
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              fontSize: 12.5,
              lineHeight: 1.55,
              color: 'var(--text-secondary)',
            }}>
              <strong style={{ color: 'var(--text-primary)' }}>Chevron Nexus</strong> develops local-first, decentralized software that turns your everyday hardware into secure, private infrastructure. No cloud subscriptions. Just complete ownership.
            </div>
          </div>

          {/* 2. Software Update & In-Place Upgrader Center */}
          <div style={{
            background: 'var(--glass-bg-card)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-hover)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
              }}>
                <RefreshCw size={20} className={checkingUpdate ? 'spin-anim' : ''} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>Setup & Software Update Center</span>
                  <span className="glass-pill" style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--green)',
                  }}>
                    v7.1.0 Stable
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {checkingUpdate
                    ? 'Connecting to Chevron Nexus update channel...'
                    : updateStatus === 'latest'
                      ? 'You are running the latest production build of NeXusWeb V7.1.0.'
                      : updateStatus === 'available'
                        ? 'New build available! Run in-place setup to upgrade.'
                        : updateStatus === 'installing'
                          ? 'Launching setup & upgrade wizard...'
                          : 'Delta updates preserve 100% of bookmarks, tabs, and local data.'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={handleCheckUpdate}
                disabled={checkingUpdate}
                className="glass-btn"
                style={{ fontSize: 12, padding: '7px 14px' }}
              >
                <RefreshCw size={13} className={checkingUpdate ? 'spin-anim' : ''} />
                <span>{checkingUpdate ? 'Checking...' : 'Check Updates'}</span>
              </button>

              <button
                onClick={handleLaunchUpgrader}
                className="glass-btn glass-btn-primary"
                style={{ fontSize: 12, padding: '7px 16px' }}
              >
                <Download size={14} />
                <span>Run Setup & Upgrader</span>
              </button>
            </div>
          </div>

          {/* 3. Core Philosophy (3-Column Grid) */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11,
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              <span style={{ width: 14, height: 2, background: 'var(--accent-primary)' }} />
              <span>Our Core Philosophy</span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 12,
            }}>
              {philosophyPillars.map((p, idx) => {
                const IconComp = p.icon
                return (
                  <div
                    key={idx}
                    className="glass-card"
                    style={{
                      padding: '16px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-hover)',
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: p.color,
                      }}>
                        <IconComp size={16} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {p.title}
                      </div>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {p.desc}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 4. Key Feature Highlights Section (Zero Emojis - Pure Vector Icons) */}
          <div className="glass-card" style={{
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}>
            <div style={{
              fontSize: 12,
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
              <span>Key Feature Highlights</span>
            </div>

            {/* 1. Multi-Engine Network & Privacy Modes */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={16} style={{ color: 'var(--green)' }} />
                <span>Multi-Engine Network & Privacy Modes</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Normal Mode:</strong> High-speed browsing with built-in tracker & ad blocker, HTTPS auto-upgrades, and anti-fingerprinting shield.
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Localhost & LAN Mode:</strong> Zero-delay routing for local developer subnets, internal microservices, and LAN services.
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Strict Privacy Mode:</strong> Hardened sandbox that disables third-party cookies, blocks tracking telemetry, and prevents WebRTC IP leaks.
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Developer Mode:</strong> Zero CORS restrictions for localhost API debugging, auto-detects active dev ports, and enables full developer tooling.
                </div>
              </div>
            </div>

            {/* 2. Private Den Sandbox */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Eye size={16} style={{ color: 'var(--accent-primary)' }} />
                <span>Private Den Sandbox</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <li>Isolated in-memory ephemeral browser session (<code>partition: memory</code>).</li>
                <li>Auto-wipes 100% of cookies, cache, local storage, indexedDB, and history on tab/window close.</li>
                <li>WebRTC non-proxied UDP disabled by default to prevent real IP leaks.</li>
              </ul>
            </div>

            {/* 3. Native High-Speed Privacy Tunnel & VPN Engine */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock size={16} style={{ color: 'var(--accent-primary)' }} />
                <span>Native High-Speed Privacy Tunnel & VPN Engine</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <li>Built-in local tunnel bridge (<code>127.0.0.1:49153</code>) supporting Encrypted DNS-over-HTTPS (DoH via Cloudflare & Quad9).</li>
                <li>Strips privacy-invasive tracking headers (<code>X-Forwarded-For</code>, <code>Client-IP</code>, <code>True-Client-IP</code>).</li>
                <li>Fast multi-region routing (Direct, US, NL, SG, UK, DE) with live real-time latency ping testing.</li>
              </ul>
            </div>

            {/* 4. Synchronized Real-Time Dynamic Resizing */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Maximize2 size={16} style={{ color: 'var(--accent-primary)' }} />
                <span>Synchronized Real-Time Dynamic Resizing</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <li><strong>Split View:</strong> Run two websites, two apps, or a website + dashboard side-by-side with draggable center splitter (10% to 90%), percentage badge, and double-click 50/50 reset.</li>
                <li><strong>Side Drawers & ScratchPad:</strong> Drag drawer left border (115px / 3cm to 880px) while the live webpage viewport automatically scales simultaneously with zero gap.</li>
              </ul>
            </div>

            {/* 5. Developer Tools & Workbenches */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Cpu size={16} style={{ color: 'var(--accent-primary)' }} />
                <span>Developer Tools & Workbenches</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>REST & GraphQL API Workbench:</strong> Native HTTP/HTTPS client with headers, JSON payload formatting, and .env variable interpolation.
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Port Manager & Localhost Scanner:</strong> Background daemon auto-detects active dev servers (Vite, Next.js, Django, Flask, Express) with 1-click PID killer.
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Request Inspector:</strong> Live HTTP network logger intercepting status codes, headers, and request duration.
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>ScratchPad & Developer Notes:</strong> Multi-note markdown workspace with live preview, split view, code syntax highlighting, JSON beautifier, and export.
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Integrated Terminal:</strong> Multi-tab PTY terminal session powered by @xterm/xterm with persistent state.
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Chrome Web Extensions:</strong> Install Chrome extensions directly from the Chrome Web Store or unpack local CRX extensions.
                </div>
              </div>
            </div>
          </div>

          {/* Footer Shortcuts & Settings Quick Links */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--glass-border)',
            paddingTop: 14,
            fontSize: 12,
            color: 'var(--text-muted)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                onClick={onOpenShortcuts}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <Keyboard size={13} />
                <span>Shortcuts Help (F1)</span>
              </button>

              <button
                onClick={onOpenSettings}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <Settings size={13} />
                <span>Preferences</span>
              </button>
            </div>

            <div>
              © 2026 Chevron Nexus Software. All Rights Reserved.
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalZoomIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-anim {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}
