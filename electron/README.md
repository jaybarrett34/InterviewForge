# InterviewForge Electron Main Process

This directory contains the Electron main process files for InterviewForge.

## Files

### main.js (366 lines)
Main entry point for the Electron application.

**Features:**
- Window state persistence (size, position, maximized state)
- Startup sequence:
  - Checks for active session in `working/` directory
  - Prompts user to resume or archive existing session
  - Loads active company from `soul_docs/_active_company.txt`
  - Loads stats from `stats/` directory
  - Initializes PTY terminals for execution and Claude Code
- App lifecycle management (ready, activate, quit)
- Window event handlers (maximize, minimize, restore)
- Error handling for uncaught exceptions
- Session archiving functionality

**Window Configuration:**
- Default size: 1600x900
- Minimum size: 1600x900
- Context isolation enabled
- Node integration disabled (security)

### preload.js (244 lines)
Context bridge exposing secure IPC API to renderer process.

**Exposed APIs via `window.electronAPI`:**
- **fs**: File system operations (readFile, writeFile, readDir, exists, mkdir, copyDir, deleteFile, deletePath)
- **terminal**: PTY terminal management (create, write, resize, kill, killAll, event listeners)
- **process**: Process execution (runPython, runPytest, spawnClaudeCode, killProcess)
- **stats**: Statistics management (load, save, increment, reset)
- **session**: Session operations (archive, clear, checkActive, loadActive)
- **window**: Window controls (minimize, maximize, close, toggleMaximize, isMaximized)
- **app**: Application info (getPath, quit, event listeners)

**Security:**
- Whitelist-based IPC channel validation
- Safe wrapper functions for IPC communication
- Event listener cleanup on unsubscribe

### ipc-handlers.js (709 lines)
All IPC event handlers for main-to-renderer communication.

**Handler Categories:**
1. **File System** - Full CRUD operations with recursive directory support
2. **Terminal (node-pty)** - PTY instance creation and management for both terminals
3. **Process** - Python, pytest, and Claude Code process spawning
4. **Stats** - JSON-based statistics tracking (daily, weekly, monthly, alltime)
5. **Session** - Archive and session management
6. **Window** - Window state controls
7. **App** - Application-level operations

**Key Features:**
- Terminal multiplexing with unique IDs
- Process output streaming (stdout/stderr separation)
- Automatic cleanup on app exit
- Stats initialization and persistence
- Directory copying for session archiving

## Dependencies

Required npm packages:
- `electron` - Main framework
- `node-pty` - PTY terminal support for both terminals

## Usage

The main process is started by Electron when running:
```bash
npm start  # or electron .
```

## Architecture

```
main.js
  ├── Creates BrowserWindow
  ├── Loads renderer (React app)
  ├── Registers IPC handlers (via ipc-handlers.js)
  └── Initializes app state
      ├── Session check
      ├── Active company load
      └── Stats load

preload.js
  └── Exposes electronAPI to renderer
      └── Safe IPC communication bridge

ipc-handlers.js
  ├── File system handlers
  ├── Terminal PTY handlers (node-pty)
  ├── Process handlers (Python/pytest/Claude)
  ├── Stats handlers
  ├── Session handlers
  └── Window/App handlers
```

## Development

- Development mode: Loads from `http://localhost:5173` (Vite dev server)
- Production mode: Loads from `../dist/index.html`
- DevTools automatically open in development mode

## Security

- Context isolation enabled
- Node integration disabled in renderer
- Sandboxing enforced
- IPC channels validated against whitelist
- No direct file system access from renderer
