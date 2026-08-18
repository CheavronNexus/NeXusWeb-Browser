import React, { useState, useEffect } from 'react'
import chevronLogoImg from '../assets/chevron_nexus_logo.jpg'
import nexuswebLogoImg from '../assets/nexusweb_logo.jpg'
import {
  Info, Sparkles, Shield, Lock, Zap, Settings, Keyboard,
  Globe, Check, RefreshCw, Star, Home, ArrowRight, ExternalLink,
  Cpu, Terminal, Layers, Heart, Download, X, Play
} from 'lucide-react'

export default function AboutPanel({ onClose, onOpenShortcuts, onOpenSettings }) {
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [updateStatus, setUpdateStatus] = useState(null) // null | 'checking' | 'latest' | 'available' | 'installing'

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
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
      color: '#38bdf8',
      borderColor: 'rgba(56, 189, 248, 0.35)',
    },
    {
      icon: Lock,
      title: 'True Privacy',
      desc: 'We never collect, store, or sell your data. Everything is end-to-end encrypted and kept inside your physical devices.',
      color: '#00d4ff',
      borderColor: 'rgba(0, 212, 255, 0.45)',
      glow: true,
    },
    {
      icon: Star,
      title: 'One-Time Buy',
      desc: 'No subscriptions. Pay once, own the software forever. Get updates and features included in your major version.',
      color: '#38bdf8',
      borderColor: 'rgba(56, 189, 248, 0.35)',
    },
  ]

  const featureItems = [
    { icon: '🕵️', title: 'Virtual Sandbox', desc: 'RAM-only Private Den. Auto-wipe on close.' },
    { icon: '🛡️', title: 'Direct VPN Tunnels', desc: '1-Click location routing (NL, US, SG, UK).' },
    { icon: '🔒', title: 'Anti-Fingerprint', desc: 'WebRTC STUN leak shield & canvas noise.' },
    { icon: '⚡', title: 'Developer Suite', desc: 'Auto port scanner, REST workbench & terminals.' },
    { icon: '📖', title: 'Reader Engine', desc: '10 distraction-free typography fonts.' },
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
        zIndex: 900,
        backgroundColor: 'rgba(5, 8, 16, 0.82)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
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
          width: 780,
          maxWidth: '96vw',
          maxHeight: '90vh',
          backgroundColor: '#0c101d',
          border: '1px solid rgba(0, 212, 255, 0.28)',
          borderRadius: 20,
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 45px rgba(0, 212, 255, 0.12)',
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
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.03)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'rgba(0, 212, 255, 0.12)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00d4ff',
            }}>
              <Info size={15} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                About NeXusWeb & Chevron Nexus
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                Local-First Decentralized Web Infrastructure
              </div>
            </div>
          </div>

          <button
            id="panel-about-close"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#94a3b8',
              cursor: 'pointer',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              transition: 'all 0.15s ease',
            }}
            title="Close (Esc)"
            onMouseEnter={e => {
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#94a3b8'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
            }}
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
            background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 212, 255, 0.16) 0%, #0e1424 75%)',
            border: '1px solid rgba(0, 212, 255, 0.35)',
            borderRadius: 16,
            padding: '24px 24px',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          }}>
            {/* Top Row: Logos & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              {/* Dual Brand Logos */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '2px solid rgba(0, 212, 255, 0.4)',
                  boxShadow: '0 0 20px rgba(0, 212, 255, 0.25)',
                  backgroundColor: '#090d18',
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
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '2px solid rgba(192, 132, 252, 0.4)',
                  boxShadow: '0 0 20px rgba(192, 132, 252, 0.25)',
                  backgroundColor: '#090d18',
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
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '3px 10px',
                  borderRadius: 20,
                  marginBottom: 8,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
                  <span>Privacy-First Personal Infrastructure</span>
                </div>

                <h1 style={{
                  fontSize: 24,
                  fontWeight: 800,
                  margin: '0 0 4px 0',
                  color: '#f8fafc',
                  letterSpacing: '-0.02em',
                }}>
                  Take Back Your <span style={{ color: '#00d4ff' }}>Digital Sovereignty.</span>
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#c084fc',
                    background: 'rgba(192, 132, 252, 0.12)',
                    border: '1px solid rgba(192, 132, 252, 0.3)',
                    padding: '2px 8px',
                    borderRadius: 12,
                  }}>
                    NeXusWeb v6.5.0 Production Release
                  </span>

                  <a
                    href="https://www.ChevronNexus.com"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#00d4ff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >
                    🌐 www.ChevronNexus.com <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* Mission Statement */}
            <div style={{
              marginTop: 16,
              background: 'rgba(8, 12, 22, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 12,
              padding: '12px 16px',
              fontSize: 13,
              lineHeight: 1.55,
              color: '#cbd5e1',
            }}>
              <strong style={{ color: '#f8fafc' }}>Chevron Nexus</strong> develops local-first, decentralized software that turns your everyday hardware into secure, private infrastructure. No cloud subscriptions. Just complete ownership.
            </div>
          </div>

          {/* 2. Software Update & In-Place Upgrader Center */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 16,
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
                borderRadius: 12,
                background: 'rgba(0, 212, 255, 0.12)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00d4ff',
              }}>
                <RefreshCw size={20} className={checkingUpdate ? 'spin-anim' : ''} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>Setup & Software Update Center</span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#22c55e',
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    padding: '1px 6px',
                    borderRadius: 8,
                  }}>
                    v6.5.0 Stable
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  {checkingUpdate
                    ? 'Connecting to Chevron Nexus update channel...'
                    : updateStatus === 'latest'
                      ? 'You are running the latest production build of NeXusWeb V6.'
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
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#f8fafc',
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: checkingUpdate ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
              >
                <RefreshCw size={13} className={checkingUpdate ? 'spin-anim' : ''} />
                <span>{checkingUpdate ? 'Checking...' : 'Check Updates'}</span>
              </button>

              <button
                onClick={handleLaunchUpgrader}
                style={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0284c7 100%)',
                  border: 'none',
                  color: '#000',
                  borderRadius: 10,
                  padding: '8px 16px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 14px rgba(0, 212, 255, 0.3)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 212, 255, 0.45)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 212, 255, 0.3)'
                }}
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
              color: '#38bdf8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              <span style={{ width: 14, height: 2, background: '#38bdf8' }} />
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
                    style={{
                      background: 'rgba(15, 20, 36, 0.8)',
                      border: `1px solid ${p.borderColor}`,
                      borderRadius: 14,
                      padding: '16px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: p.glow ? '0 0 20px rgba(0, 212, 255, 0.1)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'rgba(0, 212, 255, 0.1)',
                        border: '1px solid rgba(0, 212, 255, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: p.color,
                      }}>
                        <IconComp size={16} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>
                        {p.title}
                      </div>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#94a3b8', lineHeight: 1.5 }}>
                      {p.desc}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 4. Built-in Workstation Highlights */}
          <div style={{
            background: 'rgba(12, 16, 28, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: '16px 18px',
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 800,
              color: '#c084fc',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              NeXusWeb Key Capabilities
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 10,
            }}>
              {featureItems.map((f, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(20, 27, 48, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 10,
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{f.icon}</span>
                    <span>{f.title}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, lineHeight: 1.4 }}>
                    {f.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Shortcuts & Settings Quick Links */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: 14,
            fontSize: 12,
            color: '#64748b',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                onClick={onOpenShortcuts}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >
                <Keyboard size={13} />
                <span>Shortcuts (F1)</span>
              </button>

              <button
                onClick={onOpenSettings}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
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
