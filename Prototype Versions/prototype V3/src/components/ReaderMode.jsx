import React, { useState, useEffect } from 'react'

export default function ReaderMode({ activeTabId, onClose }) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState('serif') // 'serif' | 'sans' | 'mono'
  const [readerTheme, setReaderTheme] = useState('sepia') // 'dark' | 'sepia' | 'light'

  useEffect(() => {
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
    extractContent()
  }, [activeTabId])

  const themeStyles = {
    dark: {
      bg: '#0f1320',
      text: '#e8eaf2',
      border: '#1e2640',
      toolbarBg: '#141928',
    },
    sepia: {
      bg: '#fbf0d9',
      text: '#5f4b32',
      border: '#ebd3a7',
      toolbarBg: '#f4e3c1',
    },
    light: {
      bg: '#ffffff',
      text: '#1a1a1a',
      border: '#e5e7eb',
      toolbarBg: '#f8fafc',
    },
  }[readerTheme]

  const fontFamilies = {
    serif: 'Georgia, "Times New Roman", Cambria, serif',
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", Consolas, Courier, monospace',
  }[fontFamily]

  const handlePrint = () => {
    window.print()
  }

  const handleCopy = () => {
    if (article) {
      navigator.clipboard.writeText(`${article.title}\n\n${article.cleanHtml.replace(/<[^>]+>/g, '')}`)
    }
  }

  return (
    <div
      className="reader-mode-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: themeStyles.bg,
        color: themeStyles.text,
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideUp 0.15s ease',
      }}
    >
      {/* Reader Mode Toolbar */}
      <div style={{
        height: 48,
        backgroundColor: themeStyles.toolbarBg,
        borderBottom: `1px solid ${themeStyles.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-primary)' }}>📖 Reader View</span>
          {article && (
            <span style={{ fontSize: 11, opacity: 0.7 }}>
              {article.readingTimeMinutes} min read • {article.wordCount} words
            </span>
          )}
        </div>

        {/* Customization controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Font choice */}
          <div style={{ display: 'flex', gap: 4 }}>
            {['serif', 'sans', 'mono'].map(f => (
              <button
                key={f}
                onClick={() => setFontFamily(f)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 4,
                  border: fontFamily === f ? '1.5px solid var(--accent-primary)' : '1px solid transparent',
                  background: fontFamily === f ? 'rgba(0,212,255,0.1)' : 'transparent',
                  color: themeStyles.text,
                  cursor: 'pointer',
                  fontSize: 11,
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 16, background: themeStyles.border }} />

          {/* Font Size A- / A+ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={() => setFontSize(s => Math.max(12, s - 2))}
              style={{
                background: 'transparent',
                border: `1px solid ${themeStyles.border}`,
                borderRadius: 4,
                color: themeStyles.text,
                cursor: 'pointer',
                padding: '2px 8px',
                fontSize: 11,
              }}
            >
              A−
            </button>
            <span style={{ fontSize: 11, minWidth: 24, textAlign: 'center' }}>{fontSize}px</span>
            <button
              onClick={() => setFontSize(s => Math.min(28, s + 2))}
              style={{
                background: 'transparent',
                border: `1px solid ${themeStyles.border}`,
                borderRadius: 4,
                color: themeStyles.text,
                cursor: 'pointer',
                padding: '2px 8px',
                fontSize: 11,
              }}
            >
              A+
            </button>
          </div>

          <div style={{ width: 1, height: 16, background: themeStyles.border }} />

          {/* Themes */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { id: 'dark', icon: '🌙' },
              { id: 'sepia', icon: '📜' },
              { id: 'light', icon: '☀️' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setReaderTheme(t.id)}
                style={{
                  background: readerTheme === t.id ? 'rgba(0,212,255,0.15)' : 'transparent',
                  border: readerTheme === t.id ? '1px solid var(--accent-primary)' : 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: '2px 6px',
                }}
              >
                {t.icon}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 16, background: themeStyles.border }} />

          <button
            onClick={handleCopy}
            title="Copy article text"
            style={{
              background: 'transparent',
              border: `1px solid ${themeStyles.border}`,
              borderRadius: 4,
              color: themeStyles.text,
              cursor: 'pointer',
              padding: '3px 8px',
              fontSize: 11,
            }}
          >
            📋 Copy
          </button>

          <button
            onClick={onClose}
            title="Exit Reader View (ESC)"
            style={{
              background: 'var(--accent-primary)',
              border: 'none',
              borderRadius: 4,
              color: '#0a0d14',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '4px 12px',
              fontSize: 11,
            }}
          >
            ✕ Exit
          </button>
        </div>
      </div>

      {/* Reader Article Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '40px 24px',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{
          maxWidth: 680,
          width: '100%',
          fontFamily: fontFamilies,
          fontSize: `${fontSize}px`,
          lineHeight: 1.75,
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.7 }}>
              Extracting clean reader view...
            </div>
          ) : !article ? (
            <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.7 }}>
              Could not extract article content from this page.
            </div>
          ) : (
            <>
              <h1 style={{
                fontSize: `${fontSize * 1.8}px`,
                fontWeight: 700,
                lineHeight: 1.25,
                marginBottom: 16,
              }}>
                {article.title}
              </h1>

              {article.byline && (
                <div style={{ fontSize: `${fontSize * 0.85}px`, opacity: 0.7, marginBottom: 24 }}>
                  By {article.byline}
                </div>
              )}

              {article.leadImg && (
                <img
                  src={article.leadImg}
                  alt=""
                  style={{
                    width: '100%',
                    maxHeight: 400,
                    objectFit: 'cover',
                    borderRadius: 8,
                    marginBottom: 28,
                  }}
                  onError={e => e.target.style.display = 'none'}
                />
              )}

              <div
                className="reader-content-body"
                dangerouslySetInnerHTML={{ __html: article.cleanHtml }}
                style={{
                  '& p': { marginBottom: '1.4em' },
                  '& img': { maxWidth: '100%', borderRadius: 6, margin: '16px 0' },
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
