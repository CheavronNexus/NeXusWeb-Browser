import React, { useState, useEffect, useCallback, useRef } from 'react'
import TitleBar from './components/TitleBar'
import TabBar from './components/TabBar'
import AddressBar from './components/AddressBar'
import HomePage from './components/HomePage'
import Terminal from './components/Terminal'
import StatusBar from './components/StatusBar'
import BookmarksPanel from './components/BookmarksPanel'
import HistoryPanel from './components/HistoryPanel'
import SettingsPanel from './components/SettingsPanel'
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp'

const nexus = window.nexus

export default function App() {
  const [tabs, setTabs] = useState([])
  const [activeTabId, setActiveTabId] = useState(null)
  const [mode, setMode] = useState('strict')
  const [showTerminal, setShowTerminal] = useState(false)
  const [terminalMinimized, setTerminalMinimized] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showHome, setShowHome] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  // Panels
  const [activePanel, setActivePanel] = useState(null) // 'bookmarks' | 'history' | 'settings' | 'shortcuts'
  const addressInputRef = useRef(null)

  // ── IPC listeners ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!nexus) return

    nexus.getMode().then(setMode)

    nexus.on.tabCreated(({ tabId, url, title }) => {
      setTabs(prev => [...prev, { id: tabId, url, title, favicon: null, loading: false }])
    })

    nexus.on.tabUpdated(({ tabId, url, title, favicon, canGoBack: back, canGoForward: fwd, bookmarked: bm }) => {
      setTabs(prev => prev.map(t => t.id === tabId ? { ...t, url: url ?? t.url, title: title ?? t.title, favicon: favicon ?? t.favicon } : t))
      if (tabId === activeTabId || activeTabId === null) {
        if (url !== undefined)   setCurrentUrl(url)
        if (back !== undefined)  setCanGoBack(back)
        if (fwd !== undefined)   setCanGoForward(fwd)
        if (bm !== undefined)    setBookmarked(bm)
      }
    })

    nexus.on.tabRemoved((tabId) => {
      setTabs(prev => prev.filter(t => t.id !== tabId))
    })

    nexus.on.tabLoading(({ tabId, loading: l }) => {
      setTabs(prev => prev.map(t => t.id === tabId ? { ...t, loading: l } : t))
      if (tabId === activeTabId) setLoading(l)
    })

    nexus.on.activeTabChanged((tabId) => {
      setActiveTabId(tabId)
      setShowHome(false)
    })

    nexus.on.modeChanged(setMode)

    nexus.on.showHome((tabId) => {
      setShowHome(true)
      setCurrentUrl('nexusweb://home')
      setBookmarked(false)
    })
  }, [])

  // ── Keyboard shortcuts (renderer side) ────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      // Ctrl+L — focus address bar
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault()
        addressInputRef.current?.focus()
        addressInputRef.current?.select()
      }
      // Ctrl+` — toggle terminal
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault()
        setShowTerminal(v => !v)
      }
      // F12 — DevTools (dev mode only)
      if (e.key === 'F12') {
        e.preventDefault()
        nexus?.toggleDevTools()
      }
      // Escape — close panel
      if (e.key === 'Escape') {
        setActivePanel(null)
      }
      // Ctrl+B — bookmarks
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        setActivePanel(p => p === 'bookmarks' ? null : 'bookmarks')
      }
      // Ctrl+H — history
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        setActivePanel(p => p === 'history' ? null : 'history')
      }
      // F1 — shortcuts help
      if (e.key === 'F1') {
        e.preventDefault()
        setActivePanel(p => p === 'shortcuts' ? null : 'shortcuts')
      }
      // Ctrl+D — bookmark current page
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        handleToggleBookmark()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentUrl, bookmarked])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleNewTab = useCallback((url) => {
    nexus?.createTab(url || 'nexusweb://home')
  }, [])

  const handleCloseTab = useCallback((tabId) => {
    nexus?.closeTab(tabId)
  }, [])

  const handleSwitchTab = useCallback((tabId) => {
    nexus?.switchTab(tabId)
    setActiveTabId(tabId)
  }, [])

  const handleNavigate = useCallback((url) => {
    if (url === 'nexusweb://home' || url === '') {
      setShowHome(true)
      setCurrentUrl('nexusweb://home')
    } else {
      setShowHome(false)
      nexus?.navigate(url, activeTabId)
      setCurrentUrl(url)
    }
  }, [activeTabId])

  const handleModeChange = useCallback((newMode) => {
    nexus?.setMode(newMode).then(() => setMode(newMode))
  }, [])

  const handlePortClick = useCallback((url) => {
    setShowHome(false)
    setActivePanel(null)
    nexus?.navigate(url, activeTabId)
    setCurrentUrl(url)
  }, [activeTabId])

  const handleToggleBookmark = useCallback(async () => {
    if (!currentUrl || currentUrl === 'nexusweb://home') return
    if (bookmarked) {
      const bms = await nexus?.bookmarks.get()
      const existing = bms?.find(b => b.url === currentUrl)
      if (existing) {
        await nexus?.bookmarks.remove(existing.id)
        setBookmarked(false)
      }
    } else {
      const activeTab = tabs.find(t => t.id === activeTabId)
      await nexus?.bookmarks.add({
        url: currentUrl,
        title: activeTab?.title || currentUrl,
        favicon: activeTab?.favicon || null,
      })
      setBookmarked(true)
    }
  }, [currentUrl, bookmarked, tabs, activeTabId])

  const togglePanel = useCallback((panel) => {
    setActivePanel(p => p === panel ? null : panel)
  }, [])

  return (
    <div className="browser-shell">
      {/* Chrome */}
      <div className="browser-chrome">
        <TitleBar mode={mode} />
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onNewTab={handleNewTab}
          onCloseTab={handleCloseTab}
          onSwitchTab={handleSwitchTab}
        />
        <AddressBar
          url={currentUrl}
          mode={mode}
          loading={loading}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          bookmarked={bookmarked}
          activePanel={activePanel}
          addressInputRef={addressInputRef}
          onNavigate={handleNavigate}
          onBack={() => nexus?.goBack()}
          onForward={() => nexus?.goForward()}
          onReload={() => nexus?.reload()}
          onNewTab={handleNewTab}
          onToggleTerminal={() => setShowTerminal(v => !v)}
          onToggleDevTools={() => nexus?.toggleDevTools()}
          showTerminal={showTerminal}
          onModeChange={handleModeChange}
          onToggleBookmark={handleToggleBookmark}
          onToggleBookmarks={() => togglePanel('bookmarks')}
          onToggleHistory={() => togglePanel('history')}
          onToggleSettings={() => togglePanel('settings')}
        />
      </div>

      {/* Browser content area */}
      <div className="browser-content">
        {showHome && (
          <HomePage
            mode={mode}
            onPortClick={handlePortClick}
            onModeChange={handleModeChange}
            onNewTab={handleNewTab}
          />
        )}

        {/* Side panels */}
        {activePanel === 'bookmarks' && (
          <BookmarksPanel
            onClose={() => setActivePanel(null)}
            onNavigate={handlePortClick}
          />
        )}
        {activePanel === 'history' && (
          <HistoryPanel
            onClose={() => setActivePanel(null)}
            onNavigate={handlePortClick}
          />
        )}
        {activePanel === 'settings' && (
          <SettingsPanel
            onClose={() => setActivePanel(null)}
            onModeChange={handleModeChange}
            currentMode={mode}
          />
        )}
        {activePanel === 'shortcuts' && (
          <KeyboardShortcutsHelp onClose={() => setActivePanel(null)} />
        )}

        {/* Terminal */}
        {showTerminal && (
          <Terminal
            minimized={terminalMinimized}
            onMinimize={() => setTerminalMinimized(v => !v)}
            onClose={() => setShowTerminal(false)}
          />
        )}
      </div>

      <StatusBar mode={mode} url={currentUrl} loading={loading} onShortcutsHelp={() => togglePanel('shortcuts')} />
    </div>
  )
}
