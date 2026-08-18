# Contributing to NeXusWeb Browser

Thank you for your interest in contributing to **NeXusWeb**! NeXusWeb is built by **Chevron Nexus Software** with a focus on privacy, developer tooling, and modern browsing ergonomics.

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **OS**: Windows 10/11 (with .NET Framework 4.5+ for compiling the native setup installer)

### Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ChevronNexus/NeXusWeb.git
   cd "NeXusWeb/Stable V6.5.0"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run in development mode:**
   ```bash
   # Run Vite development server + Electron
   npm run dev
   ```

4. **Build & Package Native Windows Setup:**
   ```bash
   npm run build:setup
   ```

---

## 📁 Repository Structure

- `src/` — React 18 UI components, state management, design tokens, and CSS styles.
- `electron/` — Main Electron process, IPC handlers, network filtering, VPN tunnel, tabs manager.
- `scripts/` — C# Setup Installer compiler, Authenticode digital signing scripts, and build pipelines.

---

## 🤝 Contribution Guidelines

1. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Follow Coding Standards:**
   - Use clean, modular React hooks and functional components.
   - Maintain strict separation between Main process (Node.js/Electron) and Renderer process (React) via `preload.js`.
   - Ensure high performance, zero memory leaks, and seamless responsiveness.
3. **Commit Messages:**
   Use clear, imperative commit messages (e.g., `feat: add custom SOCKS5 proxy support`, `fix: correct BrowserView top bounds on maximize`).
4. **Submit a Pull Request:**
   Open a PR against the `main` branch with a clear description of your changes and test notes.

---

## 💬 Community & Support
- Website: [www.ChevronNexus.com](https://www.ChevronNexus.com)
- Report Issues: [GitHub Issues](https://github.com/ChevronNexus/NeXusWeb/issues)
