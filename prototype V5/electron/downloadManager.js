/**
 * downloadManager.js
 * Tracks active and completed downloads in Electron.
 */

const { shell } = require('electron')
const path = require('path')

const downloads = new Map()
let mainWindowRef = null

function initDownloadManager(sess, getMainWindow) {
  mainWindowRef = getMainWindow

  sess.on('will-download', (event, item, webContents) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 4)
    const filename = item.getFilename()
    const totalBytes = item.getTotalBytes()
    const startTime = Date.now()

    const downloadRecord = {
      id,
      filename,
      savePath: item.getSavePath(),
      receivedBytes: 0,
      totalBytes,
      state: 'progressing', // 'progressing' | 'completed' | 'cancelled' | 'interrupted'
      speed: 0,
      startTime,
      url: item.getURL(),
      mimeType: item.getMimeType(),
    }

    downloads.set(id, downloadRecord)
    sendUpdate(downloadRecord)

    let lastBytes = 0
    let lastTime = Date.now()

    item.on('updated', (e, state) => {
      const now = Date.now()
      const timeDiff = (now - lastTime) / 1000
      const currentBytes = item.getReceivedBytes()
      const byteDiff = currentBytes - lastBytes

      if (timeDiff > 0.5) {
        downloadRecord.speed = Math.round(byteDiff / timeDiff)
        lastBytes = currentBytes
        lastTime = now
      }

      downloadRecord.receivedBytes = currentBytes
      downloadRecord.totalBytes = item.getTotalBytes()
      downloadRecord.savePath = item.getSavePath()
      downloadRecord.state = state

      sendUpdate(downloadRecord)
    })

    item.once('done', (e, state) => {
      downloadRecord.state = state
      downloadRecord.receivedBytes = item.getReceivedBytes()
      downloadRecord.savePath = item.getSavePath()
      downloadRecord.speed = 0
      sendUpdate(downloadRecord)
    })
  })
}

function sendUpdate(record) {
  const win = typeof mainWindowRef === 'function' ? mainWindowRef() : mainWindowRef
  win?.webContents.send('download-updated', record)
}

function getDownloadsList() {
  return [...downloads.values()].reverse()
}

function openDownloadedFile(id) {
  const item = downloads.get(id)
  if (item && item.savePath && item.state === 'completed') {
    shell.openPath(item.savePath)
    return { success: true }
  }
  return { success: false, error: 'File not found or not completed' }
}

function showInFolder(id) {
  const item = downloads.get(id)
  if (item && item.savePath) {
    shell.showItemInFolder(item.savePath)
    return { success: true }
  }
  return { success: false, error: 'File not found' }
}

function clearCompletedDownloads() {
  for (const [id, item] of downloads.entries()) {
    if (item.state === 'completed' || item.state === 'cancelled' || item.state === 'interrupted') {
      downloads.delete(id)
    }
  }
  return getDownloadsList()
}

module.exports = {
  initDownloadManager,
  getDownloadsList,
  openDownloadedFile,
  showInFolder,
  clearCompletedDownloads,
}
