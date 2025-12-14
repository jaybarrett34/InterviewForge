# InterviewForge - Quick Start Guide

## Installation

```bash
cd /Users/bigballsinyourjaws/Interview/interviewforge

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## What You Just Got

### Complete React Frontend
- ✅ 12 production-ready components
- ✅ 4 custom React hooks
- ✅ Full theme support (light/dark)
- ✅ Responsive layout with resizable panels
- ✅ Monaco code editor
- ✅ Dual xterm.js terminals
- ✅ Statistics dashboard
- ✅ Settings modal
- ✅ Timer with alerts

### Project Structure
```
interviewforge/
├── src/
│   ├── index.jsx                 # Entry point
│   ├── App.jsx                   # Main app
│   ├── index.css                 # Global styles
│   ├── components/               # 12 components
│   │   ├── Layout.jsx
│   │   ├── ProblemPane.jsx
│   │   ├── CodeTerminal.jsx
│   │   ├── ClaudeTerminal.jsx
│   │   ├── Monaco.jsx
│   │   ├── TestRunner.jsx
│   │   ├── Timer.jsx
│   │   ├── LanguageSelector.jsx
│   │   ├── Toolbar.jsx
│   │   ├── SettingsModal.jsx
│   │   └── StatsModal.jsx
│   └── hooks/                    # 4 custom hooks
│       ├── useTheme.js
│       ├── useSession.js
│       ├── useStats.js
│       └── useTerminal.js
├── package.json
├── vite.config.js
├── tailwind.config.js
└── index.html
```

## Testing the UI

Since the backend isn't connected yet, you can test with mock data:

### 1. Add Mock Problem Data
Create a mock problem in `useSession.js` or hard-code in `ProblemPane.jsx`:

```javascript
// Example problem object
const mockProblem = {
  title: "Two Sum",
  difficulty: "Easy",
  timeEstimate: 15,
  company: "Google",
  category: "Array",
  description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers that add up to `target`.",
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9"
    }
  ],
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "Only one valid answer exists"
  ],
  hints: [
    "Try using a hash map",
    "Store complements as you iterate"
  ],
  starterCode: "def two_sum(nums, target):\n    pass\n"
};
```

### 2. Test Features

#### Layout
- Drag the panel resize handles
- Toggle bottom panel modes (Editor, Tests, Split)
- Resize window to test responsiveness

#### Theme
- Click Settings → Toggle theme
- Verify all components update

#### Timer
- Click Start on the timer
- Watch the countdown
- Test pause/resume

#### Code Editor
- Type in Monaco editor
- Try Format, Undo, Redo buttons
- Check auto-save (1s delay)

#### Terminals
- CodeTerminal: Type `help` and press Enter
- Commands: `run`, `test`, `clear`

#### Settings
- Open Settings modal
- Toggle autocomplete
- Change timer duration
- Select companies

#### Stats
- Complete a mock session
- Click Submit
- Open Stats modal to view

## Backend API (To Be Implemented)

The frontend expects these endpoints:

```javascript
// Problem Management
GET  /api/problem/random
Response: { problem object }

GET  /api/problem/:id
Response: { problem object }

// Code Execution
POST /api/run
Body: { action: 'run' }
Response: { output: string }

POST /api/test
Response: {
  total: number,
  passed: number,
  failed: number,
  tests: [{ name, passed, error?, executionTime? }]
}

// File Operations
POST /api/save/solution.py
Body: { content: string }
Response: { success: boolean }

GET  /api/watch/solution.py
Response: { content: string }

// Claude Integration
POST /api/claude/connect
Response: { process: { id: string } }

GET  /api/claude/stream/:id
Response: Server-Sent Events stream

POST /api/claude/disconnect
Body: { processId: string }
Response: { success: boolean }
```

## Component Overview

### Layout (3-Panel + Bottom)
```
┌─────────────────────────────────────────────┐
│ Toolbar + Timer                             │
├─────────┬───────────────┬───────────────────┤
│ Problem │ Code Terminal │ Claude Terminal   │
│ (20%)   │ (40%)         │ (40%)            │
├─────────┴───────────────┴───────────────────┤
│ Monaco Editor / Test Results (expandable)   │
└─────────────────────────────────────────────┘
```

### Key Components

**ProblemPane**
- Shows current problem
- Markdown rendering
- Collapsible hints
- Company filter

**CodeTerminal**
- Run Python code
- Execute tests
- Command history
- ANSI colors

**ClaudeTerminal**
- Direct Claude Code access
- PTY connection
- Real-time streaming

**Monaco Editor**
- Full VS Code experience
- Auto-save
- File watching
- Syntax highlighting

**TestRunner**
- Visual test results
- Pass/fail breakdown
- Error details
- Execution times

**Timer**
- Countdown/count-up
- Visual warnings
- Audio alerts
- Pause/resume

## Customization

### Change Theme Colors
Edit `src/index.css`:
```css
:root {
  --accent-primary: #007acc;  /* Change main color */
  --success: #22c55e;         /* Change success color */
}
```

### Adjust Layout Split
Edit `src/components/Layout.jsx`:
```javascript
<Panel defaultSize={20} minSize={15} maxSize={30}>  // Left panel
<Panel defaultSize={40} minSize={25}>                // Middle
<Panel defaultSize={40} minSize={25}>                // Right
```

### Add New Language
1. Update `src/components/LanguageSelector.jsx`
2. Add language to Monaco in `Monaco.jsx`
3. Implement backend support

## Building for Production

```bash
# Web build
npm run build
# Output: dist/

# Electron builds
npm run build:electron    # All platforms
npm run build:mac         # macOS
npm run build:win         # Windows
npm run build:linux       # Linux
# Output: release/
```

## Troubleshooting

### Monaco Editor Not Loading
```bash
npm install monaco-editor --save
```

### Terminal Not Rendering
```bash
npm install xterm xterm-addon-fit xterm-addon-web-links
```

### Tailwind Styles Not Working
```bash
npm install -D tailwindcss postcss autoprefixer
```

### Module Errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Connect Backend**: Implement the API endpoints
2. **Add Problems**: Create problem database
3. **Test Suite**: Add unit/integration tests
4. **Electron**: Configure desktop app
5. **Deploy**: Set up hosting/distribution

## Documentation

- **Component Details**: See `src/COMPONENTS_README.md`
- **Summary**: See `REACT_COMPONENTS_SUMMARY.md`
- **Full Setup**: See `SETUP.md`

## Support

For issues or questions:
1. Check component documentation
2. Review browser console for errors
3. Verify API endpoints are running
4. Check network tab for failed requests

---

Built with React 18, Vite, Monaco Editor, xterm.js, and Tailwind CSS
