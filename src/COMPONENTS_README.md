# InterviewForge React Components

Complete, production-ready React frontend for InterviewForge - an AI-powered coding interview practice platform with integrated Claude Code assistance.

## Architecture Overview

### Core Files

- **`index.jsx`** - React entry point with StrictMode
- **`App.jsx`** - Main application component with context providers
- **`index.css`** - Global styles with CSS variables for theming

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Toolbar (Timer, Buttons)                                   │
├─────────────┬──────────────────┬──────────────────────────┤
│   Problem   │   Code Terminal  │   Claude Terminal        │
│   Pane      │                  │                          │
│   (20%)     │      (40%)       │      (40%)              │
│             │                  │                          │
├─────────────┴──────────────────┴──────────────────────────┤
│ Expandable Bottom Panel                                    │
│ - Monaco Editor / Test Results / Split View                │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Layout.jsx
Main layout manager using `react-resizable-panels`.

**Features:**
- 3-column top section (20-40-40 split)
- Expandable bottom panel with 4 modes:
  - collapsed
  - editor (Monaco only)
  - tests (TestRunner only)
  - split (both side-by-side)
- Draggable panel resize handles

**Props:** None (controls via internal state)

### 2. ProblemPane.jsx
Left panel displaying problem information.

**Features:**
- Problem title, difficulty badge, time estimate
- Company tag display
- Markdown-rendered description
- Example inputs/outputs with explanations
- Constraints list
- Collapsible hints (tracks when viewed)
- Company selector dropdown
- "New Problem" button

**Data Structure:**
```javascript
{
  title: string,
  difficulty: 'Easy' | 'Medium' | 'Hard',
  timeEstimate: number, // minutes
  company: string,
  category: string,
  description: string, // markdown
  examples: [{ input, output, explanation }],
  constraints: string[],
  hints: string[],
  followUp: string[]
}
```

### 3. CodeTerminal.jsx
Middle panel with xterm.js terminal for code execution.

**Features:**
- Command input with history (up/down arrows)
- Available commands: run, test, clear, help
- Colored output (ANSI escape codes)
- Run Python solution
- Execute pytest
- Quick action buttons (Run, Test, Clear)

**API Integration:**
- POST `/api/run` - Execute solution.py
- POST `/api/test` - Run test suite

### 4. ClaudeTerminal.jsx
Right panel with direct Claude Code interface.

**Features:**
- PTY connection to Claude Code CLI
- Real-time streaming output
- Connection status indicator
- Auto-reconnect capability
- Full terminal emulation

**API Integration:**
- POST `/api/claude/connect` - Initialize PTY
- GET `/api/claude/stream/:id` - SSE stream
- POST `/api/claude/disconnect` - Cleanup

### 5. Monaco.jsx
Code editor using Monaco Editor.

**Features:**
- Python language support
- VS Code themes (light/dark sync)
- JetBrains Mono font
- Auto-save with 1s debounce
- File watcher for external changes
- Format document
- Undo/Redo buttons
- Configurable autocomplete
- Bracket pair colorization
- Parameter hints

**Bindings:**
- Reads/writes to `working/solution.py`
- Syncs with session code state

### 6. TestRunner.jsx
Test results display panel.

**Features:**
- Pass/fail summary with percentage
- Progress bar visualization
- Individual test case cards
- Expandable error details
- Execution time tracking
- Expected vs actual comparison
- Stack traces

**Data Structure:**
```javascript
{
  total: number,
  passed: number,
  failed: number,
  executionTime: number,
  tests: [{
    name: string,
    passed: boolean,
    executionTime: number,
    error?: string,
    traceback?: string,
    expected?: any,
    actual?: any
  }]
}
```

### 7. Timer.jsx
Configurable countdown/count-up timer.

**Features:**
- Default 45 minutes
- Count-down or count-up modes
- Performance.now() for accuracy
- Visual warnings at 10/5/1 minutes
- Color-coded urgency levels
- Pause/resume functionality
- Audio alert on completion
- Start/reset controls

**Props:**
```javascript
{
  defaultDuration: number, // seconds
  mode: 'countdown' | 'countup'
}
```

### 8. LanguageSelector.jsx
Language selection dropdown.

**Features:**
- Python (currently available)
- JavaScript, Java, C++, Go, Rust (coming soon)
- Disabled state for unavailable languages
- Icon + text display

### 9. Toolbar.jsx
Action buttons bar.

**Features:**
- Run Code button (triggers CodeTerminal)
- Run Tests button (shows TestRunner)
- Submit button (ends session, saves stats)
- New Problem button
- Editor toggle
- Stats modal trigger
- Settings modal trigger
- Loading states

### 10. SettingsModal.jsx
Full-screen modal for configuration.

**Settings:**
- **Appearance:** Light/dark theme toggle
- **Editor:** Autocomplete, auto-save, language
- **Timer:** Duration, mode (countdown/up), sound alerts
- **Problem Filters:** Difficulty, company selection
- Reset to defaults button

**Storage:** localStorage `interviewforge-settings`

### 11. StatsModal.jsx
Performance dashboard.

**Displays:**
- **Overview:** Total sessions, pass rate, average time
- **Difficulty Performance:** Easy/Medium/Hard breakdown
- **Category Performance:** By problem type
- **Weak Areas:** Categories < 60% pass rate
- **Recent Sessions:** Last 10 attempts with details
- Clear all stats button

