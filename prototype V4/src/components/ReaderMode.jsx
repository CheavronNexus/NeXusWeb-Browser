import React, { useState, useEffect, useRef } from 'react'
import {
  BookOpen, X, Volume2, VolumeX, Play, Pause, Square,
  Printer, Copy, Check, Type, Sun, Moon, Sparkles, ZoomIn, ZoomOut,
  Maximize2, Minimize2
} from 'lucide-react'

export default function ReaderMode({ activeTabId, onClose }) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fontSize, setFontSize] = useState(18)
  const [lineHeight, setLineHeight] = useState(1.8)
  const [maxWidth, setMaxWidth] = useState(740)
  const [fontFamily, setFontFamily] = useState('serif') // 'serif' | 'sans' | 'mono'
  const [readerTheme, setReaderTheme] = useState('dark') // 'dark' | 'sepia' | 'oled' | 'light'
  const [scrollProgress, setScrollProgress] = useState(0)
  const [copied, setCopied] = useState(false)

  // Text-To-Speech State
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [speechRate, setSpeechRate] = useState(1.0)
  const contentRef = useRef(null)

  useEffect(() => {
    let mounted = true
    const extractContent = async () => {
      setLoading(true)
      try {
        const res = await window.nexus?.readerMode?.extract(activeTabId)
        if (mounted && res?.success) {
          setArticle(res)
        } else if (mounted) {
          setArticle(null)
        }
      } catch (e) {
        if (mounted) setArticle(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    extractContent()

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        stopSpeech()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      mounted = false
      window.removeEventListener('keydown', handleKeyDown)
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

    const plainText = `${article.title}. By ${article.byline || 'Unknown author'}. ${article.cleanHtml.replace(/<[^>]+>/g, ' ')}`
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
    const plain = `${article.title}\n\n${article.cleanHtml.replace(/<[^>]+>/g, '')}`
    navigator.clipboard.writeText(plain)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  const themes = {
    dark: {
      bg: '#0a0d14',
      cardBg: 'rgba(15, 19, 32, 0.85)',
      text: '#e8eaf2',
      muted: '#8892aa',
      border: 'rgba(255, 255, 255, 0.12)',
      accent: '#00d4ff',
    },
    sepia: {
      bg: '#f7efe2',
      cardBg: 'rgba(240, 230, 214, 0.90)',
      text: '#433422',
      muted: '#7a6750',
      border: 'rgba(67, 52, 34, 0.15)',
      accent: '#b8621b',
    },
    oled: {
      bg: '#000000',
      cardBg: 'rgba(12, 12, 12, 0.90)',
      text: '#dcdcdc',
      muted: '#707070',
      border: 'rgba(255, 255, 255, 0.15)',
      accent: '#ffffff',
    },
    light: {
      bg: '#ffffff',
      cardBg: 'rgba(248, 250, 252, 0.90)',
      text: '#1e293b',
      muted: '#64748b',
      border: 'rgba(0, 0, 0, 0.10)',
      accent: '#0284c7',
    },
  }[readerTheme]

  const fontOptions = {
    serif: 'Charter, "Merriweather", "Georgia", Cambria, serif',
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Cascadia Code", Consolas, monospace',
  }[fontFamily]

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
        animation: 'fadeIn 0.2s ease',
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
        transition: 'width 0.1s ease',
      }} />

      {/* ── Floating Reader Control Header ─────────────────────────────────── */}
      <div style={{
        height: 52,
        backgroundColor: themes.cardBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${themes.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 9001,
        flexShrink: 0,
      }}>
        {/* Left: Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: 'rgba(0, 212, 255, 0.15)',
            border: `1px solid ${themes.accent}`,
            padding: '4px 8px',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 700,
            color: themes.accent,
          }}>
            <BookOpen size={14} />
            <span>READER STUDIO</span>
          </div>
          {article && (
            <span style={{ fontSize: 12, color: themes.muted }}>
              {article.readingTimeMinutes} min read • {article.wordCount} words {article.siteName ? `• ${article.siteName}` : ''}
            </span>
          )}
        </div>

        {/* Center: Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Theme Picker */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: 3, borderRadius: 6, border: `1px solid ${themes.border}` }}>
            <button
              onClick={() => setReaderTheme('dark')}
              style={{
                background: readerTheme === 'dark' ? themes.accent : 'transparent',
                color: readerTheme === 'dark' ? '#000' : themes.text,
                border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >Dark</button>
            <button
              onClick={() => setReaderTheme('sepia')}
              style={{
                background: readerTheme === 'sepia' ? themes.accent : 'transparent',
                color: readerTheme === 'sepia' ? '#fff' : themes.text,
                border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >Sepia</button>
            <button
              onClick={() => setReaderTheme('oled')}
              style={{
                background: readerTheme === 'oled' ? '#333' : 'transparent',
                color: readerTheme === 'oled' ? '#fff' : themes.text,
                border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >OLED</button>
            <button
              onClick={() => setReaderTheme('light')}
              style={{
                background: readerTheme === 'light' ? themes.accent : 'transparent',
                color: readerTheme === 'light' ? '#fff' : themes.text,
                border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >Light</button>
          </div>

          {/* Typography */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: 3, borderRadius: 6, border: `1px solid ${themes.border}` }}>
            <button
              onClick={() => setFontFamily('serif')}
              style={{
                background: fontFamily === 'serif' ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: themes.text, border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 12, fontFamily: 'serif', cursor: 'pointer',
              }}
            >Serif</button>
            <button
              onClick={() => setFontFamily('sans')}
              style={{
                background: fontFamily === 'sans' ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: themes.text, border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 12, fontFamily: 'sans-serif', cursor: 'pointer',
              }}
            >Sans</button>
            <button
              onClick={() => setFontFamily('mono')}
              style={{
                background: fontFamily === 'mono' ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: themes.text, border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 12, fontFamily: 'monospace', cursor: 'pointer',
              }}
            >Mono</button>
          </div>

          {/* Font Size Steppers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={() => setFontSize(s => Math.max(13, s - 1))}
              style={{
                background: 'transparent', border: `1px solid ${themes.border}`, borderRadius: 4,
                color: themes.text, padding: '3px 7px', fontSize: 11, cursor: 'pointer',
              }}
              title="Decrease Font Size"
            >A-</button>
            <span style={{ fontSize: 11, color: themes.muted, minWidth: 26, textAlign: 'center' }}>{fontSize}px</span>
            <button
              onClick={() => setFontSize(s => Math.min(32, s + 1))}
              style={{
                background: 'transparent', border: `1px solid ${themes.border}`, borderRadius: 4,
                color: themes.text, padding: '3px 7px', fontSize: 11, cursor: 'pointer',
              }}
              title="Increase Font Size"
            >A+</button>
          </div>

          {/* Width Toggle */}
          <button
            onClick={() => setMaxWidth(w => w === 740 ? 920 : w === 920 ? 620 : 740)}
            style={{
              background: 'transparent', border: `1px solid ${themes.border}`, borderRadius: 4,
              color: themes.text, padding: '3px 8px', fontSize: 11, cursor: 'pointer',
            }}
            title="Toggle Column Width"
          >
            {maxWidth === 620 ? 'Narrow' : maxWidth === 740 ? 'Standard' : 'Wide'}
          </button>

          {/* Text to Speech */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: 6, border: `1px solid ${themes.border}` }}>
            {!isSpeaking ? (
              <button
                onClick={startSpeech}
                style={{
                  background: 'transparent', border: 'none', color: themes.accent, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
                }}
                title="Read Article Aloud (TTS)"
              >
                <Volume2 size={13} />
                <span>Read Aloud</span>
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={pauseSpeech}
                  style={{ background: 'transparent', border: 'none', color: themes.accent, cursor: 'pointer' }}
                  title="Pause TTS"
                >
                  <Pause size={13} />
                </button>
                <button
                  onClick={stopSpeech}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  title="Stop TTS"
                >
                  <Square size={13} />
                </button>
                <span style={{ fontSize: 11, color: themes.accent, animation: 'pulse 1s infinite' }}>Speaking…</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions & Exit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleCopy}
            style={{
              background: 'transparent', border: `1px solid ${themes.border}`, borderRadius: 6,
              color: themes.text, padding: '5px 10px', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}
            title="Copy article text"
          >
            {copied ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handlePrint}
            style={{
              background: 'transparent', border: `1px solid ${themes.border}`, borderRadius: 6,
              color: themes.text, padding: '5px 10px', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}
            title="Print or Export PDF"
          >
            <Printer size={13} />
            <span>Print</span>
          </button>

          <button
            onClick={() => {
              stopSpeech()
              onClose()
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 6,
              color: '#ef4444',
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            title="Exit Reader View (Esc)"
          >
            <X size={14} />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* ── Scrollable Article Body Container ────────────────────────────── */}
      <div
        ref={contentRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '40px 24px 80px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div style={{
          width: '100%',
          maxWidth: maxWidth,
          fontFamily: fontOptions,
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight,
          letterSpacing: fontFamily === 'serif' ? '0.01em' : 'normal',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: themes.muted }}>
              <div style={{ fontSize: 32, marginBottom: 12, animation: 'spin 1.2s linear infinite' }}>⏳</div>
              <p>Extracting clean article layout…</p>
            </div>
          ) : !article ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <h2 style={{ fontSize: 22, color: themes.accent, marginBottom: 10 }}>Unable to Extract Article</h2>
              <p style={{ color: themes.muted, marginBottom: 20 }}>This page doesn't appear to contain a standard text article.</p>
              <button
                onClick={onClose}
                style={{
                  background: themes.accent, color: '#000', border: 'none', borderRadius: 6,
                  padding: '8px 16px', fontWeight: 600, cursor: 'pointer',
                }}
              >Return to Normal Web View</button>
            </div>
          ) : (
            <article>
              {/* Site source */}
              {article.siteName && (
                <div style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  color: themes.accent,
                  marginBottom: 12,
                }}>
                  {article.siteName}
                </div>
              )}

              {/* Main Headline */}
              <h1 style={{
                fontSize: `${fontSize * 1.8}px`,
                fontWeight: 800,
                lineHeight: 1.25,
                marginBottom: 16,
                color: themes.text,
              }}>
                {article.title}
              </h1>

              {/* Byline metadata */}
              {article.byline && (
                <div style={{
                  fontSize: 13,
                  color: themes.muted,
                  marginBottom: 28,
                  paddingBottom: 16,
                  borderBottom: `1px solid ${themes.border}`,
                }}>
                  By <strong style={{ color: themes.text }}>{article.byline}</strong>
                </div>
              )}

              {/* Article Clean Content */}
              <div
                className="reader-clean-body"
                dangerouslySetInnerHTML={{ __html: article.cleanHtml }}
                style={{ color: themes.text }}
              />

              {/* Footer */}
              <div style={{
                marginTop: 60,
                paddingTop: 24,
                borderTop: `1px solid ${themes.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 12,
                color: themes.muted,
              }}>
                <span>Finished reading: {article.title}</span>
                <button
                  onClick={onClose}
                  style={{
                    background: 'transparent', border: `1px solid ${themes.border}`,
                    borderRadius: 4, color: themes.accent, padding: '4px 10px', cursor: 'pointer',
                  }}
                >Back to Page ↑</button>
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  )
}
