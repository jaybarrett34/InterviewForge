import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTerminal } from '../hooks/useTerminal';
import { useTheme } from '../hooks/useTheme';
import { useSession } from '../hooks/useSession';

// Hardcoded project paths - these match electron/main.js
const PROJECT_ROOT = '/Users/bigballsinyourjaws/Interview/interviewforge';
const WORKING_DIR = `${PROJECT_ROOT}/working`;

const CodeTerminal = () => {
  const { theme } = useTheme();
  const { updateTestResults, requestSave } = useSession();
  const [isRunning, setIsRunning] = useState(false);
  const [terminalId, setTerminalId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
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
      console.log('[CodeTerminal] Resizing PTY:', cols, 'x', rows);
      window.electronAPI.terminal.resize(ptyIdRef.current, cols, rows);
    }
  }, []);

  const { containerRef, write, writeln, clear, isReady, terminalRef } = useTerminal({
    onData: handleTerminalData,
    onResize: handleTerminalResize,
    theme
  });

  // Initialize a real PTY terminal
  const initializeTerminal = useCallback(async () => {
    console.log('[CodeTerminal] initializeTerminal called');
    console.log('[CodeTerminal] electronAPI available:', !!window.electronAPI);

    if (!window.electronAPI) {
      console.error('[CodeTerminal] No electronAPI!');
      writeln('\x1b[31mElectron API not available\x1b[0m');
      return;
    }

    try {
      console.log('[CodeTerminal] Creating PTY...');
      writeln('\x1b[36mInitializing terminal...\x1b[0m');

      const shell = '/bin/bash';
      const result = await window.electronAPI.terminal.create(
        shell,
        [],
        WORKING_DIR,
        { TERM: 'xterm-256color', COLORTERM: 'truecolor' }
      );

      console.log('[CodeTerminal] PTY create result:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create terminal');
      }

      const newTerminalId = result.terminalId;
      console.log('[CodeTerminal] Got terminalId:', newTerminalId);
      setTerminalId(newTerminalId);
      ptyIdRef.current = newTerminalId;
      setIsConnected(true);

      // Sync initial PTY size with xterm dimensions
      if (terminalRef.current) {
        const { cols, rows } = terminalRef.current;
        console.log('[CodeTerminal] Initial PTY resize:', cols, 'x', rows);
        await window.electronAPI.terminal.resize(newTerminalId, cols, rows);
      }

      // Listen for terminal data - write directly to xterm via ref
      console.log('[CodeTerminal] Setting up data listener for:', newTerminalId);
      const unsubData = window.electronAPI.terminal.onData(newTerminalId, (data) => {
        console.log('[CodeTerminal] Received PTY data, length:', data.length);
        // Write directly to the xterm terminal instance
        if (terminalRef.current) {
          terminalRef.current.write(data);
        } else {
          console.error('[CodeTerminal] terminalRef.current is null!');
        }
      });
      cleanupRef.current.push(unsubData);
      console.log('[CodeTerminal] Data listener registered');

      // Listen for terminal exit
      const unsubExit = window.electronAPI.terminal.onExit(newTerminalId, (exitCode) => {
        console.log('[CodeTerminal] Terminal exited:', exitCode);
        setIsConnected(false);
        setTerminalId(null);
        writeln('');
        writeln(`\x1b[33mTerminal exited with code ${exitCode}\x1b[0m`);
      });
      cleanupRef.current.push(unsubExit);

      writeln('\x1b[32mTerminal ready\x1b[0m');
      writeln('');

    } catch (error) {
      console.error('[CodeTerminal] Error:', error);
      writeln('\x1b[31mError: ' + error.message + '\x1b[0m');
    }
  }, [write, writeln]);

  // Wait for xterm to be ready before initializing PTY
  useEffect(() => {
    if (isReady && !initAttemptedRef.current) {
      console.log('[CodeTerminal] xterm is ready, initializing PTY');
      initAttemptedRef.current = true;
      initializeTerminal();
    }
  }, [isReady, initializeTerminal]);

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

  // Run solution against tests (combined Run functionality)
  const handleRun = async () => {
    if (!window.electronAPI) {
      writeln('\x1b[31mElectron API not available\x1b[0m');
      return;
    }

    if (!isConnected || !terminalId) {
      writeln('\x1b[31mTerminal not connected\x1b[0m');
      return;
    }

    setIsRunning(true);

    try {
      // Save the editor content first (if available)
      if (requestSave) {
        await requestSave();
      }

      // Run python3 on solution.py (use \r for PTY execution)
      const command = `cd "${WORKING_DIR}" && python3 solution.py\r`;
      await window.electronAPI.terminal.write(terminalId, command);

      // Reset running state after a delay
      setTimeout(() => setIsRunning(false), 2000);

    } catch (error) {
      writeln('\x1b[31mError: ' + error.message + '\x1b[0m');
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    clear();
    if (isConnected) {
      writeln('\x1b[32mTerminal ready\x1b[0m');
      writeln('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)]">
      <div className="flex-1 overflow-hidden">
        <div ref={containerRef} className="h-full w-full" />
      </div>
      {/* Status bar */}
      <div className="h-7 border-t border-[var(--border-color)] flex items-center justify-between px-2 bg-[var(--bg-tertiary)] text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <span className="text-[var(--text-secondary)]">
            {isConnected ? 'Terminal Ready' : 'Disconnected'}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning || !isConnected}
            className="px-2 py-0.5 rounded bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white"
            title="Run solution against tests"
          >
            {isRunning ? 'Running...' : 'Run'}
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

export default CodeTerminal;