**Calculations:**
- Pass rate percentages
- Time averaging
- Category/difficulty grouping
- Weak area detection

## Hooks

### useTheme.js
Theme management context.

```javascript
const { theme, toggleTheme } = useTheme();
// theme: 'dark' | 'light'
// Syncs with localStorage and document.documentElement
```

### useSession.js
Current problem session state.

```javascript
const {
  currentProblem,
  sessionStartTime,
  hintsViewed,
  code,
  testResults,
  isSubmitted,
  startNewSession,
  viewHint,
  updateCode,
  updateTestResults,
  submitSolution,
  getSessionDuration
} = useSession();
```

**Features:**
- Performance.now() timestamps
- Hint tracking
- Code synchronization
- Test result storage
- Session duration calculation

### useStats.js
Performance tracking and analytics.

```javascript
const {
  sessions,
  addSession,
  getStats,
  clearStats
} = useStats();
```

**Storage:** localStorage `interviewforge-stats`

**Session Data:**
```javascript
{
  id: number,
  problem: object,
  duration: number,
  hintsUsed: number,
  testResults: object,
  timestamp: string
}
```

### useTerminal.js
xterm.js terminal instance manager.

```javascript
const {
  containerRef,
  terminal,
  write,
  writeln,
  clear,
  focus,
  fit
} = useTerminal({ onData, theme });
```

**Features:**
- Auto-resize with FitAddon
- Web links support
- Theme synchronization
- Cleanup on unmount
- Performance optimized

## Styling

### CSS Variables
All colors use CSS variables for easy theming:

```css
--bg-primary
--bg-secondary
--bg-tertiary
--text-primary
--text-secondary
--border-color
--accent-primary
--accent-hover
--success
--error
--warning
```

### Tailwind Classes
- `btn`, `btn-primary`, `btn-secondary`, `btn-success`, `btn-danger`
- `badge`, `badge-easy`, `badge-medium`, `badge-hard`
- `panel`, `panel-header`
- `markdown-content`
- `modal-overlay`, `modal-content`

### Dark Mode
- Class-based: `dark` on `<html>`
- Automatic system preference detection
- Persistent via localStorage

## API Endpoints Expected

```javascript
// Problem Management
GET  /api/problem/random
GET  /api/problem/:id

// Code Execution
POST /api/run          // { action: 'run' }
POST /api/test         // returns test results

// File Operations
POST /api/save/solution.py     // { content: string }
GET  /api/watch/solution.py    // { content: string }

// Claude Integration
POST /api/claude/connect       // { process: { id } }
GET  /api/claude/stream/:id    // Server-Sent Events
POST /api/claude/disconnect    // { processId: string }
```

## Installation

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build
```

## Dependencies

### Production
- `react` ^18.2.0
- `react-dom` ^18.2.0
- `react-resizable-panels` ^1.0.9
- `react-markdown` ^9.0.1
- `monaco-editor` ^0.45.0
- `xterm` ^5.3.0
- `xterm-addon-fit` ^0.8.0
- `xterm-addon-web-links` ^0.9.0

### Development
- `vite` ^5.0.8
- `@vitejs/plugin-react` ^4.2.1
- `tailwindcss` ^3.3.6
- `autoprefixer` ^10.4.16
- `postcss` ^8.4.32

## File Structure

```
src/
├── index.jsx                 # Entry point
├── App.jsx                   # Main app with providers
├── index.css                 # Global styles
├── components/
│   ├── Layout.jsx            # Main layout manager
│   ├── ProblemPane.jsx       # Problem display
│   ├── CodeTerminal.jsx      # Execution terminal
│   ├── ClaudeTerminal.jsx    # Claude Code terminal
│   ├── Monaco.jsx            # Code editor
│   ├── TestRunner.jsx        # Test results
│   ├── Timer.jsx             # Timer widget
│   ├── LanguageSelector.jsx  # Language picker
│   ├── Toolbar.jsx           # Action buttons
│   ├── SettingsModal.jsx     # Settings dialog
│   └── StatsModal.jsx        # Stats dashboard
└── hooks/
    ├── useTheme.js           # Theme context
    ├── useSession.js         # Session state
    ├── useStats.js           # Performance tracking
    └── useTerminal.js        # Terminal management
```

## Key Features

### Performance
- Code splitting (React, Monaco, Terminal vendors)
- Debounced auto-save (1s)
- RequestAnimationFrame for timer
- ResizeObserver for terminal fitting
- Memoized stats calculations

### Accessibility
- Keyboard shortcuts (Ctrl+Enter, Ctrl+Shift+T, etc.)
- ARIA labels on interactive elements
- Focus management
- Screen reader friendly

### Data Persistence
- localStorage for settings
- localStorage for stats
- Session state in React context
- File system sync for code

### Error Handling
- Try/catch on all API calls
- Graceful degradation
- User-friendly error messages
- Reconnection logic for Claude terminal

## Development Notes

### Adding New Languages
1. Add to `LANGUAGES` array in `LanguageSelector.jsx`
2. Update Monaco language config in `Monaco.jsx`
3. Backend support for compilation/execution
4. Update starter code templates

### Customizing Theme
1. Modify CSS variables in `index.css`
2. Update Monaco theme in `useTerminal.js`
3. Adjust Tailwind config in `tailwind.config.js`

### Backend Integration
All components are designed to work with a FastAPI/Flask backend. Mock data can be used for development by creating a `public/mock-api` folder with JSON responses.

## License

MIT
