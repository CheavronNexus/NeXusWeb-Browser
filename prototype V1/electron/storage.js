/**
 * storage.js
 * Persistent JSON storage for bookmarks, history, and settings.
 * Stored in Electron's userData directory.
 */

const { app } = require('electron')
const fs = require('fs')
const path = require('path')

function getStorePath(name) {
  return path.join(app.getPath('userData'), `${name}.json`)
}

function readStore(name, defaultValue = []) {
  try {
    const p = getStorePath(name)
    if (!fs.existsSync(p)) return defaultValue
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch (e) {
    return defaultValue
  }
}

function writeStore(name, data) {
  try {
    fs.writeFileSync(getStorePath(name), JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (e) {
    return false
  }
}

// ── Bookmarks ──────────────────────────────────────────────────────────────────
function getBookmarks() {
  return readStore('bookmarks', [])
}

function addBookmark({ url, title, favicon }) {
  const bookmarks = getBookmarks()
  // Don't duplicate
  if (bookmarks.find(b => b.url === url)) return bookmarks
  bookmarks.unshift({ id: Date.now(), url, title: title || url, favicon: favicon || null, addedAt: new Date().toISOString() })
  writeStore('bookmarks', bookmarks)
  return bookmarks
}

function removeBookmark(id) {
  const bookmarks = getBookmarks().filter(b => b.id !== id)
  writeStore('bookmarks', bookmarks)
  return bookmarks
}

function isBookmarked(url) {
  return !!getBookmarks().find(b => b.url === url)
}

// ── History ────────────────────────────────────────────────────────────────────
const MAX_HISTORY = 500

function getHistory() {
  return readStore('history', [])
}

function addHistory({ url, title, favicon }) {
  if (!url || url === 'nexusweb://home' || url.startsWith('devtools://')) return
  const history = getHistory()
  // Remove duplicate if same URL is recent (within last 5)
  const recent = history.slice(0, 5)
  const idx = recent.findIndex(h => h.url === url)
  if (idx !== -1) {
    history.splice(idx, 1)
  }
  history.unshift({ id: Date.now(), url, title: title || url, favicon: favicon || null, visitedAt: new Date().toISOString() })
  // Trim
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY
  writeStore('history', history)
  return history
}

function clearHistory() {
  writeStore('history', [])
  return []
}

function deleteHistoryItem(id) {
  const history = getHistory().filter(h => h.id !== id)
  writeStore('history', history)
  return history
}

// ── Settings ──────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  defaultMode: 'strict',
  homePage: 'nexusweb://home',
  terminalShell: '',  // empty = auto
  showBookmarksBar: false,
  newTabPage: 'home', // 'home' | 'blank' | 'custom'
  version: '1.0.0',
}

function getSettings() {
  return { ...DEFAULT_SETTINGS, ...readStore('settings', {}) }
}

function updateSettings(patch) {
  const current = getSettings()
  const updated = { ...current, ...patch }
  writeStore('settings', updated)
  return updated
}

module.exports = {
  getBookmarks, addBookmark, removeBookmark, isBookmarked,
  getHistory, addHistory, clearHistory, deleteHistoryItem,
  getSettings, updateSettings,
}
