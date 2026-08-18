const { app, BrowserWindow, BrowserView, ipcMain, session, dialog, shell, globalShortcut, Menu } = require('electron')
const path = require('path')
const { setupNetworkFilter } = require('./networkFilter')
const { scanLocalPorts } = require('./portScanner')
const { createTerminal, writeToTerminal, resizeTerminal, destroyTerminal } = require('./terminalManager')
const {
  getBookmarks, addBookmark, removeBookmark, isBookmarked,
  getHistory, addHistory, clearHistory, deleteHistoryItem,
  getSettings, updateSettings,
} = require('./storage')

const isDev = process.env.NODE_ENV === 'development' && !app.isPackaged

let mainWindow = null
const settings = getSettings()
let currentMode = settings.defaultMode || 'strict'
const tabs = new Map()
let activeTabId = null
let tabCounter = 0

// Ignore self-signed certificates on localhost/127.0.0.1 for local dev servers
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  try {
    const u = new URL(url)
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1' || u.hostname === '::1') {
      event.preventDefault()
      callback(true)
      return
    }
  } catch (e) {}
  callback(false)
})

// ─── Window Creation ──────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    backgroundColor: '#0a0d14',
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
    icon: path.join(__dirname, '../src/assets/icon.png'),
  })

  Menu.setApplicationMenu(null)

  const loadDist = () => {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html')).catch(err => {
      console.error('[NeXusWeb] Failed to load dist/index.html:', err)
    })
  }

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      loadDist()
    })
  } else {
    loadDist()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
    tabs.forEach((_, id) => removeTab(id))
  })

  mainWindow.on('resize', () => repositionActiveView())
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-state-change', 'maximized')
    repositionActiveView()
  })
  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-state-change', 'normal')
    repositionActiveView()
  })

  setupNetworkFilter(session.defaultSession, currentMode)
}

