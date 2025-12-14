# InterviewForge Setup Guide

## Project Created Successfully!

The InterviewForge Electron project has been initialized with the complete directory structure and all foundational files.

## Directory Structure

```
interviewforge/
├── electron/              # Electron main process
│   ├── main.js           # Main process entry point
│   ├── preload.js        # Context bridge for secure IPC
│   └── ipc-handlers.js   # IPC communication handlers
├── src/                  # React application
│   ├── components/       # React components (ready for additions)
│   ├── hooks/           # Custom React hooks (ready for additions)
│   ├── App.jsx          # Root application component
│   ├── App.css          # Application styles
│   ├── index.jsx        # Application entry point
│   └── index.css        # Global styles
├── working/             # Active interview session files
│   └── __tests__/       # Test files
├── archive/             # Archived sessions
├── soul_docs/           # Company documentation
│   └── _active_company.txt  # Currently set to "stripe"
├── claude_instructions/ # AI agent instructions
├── stats/               # Performance statistics
├── public/              # Public assets
│   └── index.html       # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite bundler configuration
├── electron-builder.json # Electron packaging config
├── .gitignore           # Git ignore rules
└── README.md            # Project documentation
```

## Installation Steps

### 1. Install Dependencies

```bash
cd /Users/bigballsinyourjaws/Interview/interviewforge
npm install
```

### 2. Development Mode

Run both Vite dev server and Electron together:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Start Vite dev server
npm run dev:vite

# Terminal 2 - Start Electron (after Vite is running)
npm run dev:electron
```

### 3. Build for Production

```bash
# Build React app only
npm run build

# Build complete Electron app
npm run build:electron

# Platform-specific builds
npm run build:mac
npm run build:win
npm run build:linux
```

## Key Features Included

### Electron Setup
- Main process with window management
- Preload script for secure IPC communication
- IPC handlers for:
  - File system operations
  - Terminal management (node-pty)
  - Application state (electron-store)
  - System utilities

### React Setup
- Vite for fast development and optimized builds
- Basic App component with welcome screen
- Ready for component additions

### Dependencies Installed
- **Core**: electron, react, react-dom
- **Terminal**: xterm, xterm-addon-fit, xterm-addon-web-links, node-pty
- **Editor**: monaco-editor, @monaco-editor/react
- **Markdown**: react-markdown, remark-gfm
- **UI**: react-resizable-panels
- **Utilities**: uuid, electron-store
- **Build**: vite, electron-builder, concurrently, wait-on

## Development Workflow

1. **Start Development**: `npm run dev`
2. **Edit React Components**: Files in `src/` hot-reload automatically
3. **Edit Electron Code**: Files in `electron/` require restart
4. **Build Application**: `npm run build:electron`

## Security Features

- Context isolation enabled
- Node integration disabled in renderer
- Preload script for controlled API exposure
- Sandboxed renderer process

## Next Steps for Other Agents

This foundation provides:
- Complete directory structure
- All configuration files
- Basic Electron + React setup
- IPC communication layer
- File system and terminal APIs
- Package management and build scripts

Future agents can now build:
- UI components in `src/components/`
- Custom hooks in `src/hooks/`
- Terminal integration
- Code editor features
- AI interview simulation
- Statistics tracking
- Session management

## Notes

- The `soul_docs/_active_company.txt` is set to "stripe"
- All empty directories have `.gitkeep` files
- The app runs at `http://localhost:5173` in development
- DevTools open automatically in development mode

## Troubleshooting

### If npm install fails on node-pty:
- macOS: Install Xcode Command Line Tools
- Windows: Install Visual Studio Build Tools
- Linux: Install build-essential and python3

### If Electron won't start:
- Ensure Vite dev server is running on port 5173
- Check that port 5173 is not in use by another process
- Try `npm run dev:vite` first, then `npm run dev:electron`

## Ready for Development!

The project is now ready for the next agents to implement features. All foundational infrastructure is in place.
