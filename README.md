# InterviewForge

AI-Powered Interview Preparation Platform built with Electron and React.

## Overview

InterviewForge is a comprehensive interview preparation tool that combines AI-powered interview simulation with real-time code execution, interactive coding challenges, and performance analytics.

## Tech Stack

- **Frontend**: React 18, Vite
- **Desktop**: Electron 28
- **Terminal**: XTerm.js, node-pty
- **Code Editor**: Monaco Editor
- **UI Components**: react-resizable-panels
- **Markdown**: react-markdown, remark-gfm
- **State Management**: electron-store
- **Build**: electron-builder

## Project Structure

```
interviewforge/
├── electron/           # Electron main process files
│   ├── main.js        # Main process entry point
│   ├── preload.js     # Preload script for context bridge
│   └── ipc-handlers.js # IPC communication handlers
├── src/               # React application source
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   ├── App.jsx        # Root application component
│   └── index.jsx      # Application entry point
├── working/           # Working directory for interview files
│   └── __tests__/     # Test files
├── archive/           # Archived interview sessions
├── soul_docs/         # Company-specific documentation
│   └── _active_company.txt # Currently active company
├── claude_instructions/ # AI assistant instructions
├── stats/             # Performance statistics
├── public/            # Public assets
│   └── index.html     # HTML template
├── package.json       # Dependencies and scripts
├── vite.config.js     # Vite configuration
└── electron-builder.json # Electron builder configuration
```

## Development

### Prerequisites

- Node.js 18+ and npm
- For native modules: Build tools for your platform
  - macOS: Xcode Command Line Tools
  - Windows: Visual Studio Build Tools
  - Linux: gcc, make, python3

### Installation

```bash
# Install dependencies
npm install
```

### Running in Development

```bash
# Start both Vite dev server and Electron
npm run dev

# Start only Vite dev server
npm run dev:vite

# Start only Electron (requires Vite to be running)
npm run dev:electron
```

### Building

```bash
# Build the React app
npm run build

# Build the Electron app for current platform
npm run build:electron

# Build for specific platforms
npm run build:mac
npm run build:win
npm run build:linux
```

## Available Scripts

- `npm run dev` - Start development mode (Vite + Electron)
- `npm run build` - Build React app for production
- `npm run build:electron` - Build Electron app for distribution
- `npm run build:mac` - Build macOS app
- `npm run build:win` - Build Windows app
- `npm run build:linux` - Build Linux app
- `npm start` - Start Electron with production build
- `npm run preview` - Preview production build with Vite

## Features

### Current
- Electron desktop application framework
- React-based UI
- IPC communication between main and renderer processes
- File system operations
- Terminal integration (node-pty)
- Application state persistence (electron-store)

### Planned
- Interactive coding challenges
- AI-powered interview simulation
- Real-time code execution
- Performance analytics and statistics
- Company-specific preparation materials
- Monaco code editor integration
- Terminal with XTerm.js
- Markdown rendering for documentation
- Resizable panels for multi-pane layout

## Architecture

### Main Process (Electron)
- `electron/main.js`: Creates application window, manages app lifecycle
- `electron/ipc-handlers.js`: Handles IPC communication with renderer process
  - File system operations
  - Terminal management (via node-pty)
  - Application utilities
  - Persistent storage (electron-store)

### Renderer Process (React)
- `src/index.jsx`: Application entry point
- `src/App.jsx`: Root component
- `src/components/`: Reusable UI components
- `src/hooks/`: Custom React hooks

### Context Bridge
- `electron/preload.js`: Exposes safe APIs to renderer process
  - `window.electron`: Electron APIs
  - `window.process`: Node.js process information

## Security

The application follows Electron security best practices:
- Context isolation enabled
- Node integration disabled in renderer
- Preload script for controlled API exposure
- IPC communication for all main/renderer interaction

## Contributing

This project serves as a foundation for interview preparation. Future agents will build upon this structure to implement specific features.

## License

MIT
