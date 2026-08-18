const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('nexus', {
  // ── Tab Management ──────────────────────────────────────────────────────────
  createTab:    (url)   => ipcRenderer.invoke('create-tab', url),
  closeTab:     (tabId) => ipcRenderer.invoke('close-tab', tabId),
  switchTab:    (tabId) => ipcRenderer.invoke('switch-tab', tabId),
  getTabs:      ()      => ipcRenderer.invoke('get-tabs'),
  getActiveTab: ()      => ipcRenderer.invoke('get-active-tab'),

  // ── Navigation ──────────────────────────────────────────────────────────────
  navigate:   (url, tabId) => ipcRenderer.invoke('navigate', { url, tabId }),
  goBack:     ()           => ipcRenderer.invoke('go-back'),
  goForward:  ()           => ipcRenderer.invoke('go-forward'),
  reload:     ()           => ipcRenderer.invoke('reload'),

  // ── Network Mode ────────────────────────────────────────────────────────────
  setMode: (mode) => ipcRenderer.invoke('set-mode', mode),
  getMode: ()     => ipcRenderer.invoke('get-mode'),

  // ── Port Scanner ────────────────────────────────────────────────────────────
  scanPorts: () => ipcRenderer.invoke('scan-ports'),

  // ── DevTools ────────────────────────────────────────────────────────────────
  toggleDevTools: () => ipcRenderer.invoke('toggle-devtools'),

  // ── Terminal ────────────────────────────────────────────────────────────────
  terminal: {
    create:  (id, cols, rows) => ipcRenderer.invoke('terminal-create', { id, cols, rows }),
    write:   (id, data)       => ipcRenderer.invoke('terminal-write', { id, data }),
    resize:  (id, cols, rows) => ipcRenderer.invoke('terminal-resize', { id, cols, rows }),
    destroy: (id)             => ipcRenderer.invoke('terminal-destroy', { id }),
    onData:  (cb) => ipcRenderer.on('terminal-data', (_, payload) => cb(payload)),
    offData: ()   => ipcRenderer.removeAllListeners('terminal-data'),
  },

  // ── Bookmarks ────────────────────────────────────────────────────────────────
  bookmarks: {
    get:    ()        => ipcRenderer.invoke('bookmark-get'),
    add:    (data)    => ipcRenderer.invoke('bookmark-add', data),
    remove: (id)      => ipcRenderer.invoke('bookmark-remove', id),
    check:  (url)     => ipcRenderer.invoke('bookmark-check', url),
  },

  // ── History ──────────────────────────────────────────────────────────────────
  history: {
    get:        ()   => ipcRenderer.invoke('history-get'),
    clear:      ()   => ipcRenderer.invoke('history-clear'),
    deleteItem: (id) => ipcRenderer.invoke('history-delete-item', id),
  },

  // ── Settings ─────────────────────────────────────────────────────────────────
  settings: {
    get:    ()      => ipcRenderer.invoke('settings-get'),
    update: (patch) => ipcRenderer.invoke('settings-update', patch),
  },

  // ── Window Controls ──────────────────────────────────────────────────────────
  window: {
    minimize:    () => ipcRenderer.invoke('window-minimize'),
    maximize:    () => ipcRenderer.invoke('window-maximize'),
    close:       () => ipcRenderer.invoke('window-close'),
    onStateChange: (cb) => ipcRenderer.on('window-state-change', (_, state) => cb(state)),
  },

  // ── Event Listeners ──────────────────────────────────────────────────────────
  on: {
    tabCreated:       (cb) => ipcRenderer.on('tab-created',       (_, d) => cb(d)),
    tabUpdated:       (cb) => ipcRenderer.on('tab-updated',       (_, d) => cb(d)),
    tabRemoved:       (cb) => ipcRenderer.on('tab-removed',       (_, id) => cb(id)),
    tabLoading:       (cb) => ipcRenderer.on('tab-loading',       (_, d) => cb(d)),
    activeTabChanged: (cb) => ipcRenderer.on('active-tab-changed',(_, id) => cb(id)),
    modeChanged:      (cb) => ipcRenderer.on('mode-changed',      (_, m) => cb(m)),
    navError:         (cb) => ipcRenderer.on('navigation-error',  (_, d) => cb(d)),
    showHome:         (cb) => ipcRenderer.on('show-home',         (_, id) => cb(id)),
  },

  // ── File Dialog ──────────────────────────────────────────────────────────────
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),

  // ── Keyboard Shortcuts broadcast (from renderer) ──────────────────────────────
  onShortcut: (cb) => ipcRenderer.on('shortcut', (_, key) => cb(key)),
})
