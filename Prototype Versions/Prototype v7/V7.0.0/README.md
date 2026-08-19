# 🌐 NeXusWeb Browser V6.5 (v6.5.0)
### **Chevron Nexus Software — [www.ChevronNexus.com](https://www.ChevronNexus.com)**

This directory contains the production codebase for **NeXusWeb V6.5** (`v6.5.0`).

## 🛠️ Quick Commands

```bash
# Install dependencies
npm install

# Run Vite dev server + Electron
npm run dev

# Build Vite frontend
npm run build:vite

# Build & Package Standalone Windows Setup Installer (.exe)
npm run build:setup
```

## 📁 Directory Structure
- `electron/` — Main process, native VPN tunnel engine, network filtering, chrome extension manager, PTY terminal.
- `src/` — React 18 frontend, design tokens, CSS system, and 36 modular UI components.
- `scripts/` — C# Setup Installer compiler, Authenticode signing scripts, and build automation.
