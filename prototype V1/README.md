# NeXusWeb — Prototype V1

> **Local Developer Browser** — built with Electron + React + Vite

A purpose-built browser for localhost development with built-in terminal, auto-detection of running dev servers, and three enforced network modes.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Build for production
npm run build
```

## 🔒 Network Modes

| Mode           | Internet | LAN | Localhost | Files | DevTools | Terminal |
|----------------|----------|-----|-----------|-------|----------|----------|
| Strict Offline | ❌       | ❌  | ✅        | ✅    | ❌       | ✅       |
| Local Network  | ❌       | ✅  | ✅        | ✅    | ❌       | ✅       |
| Developer Mode | ⚡       | ✅  | ✅        | ✅    | ✅       | ✅       |

## 📁 Project Structure

```
prototype V1/
├── electron/
│   ├── main.js            # Main process, tabs, IPC
│   ├── preload.js         # contextBridge APIs
│   ├── networkFilter.js   # Mode-based request blocking
│   ├── portScanner.js     # Auto-detect localhost servers
│   └── terminalManager.js # node-pty terminal
├── src/
│   ├── App.jsx            # Root component
│   ├── index.css          # Design system
│   └── components/        # All UI components
└── package.json
```

## 🔧 Version History

- **v1.0.0** — Prototype V1: Core browser, 3 modes, terminal, port scanner
