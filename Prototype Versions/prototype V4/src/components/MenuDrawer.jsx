import React, { useState } from 'react'
import { PanelShell } from './PanelShell'
import { 
  Zap, Rocket, Puzzle, Globe, Key, Cpu, Terminal, Split, Wrench,
  Music, BookOpen, Search, Camera, Download, FileText, Bookmark,
  Clock, Palette, Settings, Keyboard, Info, Sun, Moon, EyeOff, Shield, Menu
} from 'lucide-react'

export default function MenuDrawer({
  onClose,
  activePanel,
  onOpenPanel,
  onOpenCommandPalette,
  onToggleReaderMode,
  onTriggerPiP,
  onToggleTerminal,
  onToggleSplitView,
  onToggleDevTools,
  onToggleFind,
  onCaptureScreenshot,
  onToggleTheme,
  onCreatePrivateDen,
  currentTheme,
  mode,
}) {
  const [searchFilter, setSearchFilter] = useState('')

  const menuSections = [
    {
      title: 'Privacy & Dev Tools',
      items: [
        {
          id: 'private-den',
          icon: <EyeOff size={16} style={{ color: 'var(--accent-secondary)' }} />,
          label: 'Private Den (Incognito Tab)',
          badge: 'Zero Traces',
          desc: 'Ephemeral session with zero history, cache or logs',
          action: () => {
            onClose()
            onCreatePrivateDen?.()
          },
        },
        {
          id: 'palette',
          icon: <Zap size={16} style={{ color: 'var(--yellow)' }} />,
          label: 'Command Palette',
          badge: 'Ctrl+K',
          desc: 'Quick search and launcher for all actions',
          action: onOpenCommandPalette,
        },
        {
          id: 'api-workbench',
          icon: <Rocket size={16} style={{ color: 'var(--accent-primary)' }} />,
          label: 'REST & GraphQL Workbench',
          badge: 'NEW',
          desc: 'Postman-style endpoint tester with .env variables',
          action: () => onOpenPanel('api-workbench'),
        },
        {
          id: 'extensions',
          icon: <Puzzle size={16} style={{ color: 'var(--accent-secondary)' }} />,
          label: 'Extensions & Chrome Store',
          badge: 'Store + Scripts',
          desc: 'Install Chrome extensions & custom userscripts',
          action: () => onOpenPanel('extensions'),
        },
        {
          id: 'inspector',
          icon: <Globe size={16} style={{ color: 'var(--green)' }} />,
          label: 'Request Inspector',
          badge: 'Ctrl+Shift+I',
          desc: 'Real-time HTTP/HTTPS network logging',
          action: () => onOpenPanel('inspector'),
        },
        {
          id: 'env',
          icon: <Key size={16} style={{ color: 'var(--yellow)' }} />,
          label: 'Environment Variables',
          badge: '.env',
          desc: 'Scan workspace .env files with masking',
          action: () => onOpenPanel('env'),
        },
        {
          id: 'ports',
          icon: <Cpu size={16} style={{ color: 'var(--accent-primary)' }} />,
          label: 'Port Manager',
          badge: 'Ctrl+Shift+L',
          desc: 'Scan and manage localhost servers',
          action: () => onOpenPanel('ports'),
        },
        {
          id: 'terminal',
          icon: <Terminal size={16} style={{ color: 'var(--text-primary)' }} />,
          label: 'Terminal Sessions',
          badge: 'Ctrl+`',
          desc: 'Embedded multi-session shell terminal',
          action: onToggleTerminal,
        },
        {
          id: 'split',
          icon: <Split size={16} style={{ color: 'var(--accent-secondary)' }} />,
          label: 'Dual Split View',
          badge: 'Ctrl+\\',
          desc: 'Side-by-side split screen browsing',
          action: onToggleSplitView,
        },
        ...(mode === 'dev' || mode === 'normal' ? [{
          id: 'devtools',
          icon: <Wrench size={16} style={{ color: 'var(--accent-primary)' }} />,
          label: 'DevTools Inspector',
          badge: 'F12',
          desc: 'Chromium Developer Tools window',
          action: onToggleDevTools,
        }] : []),
      ],
    },
    {
      title: 'Media & Reading Studio',
      items: [
        {
          id: 'reader',
          icon: <BookOpen size={16} style={{ color: 'var(--yellow)' }} />,
          label: 'Reader Studio (Full View)',
          badge: 'Ctrl+Shift+R',
          desc: 'Distraction-free article extractor with TTS and themes',
          action: onToggleReaderMode,
        },
        {
          id: 'media-hud',
          icon: <Music size={16} style={{ color: 'var(--accent-pink)' }} />,
          label: 'Media HUD Controller',
          badge: 'Ctrl+Shift+M',
          desc: 'Scrub bar, volume, playback speed & tab audio',
          action: () => onOpenPanel('media'),
        },
      ],
    },
    {
      title: 'Search & Capture',
      items: [
        {
          id: 'find',
          icon: <Search size={16} style={{ color: 'var(--accent-primary)' }} />,
          label: 'Find in Page',
          badge: 'Ctrl+F',
          desc: 'Highlight and jump to search terms',
          action: onToggleFind,
        },
        {
          id: 'screenshot',
          icon: <Camera size={16} style={{ color: 'var(--green)' }} />,
          label: 'Page Screenshot',
          badge: 'F9',
          desc: 'Capture full resolution page image',
          action: onCaptureScreenshot,
        },
        {
          id: 'downloads',
          icon: <Download size={16} style={{ color: 'var(--accent-secondary)' }} />,
          label: 'Downloads Manager',
          badge: 'Ctrl+J',
          desc: 'View and open downloaded files',
          action: () => onOpenPanel('downloads'),
        },
      ],
    },
    {
      title: 'Notes & Browsing Data',
      items: [
        {
          id: 'notes',
          icon: <FileText size={16} style={{ color: 'var(--yellow)' }} />,
          label: 'Scratch Pad / Notes',
          badge: 'Ctrl+Shift+N',
          desc: 'Keep URL-linked developer notes',
          action: () => onOpenPanel('notes'),
        },
        {
          id: 'bookmarks',
          icon: <Bookmark size={16} style={{ color: 'var(--yellow)' }} />,
          label: 'Bookmarks Manager',
          badge: 'Ctrl+B',
          desc: 'Manage and organize saved links',
          action: () => onOpenPanel('bookmarks'),
        },
        {
          id: 'history',
          icon: <Clock size={16} style={{ color: 'var(--accent-primary)' }} />,
          label: 'Browsing History',
          badge: 'Ctrl+H',
          desc: 'Search past visited URLs',
          action: () => onOpenPanel('history'),
        },
      ],
    },
    {
      title: 'Preferences & Themes',
      items: [
        {
          id: 'theme-studio',
          icon: <Palette size={16} style={{ color: 'var(--accent-primary)' }} />,
          label: 'Theme & Accents Studio',
          badge: '6 Themes',
          desc: 'Curated color palettes and live neon glows',
          action: () => onOpenPanel('theme'),
        },
        {
          id: 'theme-toggle',
          icon: currentTheme === 'light' ? <Moon size={16} style={{ color: 'var(--accent-secondary)' }} /> : <Sun size={16} style={{ color: 'var(--yellow)' }} />,
          label: `Quick Toggle ${currentTheme === 'light' ? 'Dark' : 'Light'} Mode`,
          desc: 'Toggle visual theme color tokens',
          action: onToggleTheme,
        },
        {
          id: 'settings',
          icon: <Settings size={16} style={{ color: 'var(--text-secondary)' }} />,
          label: 'Settings & Privacy Shield',
          desc: 'Search engine picker, zoom, and security rules',
          action: () => onOpenPanel('settings'),
        },
        {
          id: 'shortcuts',
          icon: <Keyboard size={16} style={{ color: 'var(--text-muted)' }} />,
          label: 'Keyboard Shortcuts',
          badge: 'F1',
          desc: 'Comprehensive key combination list',
          action: () => onOpenPanel('shortcuts'),
        },
        {
          id: 'about',
          icon: <Info size={16} style={{ color: 'var(--accent-primary)' }} />,
          label: 'About NeXusWeb',
          badge: 'v4.0.0',
          desc: 'Vision, architecture, and feature guide',
          action: () => onOpenPanel('about'),
        },
      ],
    },
  ]

  const q = searchFilter.toLowerCase().trim()

  return (
    <PanelShell id="panel-menu" title="NeXusWeb Menu & Tools" icon={<Menu size={16} style={{ color: 'var(--accent-primary)' }} />} onClose={onClose}>
      <div style={{ padding: '10px 12px 24px' }}>
        
        {/* Quick Filter */}
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Search tools & features (e.g. inspector, terminal, notes)..."
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'var(--bg-base)',
              border: '1px solid var(--border-dim)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              outline: 'none',
            }}
          />
        </div>

        {/* Sections */}
        {menuSections.map(section => {
          const matchingItems = section.items.filter(item =>
            !q || item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || (item.badge && item.badge.toLowerCase().includes(q))
          )

          if (matchingItems.length === 0) return null

          return (
            <div key={section.title} style={{ marginBottom: 14 }}>
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 6,
                paddingLeft: 4,
              }}>
                {section.title}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {matchingItems.map(item => {
                  const isActive = activePanel === item.id

                  return (
                    <div
                      key={item.id}
                      id={`drawer-item-${item.id}`}
                      onClick={() => {
                        onClose()
                        item.action()
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        background: isActive ? 'var(--accent-primary-dim)' : 'var(--bg-base)',
                        border: `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'all var(--t-fast)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--bg-hover)'
                        e.currentTarget.style.borderColor = 'var(--border-dim)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = isActive ? 'var(--accent-primary-dim)' : 'var(--bg-base)'
                        e.currentTarget.style.borderColor = isActive ? 'var(--accent-primary)' : 'var(--border-subtle)'
                      }}
                    >
                      <span style={{ fontSize: 16, width: 22, textAlign: 'center', flexShrink: 0 }}>
                        {item.icon}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.label}
                          </span>
                        </div>
                        <div style={{
                          fontSize: 10.5,
                          color: 'var(--text-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginTop: 1,
                        }}>
                          {item.desc}
                        </div>
                      </div>
                      {item.badge && (
                        <span style={{
                          fontSize: 9.5,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-muted)',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          padding: '2px 5px',
                          borderRadius: 4,
                          flexShrink: 0,
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

      </div>
    </PanelShell>
  )
}
