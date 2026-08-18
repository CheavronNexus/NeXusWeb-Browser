<div align="center">

# 🌐 NeXusWeb Browser (v6.5.0)
### **Privacy-First Personal Web Infrastructure & Developer Browser**
*Crafted by **Chevron Nexus Software** — [www.ChevronNexus.com](https://www.ChevronNexus.com)*

[![Version](https://img.shields.io/badge/version-6.5.0-00d4ff.svg?style=flat-square)](https://github.com/ChevronNexus/NeXusWeb)
[![Electron](https://img.shields.io/badge/Electron-28.3.3-47848F.svg?style=flat-square&logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1.4-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Platform](https://img.shields.io/badge/platform-Windows%20x64-0078D6.svg?style=flat-square&logo=windows)](https://microsoft.com/windows)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](LICENSE)

<p align="center">
  <b>NeXusWeb</b> is a powerful next-generation web browser engineered specifically for software engineers, developers, and privacy-conscious users. Combining multi-engine privacy modes, live HTTP request interception, native encrypted DNS/VPN tunneling, real-time split view, and local developer workspaces into a cohesive glassmorphic desktop environment.
</p>

</div>

---

## ✨ Key Feature Highlights

### 🛡️ Multi-Engine Network & Privacy Modes
- **🛡️ Normal Mode**: High-speed browsing with built-in tracker & ad blocker, HTTPS auto-upgrades, and anti-fingerprinting shield.
- **🌐 Localhost & LAN Mode**: Zero-delay routing for local developer subnets, internal microservices, and LAN services.
- **🔒 Strict Privacy Mode**: Hardened sandbox that disables third-party cookies, blocks tracking telemetry, and prevents WebRTC IP leaks.
- **⚡ Developer Mode**: Zero CORS restrictions for localhost API debugging, auto-detects active dev ports, and enables full developer tooling.

### 🕵️ Private Den Sandbox
- Isolated in-memory ephemeral browser session (`partition: memory`).
- Auto-wipes 100% of cookies, cache, local storage, indexedDB, and history on tab/window close.
- WebRTC non-proxied UDP disabled by default to prevent real IP leaks.

### 🔒 Native High-Speed Privacy Tunnel & VPN Engine
- Built-in local tunnel bridge (`127.0.0.1:49153`) supporting Encrypted DNS-over-HTTPS (DoH via Cloudflare & Quad9).
- Strips privacy-invasive tracking headers (`X-Forwarded-For`, `Client-IP`, `True-Client-IP`).
- Fast multi-region routing (`Direct`, `US 🇺🇸`, `NL 🇳🇱`, `SG 🇸🇬`, `UK 🇬🇧`, `DE 🇩🇪`) with live real-time latency ping testing.

### ↔️ Synchronized Real-Time Dynamic Resizing
- **Split View**: Run two websites, two apps, or a website + dashboard side-by-side with draggable center splitter (`10%` to `90%`), percentage badge, and double-click 50/50 reset.
- **Side Drawers & ScratchPad**: Drag drawer left border (`115px / 3cm` to `880px`) while the live webpage viewport automatically scales simultaneously with zero gap.

### 🎛️ Developer Tools & Workbenches
- **⚡ REST & GraphQL API Workbench**: Native HTTP/HTTPS client with headers, JSON payload formatting, and `.env` variable interpolation.
- **🔌 Port Manager & Localhost Scanner**: Background daemon auto-detects active dev servers (Vite, Next.js, Django, Flask, Express) with 1-click PID killer.
- **🔍 Request Inspector**: Live HTTP network logger intercepting status codes, headers, and request duration.
- **📝 ScratchPad & Developer Notes**: Multi-note markdown workspace with live preview, split view, code syntax highlighting, JSON beautifier, and export.
- **💻 Integrated Terminal**: Multi-tab PTY terminal session powered by `@xterm/xterm` with persistent state.
- **🧩 Chrome Web Extensions**: Install Chrome extensions directly from the Chrome Web Store or unpack local CRX extensions.

---

## 🏗️ Repository Architecture

```text
NeXusWeb/
├── .github/
│   ├── workflows/
│   │   └── build.yml               # GitHub Actions CI build workflow
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml          # Structured bug report template
│   │   └── feature_request.yml     # Feature request template
│   └── pull_request_template.md    # Pull request guideline template
├── Stable V6.5.0/                  # Active Production Codebase (v6.5.0)
│   ├── electron/                   # Electron Main Process & Native Node Modules
│   │   ├── main.js                 # App lifecycle, window manager, BrowserView placement
│   │   ├── preload.js              # Context-isolated secure IPC bridge (window.nexus)
│   │   ├── vpnEngine.js            # Native High-Speed Privacy Tunnel & DoH Engine
│   │   ├── networkFilter.js        # Dynamic webRequest interception & ad/tracker blocker
│   │   ├── chromeExtensionManager.js # Chrome Web Store & MV2/MV3 Extension Loader
│   │   ├── portScanner.js          # Localhost dev server detection & PID killer
│   │   ├── terminalManager.js      # Node-pty terminal session manager
│   │   ├── requestInspector.js     # Live HTTP/HTTPS traffic inspector
│   │   ├── downloadManager.js      # Native file download controller
│   │   └── storage.js              # Local persistence (Bookmarks, History, Notes, Settings)
│   ├── src/                        # React 18 Glassmorphic Frontend
│   │   ├── components/             # Modular React UI Components (36 Components)
│   │   │   ├── TitleBar.jsx        # Frameless window controls & traffic lights
│   │   │   ├── TabBar.jsx          # Draggable tab reordering & audio mute controls
│   │   │   ├── AddressBar.jsx      # Omnibox, search suggestions, SSL shield, mode badge
│   │   │   ├── ScratchPad.jsx      # Multi-note markdown notes & JSON formatter
│   │   │   ├── PanelShell.jsx      # Resizable drawer shell with live IPC sync
│   │   │   ├── SplitResizeBar.jsx  # Center draggable split view splitter
│   │   │   ├── QuickToolsDrawer.jsx# Quick utilities, VPN switcher, IP tester
│   │   │   ├── ApiWorkbench.jsx    # REST & GraphQL testing client
│   │   │   ├── PortManager.jsx     # Active local port monitor
│   │   │   ├── RequestInspector.jsx# Network logger
│   │   │   └── Terminal.jsx        # Embedded xterm.js terminal drawer
│   │   ├── assets/                 # Brand logos, icons, and visual assets
│   │   ├── index.css               # Design system tokens, glassmorphism, animations
│   │   ├── App.jsx                 # Root layout & global application state
│   │   └── main.jsx                # React DOM entry point
│   ├── scripts/                    # Build & Native Packaging Pipeline
│   │   ├── buildSetup.js           # Multi-stage automated installer pipeline
│   │   ├── SetupInstaller.cs       # Native C# WPF .NET Setup & In-Place Upgrader
│   │   ├── signBinaries.ps1        # Authenticode digital signing script
│   │   └── app.manifest            # Windows UAC & DPI awareness manifest
│   ├── package.json                # Project dependencies & npm scripts
│   └── vite.config.js              # Vite React configuration
├── .editorconfig                   # Consistent multi-editor formatting rules
├── .gitattributes                  # Normalized Git line endings
├── .gitignore                      # Git exclusion rules
├── CONTRIBUTING.md                 # Developer contribution guidelines
├── LICENSE                         # MIT License
├── README.md                       # Master project documentation
└── SECURITY.md                     # Vulnerability reporting policy
```

---

## 🚀 Quick Start & Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0+
- [Git](https://git-scm.com/)
- Windows 10/11 (with .NET Framework 4.5+ for native setup compilation)

### 1. Clone & Install
```bash
git clone https://github.com/ChevronNexus/NeXusWeb.git
cd "NeXusWeb/Stable V6.5.0"
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```

### 3. Build & Package Standalone Windows Setup (.exe)
```bash
npm run build:setup
```
*Outputs:*
- `dist-electron/NeXusWeb-Setup-v6.5.0.exe` (Self-extracting C# setup & in-place upgrader)
- `dist-electron/NeXusWeb-V6-win32-x64/NeXusWeb-V6.exe` (Unpacked standalone application)

---

## ⌨️ Global Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>T</kbd> | Open New Tab |
| <kbd>Ctrl</kbd> + <kbd>W</kbd> | Close Current Tab |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>T</kbd> | Reopen Last Closed Tab |
| <kbd>Ctrl</kbd> + <kbd>N</kbd> | Open New Window |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>N</kbd> | Open New **Private Den** Sandbox |
| <kbd>Ctrl</kbd> + <kbd>L</kbd> | Focus Address Bar |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> | Open Command Palette |
| <kbd>Ctrl</kbd> + <kbd>R</kbd> / <kbd>F5</kbd> | Reload Current Page |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> | Toggle Split View |
| <kbd>Ctrl</kbd> + <kbd>`</kbd> | Toggle Embedded Terminal |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd> | Toggle Chromium DevTools |
| <kbd>Ctrl</kbd> + <kbd>F</kbd> | Find in Page |

---

## 🏢 About Chevron Nexus Software

**Chevron Nexus Software** builds modern personal infrastructure, developer workflows, and privacy-first web systems.
- **Website**: [www.ChevronNexus.com](https://www.ChevronNexus.com)
- **Product**: NeXusWeb Browser (Version 6.5.0)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
