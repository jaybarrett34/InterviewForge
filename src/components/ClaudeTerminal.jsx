import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useTerminal } from '../hooks/useTerminal';
import { useTheme } from '../hooks/useTheme';

const ClaudeTerminal = () => {
  const { theme } = useTheme();
  const [isConnected, setIsConnected] = useState(false);
  const [terminalId, setTerminalId] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const cleanupRef = useRef([]);
  const initAttemptedRef = useRef(false);
  const ptyIdRef = useRef(null);

  const handleTerminalData = useCallback((data) => {
    // Send user keystrokes to PTY process
    if (ptyIdRef.current && window.electronAPI) {
      window.electronAPI.terminal.write(ptyIdRef.current, data);
    }
  }, []);

  const handleTerminalResize = useCallback((cols, rows) => {
    if (ptyIdRef.current && window.electronAPI) {
      console.log('[ClaudeTerminal] Resizing PTY:', cols, 'x', rows);
      window.electronAPI.terminal.resize(ptyIdRef.current, cols, rows);
    }
  }, []);

  const { containerRef, write, writeln, clear, isReady, terminalRef } = useTerminal({
    onData: handleTerminalData,
    onResize: handleTerminalResize,
    theme
  });

  const initializeClaude = useCallback(async () => {
    if (!window.electronAPI) {
      writeln('\x1b[31mError: Electron API not available\x1b[0m');
      writeln('This app must run in Electron environment.');
      setConnectionError('Electron API not available');
      return;
    }

    setConnectionError(null);

    try {
      writeln('\x1b[36mInitializing terminal...\x1b[0m');
      writeln('');

      // Use bash on macOS/Linux
      const shell = '/bin/bash';

      // Create a PTY terminal with a shell
      const result = await window.electronAPI.terminal.create(
        shell,
        [],
        '/Users/bigballsinyourjaws/Interview/interviewforge', // Project root
        {
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor'
        }
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to create terminal');
      }

      const newTerminalId = result.terminalId;
      setTerminalId(newTerminalId);
      ptyIdRef.current = newTerminalId;
      setIsConnected(true);

      // Sync initial PTY size with xterm dimensions
      if (terminalRef.current) {
        const { cols, rows } = terminalRef.current;
        console.log('[ClaudeTerminal] Initial PTY resize:', cols, 'x', rows);
        await window.electronAPI.terminal.resize(newTerminalId, cols, rows);
      }

      // Listen for terminal data - write directly to xterm via ref
      const unsubData = window.electronAPI.terminal.onData(newTerminalId, (data) => {
        if (terminalRef.current) {
          terminalRef.current.write(data);
        }
      });
      cleanupRef.current.push(unsubData);

      // Listen for terminal exit
      const unsubExit = window.electronAPI.terminal.onExit(newTerminalId, (exitCode) => {
        setIsConnected(false);
        setTerminalId(null);
        writeln('');
        writeln(`\x1b[33mTerminal exited with code ${exitCode}\x1b[0m`);
        writeln('Click "Reconnect" to start a new session.');
      });
      cleanupRef.current.push(unsubExit);

      // Listen for terminal errors
      const unsubError = window.electronAPI.terminal.onError(newTerminalId, (error) => {
        writeln(`\x1b[31mTerminal error: ${error}\x1b[0m`);
        setConnectionError(error);
      });
      cleanupRef.current.push(unsubError);

      writeln('\x1b[32m✓ Terminal connected\x1b[0m');
      writeln('');
      writeln('\x1b[36mStarting InterviewForge Claude...\x1b[0m');
      writeln('');

      // Auto-start claude with pre-loaded context via startup script
      setTimeout(() => {
        if (window.electronAPI && newTerminalId) {
          // Use the startup script that injects the system prompt
          window.electronAPI.terminal.write(newTerminalId, './scripts/start-claude.sh\r');
        }
      }, 500);

    } catch (error) {
      const errorMsg = error.message || 'Unknown error';
      writeln('\x1b[31m✗ Error: ' + errorMsg + '\x1b[0m');
      writeln('');
      setConnectionError(errorMsg);
      setIsConnected(false);

      writeln('\x1b[33mTroubleshooting:\x1b[0m');
      writeln('1. Check if the terminal path is accessible');
      writeln('2. Try clicking "Reconnect"');
      writeln('');
    }
  }, [write, writeln]);

  // Wait for xterm to be ready before initializing PTY
  useEffect(() => {
    if (isReady && !initAttemptedRef.current) {
      console.log('[ClaudeTerminal] xterm is ready, initializing PTY');
      initAttemptedRef.current = true;
      initializeClaude();
    }
  }, [isReady, initializeClaude]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        cleanupRef.current.forEach(cleanup => {
          try {
            cleanup?.();
          } catch (e) {
            // Ignore cleanup errors - object may already be destroyed
          }
        });
        if (terminalId && window.electronAPI?.terminal) {
          window.electronAPI.terminal.kill(terminalId).catch(() => {});
        }
      } catch (e) {
        // Ignore errors during cleanup - window may be closing
      }
    };
  }, [terminalId]);

  const handleReconnect = async () => {
    // Kill existing terminal if any
    if (terminalId && window.electronAPI) {
      try {
        await window.electronAPI.terminal.kill(terminalId);
      } catch (e) {
        // Ignore errors when killing already dead terminal
      }
    }

    // Clear cleanup functions
    cleanupRef.current.forEach(cleanup => cleanup?.());
    cleanupRef.current = [];

    clear();
    setTerminalId(null);
    setIsConnected(false);
    setConnectionError(null);
    initAttemptedRef.current = false; // Allow re-init

    // Wait a moment for cleanup, then re-init
    setTimeout(() => {
      if (isReady) {
        initAttemptedRef.current = true;
        initializeClaude();
      }
    }, 100);
  };

  const handleClear = () => {
    clear();
    if (isConnected) {
      writeln('\x1b[32m✓ Terminal connected\x1b[0m');
      writeln('Type \x1b[33mclaude\x1b[0m to start Claude Code');
      writeln('');
    } else {
      writeln('\x1b[31m✗ Not connected\x1b[0m');
      if (connectionError) {
        writeln(`Error: ${connectionError}`);
      }
      writeln('Click "Reconnect" to try again.');
      writeln('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)]">
      <div className="flex-1 overflow-hidden">
        <div ref={containerRef} className="h-full w-full" />
      </div>
      {/* Status bar at bottom */}
      <div className="h-7 border-t border-[var(--border-color)] flex items-center justify-between px-2 bg-[var(--bg-tertiary)] text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            title={isConnected ? 'Connected' : 'Disconnected'}
          />
          <span className="text-[var(--text-secondary)]">
            {isConnected ? 'Terminal Ready' : connectionError || 'Disconnected'}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReconnect}
            className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            Reconnect
          </button>
          <button
            onClick={handleClear}
            className="px-2 py-0.5 rounded bg-gray-600 hover:bg-gray-700 text-white"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaudeTerminal;
