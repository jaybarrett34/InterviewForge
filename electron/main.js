const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { dialog } = require('electron');

let mainWindow = null;
let windowState = {
  width: 1600,
  height: 900,
  x: undefined,
  y: undefined,
  isMaximized: false
};

const STATE_FILE = path.join(app.getPath('userData'), 'window-state.json');
const PROJECT_ROOT = path.join(app.getAppPath(), '..');
const WORKING_DIR = path.join(PROJECT_ROOT, 'working');
const SOUL_DOCS_DIR = path.join(PROJECT_ROOT, 'soul_docs');
const STATS_DIR = path.join(PROJECT_ROOT, 'stats');
const ACTIVE_COMPANY_FILE = path.join(SOUL_DOCS_DIR, '_active_company.txt');

// Import IPC handlers
const { registerIpcHandlers } = require('./ipc-handlers');

/**
 * Load persisted window state
 */
async function loadWindowState() {
  try {
    const data = await fs.readFile(STATE_FILE, 'utf8');
    const state = JSON.parse(data);
    windowState = { ...windowState, ...state };
  } catch (error) {
    console.log('No saved window state, using defaults');
  }
}

/**
 * Save current window state
 */
async function saveWindowState() {
  try {
    if (mainWindow) {
      const bounds = mainWindow.getBounds();
      windowState = {
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        isMaximized: mainWindow.isMaximized()
      };
      await fs.writeFile(STATE_FILE, JSON.stringify(windowState, null, 2));
    }
  } catch (error) {
    console.error('Failed to save window state:', error);
  }
}

/**
 * Check if working directory has an active session
 */
async function checkActiveSession() {
  try {
    const workingExists = fsSync.existsSync(WORKING_DIR);
    if (!workingExists) {
      return { hasSession: false };
    }

    const files = await fs.readdir(WORKING_DIR);
    const hasFiles = files.length > 0;

    if (!hasFiles) {
      return { hasSession: false };
    }

    // Check for session indicator files
    const sessionFiles = files.filter(f =>
      f.endsWith('.py') ||
      f.endsWith('.txt') ||
      f === 'current_problem.json'
    );

    return {
      hasSession: sessionFiles.length > 0,
      fileCount: sessionFiles.length
    };
  } catch (error) {
    console.error('Error checking active session:', error);
    return { hasSession: false };
  }
}

/**
 * Prompt user to resume or archive existing session
 */
async function promptSessionResume(sessionInfo) {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    buttons: ['Resume Session', 'Archive & Start New', 'Cancel'],
    defaultId: 0,
    title: 'Active Session Detected',
    message: 'Found an active session in working directory',
    detail: `${sessionInfo.fileCount} files found. Would you like to resume or archive this session?`
  });

  return result.response; // 0 = Resume, 1 = Archive, 2 = Cancel
}

/**
 * Archive existing session
 */
