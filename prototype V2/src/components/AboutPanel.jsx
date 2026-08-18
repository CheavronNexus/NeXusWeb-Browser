import React from 'react'
import { PanelShell } from './PanelShell'
import logoImg from '../assets/logo.png'

export default function AboutPanel({ onClose, onOpenShortcuts, onOpenSettings }) {
  return (
    <PanelShell id="panel-about" title="About NeXusWeb" icon="ℹ️" onClose={onClose}>
      <div style={{ padding: '16px 14px' }}>
        
        {/* Hero Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
          border: '1px solid var(--border-bright)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 16px',
          textAlign: 'center',
          marginBottom: 16,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}>
          <img
            src={logoImg}
            alt="NeXusWeb Brand Logo"
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 0 28px rgba(0, 212, 255, 0.45)',
              objectFit: 'contain',
              marginBottom: 12,
            }}
          />
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            NeXusWeb
          </div>
          <div style={{
            display: 'inline-block',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--accent-primary)',
            background: 'rgba(0, 212, 255, 0.15)',
            border: '1px solid var(--border-bright)',
            padding: '2px 8px',
            borderRadius: 100,
            marginTop: 4,
            marginBottom: 8,
          }}>
            v3.0.0 Production Release
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            The Developer Browser & Privacy Web Client
          </div>
        </div>

        {/* Vision & Philosophy */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            🌟 The Vision
          </div>
          <div style={{
            fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6,
            background: 'var(--bg-base)', padding: '12px 14px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            Modern web development is often fragmented across multiple IDEs, terminal windows, browser tabs, port conflicts, and CORS headaches. Mainstream browsers are burdened with telemetry, heavy background bloat, and ad profiling.
            <br /><br />
            <strong>NeXusWeb was created with a clear vision:</strong> To build a unified, lightning-fast, and strictly private workstation browser that eliminates context switching for developers while giving everyone an ad-free, tracker-free web browsing experience.
          </div>
        </div>

        {/* For Whom? */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            👥 Who Is NeXusWeb For?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              {
                icon: '⚛️',
                title: 'Frontend Developers',
                desc: 'Instant auto-detection for Vite, React, Vue, Next.js, and Live Servers with hot-reload support.',
              },
              {
                icon: '🐍',
                title: 'Backend & API Engineers',
                desc: 'Test Flask, FastAPI, Django, Express, and Go APIs with live request inspection and .env file readers.',
              },
              {
                icon: '🛡️',
                title: 'Privacy Conscious Users',
                desc: 'DuckDuckGo-style Privacy Shield blocking 55+ tracker networks, anti-fingerprinting, and 100% local data storage.',
              },
              {
                icon: '⚡',
                title: 'Power Users & Students',
                desc: 'Integrated multi-terminal sessions, dual split-screen view, floating video PiP, and quick command palette (Ctrl+K).',
              },
            ].map(item => (
              <div
                key={item.title}
                style={{
                  display: 'flex',
                  gap: 10,
                  background: 'var(--bg-base)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Use NeXusWeb? (Key Features) */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            🚀 Why Use NeXusWeb?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: '🛡️ Privacy Shield', text: 'Blocks 55+ tracker domains, enforces HTTPS upgrades, and spoofs canvas/audio fingerprinting.' },
              { label: '🔌 Port Auto-Detector', text: 'Live polling of active localhost TCP listeners (Flask: 5000, Vite: 5173, React: 3000, Django: 8000).' },
              { label: '⌨️ Built-in Multi-Terminal', text: 'Full xterm.js + node-pty terminals with session tabs directly inside the browser.' },
              { label: '🌐 Request Inspector', text: 'Real-time HTTP/HTTPS network logging with status codes, headers, and latency metrics.' },
              { label: '🔑 .env Workspace Reader', text: 'Safe inspection of workspace environment files with secret masking and copy tools.' },
              { label: '🪟 Dual Split View', text: 'Browse or test two web applications side-by-side in one window (Ctrl+\\).' },
              { label: '📺 Floating Video (PiP)', text: 'Pop out any video into an always-on-top floating player with global HUD controls.' },
              { label: '📖 Reader Mode', text: 'Distraction-free article extractor with custom typography and themes.' },
              { label: '⚡ Command Palette', text: 'Fuzzy search and trigger any browser action in milliseconds (Ctrl+K).' },
              { label: '🔍 8 Search Engines', text: 'Instant switching between DuckDuckGo, Brave, Google, Bing, Ecosia, Startpage, Kagi, or Custom.' },
            ].map(f => (
              <div
                key={f.label}
                style={{
                  padding: '8px 10px',
                  background: 'var(--bg-base)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: 11.5,
                  lineHeight: 1.4,
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginRight: 4 }}>{f.label}:</span>
                <span style={{ color: 'var(--text-secondary)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Network Modes */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            🔒 4 Dynamic Network Modes
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              { name: 'Normal Web', icon: '🛡️', color: 'var(--green)', desc: 'DuckDuckGo privacy search & tracker protection.' },
              { name: 'Strict Offline', icon: '🔒', color: 'var(--red)', desc: 'Air-gapped; localhost & 127.0.0.1 only.' },
              { name: 'Local LAN', icon: '📡', color: 'var(--amber)', desc: 'Local subnets & intranet device testing.' },
              { name: 'Developer', icon: '⚡', color: 'var(--purple)', desc: 'Unrestricted CORS & full DevTools inspection.' },
            ].map(m => (
              <div
                key={m.name}
                style={{
                  background: 'var(--bg-base)',
                  border: `1px solid var(--border-subtle)`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 10px',
                }}
              >
                <div style={{ fontSize: 11.5, fontWeight: 700, color: m.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>{m.icon}</span> {m.name}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.3 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture & Stack */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            ⚙️ Architecture & Technology
          </div>
          <div style={{
            fontSize: 11.5, color: 'var(--text-secondary)', background: 'var(--bg-base)',
            padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
            lineHeight: 1.5,
          }}>
            <div>• <strong>Engine</strong>: Electron 28 · Chromium 120 · Node.js 18</div>
            <div>• <strong>UI Framework</strong>: React 18 · Vite 5 · Vanilla CSS Tokens</div>
            <div>• <strong>Terminal Core</strong>: @xterm/xterm 5 · node-pty 1.1</div>
            <div>• <strong>Storage</strong>: 100% Local JSON Store (Zero Cloud Tracking)</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <button
            className="scan-btn"
            onClick={() => {
              onClose()
              if (onOpenSettings) onOpenSettings()
            }}
            style={{ width: '100%', padding: '9px 14px', fontSize: 12, justifyContent: 'center' }}
          >
            ⚙️ Open Settings & Search Engine Preferences
          </button>
          <button
            className="scan-btn"
            onClick={() => {
              onClose()
              if (onOpenShortcuts) onOpenShortcuts()
            }}
            style={{ width: '100%', padding: '9px 14px', fontSize: 12, justifyContent: 'center' }}
          >
            ⌨️ View Keyboard Shortcuts (F1)
          </button>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center', marginTop: 18, paddingTop: 14,
          borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: 11,
        }}>
          NeXusWeb v3.0.0 · Crafted for Developers & Privacy Enthusiasts
        </div>

      </div>
    </PanelShell>
  )
}
