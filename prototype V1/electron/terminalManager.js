/**
 * terminalManager.js
 * Manages node-pty terminal instances for the built-in terminal panel.
 */

let pty
try {
  pty = require('node-pty')
} catch (e) {
  console.warn('[NeXusWeb] node-pty not available, terminal disabled:', e.message)
  pty = null
}

const terminals = new Map() // id -> ptyProcess

/**
 * Create a new terminal instance
 * @param {string} id - Unique terminal ID
 * @param {number} cols - Terminal columns
 * @param {number} rows - Terminal rows
 * @param {function} onData - Callback for terminal output data
 */
function createTerminal(id, cols = 80, rows = 24, onData) {
  if (!pty) {
    return { success: false, error: 'node-pty not installed' }
  }

  if (terminals.has(id)) {
    destroyTerminal(id)
  }

  const shell = process.platform === 'win32'
    ? (process.env.COMSPEC || 'cmd.exe')
    : (process.env.SHELL || '/bin/bash')

  const shellArgs = process.platform === 'win32' ? [] : []

  try {
    const ptyProcess = pty.spawn(shell, shellArgs, {
      name: 'xterm-256color',
      cols: cols,
      rows: rows,
      cwd: process.env.USERPROFILE || process.env.HOME || process.cwd(),
      env: {
        ...process.env,
        TERM: 'xterm-256color',
        COLORTERM: 'truecolor',
        NEXUSWEB: '1',
      },
    })

    ptyProcess.onData((data) => {
      if (onData) onData(data)
    })

    ptyProcess.onExit(() => {
      terminals.delete(id)
    })

    terminals.set(id, ptyProcess)
    console.log(`[NeXusWeb] Terminal ${id} created (${shell})`)
    return { success: true, shell }
  } catch (err) {
    console.error(`[NeXusWeb] Failed to create terminal:`, err)
    return { success: false, error: err.message }
  }
}

/**
 * Write data (keystrokes) to a terminal
 */
function writeToTerminal(id, data) {
  const term = terminals.get(id)
  if (term) {
    term.write(data)
    return true
  }
  return false
}

/**
 * Resize a terminal
 */
function resizeTerminal(id, cols, rows) {
  const term = terminals.get(id)
  if (term) {
    try {
      term.resize(cols, rows)
      return true
    } catch (e) {
      return false
    }
  }
  return false
}

/**
 * Destroy a terminal instance
 */
function destroyTerminal(id) {
  const term = terminals.get(id)
  if (term) {
    try {
      term.kill()
    } catch (e) { }
    terminals.delete(id)
    return true
  }
  return false
}

module.exports = { createTerminal, writeToTerminal, resizeTerminal, destroyTerminal }
