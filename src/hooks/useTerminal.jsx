import { useEffect, useRef, useCallback, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';

export const useTerminal = ({ onData, onResize, theme = 'dark' }) => {
  const terminalRef = useRef(null);
  const fitAddonRef = useRef(null);
  const containerRef = useRef(null);
  const onDataRef = useRef(onData);
  const onResizeRef = useRef(onResize);
  const [isReady, setIsReady] = useState(false);

  // Keep refs updated
  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  const initTerminal = useCallback(() => {
    console.log('[useTerminal] initTerminal called', {
      hasContainer: !!containerRef.current,
      hasTerminal: !!terminalRef.current,
      containerSize: containerRef.current ? {
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      } : null
    });

    if (!containerRef.current || terminalRef.current) {
      console.log('[useTerminal] Skipping init - container missing or terminal exists');
      return;
    }

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Fira Code, Consolas, Monaco, monospace',
      theme: theme === 'dark' ? {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5'
      } : {
        background: '#ffffff',
        foreground: '#1a1a1a',
        cursor: '#1a1a1a',
        black: '#000000',
        red: '#cd3131',
        green: '#00bc00',
        yellow: '#949800',
        blue: '#0451a5',
        magenta: '#bc05bc',
        cyan: '#0598bc',
        white: '#555555',
        brightBlack: '#666666',
        brightRed: '#cd3131',
        brightGreen: '#14ce14',
        brightYellow: '#b5ba00',
        brightBlue: '#0451a5',
        brightMagenta: '#bc05bc',
        brightCyan: '#0598bc',
        brightWhite: '#a5a5a5'
      },
      allowProposedApi: true,
      scrollback: 1000,
      convertEol: true
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(new WebLinksAddon());

    console.log('[useTerminal] Opening terminal in container');
    terminal.open(containerRef.current);

    console.log('[useTerminal] Fitting terminal');
    fitAddon.fit();

    console.log('[useTerminal] Terminal dimensions after fit:', {
      cols: terminal.cols,
      rows: terminal.rows
    });

    // Use ref to avoid dependency on onData changing
    terminal.onData((data) => {
      if (onDataRef.current) {
        onDataRef.current(data);
      }
    });

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Mark terminal as ready and auto-focus
    setIsReady(true);
    terminal.focus();

    const handleResize = () => {
      if (fitAddonRef.current && terminalRef.current) {
        try {
          fitAddonRef.current.fit();
          const { cols, rows } = terminalRef.current;
          console.log('[useTerminal] Terminal resized to:', cols, 'x', rows);
          if (onResizeRef.current) {
            onResizeRef.current(cols, rows);
          }
        } catch (err) {
          console.error('Error fitting terminal:', err);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      console.log('[useTerminal] Cleanup - disposing terminal');
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
      setIsReady(false);
    };
  }, [theme]); // Only reinit if theme changes, not onData

  useEffect(() => {
    // Small delay to ensure container is fully mounted in DOM
    const timer = setTimeout(() => {
      initTerminal();
    }, 50);

    return () => {
      clearTimeout(timer);
      // Cleanup terminal if it was created
      if (terminalRef.current) {
        terminalRef.current.dispose();
        terminalRef.current = null;
        fitAddonRef.current = null;
        setIsReady(false);
      }
    };
  }, [initTerminal]);

  const write = useCallback((data) => {
    if (terminalRef.current) {
      terminalRef.current.write(data);
    }
  }, []);

  const writeln = useCallback((data) => {
    if (terminalRef.current) {
      terminalRef.current.writeln(data);
    }
  }, []);

  const clear = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.clear();
    }
  }, []);

  const focus = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.focus();
    }
  }, []);

  const fit = useCallback(() => {
    if (fitAddonRef.current) {
      try {
        fitAddonRef.current.fit();
      } catch (err) {
        console.error('Error fitting terminal:', err);
      }
    }
  }, []);

  // Add click handler to ensure focus on container click
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = () => {
      if (terminalRef.current) {
        terminalRef.current.focus();
      }
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, []);

  // Return terminalRef instead of terminalRef.current so it stays updated
  return {
    containerRef,
    terminal: terminalRef.current,
    terminalRef, // Also expose the ref itself
    write,
    writeln,
    clear,
    focus,
    fit,
    isReady
  };
};
