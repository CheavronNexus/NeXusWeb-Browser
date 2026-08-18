import React, { useState, useEffect, useRef } from 'react'
import {
  BookOpen, X, Volume2, VolumeX, Play, Pause, Square,
  Printer, Copy, Check, Type, Sun, Moon, Sparkles, ZoomIn, ZoomOut,
  Maximize2, Minimize2, Globe, FileText, AlignLeft, AlignJustify,
  ChevronDown, Sliders, RefreshCw
} from 'lucide-react'

const LICENSE_FREE_FONTS = [
  { id: 'inter', name: 'Inter', category: 'Modern Sans', family: '"Inter", sans-serif', desc: 'Crisp, high legibility neo-grotesque' },
  { id: 'merriweather', name: 'Merriweather', category: 'Editorial Serif', family: '"Merriweather", Georgia, serif', desc: 'Designed specifically for screen reading' },
  { id: 'lora', name: 'Lora', category: 'Contemporary Serif', family: '"Lora", serif', desc: 'Balanced literary curves and calligraphy' },
  { id: 'roboto-serif', name: 'Roboto Serif', category: 'Longform Serif', family: '"Roboto Serif", serif', desc: 'Refined readability for long articles' },
  { id: 'literata', name: 'Literata', category: 'E-Book Serif', family: '"Literata", Georgia, serif', desc: 'Designed for Google Play Books' },
  { id: 'playfair', name: 'Playfair Display', category: 'High-Contrast Serif', family: '"Playfair Display", serif', desc: 'Editorial elegance and character' },
  { id: 'plus-jakarta', name: 'Plus Jakarta Sans', category: 'Geometric Sans', family: '"Plus Jakarta Sans", sans-serif', desc: 'Clean, clean-cut modern aesthetic' },
  { id: 'open-sans', name: 'Open Sans', category: 'Neutral Sans', family: '"Open Sans", sans-serif', desc: 'Optimized for print, web, and mobile' },
  { id: 'source-serif', name: 'Source Serif 4', category: 'Scholarly Serif', family: '"Source Serif 4", serif', desc: 'Adobe open-source typeface' },
  { id: 'fira-code', name: 'Fira Code', category: 'Technical Mono', family: '"Fira Code", "JetBrains Mono", monospace', desc: 'Monospaced with clean programming ligatures' },
]

