/**
 * portScanner.js
 * Auto-detects running localhost servers by probing common dev ports
 * and querying active local TCP listeners.
 */

const net = require('net')
const { exec } = require('child_process')

const PORT_LABELS = {
  3000: 'React / Next.js / Node',
  3001: 'React / Node (Port 3001)',
  3002: 'React / Node (Port 3002)',
  3003: 'React / Node (Port 3003)',
  4000: 'GraphQL / Strapi / Hexo',
  4200: 'Angular CLI',
  4321: 'Astro Dev Server',
  5000: 'Flask / Python / Werkzeug',
  5001: 'Flask Alt (Port 5001)',
  5002: 'Flask Alt (Port 5002)',
  5050: 'Flask / PgAdmin',
  5173: 'Vite Dev Server',
  5174: 'Vite Alt (Port 5174)',
  5175: 'Vite Alt (Port 5175)',
  5500: 'VS Code Live Server',
  5501: 'VS Code Live Server (5501)',
  7000: 'FastAPI / Custom Dev',
  7860: 'Gradio Web UI',
  8000: 'Django / FastAPI / Python',
  8001: 'Django / Python Alt',
  8080: 'HTTP Server / Tomcat / Vue',
  8081: 'Metro Bundler / React Native',
  8088: 'Custom HTTP Service',
  8501: 'Streamlit App',
  8888: 'Jupyter Notebook',
  9000: 'PHP / Webpack Dev Server',
  9001: 'PHP / Dev Server',
  9229: 'Node.js Debugger',
  11434: 'Ollama LLM API',
}

const COMMON_PORTS = Object.keys(PORT_LABELS).map(p => ({
  port: parseInt(p, 10),
  label: PORT_LABELS[p],
}))

/**
 * Check if a TCP port is open on localhost (probes both IPv4 127.0.0.1 and IPv6 ::1).
 * @param {number} port
 * @param {number} timeout - ms to wait before giving up
 */
function probePort(port, timeout = 700) {
  return new Promise((resolve) => {
    let resolved = false

    const checkHost = (host) => {
      return new Promise((res) => {
        const socket = new net.Socket()
        socket.setTimeout(timeout)
        socket.on('connect', () => {
          socket.destroy()
          res(true)
        })
        socket.on('timeout', () => {
          socket.destroy()
          res(false)
        })
        socket.on('error', () => {
          socket.destroy()
          res(false)
        })
        try {
          socket.connect(port, host)
        } catch (e) {
          res(false)
        }
      })
    }

    // Try IPv4 first, then IPv6
    checkHost('127.0.0.1').then((open) => {
      if (open) {
        resolve(true)
      } else {
        checkHost('::1').then((open6) => resolve(open6))
      }
    })
  })
}

/**
 * On Windows, query active listening ports directly from the OS TCP table.
 */
function getActiveSystemPorts() {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') {
      return resolve([])
    }

    exec('netstat -ano -p tcp', { timeout: 1500 }, (err, stdout) => {
      if (err || !stdout) return resolve([])

      const foundPorts = new Set()
      const lines = stdout.split('\n')
      for (const line of lines) {
        if (line.includes('LISTENING')) {
          const match = line.match(/(?:127\.0\.0\.1|0\.0\.0\.0|\[::\]|\[::1\]):(\d+)/)
          if (match && match[1]) {
            const port = parseInt(match[1], 10)
            // Filter out internal Windows/system ports
            if (port >= 1000 && port <= 65535 && port !== 5040 && port !== 7680) {
              foundPorts.add(port)
            }
          }
        }
      }
      resolve([...foundPorts])
    })
  })
}

/**
 * Scans all common developer ports plus active system listeners.
 * @returns {Promise<Array<{port: number, label: string, url: string}>>}
 */
async function scanLocalPorts() {
  try {
    // 1. Probe known common developer ports in parallel
    const probePromises = COMMON_PORTS.map(async ({ port, label }) => {
      const open = await probePort(port)
      return open ? { port, label, url: `http://localhost:${port}` } : null
    })

    // 2. Discover any additional active ports on Windows
    const [probeResults, sysPorts] = await Promise.all([
      Promise.all(probePromises),
      getActiveSystemPorts(),
    ])

    const foundMap = new Map()

    // Add probed common ports
    probeResults.filter(Boolean).forEach(item => {
      foundMap.set(item.port, item)
    })

    // Probe any non-standard discovered system ports
    const extraPorts = sysPorts.filter(p => !foundMap.has(p) && p >= 1024 && p <= 49151)
    const extraProbes = await Promise.all(
      extraPorts.slice(0, 15).map(async (port) => {
        const open = await probePort(port, 400)
        if (open) {
          const label = PORT_LABELS[port] || `Local Server (Port ${port})`
          return { port, label, url: `http://localhost:${port}` }
        }
        return null
      })
    )

    extraProbes.filter(Boolean).forEach(item => {
      foundMap.set(item.port, item)
    })

    const results = [...foundMap.values()].sort((a, b) => a.port - b.port)
    console.log(`[NeXusWeb] Port scan detected ${results.length} active server(s):`, results.map(r => r.port).join(', '))
    return results
  } catch (err) {
    console.error('[NeXusWeb] Port scan error:', err)
    return []
  }
}

module.exports = { scanLocalPorts, probePort, COMMON_PORTS, PORT_LABELS }
