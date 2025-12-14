const { ipcMain, app } = require('electron');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const pty = require('node-pty');
const { spawn } = require('child_process');

// Global state
const terminals = new Map();
const processes = new Map();
let config = null;

/**
 * Generate unique ID for terminals and processes
 */
function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Safely send data to renderer process
 * Prevents "object destroyed" errors when window is closing
 */
function safeSend(mainWindow, channel, data) {
  try {
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
      mainWindow.webContents.send(channel, data);
    }
  } catch (error) {
    // Ignore errors when window is destroyed
    console.log('[IPC] Could not send to renderer:', error.message);
  }
}

/**
 * Register all IPC handlers
 */
function registerIpcHandlers(mainWindow, appConfig) {
  config = appConfig;

  // ============================================
  // File System Handlers
  // ============================================

  ipcMain.handle('fs:readFile', async (event, filePath, encoding = 'utf8') => {
    try {
      const content = await fs.readFile(filePath, encoding);
      return { success: true, content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('fs:writeFile', async (event, filePath, content, encoding = 'utf8') => {
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, encoding);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('fs:readDir', async (event, dirPath) => {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const items = entries.map(entry => ({
        name: entry.name,
        isDirectory: entry.isDirectory(),
        isFile: entry.isFile(),
        path: path.join(dirPath, entry.name)
      }));
      return { success: true, items };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('fs:exists', async (event, filePath) => {
    try {
      await fs.access(filePath);
      return { success: true, exists: true };
    } catch (error) {
      return { success: true, exists: false };
    }
  });

  ipcMain.handle('fs:mkdir', async (event, dirPath, recursive = true) => {
    try {
      await fs.mkdir(dirPath, { recursive });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('fs:copyDir', async (event, srcDir, destDir) => {
    try {
      await copyDirectory(srcDir, destDir);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('fs:deleteFile', async (event, filePath) => {
    try {
      await fs.unlink(filePath);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('fs:deletePath', async (event, filePath, recursive = false) => {
    try {
      const stat = await fs.stat(filePath);
      if (stat.isDirectory() && recursive) {
        await fs.rm(filePath, { recursive: true, force: true });
      } else if (stat.isDirectory()) {
        await fs.rmdir(filePath);
      } else {
        await fs.unlink(filePath);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ============================================
  // Terminal Handlers (node-pty)
  // ============================================

  ipcMain.handle('terminal:create', async (event, shellPath, args = [], cwd, env = {}) => {
    try {
      const terminalId = generateId();

      // Determine shell and default arguments
      const shell = shellPath || (process.platform === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/bash');
      const workingDir = cwd || config.workingDir;

      // Create PTY instance
      const ptyProcess = pty.spawn(shell, args, {
        name: 'xterm-256color',
        cols: 80,
        rows: 30,
        cwd: workingDir,
        env: { ...process.env, ...env }
      });

      // Store terminal instance
      terminals.set(terminalId, ptyProcess);

      // Handle data from terminal
      ptyProcess.onData((data) => {
        safeSend(mainWindow, 'terminal:data', { terminalId, data });
      });

      // Handle terminal exit
      ptyProcess.onExit(({ exitCode, signal }) => {
        safeSend(mainWindow, 'terminal:exit', { terminalId, exitCode, signal });
        terminals.delete(terminalId);
      });

      return { success: true, terminalId, pid: ptyProcess.pid };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('terminal:write', async (event, terminalId, data) => {
    try {
      const terminal = terminals.get(terminalId);
      if (!terminal) {
        return { success: false, error: 'Terminal not found' };
      }

      terminal.write(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('terminal:resize', async (event, terminalId, cols, rows) => {
    try {
      const terminal = terminals.get(terminalId);
      if (!terminal) {
        return { success: false, error: 'Terminal not found' };
      }

      terminal.resize(cols, rows);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('terminal:kill', async (event, terminalId) => {
    try {
      const terminal = terminals.get(terminalId);
      if (!terminal) {
        return { success: false, error: 'Terminal not found' };
      }

      terminal.kill();
      terminals.delete(terminalId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('terminal:killAll', async () => {
    try {
      for (const [terminalId, terminal] of terminals.entries()) {
        terminal.kill();
        terminals.delete(terminalId);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ============================================
  // Process Handlers
  // ============================================

  ipcMain.handle('process:runPython', async (event, scriptPath, args = [], cwd) => {
    try {
      const processId = generateId();
      const workingDir = cwd || config.workingDir;

      const pythonProcess = spawn('python3', [scriptPath, ...args], {
        cwd: workingDir,
        env: process.env
      });

      processes.set(processId, pythonProcess);

      // Handle stdout
      pythonProcess.stdout.on('data', (data) => {
        safeSend(mainWindow, 'process:output', { processId, output: data.toString(), stream: 'stdout' });
      });

      // Handle stderr
      pythonProcess.stderr.on('data', (data) => {
        safeSend(mainWindow, 'process:output', { processId, output: data.toString(), stream: 'stderr' });
      });

      // Handle error
      pythonProcess.on('error', (error) => {
        safeSend(mainWindow, 'process:error', { processId, error: error.message });
        processes.delete(processId);
      });

      // Handle exit
      pythonProcess.on('close', (exitCode, signal) => {
        safeSend(mainWindow, 'process:exit', { processId, exitCode, signal });
        processes.delete(processId);
      });

      return { success: true, processId, pid: pythonProcess.pid };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('process:runPytest', async (event, testPath, args = [], cwd) => {
    try {
      const processId = generateId();
      const workingDir = cwd || config.workingDir;

      // Build pytest command with common options
      const pytestArgs = ['-v', '--tb=short', testPath, ...args];

      const pytestProcess = spawn('pytest', pytestArgs, {
        cwd: workingDir,
        env: process.env
      });

      processes.set(processId, pytestProcess);

      // Handle stdout
      pytestProcess.stdout.on('data', (data) => {
        safeSend(mainWindow, 'process:output', { processId, output: data.toString(), stream: 'stdout' });
      });

      // Handle stderr
      pytestProcess.stderr.on('data', (data) => {
        safeSend(mainWindow, 'process:output', { processId, output: data.toString(), stream: 'stderr' });
      });

      // Handle error
      pytestProcess.on('error', (error) => {
        safeSend(mainWindow, 'process:error', { processId, error: error.message });
        processes.delete(processId);
      });

      // Handle exit
      pytestProcess.on('close', (exitCode, signal) => {
        safeSend(mainWindow, 'process:exit', { processId, exitCode, signal });
        processes.delete(processId);
      });

      return { success: true, processId, pid: pytestProcess.pid };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('process:spawnClaudeCode', async (event, cwd, env = {}) => {
    try {
      const processId = generateId();
      const workingDir = cwd || config.workingDir;

      // Spawn Claude Code CLI
      const claudeProcess = spawn('claude', ['code'], {
        cwd: workingDir,
        env: { ...process.env, ...env },
        shell: true
      });

      processes.set(processId, claudeProcess);

      // Handle stdout
      claudeProcess.stdout.on('data', (data) => {
        safeSend(mainWindow, 'process:output', { processId, output: data.toString(), stream: 'stdout' });
      });

      // Handle stderr
      claudeProcess.stderr.on('data', (data) => {
        safeSend(mainWindow, 'process:output', { processId, output: data.toString(), stream: 'stderr' });
      });

      // Handle error
      claudeProcess.on('error', (error) => {
        safeSend(mainWindow, 'process:error', { processId, error: error.message });
        processes.delete(processId);
      });

      // Handle exit
      claudeProcess.on('close', (exitCode, signal) => {
        safeSend(mainWindow, 'process:exit', { processId, exitCode, signal });
        processes.delete(processId);
      });

      return { success: true, processId, pid: claudeProcess.pid };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('process:killProcess', async (event, processId) => {
    try {
      const proc = processes.get(processId);
      if (!proc) {
        return { success: false, error: 'Process not found' };
      }

      proc.kill();
      processes.delete(processId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ============================================
  // Stats Handlers
  // ============================================

  ipcMain.handle('stats:load', async () => {
    try {
      const statsFiles = ['daily.json', 'weekly.json', 'monthly.json', 'alltime.json'];
      const stats = {};

      for (const file of statsFiles) {
        const filePath = path.join(config.statsDir, file);
        if (fsSync.existsSync(filePath)) {
          const content = await fs.readFile(filePath, 'utf8');
          const key = file.replace('.json', '');
          stats[key] = JSON.parse(content);
        } else {
          stats[file.replace('.json', '')] = initializeStats();
        }
      }

      return { success: true, stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('stats:save', async (event, stats) => {
    try {
      await fs.mkdir(config.statsDir, { recursive: true });

      for (const [timeframe, data] of Object.entries(stats)) {
        const filePath = path.join(config.statsDir, `${timeframe}.json`);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('stats:increment', async (event, metric, value = 1, timeframes = ['daily', 'weekly', 'monthly', 'alltime']) => {
    try {
      // Load current stats
      const loadResult = await ipcMain.invoke(null, 'stats:load');
      if (!loadResult.success) {
        return loadResult;
      }

      const stats = loadResult.stats;

      // Increment metric in specified timeframes
      for (const timeframe of timeframes) {
        if (stats[timeframe]) {
          if (!stats[timeframe][metric]) {
            stats[timeframe][metric] = 0;
          }
          stats[timeframe][metric] += value;
        }
      }

      // Save updated stats
      return await ipcMain.invoke(null, 'stats:save', stats);
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('stats:reset', async (event, timeframe) => {
    try {
      const filePath = path.join(config.statsDir, `${timeframe}.json`);
      const initialStats = initializeStats();
      await fs.writeFile(filePath, JSON.stringify(initialStats, null, 2));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ============================================
  // Session Handlers
  // ============================================

  ipcMain.handle('session:archive', async () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const archiveDir = path.join(config.projectRoot, 'archives', `session_${timestamp}_${Date.now()}`);

      await fs.mkdir(path.dirname(archiveDir), { recursive: true });
      await fs.mkdir(archiveDir, { recursive: true });

      // Copy working directory contents to archive
      const files = await fs.readdir(config.workingDir);
      for (const file of files) {
        const srcPath = path.join(config.workingDir, file);
        const destPath = path.join(archiveDir, file);
        const stat = await fs.stat(srcPath);

        if (stat.isDirectory()) {
          await copyDirectory(srcPath, destPath);
        } else {
          await fs.copyFile(srcPath, destPath);
        }
      }

      return { success: true, archivePath: archiveDir };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('session:clear', async () => {
    try {
      const files = await fs.readdir(config.workingDir);
      for (const file of files) {
        const filePath = path.join(config.workingDir, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
          await fs.rm(filePath, { recursive: true, force: true });
        } else {
          await fs.unlink(filePath);
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('session:checkActive', async () => {
    try {
      const workingExists = fsSync.existsSync(config.workingDir);
      if (!workingExists) {
        return { success: true, hasSession: false };
      }

      const files = await fs.readdir(config.workingDir);
      const hasFiles = files.length > 0;

      if (!hasFiles) {
        return { success: true, hasSession: false };
      }

      const sessionFiles = files.filter(f =>
        f.endsWith('.py') ||
        f.endsWith('.txt') ||
        f === 'current_problem.json'
      );

      return {
        success: true,
        hasSession: sessionFiles.length > 0,
        fileCount: sessionFiles.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('session:loadActive', async () => {
    try {
      const activeCompanyFile = path.join(config.soulDocsDir, '_active_company.txt');
      if (fsSync.existsSync(activeCompanyFile)) {
        const content = await fs.readFile(activeCompanyFile, 'utf8');
        return { success: true, activeCompany: content.trim() };
      }
      return { success: true, activeCompany: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ============================================
  // Window Handlers
  // ============================================

  ipcMain.handle('window:minimize', async () => {
    mainWindow.minimize();
    return { success: true };
  });

  ipcMain.handle('window:maximize', async () => {
    mainWindow.maximize();
    return { success: true };
  });

  ipcMain.handle('window:close', async () => {
    mainWindow.close();
    return { success: true };
  });

  ipcMain.handle('window:toggleMaximize', async () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
    return { success: true, isMaximized: mainWindow.isMaximized() };
  });

  ipcMain.handle('window:isMaximized', async () => {
    return { success: true, isMaximized: mainWindow.isMaximized() };
  });

  // ============================================
  // App Handlers
  // ============================================

  ipcMain.handle('app:getPath', async (event, name) => {
    try {
      const pathValue = app.getPath(name);
      return { success: true, path: pathValue };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('app:quit', async () => {
    app.quit();
    return { success: true };
  });
}

// ============================================
// Helper Functions
// ============================================

/**
 * Recursively copy directory
 */
async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Initialize empty stats object
 */
function initializeStats() {
  return {
    problemsAttempted: 0,
    problemsSolved: 0,
    testsPassed: 0,
    testsFailed: 0,
    totalTests: 0,
    timeSpent: 0,
    companiesPracticed: [],
    difficultyCounts: {
      easy: 0,
      medium: 0,
      hard: 0
    },
    categoryCounts: {}
  };
}

/**
 * Cleanup on exit
 */
function cleanup() {
  // Kill all terminals
  for (const [terminalId, terminal] of terminals.entries()) {
    try {
      terminal.kill();
    } catch (error) {
      console.error(`Failed to kill terminal ${terminalId}:`, error);
    }
  }
  terminals.clear();

  // Kill all processes
  for (const [processId, proc] of processes.entries()) {
    try {
      proc.kill();
    } catch (error) {
      console.error(`Failed to kill process ${processId}:`, error);
    }
  }
  processes.clear();
}

// Register cleanup on app exit
app.on('before-quit', cleanup);
process.on('exit', cleanup);

module.exports = {
  registerIpcHandlers,
  cleanup
};
