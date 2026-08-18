import React, { useState, useEffect } from 'react'
import PanelShell from './PanelShell'
import { Palette, Check } from 'lucide-react'

const nexus = window.nexus

export default function ThemeCustomizer({
  currentTheme,
  onThemeChange,
  onClose,
}) {
  const [accentColor, setAccentColor] = useState('#00d4ff')

  const themes = [
    {
      id: 'cyber-dark',
      name: 'Cyber Dark',
      desc: 'Deep slate with electric cyan neon accents',
      bg: '#0a0d14',
      accent: '#00d4ff',
    },
    {
      id: 'emerald-matrix',
      name: 'Emerald Matrix',
      desc: 'Dark forest terminal with emerald matrix glow',
      bg: '#06130d',
      accent: '#10b981',
    },
    {
      id: 'solar-amber',
      name: 'Solar Amber',
      desc: 'Warm obsidian with rich amber gold highlights',
      bg: '#120e06',
      accent: '#f59e0b',
    },
    {
      id: 'synth-violet',
      name: 'Synth Violet',
      desc: 'Midnight synthwave with electric purple vibe',
      bg: '#0d0818',
      accent: '#a855f7',
    },
    {
      id: 'sakura-neon',
      name: 'Sakura Neon',
      desc: 'Deep plum with radiant rose blossom accents',
      bg: '#160812',
      accent: '#f43f5e',
    },
    {
      id: 'obsidian-light',
      name: 'Obsidian Light',
      desc: 'High-contrast clean daylight productivity theme',
      bg: '#f8fafc',
      accent: '#0284c7',
    },
  ]

  const accentPresets = [
    '#00d4ff', // Cyan
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#a855f7', // Violet
    '#f43f5e', // Rose
    '#06b6d4', // Sky
    '#84cc16', // Lime
    '#fb923c', // Orange
  ]

  const handleSelectAccent = (color) => {
    setAccentColor(color)
    document.documentElement.style.setProperty('--accent', color)
    document.documentElement.style.setProperty('--accent-glow', `${color}33`)
    document.documentElement.style.setProperty('--border-active', `${color}66`)
    nexus?.settings.update({ accentColor: color })
  }

  return (
    <PanelShell
      title="Theme & Accents"
      icon={<Palette size={16} style={{ color: 'var(--accent)' }} />}
      onClose={onClose}
      badge="Customizer"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Curated Themes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Curated Color Palettes
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {themes.map(t => {
              const isSelected = currentTheme === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => onThemeChange(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'var(--bg-tertiary)',
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-sm)',
                      background: t.bg,
                      border: `2px solid ${t.accent}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.accent }} />
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                        {t.desc}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check size={16} style={{ color: 'var(--accent)' }} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Custom Color Accents */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Live Accent Glow Presets
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {accentPresets.map(color => (
              <button
                key={color}
                onClick={() => handleSelectAccent(color)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  background: color,
                  border: accentColor === color ? '2px solid white' : '1px solid var(--border)',
                  boxShadow: accentColor === color ? `0 0 10px ${color}` : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {accentColor === color && <Check size={14} style={{ color: '#0a0d14' }} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PanelShell>
  )
}