function getErrorPageHtml(url, errorCode, errorDesc) {
  const safeUrl = String(url).replace(/"/g, '&quot;')
  return `data:text/html;charset=utf-8,` + encodeURIComponent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Connection Failed · NeXusWeb</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #0a0d14;
          color: #e8eaf2;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          padding: 24px;
        }
        .card {
          background: #0f1320;
          border: 1px solid #1e2640;
          border-radius: 16px;
          padding: 40px;
          max-width: 540px;
          width: 100%;
          text-align: center;
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
        }
        .icon { font-size: 48px; margin-bottom: 16px; }
        h1 { font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #00d4ff; }
        p { font-size: 13px; color: #8892aa; margin-bottom: 20px; line-height: 1.5; }
        .url-box {
          background: #0a0d14;
          border: 1px solid #2a3550;
          border-radius: 8px;
          padding: 10px 14px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: #f59e0b;
          word-break: break-all;
          margin-bottom: 24px;
        }
        .actions { display: flex; gap: 10px; justify-content: center; }
        button {
          padding: 9px 20px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-retry {
          background: #00d4ff;
          color: #0a0d14;
          border: none;
        }
        .btn-retry:hover { background: #38bdf8; transform: translateY(-1px); }
        .btn-home {
          background: transparent;
          color: #8892aa;
          border: 1px solid #2a3550;
        }
        .btn-home:hover { background: #141928; color: #e8eaf2; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">🔌</div>
        <h1>Cannot Connect to Server</h1>
        <p>The local development server is not responding or hasn't started yet.</p>
        <div class="url-box">${safeUrl}</div>
        <div class="actions">
          <button class="btn-retry" onclick="window.location.href='${safeUrl}'">↻ Retry Connection</button>
        </div>
      </div>
    </body>
    </html>
  `)
}

// ─── BrowserView Tab Management ───────────────────────────────────────────────
function createTab(url = 'nexusweb://home') {
  const tabId = ++tabCounter
  const view = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: currentMode !== 'dev',
      devTools: currentMode === 'dev',
    },
  })

  try {
    view.setAutoResize({ width: true, height: true })
  } catch (e) {}

  tabs.set(tabId, { view, url, title: url === 'nexusweb://home' ? 'Home' : 'New Tab', favicon: null })

  // Open target="_blank" in a new tab
  view.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    createTab(targetUrl)
    return { action: 'deny' }
  })

  view.webContents.on('did-navigate', (e, navUrl) => {
    if (navUrl.startsWith('data:text/html')) return
    const tab = tabs.get(tabId)
    if (tab) {
      tab.url = navUrl
      mainWindow?.webContents.send('tab-updated', {
        tabId, url: navUrl, title: tab.title,
        bookmarked: isBookmarked(navUrl),
      })
    }
  })

  view.webContents.on('did-navigate-in-page', (e, navUrl) => {
    if (navUrl.startsWith('data:text/html')) return
    const tab = tabs.get(tabId)
    if (tab) {
      tab.url = navUrl
      mainWindow?.webContents.send('tab-updated', {
        tabId, url: navUrl, title: tab.title,
        bookmarked: isBookmarked(navUrl),
      })
    }
  })

  view.webContents.on('page-title-updated', (e, title) => {
    const tab = tabs.get(tabId)
    if (tab && !tab.url.startsWith('data:text/html')) {
      tab.title = title
      mainWindow?.webContents.send('tab-updated', { tabId, url: tab.url, title })
    }
  })

  view.webContents.on('page-favicon-updated', (e, favicons) => {
    const tab = tabs.get(tabId)
    if (tab && favicons.length > 0) {
      tab.favicon = favicons[0]
      mainWindow?.webContents.send('tab-updated', { tabId, url: tab.url, title: tab.title, favicon: favicons[0] })
    }
  })

  view.webContents.on('did-start-loading', () => {
    mainWindow?.webContents.send('tab-loading', { tabId, loading: true })
  })

  view.webContents.on('did-stop-loading', () => {
    mainWindow?.webContents.send('tab-loading', { tabId, loading: false })
    const tab = tabs.get(tabId)
    if (tab && tab.url !== 'nexusweb://home' && !tab.url.startsWith('data:text/html')) {
      const navUrl = view.webContents.getURL()
      if (navUrl && !navUrl.startsWith('devtools://') && !navUrl.startsWith('data:')) {
        tab.url = navUrl
        addHistory({ url: navUrl, title: tab.title, favicon: tab.favicon })
        mainWindow?.webContents.send('tab-updated', {
          tabId,
          url: navUrl,
          canGoBack: view.webContents.canGoBack(),
          canGoForward: view.webContents.canGoForward(),
          bookmarked: isBookmarked(navUrl),
        })
      }
    }
  })

  view.webContents.on('did-fail-load', (e, errorCode, errorDescription, validatedURL) => {
    if (errorCode === -3) return // ABORTED
    console.log(`[NeXusWeb] Page load failed: ${validatedURL} (${errorCode}: ${errorDescription})`)
    const tab = tabs.get(tabId)
    if (tab && activeTabId === tabId) {
      view.webContents.loadURL(getErrorPageHtml(validatedURL, errorCode, errorDescription))
    }
  })

  mainWindow?.webContents.send('tab-created', {
    tabId,
    url,
    title: url === 'nexusweb://home' ? 'Home' : 'New Tab'
  })

  setActiveTab(tabId)
  if (url && url !== 'nexusweb://home') {
    navigateTab(tabId, url)
  }

  return tabId
}

function setActiveTab(tabId) {
  if (!mainWindow) return
  tabs.forEach(({ view }) => {
    try { mainWindow.removeBrowserView(view) } catch (e) {}
  })

  activeTabId = tabId
  const tab = tabs.get(tabId)
  if (tab) {
    if (tab.url && tab.url !== 'nexusweb://home') {
      try {
        mainWindow.addBrowserView(tab.view)
        repositionActiveView()
      } catch (e) {}
      mainWindow.webContents.send('tab-updated', {
        tabId,
        url: tab.url,
        title: tab.title,
        favicon: tab.favicon,
        canGoBack: tab.view.webContents.canGoBack(),
        canGoForward: tab.view.webContents.canGoForward(),
        bookmarked: isBookmarked(tab.url),
      })
    } else {
      mainWindow.webContents.send('show-home', tabId)
    }
    mainWindow.webContents.send('active-tab-changed', tabId)
  }
}

function removeTab(tabId) {
  const tab = tabs.get(tabId)
  if (!tab) return
  if (mainWindow) {
    try { mainWindow.removeBrowserView(tab.view) } catch (e) {}
  }
  try { tab.view.webContents.destroy() } catch (e) {}
  tabs.delete(tabId)
  mainWindow?.webContents.send('tab-removed', tabId)
  if (activeTabId === tabId) {
    const remaining = [...tabs.keys()]
    if (remaining.length > 0) setActiveTab(remaining[remaining.length - 1])
    else createTab()
  }
}

function resolveUrl(input) {
  const str = input.trim()
  if (!str) return 'nexusweb://home'
  if (str === 'nexusweb://home') return str
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('file://')) {
    return str
  }

  // Raw port numbers: e.g. "5000" or "8080"
  if (/^\d{1,5}$/.test(str)) {
    return `http://localhost:${str}`
  }

  // Localhost shorthand: e.g. "localhost:5000" or "127.0.0.1:5000"
  if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?(\/.*)?$/i.test(str)) {
    return `http://${str}`
  }

  // LAN IP shorthand: e.g. "192.168.1.5:3000"
  if (/^(192\.168\.|10\.|172\.)/.test(str)) {
    return `http://${str}`
  }

  return `http://${str}`
}

function navigateTab(tabId, url) {
  const tab = tabs.get(tabId)
  if (!tab || !mainWindow) return

  if (url === 'nexusweb://home' || url === '' || !url) {
    tab.url = 'nexusweb://home'
    tab.title = 'Home'
    if (activeTabId === tabId) {
      try { mainWindow.removeBrowserView(tab.view) } catch (e) {}
    }
    mainWindow.webContents.send('show-home', tabId)
    mainWindow.webContents.send('tab-updated', { tabId, url: 'nexusweb://home', title: 'Home', favicon: null })
    return
  }

  const finalUrl = resolveUrl(url)
  tab.url = finalUrl

  if (activeTabId === tabId) {
    try {
      mainWindow.addBrowserView(tab.view)
      repositionActiveView()
    } catch (e) {}
  }

  tab.view.webContents.loadURL(finalUrl).catch(err => {
    console.error(`[NeXusWeb] loadURL error on ${finalUrl}:`, err.message)
    mainWindow.webContents.send('navigation-error', { tabId, error: err.message, url: finalUrl })
  })
}

function repositionActiveView() {
  if (!mainWindow || !activeTabId) return
  const tab = tabs.get(activeTabId)
  if (!tab || tab.url === 'nexusweb://home' || !tab.url) return
  const bounds = mainWindow.getContentBounds()
  const TOP_OFFSET = 128
  const BOTTOM_OFFSET = 28
  try {
    tab.view.setBounds({
      x: 0, y: TOP_OFFSET,
      width: Math.max(0, bounds.width),
      height: Math.max(0, bounds.height - TOP_OFFSET - BOTTOM_OFFSET),
    })
  } catch (e) {}
}

// ─── IPC: Tabs & Navigation ───────────────────────────────────────────────────
ipcMain.handle('create-tab',   (_, url)   => createTab(url))
ipcMain.handle('close-tab',    (_, tabId) => removeTab(tabId))
ipcMain.handle('switch-tab',   (_, tabId) => setActiveTab(tabId))
ipcMain.handle('navigate',     (_, { tabId, url }) => navigateTab(tabId || activeTabId, url))
ipcMain.handle('go-back',      () => { const t = tabs.get(activeTabId); if (t?.view.webContents.canGoBack()) t.view.webContents.goBack() })
ipcMain.handle('go-forward',   () => { const t = tabs.get(activeTabId); if (t?.view.webContents.canGoForward()) t.view.webContents.goForward() })
ipcMain.handle('reload',       () => { tabs.get(activeTabId)?.view.webContents.reload() })
ipcMain.handle('get-active-tab', () => activeTabId)
ipcMain.handle('get-tabs', () =>
  [...tabs.entries()].map(([id, t]) => ({ id, url: t.url, title: t.title, favicon: t.favicon }))
)

// ─── IPC: Network Mode ────────────────────────────────────────────────────────
ipcMain.handle('set-mode', (_, mode) => {
  currentMode = mode
  setupNetworkFilter(session.defaultSession, mode)
  mainWindow?.webContents.send('mode-changed', mode)
  return { success: true, mode }
})
ipcMain.handle('get-mode', () => currentMode)

// ─── IPC: Port Scanner ───────────────────────────────────────────────────────
ipcMain.handle('scan-ports', async () => scanLocalPorts())

// ─── IPC: DevTools ────────────────────────────────────────────────────────────
ipcMain.handle('toggle-devtools', () => {
  const tab = tabs.get(activeTabId)
  if (tab && currentMode === 'dev') {
    tab.view.webContents.isDevToolsOpened()
      ? tab.view.webContents.closeDevTools()
      : tab.view.webContents.openDevTools({ mode: 'detach' })
  }
})

// ─── IPC: Terminal ────────────────────────────────────────────────────────────
ipcMain.handle('terminal-create',  (_, { id, cols, rows }) =>
  createTerminal(id, cols, rows, (data) => mainWindow?.webContents.send('terminal-data', { id, data }))
)
ipcMain.handle('terminal-write',   (_, { id, data }) => writeToTerminal(id, data))
ipcMain.handle('terminal-resize',  (_, { id, cols, rows }) => resizeTerminal(id, cols, rows))
ipcMain.handle('terminal-destroy', (_, { id }) => destroyTerminal(id))

// ─── IPC: Bookmarks ───────────────────────────────────────────────────────────
ipcMain.handle('bookmark-get',    () => getBookmarks())
ipcMain.handle('bookmark-add',    (_, data) => addBookmark(data))
ipcMain.handle('bookmark-remove', (_, id) => removeBookmark(id))
ipcMain.handle('bookmark-check',  (_, url) => isBookmarked(url))

// ─── IPC: History ─────────────────────────────────────────────────────────────
ipcMain.handle('history-get',         () => getHistory())
ipcMain.handle('history-clear',       () => clearHistory())
ipcMain.handle('history-delete-item', (_, id) => deleteHistoryItem(id))

// ─── IPC: Settings ────────────────────────────────────────────────────
ipcMain.handle('settings-get',    () => getSettings())
ipcMain.handle('settings-update', (_, patch) => updateSettings(patch))

// ─── IPC: Window Controls ─────────────────────────────────────────────────────
ipcMain.handle('window-minimize', () => mainWindow?.minimize())
ipcMain.handle('window-maximize', () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize())
ipcMain.handle('window-close',    () => mainWindow?.close())
ipcMain.handle('open-file-dialog', async () =>
  dialog.showOpenDialog(mainWindow, { properties: ['openFile', 'openDirectory'] })
)

// ─── Global Keyboard Shortcuts ────────────────────────────────────────────────
function registerShortcuts() {
  globalShortcut.register('CommandOrControl+T', () => createTab())
  globalShortcut.register('CommandOrControl+W', () => { if (activeTabId) removeTab(activeTabId) })
  globalShortcut.register('CommandOrControl+R', () => { tabs.get(activeTabId)?.view.webContents.reload() })
  globalShortcut.register('F5', () => { tabs.get(activeTabId)?.view.webContents.reload() })
  globalShortcut.register('Alt+Left', () => {
    const t = tabs.get(activeTabId)
    if (t?.view.webContents.canGoBack()) t.view.webContents.goBack()
  })
  globalShortcut.register('Alt+Right', () => {
    const t = tabs.get(activeTabId)
    if (t?.view.webContents.canGoForward()) t.view.webContents.goForward()
  })
  globalShortcut.register('CommandOrControl+Tab', () => {
    const tabIds = [...tabs.keys()]
    if (tabIds.length <= 1) return
    const idx = tabIds.indexOf(activeTabId)
    const next = tabIds[(idx + 1) % tabIds.length]
    if (next !== undefined) setActiveTab(next)
  })
  globalShortcut.register('CommandOrControl+Shift+Tab', () => {
    const tabIds = [...tabs.keys()]
    if (tabIds.length <= 1) return
    const idx = tabIds.indexOf(activeTabId)
    const prev = tabIds[(idx - 1 + tabIds.length) % tabIds.length]
    if (prev !== undefined) setActiveTab(prev)
  })
}

// ─── App Lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow()
  registerShortcuts()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  mainWindow.webContents.once('did-finish-load', () => {
    setTimeout(() => createTab(), 200)
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