async function archiveExistingSession() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const archiveDir = path.join(PROJECT_ROOT, 'archives', `session_${timestamp}_${Date.now()}`);

    await fs.mkdir(path.dirname(archiveDir), { recursive: true });
    await fs.mkdir(archiveDir, { recursive: true });

    // Copy working directory contents to archive
    const files = await fs.readdir(WORKING_DIR);
    for (const file of files) {
      const srcPath = path.join(WORKING_DIR, file);
      const destPath = path.join(archiveDir, file);
      await fs.copyFile(srcPath, destPath);
    }

    // Clear working directory
    for (const file of files) {
      await fs.unlink(path.join(WORKING_DIR, file));
    }

    console.log('Session archived to:', archiveDir);
    return { success: true, archivePath: archiveDir };
  } catch (error) {
    console.error('Failed to archive session:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Load active company from soul_docs
 */
async function loadActiveCompany() {
  try {
    if (fsSync.existsSync(ACTIVE_COMPANY_FILE)) {
      const content = await fs.readFile(ACTIVE_COMPANY_FILE, 'utf8');
      return content.trim();
    }
    return null;
  } catch (error) {
    console.error('Failed to load active company:', error);
    return null;
  }
}

/**
 * Load stats from stats directory
 */
async function loadStats() {
  try {
    const statsFiles = ['daily.json', 'weekly.json', 'monthly.json', 'alltime.json'];
    const stats = {};

    for (const file of statsFiles) {
      const filePath = path.join(STATS_DIR, file);
      if (fsSync.existsSync(filePath)) {
        const content = await fs.readFile(filePath, 'utf8');
        const key = file.replace('.json', '');
        stats[key] = JSON.parse(content);
      } else {
        stats[file.replace('.json', '')] = {};
      }
    }

    return stats;
  } catch (error) {
    console.error('Failed to load stats:', error);
    return { daily: {}, weekly: {}, monthly: {}, alltime: {} };
  }
}

/**
 * Initialize the application startup sequence
 */
async function initializeApp() {
  try {
    // Step 1: Check for active session
    const sessionInfo = await checkActiveSession();
    let shouldArchive = false;

    if (sessionInfo.hasSession) {
      const choice = await promptSessionResume(sessionInfo);
      if (choice === 2) {
        // User cancelled
        app.quit();
        return;
      } else if (choice === 1) {
        // Archive session
        shouldArchive = true;
        await archiveExistingSession();
      }
      // choice === 0 means resume, do nothing
    } else {
      // Ensure working directory exists
      await fs.mkdir(WORKING_DIR, { recursive: true });
    }

    // Step 2: Load active company
    const activeCompany = await loadActiveCompany();

    // Step 3: Load stats
    const stats = await loadStats();

    // Step 4: Send initialization data to renderer
    mainWindow.webContents.send('app:initialized', {
      sessionResumed: sessionInfo.hasSession && !shouldArchive,
      activeCompany,
      stats,
      workingDir: WORKING_DIR,
      projectRoot: PROJECT_ROOT
    });

    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    dialog.showErrorBox('Initialization Error', `Failed to initialize InterviewForge: ${error.message}`);
  }
}

/**
 * Create the main application window
 */
async function createWindow() {
  await loadWindowState();

  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#1e1e1e',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: true, // Show immediately
    title: 'InterviewForge'
  });

  // Restore maximized state
  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    console.log('Loading development URL: http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173').catch(err => {
      console.error('Failed to load URL:', err);
    });
    // Open DevTools in a separate window to not block the view
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Save window state on close
  mainWindow.on('close', async () => {
    await saveWindowState();
  });

  // Handle window state changes
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window:maximized');
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window:unmaximized');
  });

  mainWindow.on('minimize', () => {
    mainWindow.webContents.send('window:minimized');
  });

  mainWindow.on('restore', () => {
    mainWindow.webContents.send('window:restored');
  });

  // Register all IPC handlers
  registerIpcHandlers(mainWindow, {
    projectRoot: PROJECT_ROOT,
    workingDir: WORKING_DIR,
    soulDocsDir: SOUL_DOCS_DIR,
    statsDir: STATS_DIR
  });

  // Initialize app after window is ready
  mainWindow.webContents.on('did-finish-load', async () => {
    await initializeApp();
  });
}

// App lifecycle handlers

/**
 * App ready - create window
 */
app.whenReady().then(async () => {
  await createWindow();
});

/**
 * All windows closed - quit on non-macOS
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Activate (macOS) - recreate window if needed
 */
app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});

/**
 * Before quit - cleanup
 */
app.on('before-quit', async () => {
  await saveWindowState();
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  dialog.showErrorBox('Application Error', `An unexpected error occurred: ${error.message}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

// Export for testing
module.exports = {
  createWindow,
  loadWindowState,
  saveWindowState,
  checkActiveSession,
  archiveExistingSession,
  loadActiveCompany,
  loadStats
};
