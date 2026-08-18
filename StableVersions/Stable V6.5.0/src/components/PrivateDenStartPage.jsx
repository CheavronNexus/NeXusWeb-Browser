import React, { useState, useEffect } from 'react'
import { Shield, Lock, Globe, Trash2, Search, ArrowRight, EyeOff, Radio, Cpu, RefreshCw, Check, Zap } from 'lucide-react'

export default function PrivateDenStartPage({ onNavigate, onWipeAndExit }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [vpnConfig, setVpnConfig] = useState({ mode: 'direct', region: 'direct' })
  const [vpnLoading, setVpnLoading] = useState(false)

  useEffect(() => {
    const checkVpn = async () => {
      try {
        const conf = await window.nexus?.proxy?.getConfig()
        if (conf) setVpnConfig(conf)
      } catch (e) {}
    }
    checkVpn()
  }, [])

  const handleSetProxy = async (region) => {
    setVpnLoading(true)
    try {
      if (region === 'direct') {
        await window.nexus?.proxy?.setMode?.('direct', 'direct')
        setVpnConfig({ mode: 'direct', region: 'direct' })
      } else {
        const res = await window.nexus?.proxy?.setMode?.('proxy', region)
        if (res?.config) setVpnConfig(res.config)
        else setVpnConfig({ mode: 'proxy', region })
      }
    } catch (e) {}
    setVpnLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return

    if (q.startsWith('http://') || q.startsWith('https://')) {
      onNavigate(q)
      return
    }
    if (q.includes('.') && !q.includes(' ')) {
      onNavigate(`https://${q}`)
      return
    }

    onNavigate(`https://duckduckgo.com/?q=${encodeURIComponent(q)}`)
  }

  const privacyFeatures = [
    {
      icon: EyeOff,
      title: 'In-Memory RAM Sandbox',
      desc: 'All browsing data, cookies, and cache reside strictly in temporary RAM. Nothing is written to your physical storage disk.',
      color: '#c084fc',
    },
    {
      icon: Globe,
      title: 'WebRTC IP Leak Shield',
      desc: 'Non-proxied UDP packets are strictly disabled, ensuring peer connections never reveal your local or public IP.',
      color: '#38bdf8',
    },
    {
      icon: Shield,
      title: 'Anti-Fingerprint Masking',
      desc: 'Injects randomized canvas, audio frequency noise, and screen metrics to thwart cross-site tracking scripts.',
      color: '#4ade80',
    },
    {
      icon: Trash2,
      title: 'Instant 100% Data Wipe',
      desc: 'Closing this window triggers an automatic hardware-level memory wipe of all cookies, storages, and cache.',
      color: '#f87171',
    },
  ]

  const vpnRegions = [
    { id: 'direct', label: 'Direct', sub: 'Standard ISP IP' },
    { id: 'nl', label: 'Netherlands', sub: 'EU Privacy Haven' },
    { id: 'us', label: 'United States', sub: 'US East Tunnel' },
    { id: 'sg', label: 'Singapore', sub: 'Asia-Pacific Fast' },
    { id: 'uk', label: 'United Kingdom', sub: 'London Fast Proxy' },
  ]

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      background: 'radial-gradient(ellipse at 50% 10%, rgba(139, 92, 246, 0.12) 0%, #090812 70%)',
      color: '#e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '48px 24px',
      fontFamily: 'var(--font-sans)',
      userSelect: 'none',
    }}>
      {/* Hero Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        borderRadius: 20,
        background: 'rgba(168, 85, 247, 0.15)',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        color: '#d8b4fe',
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 20,
        letterSpacing: '0.04em',
        boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)',
      }}>
        <span>🕵️</span>
        <span>PRIVATE DEN · VIRTUAL SANDBOX</span>
      </div>

      {/* Main Title */}
      <h1 style={{
        fontSize: 32,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        color: '#f8fafc',
        marginBottom: 10,
        textAlign: 'center',
      }}>
        Isolated Ephemeral Session
      </h1>
      <p style={{
        fontSize: 14,
        color: '#94a3b8',
        maxWidth: 580,
        textAlign: 'center',
        lineHeight: 1.6,
        marginBottom: 32,
      }}>
        You are browsing inside a virtual sandbox. No browsing history, cookies, form entries, or cache are ever saved. All traces are instantly wiped from RAM when you close this window.
      </p>

      {/* Search Input */}
      <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: 640, marginBottom: 36 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          borderRadius: 14,
          padding: '6px 8px 6px 16px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
          transition: 'all 0.2s ease',
        }}>
          <Search size={18} style={{ color: '#a855f7', flexShrink: 0, marginRight: 12 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search privately on DuckDuckGo or enter URL..."
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: 15,
              fontWeight: 500,
            }}
          />
          <button
            type="submit"
            style={{
              background: '#8b5cf6',
              border: 'none',
              borderRadius: 10,
              padding: '8px 16px',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            <span>Search</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </form>

      {/* VPN & Proxy Region Selector Card */}
      <div style={{
        width: '100%',
        maxWidth: 720,
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={18} style={{ color: '#38bdf8' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>High-Speed Proxy / VPN Tunnel</span>
          </div>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 9px',
            borderRadius: 6,
            background: vpnConfig.mode !== 'direct' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.06)',
            color: vpnConfig.mode !== 'direct' ? '#38bdf8' : '#94a3b8',
            border: '1px solid',
            borderColor: vpnConfig.mode !== 'direct' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255,255,255,0.08)',
          }}>
            {vpnConfig.mode !== 'direct' ? `ACTIVE: ${vpnConfig.region?.toUpperCase()}` : 'DIRECT (NO VPN)'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {vpnRegions.map(r => {
            const isSelected = (vpnConfig.region || 'direct') === r.id
            return (
              <button
                key={r.id}
                onClick={() => handleSetProxy(r.id)}
                disabled={vpnLoading}
                style={{
                  padding: '12px 10px',
                  borderRadius: 10,
                  border: '1px solid',
                  borderColor: isSelected ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)',
                  background: isSelected ? 'rgba(139, 92, 246, 0.20)' : 'rgba(255, 255, 255, 0.03)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: isSelected ? '#d8b4fe' : '#f1f5f9' }}>
                  {r.label}
                </span>
                <span style={{ fontSize: 9.5, color: '#94a3b8' }}>
                  {r.sub}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Privacy Feature Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 14,
        width: '100%',
        maxWidth: 720,
        marginBottom: 32,
      }}>
        {privacyFeatures.map((f, i) => {
          const IconComp = f.icon
          return (
            <div
              key={i}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 12,
                padding: '16px 18px',
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
              }}
            >
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: 10,
                borderRadius: 10,
                color: f.color,
                flexShrink: 0,
              }}>
                <IconComp size={18} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>
                  {f.title}
                </div>
                <div style={{ fontSize: 11.5, color: '#94a3b8', lineHeight: 1.45 }}>
                  {f.desc}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Wipe & Exit Action Button */}
      <button
        onClick={onWipeAndExit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 10,
          padding: '10px 22px',
          color: '#fca5a5',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
      >
        <Trash2 size={15} />
        <span>Wipe RAM Session & Exit Private Den</span>
      </button>
    </div>
  )
}