export default function ReaderMode({ activeTabId, onClose }) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('clean') // 'clean' | 'full'
  const [fontSize, setFontSize] = useState(19)
  const [lineHeight, setLineHeight] = useState(1.85)
  const [maxWidth, setMaxWidth] = useState(780)
  const [selectedFont, setSelectedFont] = useState('merriweather')
  const [textAlign, setTextAlign] = useState('left') // 'left' | 'justify'
  const [readerTheme, setReaderTheme] = useState('dark') // 'dark' | 'sepia' | 'warm' | 'light' | 'oled'
  const [scrollProgress, setScrollProgress] = useState(0)
  const [copied, setCopied] = useState(false)
  const [showFontMenu, setShowFontMenu] = useState(false)
  const [showAppearanceMenu, setShowAppearanceMenu] = useState(false)

  // Text-To-Speech State
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [speechRate, setSpeechRate] = useState(1.0)
  const fontMenuRef = useRef(null)
  const appearanceMenuRef = useRef(null)
  const contentRef = useRef(null)

  const extractContent = async () => {
    setLoading(true)
    try {
      const res = await window.nexus?.readerMode?.extract(activeTabId)
      if (res?.success) {
        setArticle(res)
      } else {
        setArticle(null)
      }
    } catch (e) {
      setArticle(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    extractContent()

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        stopSpeech()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    const handleClickOutside = (e) => {
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target)) {
        setShowFontMenu(false)
      }
      if (appearanceMenuRef.current && !appearanceMenuRef.current.contains(e.target)) {
        setShowAppearanceMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
      stopSpeech()
    }
  }, [activeTabId, onClose])

  const handleScroll = (e) => {
    const el = e.target
    const total = el.scrollHeight - el.clientHeight
    if (total > 0) {
      setScrollProgress(Math.min(100, Math.max(0, (el.scrollTop / total) * 100)))
    }
  }

  // Text to Speech
  const startSpeech = () => {
    if (!('speechSynthesis' in window)) return
    if (isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
      setIsSpeaking(true)
      return
    }

    window.speechSynthesis.cancel()
    if (!article) return

    const htmlToRead = viewMode === 'full' ? (article.fullPageHtml || article.cleanHtml) : article.cleanHtml
    const plainText = `${article.title}. ${article.byline ? `By ${article.byline}.` : ''} ${htmlToRead.replace(/<[^>]+>/g, ' ')}`
    const utterance = new SpeechSynthesisUtterance(plainText)
    utterance.rate = speechRate

    utterance.onend = () => {
      setIsSpeaking(false)
      setIsPaused(false)
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      setIsPaused(false)
    }

    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
    setIsPaused(false)
  }

  const pauseSpeech = () => {
    if ('speechSynthesis' in window && isSpeaking) {
      window.speechSynthesis.pause()
      setIsPaused(true)
      setIsSpeaking(false)
    }
  }

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setIsPaused(false)
    }
  }

  const handleCopy = () => {
    if (!article) return
    const htmlToCopy = viewMode === 'full' ? (article.fullPageHtml || article.cleanHtml) : article.cleanHtml
    const plain = `${article.title}\n\n${htmlToCopy.replace(/<[^>]+>/g, '')}`
    navigator.clipboard.writeText(plain)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  const themes = {
    dark: {
      bg: '#0e111a',
      cardBg: 'rgba(20, 24, 38, 0.92)',
      text: '#e2e8f0',
      muted: '#94a3b8',
      border: 'rgba(255, 255, 255, 0.10)',
      accent: '#00d4ff',
      tagBg: 'rgba(0, 212, 255, 0.12)',
      hoverBg: 'rgba(255, 255, 255, 0.08)',
    },
    sepia: {
      bg: '#fbf0d9',
      cardBg: 'rgba(244, 232, 208, 0.95)',
      text: '#3d2e1e',
      muted: '#7a6652',
      border: 'rgba(61, 46, 30, 0.15)',
      accent: '#c05621',
      tagBg: 'rgba(192, 86, 33, 0.12)',
      hoverBg: 'rgba(61, 46, 30, 0.08)',
    },
    warm: {
      bg: '#faf8f5',
      cardBg: 'rgba(240, 237, 230, 0.95)',
      text: '#2d3748',
      muted: '#718096',
      border: 'rgba(0, 0, 0, 0.08)',
      accent: '#3182ce',
      tagBg: 'rgba(49, 130, 206, 0.12)',
      hoverBg: 'rgba(0, 0, 0, 0.05)',
    },
    light: {
      bg: '#ffffff',
      cardBg: 'rgba(248, 250, 252, 0.95)',
      text: '#0f172a',
      muted: '#64748b',
      border: 'rgba(0, 0, 0, 0.10)',
      accent: '#0284c7',
      tagBg: 'rgba(2, 132, 199, 0.12)',
      hoverBg: 'rgba(0, 0, 0, 0.06)',
    },
    oled: {
      bg: '#000000',
      cardBg: 'rgba(12, 12, 12, 0.95)',
      text: '#f1f5f9',
      muted: '#64748b',
      border: 'rgba(255, 255, 255, 0.15)',
      accent: '#38bdf8',
      tagBg: 'rgba(56, 189, 248, 0.15)',
      hoverBg: 'rgba(255, 255, 255, 0.10)',
    },
  }[readerTheme]

  const activeFontObj = LICENSE_FREE_FONTS.find(f => f.id === selectedFont) || LICENSE_FREE_FONTS[0]

  return (
    <div
      className="reader-mode-full-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: themes.bg,
        color: themes.text,
        zIndex: 9000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeIn 0.18s ease',
      }}
    >
      {/* ── Scroll Progress Line ──────────────────────────────────────────── */}
      <div style={{
        height: 3,
        width: `${scrollProgress}%`,
        background: themes.accent,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 9002,
        transition: 'width 0.08s ease',
      }} />

      {/* ── Floating Reader Control Header ─────────────────────────────────── */}
      <div style={{
        height: 54,
        backgroundColor: themes.cardBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${themes.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 9001,
        userSelect: 'none',
        flexShrink: 0,
      }}>
        {/* Left: Mode Switcher (Clean Article vs Full Webpage) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: themes.hoverBg,
            border: `1px solid ${themes.border}`,
            borderRadius: 8,
            padding: 2,
          }}>
            <button
              onClick={() => setViewMode('clean')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                fontSize: 11.5, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer',
                background: viewMode === 'clean' ? themes.accent : 'transparent',
                color: viewMode === 'clean' ? (readerTheme === 'dark' || readerTheme === 'oled' ? '#000000' : '#ffffff') : themes.muted,
                transition: 'all 0.12s ease',
              }}
              title="Distraction-free article extraction"
            >
              <FileText size={13} />
              <span>Clean Article</span>
            </button>
            <button
              onClick={() => setViewMode('full')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                fontSize: 11.5, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer',
                background: viewMode === 'full' ? themes.accent : 'transparent',
                color: viewMode === 'full' ? (readerTheme === 'dark' || readerTheme === 'oled' ? '#000000' : '#ffffff') : themes.muted,
                transition: 'all 0.12s ease',
              }}
              title="Load complete webpage without clutter or ads"
            >
              <Globe size={13} />
              <span>Full Webpage</span>
            </button>
          </div>

          <button
            onClick={extractContent}
            style={{
              border: `1px solid ${themes.border}`, background: 'transparent', color: themes.muted,
              padding: '6px 8px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}
            title="Reload & re-extract page content"
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
          </button>
        </div>

        {/* Center: Font Picker Button & Typography Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          
          {/* 1. Font Selection Button */}
          <div ref={fontMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFontMenu(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 12px',
                background: showFontMenu ? themes.tagBg : themes.hoverBg,
                border: `1px solid ${showFontMenu ? themes.accent : themes.border}`,
                borderRadius: 7,
                color: themes.text,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: activeFontObj.family,
                transition: 'all 0.12s ease',
              }}
              title="Select from 10 license-free reading fonts"
            >
              <Type size={14} style={{ color: themes.accent }} />
              <span>{activeFontObj.name}</span>
              <ChevronDown size={13} style={{ color: themes.muted }} />
            </button>

            {/* 10 License-Free Font Popover */}
            {showFontMenu && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 320,
                maxHeight: 420,
                overflowY: 'auto',
                backgroundColor: themes.cardBg,
                backdropFilter: 'blur(25px)',
                WebkitBackdropFilter: 'blur(25px)',
                border: `1px solid ${themes.border}`,
                borderRadius: 12,
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)',
                padding: '8px',
                zIndex: 9999,
                animation: 'fadeIn 0.12s ease',
              }}>
                <div style={{ padding: '6px 8px 8px', borderBottom: `1px solid ${themes.border}`, marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: themes.muted }}>
                    10 License-Free Reading Fonts
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {LICENSE_FREE_FONTS.map(f => (
                    <div
                      key={f.id}
                      onClick={() => { setSelectedFont(f.id); setShowFontMenu(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: selectedFont === f.id ? themes.tagBg : 'transparent',
                        border: selectedFont === f.id ? `1px solid ${themes.accent}` : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'background 0.1s ease',
                      }}
                      onMouseEnter={e => { if (selectedFont !== f.id) e.currentTarget.style.background = themes.hoverBg }}
                      onMouseLeave={e => { if (selectedFont !== f.id) e.currentTarget.style.background = 'transparent' }}
                    >
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: themes.text, fontFamily: f.family }}>
                          {f.name}
                        </div>
                        <div style={{ fontSize: 10, color: themes.muted, marginTop: 1 }}>
                          {f.category} · {f.desc}
                        </div>
                      </div>
                      {selectedFont === f.id && <Check size={14} style={{ color: themes.accent }} />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Quick Font Size Adjuster */}
          <div style={{ display: 'flex', alignItems: 'center', background: themes.hoverBg, border: `1px solid ${themes.border}`, borderRadius: 7, padding: '2px 4px' }}>
            <button
              onClick={() => setFontSize(s => Math.max(14, s - 1))}
              style={{ border: 'none', background: 'transparent', color: themes.text, padding: '4px 7px', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
              title="Decrease font size"
            >
              A-
            </button>
            <span style={{ fontSize: 11, fontWeight: 600, color: themes.muted, minWidth: 24, textAlign: 'center' }}>
              {fontSize}
            </span>
            <button
              onClick={() => setFontSize(s => Math.min(32, s + 1))}
              style={{ border: 'none', background: 'transparent', color: themes.text, padding: '4px 7px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
              title="Increase font size"
            >
              A+
            </button>
          </div>

          {/* 3. Text Alignment */}
          <div style={{ display: 'flex', alignItems: 'center', background: themes.hoverBg, border: `1px solid ${themes.border}`, borderRadius: 7, padding: 2 }}>
            <button
              onClick={() => setTextAlign('left')}
              style={{
                border: 'none', background: textAlign === 'left' ? themes.tagBg : 'transparent',
                color: textAlign === 'left' ? themes.accent : themes.muted,
                padding: '4px 6px', borderRadius: 5, cursor: 'pointer', display: 'flex', alignItems: 'center'
              }}
              title="Align Left"
            >
              <AlignLeft size={13} />
            </button>
            <button
              onClick={() => setTextAlign('justify')}
              style={{
                border: 'none', background: textAlign === 'justify' ? themes.tagBg : 'transparent',
                color: textAlign === 'justify' ? themes.accent : themes.muted,
                padding: '4px 6px', borderRadius: 5, cursor: 'pointer', display: 'flex', alignItems: 'center'
              }}
              title="Justify Text"
            >
              <AlignJustify size={13} />
            </button>
          </div>

          {/* 4. Reading Themes Palette */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: themes.hoverBg, border: `1px solid ${themes.border}`, borderRadius: 8, padding: '3px 6px' }}>
            {[
              { id: 'dark', bg: '#0e111a', border: '#38bdf8', label: 'Dark Obsidian' },
              { id: 'sepia', bg: '#fbf0d9', border: '#c05621', label: 'Sepia Paper' },
              { id: 'warm', bg: '#faf8f5', border: '#718096', label: 'Warm Cream' },
              { id: 'light', bg: '#ffffff', border: '#0284c7', label: 'Clean Light' },
              { id: 'oled', bg: '#000000', border: '#ffffff', label: 'OLED Pitch Black' },
            ].map(t => (
              <div
                key={t.id}
                onClick={() => setReaderTheme(t.id)}
                style={{
                  width: 18, height: 18, borderRadius: '50%',
                  backgroundColor: t.bg,
                  border: readerTheme === t.id ? `2px solid ${t.border}` : '1px solid rgba(128,128,128,0.4)',
                  cursor: 'pointer',
                  transform: readerTheme === t.id ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.12s ease',
                }}
                title={t.label}
              />
            ))}
          </div>

          {/* 5. Audio Text-To-Speech Player */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: themes.hoverBg, border: `1px solid ${themes.border}`, borderRadius: 7, padding: '2px 6px' }}>
            {!isSpeaking ? (
              <button
                onClick={startSpeech}
                style={{ border: 'none', background: 'transparent', color: themes.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '4px 6px' }}
                title="Listen to Article (Text-to-Speech)"
              >
                <Volume2 size={14} />
                <span>Listen</span>
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  onClick={pauseSpeech}
                  style={{ border: 'none', background: 'transparent', color: themes.accent, cursor: 'pointer', padding: 4 }}
                  title="Pause speech"
                >
                  <Pause size={13} />
                </button>
                <button
                  onClick={stopSpeech}
                  style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                  title="Stop speech"
                >
                  <Square size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions (Copy, Print, Width, Close) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={handleCopy}
            style={{
              border: `1px solid ${themes.border}`, background: themes.hoverBg, color: themes.text,
              padding: '6px 10px', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600,
            }}
            title="Copy clean text"
          >
            {copied ? <Check size={13} style={{ color: '#22c55e' }} /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handlePrint}
            style={{
              border: `1px solid ${themes.border}`, background: themes.hoverBg, color: themes.text,
              padding: '6px 8px', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}
            title="Print Clean Article"
          >
            <Printer size={14} />
          </button>

          <button
            onClick={onClose}
            style={{
              border: 'none', background: 'transparent', color: themes.muted,
              padding: 6, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center',
              marginLeft: 4,
            }}
            title="Exit Reader Mode (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Main Reader Reading Canvas ────────────────────────────────────── */}
      <div
        ref={contentRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '40px 24px 80px',
          display: 'flex',
          justifyContent: 'center',
          fontFamily: activeFontObj.family,
          lineHeight: lineHeight,
          scrollbarWidth: 'thin',
        }}
      >
        <div style={{ width: '100%', maxWidth: maxWidth }}>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '120px 0', color: themes.muted }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <BookOpen size={20} style={{ color: themes.accent }} />
                <span>Extracting page content...</span>
              </div>
              <div style={{ fontSize: 12 }}>Parsing full structured webpage layout</div>
            </div>
          ) : !article ? (
            <div style={{ textAlign: 'center', padding: '120px 0', color: themes.muted }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Unable to extract readable content</div>
              <div style={{ fontSize: 12, maxWidth: 360, margin: '0 auto 16px' }}>This page may contain dynamic client-rendered scripts or no long-form article text.</div>
              <button
                onClick={extractContent}
                style={{
                  padding: '7px 16px', background: themes.accent, border: 'none', borderRadius: 6,
                  color: readerTheme === 'dark' || readerTheme === 'oled' ? '#000000' : '#ffffff',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Retry Extraction
              </button>
            </div>
          ) : (
            <article style={{ textAlign: textAlign }}>
              
              {/* Metadata Header */}
              <header style={{ marginBottom: 36, paddingBottom: 24, borderBottom: `1px solid ${themes.border}` }}>
                {article.siteName && (
                  <div style={{
                    fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: themes.accent, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <Globe size={13} />
                    <span>{article.siteName}</span>
                    <span>•</span>
                    <span style={{ color: themes.muted, textTransform: 'none', fontWeight: 500 }}>{article.readingTimeMinutes} min read ({article.wordCount} words)</span>
                  </div>
                )}

                <h1 style={{
                  fontSize: fontSize * 1.75,
                  fontWeight: 700,
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                  color: themes.text,
                  marginBottom: 16,
                  fontFamily: activeFontObj.family,
                }}>
                  {article.title}
                </h1>

                {article.byline && (
                  <div style={{ fontSize: 13, color: themes.muted, fontStyle: 'italic' }}>
                    By {article.byline}
                  </div>
                )}
              </header>

              {/* Lead Image if available */}
              {article.leadImg && viewMode === 'clean' && (
                <div style={{ marginBottom: 32, textAlign: 'center' }}>
                  <img
                    src={article.leadImg}
                    alt=""
                    style={{
                      maxWidth: '100%',
                      borderRadius: 12,
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
                    }}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                </div>
              )}

              {/* Body Content */}
              <div
                className="reader-content-body"
                style={{
                  fontSize: fontSize,
                  color: themes.text,
                }}
                dangerouslySetInnerHTML={{
                  __html: viewMode === 'full' ? (article.fullPageHtml || article.cleanHtml) : article.cleanHtml
                }}
              />

              {/* Footer Source Link */}
              <footer style={{ marginTop: 60, paddingTop: 24, borderTop: `1px solid ${themes.border}`, fontSize: 12, color: themes.muted }}>
                <div>Original Source: <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: themes.accent, textDecoration: 'none' }}>{article.url}</a></div>
              </footer>

            </article>
          )}

        </div>
      </div>
    </div>
  )
}
