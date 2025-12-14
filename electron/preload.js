const { contextBridge, ipcRenderer } = require('electron');

/**
 * InterviewForge Preload Script
 * Exposes secure API to renderer process via context bridge
 */

// Define valid channels for IPC communication
const validChannels = {
  send: [
    // File system operations
    'fs:readFile',
    'fs:writeFile',
    'fs:readDir',
    'fs:exists',
    'fs:mkdir',
    'fs:copyDir',
    'fs:deleteFile',
    'fs:deletePath',

    // Terminal operations
    'terminal:create',
    'terminal:write',
    'terminal:resize',
    'terminal:kill',
    'terminal:killAll',

    // Process operations
    'process:runPython',
    'process:runPytest',
    'process:spawnClaudeCode',
    'process:killProcess',

    // Stats operations
    'stats:load',
    'stats:save',
    'stats:increment',
    'stats:reset',

    // Session operations
    'session:archive',
    'session:clear',
    'session:checkActive',
    'session:loadActive',

    // Window operations
    'window:minimize',
    'window:maximize',
    'window:close',
    'window:toggleMaximize',
    'window:isMaximized',

    // App operations
    'app:getPath',
    'app:quit'
  ],
  receive: [
    // Terminal events
    'terminal:data',
    'terminal:exit',
    'terminal:error',

    // Process events
    'process:output',
    'process:error',
    'process:exit',

    // App events
    'app:initialized',
    'app:error',

    // Window events
    'window:maximized',
    'window:unmaximized',
    'window:minimized',
    'window:restored'
  ]
};

/**
 * Safe IPC invoke wrapper
 */
function invoke(channel, ...args) {
  if (validChannels.send.includes(channel)) {
    return ipcRenderer.invoke(channel, ...args);
  }
  throw new Error(`Invalid IPC channel: ${channel}`);
}

/**
 * Safe IPC send wrapper
 */
function send(channel, ...args) {
  if (validChannels.send.includes(channel)) {
    return ipcRenderer.send(channel, ...args);
  }
  throw new Error(`Invalid IPC channel: ${channel}`);
}

/**
 * Safe IPC receive wrapper
 */
function on(channel, callback) {
  if (validChannels.receive.includes(channel)) {
    const subscription = (event, ...args) => {
      if (channel === 'terminal:data') {
        console.log('[Preload] Received terminal:data event');
      }
      callback(...args);
    };
    ipcRenderer.on(channel, subscription);

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  }
  throw new Error(`Invalid IPC channel: ${channel}`);
}

/**
 * Safe IPC once wrapper
 */
function once(channel, callback) {
  if (validChannels.receive.includes(channel)) {
    ipcRenderer.once(channel, (event, ...args) => callback(...args));
  } else {
    throw new Error(`Invalid IPC channel: ${channel}`);
  }
}

// Expose protected methods via context bridge
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  fs: {
    readFile: (filePath, encoding = 'utf8') => invoke('fs:readFile', filePath, encoding),
    writeFile: (filePath, content, encoding = 'utf8') => invoke('fs:writeFile', filePath, content, encoding),
    readDir: (dirPath) => invoke('fs:readDir', dirPath),
    exists: (filePath) => invoke('fs:exists', filePath),
    mkdir: (dirPath, recursive = true) => invoke('fs:mkdir', dirPath, recursive),
    copyDir: (srcDir, destDir) => invoke('fs:copyDir', srcDir, destDir),
    deleteFile: (filePath) => invoke('fs:deleteFile', filePath),
    deletePath: (filePath, recursive = false) => invoke('fs:deletePath', filePath, recursive)
  },

  // Terminal operations
  terminal: {
    create: (shellPath, args = [], cwd, env) => invoke('terminal:create', shellPath, args, cwd, env),
    write: (terminalId, data) => invoke('terminal:write', terminalId, data),
    resize: (terminalId, cols, rows) => invoke('terminal:resize', terminalId, cols, rows),
    kill: (terminalId) => invoke('terminal:kill', terminalId),
    killAll: () => invoke('terminal:killAll'),

    // Event listeners
    onData: (terminalId, callback) => on('terminal:data', (data) => {
      if (data.terminalId === terminalId) {
        callback(data.data);
      }
    }),
    onExit: (terminalId, callback) => on('terminal:exit', (data) => {
      if (data.terminalId === terminalId) {
        callback(data.exitCode, data.signal);
      }
    }),
    onError: (terminalId, callback) => on('terminal:error', (data) => {
      if (data.terminalId === terminalId) {
        callback(data.error);
      }
    })
  },

  // Process operations
  process: {
    runPython: (scriptPath, args = [], cwd) => invoke('process:runPython', scriptPath, args, cwd),
    runPytest: (testPath, args = [], cwd) => invoke('process:runPytest', testPath, args, cwd),
    spawnClaudeCode: (cwd, env) => invoke('process:spawnClaudeCode', cwd, env),
    killProcess: (processId) => invoke('process:killProcess', processId),

    // Event listeners
    onOutput: (processId, callback) => on('process:output', (data) => {
      if (data.processId === processId) {
        callback(data.output, data.stream);
      }
    }),
    onError: (processId, callback) => on('process:error', (data) => {
      if (data.processId === processId) {
        callback(data.error);
      }
    }),
    onExit: (processId, callback) => on('process:exit', (data) => {
      if (data.processId === processId) {
        callback(data.exitCode, data.signal);
      }
    })
  },

  // Stats operations
  stats: {
    load: () => invoke('stats:load'),
    save: (stats) => invoke('stats:save', stats),
    increment: (metric, value = 1, timeframes = ['daily', 'weekly', 'monthly', 'alltime']) =>
      invoke('stats:increment', metric, value, timeframes),
    reset: (timeframe) => invoke('stats:reset', timeframe)
  },

  // Session operations
  session: {
    archive: () => invoke('session:archive'),
    clear: () => invoke('session:clear'),
    checkActive: () => invoke('session:checkActive'),
    loadActive: () => invoke('session:loadActive')
  },

  // Window operations
  window: {
    minimize: () => invoke('window:minimize'),
    maximize: () => invoke('window:maximize'),
    close: () => invoke('window:close'),
    toggleMaximize: () => invoke('window:toggleMaximize'),
    isMaximized: () => invoke('window:isMaximized'),

    // Event listeners
    onMaximized: (callback) => on('window:maximized', callback),
    onUnmaximized: (callback) => on('window:unmaximized', callback),
    onMinimized: (callback) => on('window:minimized', callback),
    onRestored: (callback) => on('window:restored', callback)
  },

  // App operations
  app: {
    getPath: (name) => invoke('app:getPath', name),
    quit: () => invoke('app:quit'),

    // Event listeners
    onInitialized: (callback) => once('app:initialized', callback),
    onError: (callback) => on('app:error', callback)
  },

  // Utility functions
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});

// Log when preload script is loaded
console.log('InterviewForge preload script loaded');
