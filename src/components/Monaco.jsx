import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import { useTheme } from '../hooks/useTheme';
import { useSession } from '../hooks/useSession';
import { DEFAULT_TEMPLATE } from '../utils/solutionTemplate';

const Monaco = () => {
  const { theme } = useTheme();
  const { code, updateCode, registerSaveCallback } = useSession();
  const containerRef = useRef(null);
  const monacoInstanceRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const fileWatcherRef = useRef(null);
  const lastSavedContentRef = useRef('');
  const [solutionPath, setSolutionPath] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Get the solution file path and ensure it exists
  useEffect(() => {
    const initializePath = async () => {
      if (!window.electronAPI) return;

      try {
        // Use the project root directly
        const projectRoot = '/Users/bigballsinyourjaws/Interview/interviewforge';
        const workingDir = `${projectRoot}/working`;
        const path = `${workingDir}/solution.py`;

        setSolutionPath(path);

        // Ensure working directory exists
        await window.electronAPI.fs.mkdir(workingDir);

        // Check if solution.py exists, if not create with default template
        const existsResult = await window.electronAPI.fs.exists(path);
        if (!existsResult.exists) {
          await window.electronAPI.fs.writeFile(path, DEFAULT_TEMPLATE);
          lastSavedContentRef.current = DEFAULT_TEMPLATE;
        }
      } catch (error) {
        console.error('Failed to initialize solution path:', error);
      }
    };

    initializePath();
  }, []);

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current || monacoInstanceRef.current) return;

    const editor = monaco.editor.create(containerRef.current, {
      value: code || DEFAULT_TEMPLATE,
      language: 'python',
      theme: theme === 'dark' ? 'vs-dark' : 'vs',
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Fira Code, Consolas, Monaco, monospace',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 4,
      insertSpaces: true,
      wordWrap: 'on',
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      suggest: { snippetsPreventQuickSuggestions: false },
      quickSuggestions: { other: true, comments: false, strings: false },
      parameterHints: { enabled: true },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: 'on',
      snippetSuggestions: 'top',
      padding: { top: 10, bottom: 10 }
    });

    monacoInstanceRef.current = editor;

    // Listen for content changes
    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce save by 1 second
      saveTimeoutRef.current = setTimeout(() => {
        updateCode(value);
        saveToFile(value);
      }, 1000);
    });

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      editor.layout();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      editor.dispose();
      monacoInstanceRef.current = null;
    };
  }, []);

  // Update theme
  useEffect(() => {
    if (monacoInstanceRef.current) {
      monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
    }
  }, [theme]);

  // Load initial file content
  useEffect(() => {
    const loadFile = async () => {
      if (!solutionPath || !window.electronAPI) return;

      try {
        const existsResult = await window.electronAPI.fs.exists(solutionPath);
        if (existsResult.exists) {
          const result = await window.electronAPI.fs.readFile(solutionPath);
          if (result.success && result.content && monacoInstanceRef.current) {
            const currentValue = monacoInstanceRef.current.getValue();
            if (currentValue !== result.content) {
              monacoInstanceRef.current.setValue(result.content);
              updateCode(result.content);
              lastSavedContentRef.current = result.content;
            }
          }
        }
      } catch (error) {
        console.error('Failed to load file:', error);
      }
    };

    loadFile();
  }, [solutionPath, updateCode]);

  // File watcher for external changes
  useEffect(() => {
    if (!solutionPath || !window.electronAPI) return;

    const watchFile = async () => {
      try {
        const existsResult = await window.electronAPI.fs.exists(solutionPath);
        if (!existsResult.exists) return;

        const result = await window.electronAPI.fs.readFile(solutionPath);
        if (result.success && result.content && monacoInstanceRef.current) {
          // Only update if content differs from what we last saved
          if (result.content !== lastSavedContentRef.current && !isSaving) {
            const currentValue = monacoInstanceRef.current.getValue();
            if (currentValue !== result.content) {
              monacoInstanceRef.current.setValue(result.content);
              updateCode(result.content);
              lastSavedContentRef.current = result.content;
            }
          }
        }
      } catch (error) {
        // File might not exist yet, that's okay
      }
    };

    // Poll for file changes every 2 seconds
    fileWatcherRef.current = setInterval(watchFile, 2000);

    return () => {
      if (fileWatcherRef.current) {
        clearInterval(fileWatcherRef.current);
      }
    };
  }, [solutionPath, updateCode, isSaving]);

  const saveToFile = useCallback(async (content) => {
    if (!solutionPath || !window.electronAPI) return;

    setIsSaving(true);
    try {
      const result = await window.electronAPI.fs.writeFile(solutionPath, content);
      if (result.success) {
        lastSavedContentRef.current = content;
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [solutionPath]);

  // Immediate save function - called before running tests
  const saveNow = useCallback(async () => {
    if (!monacoInstanceRef.current || !solutionPath || !window.electronAPI) return;

    // Clear any pending debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    const content = monacoInstanceRef.current.getValue();
    await saveToFile(content);
    updateCode(content);
  }, [solutionPath, saveToFile, updateCode]);

  // Register the save callback with session context
  useEffect(() => {
    if (registerSaveCallback) {
      registerSaveCallback(saveNow);
      return () => registerSaveCallback(null);
    }
  }, [registerSaveCallback, saveNow]);

  const handleFormat = () => {
    if (monacoInstanceRef.current) {
      monacoInstanceRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  const handleUndo = () => {
    if (monacoInstanceRef.current) {
      monacoInstanceRef.current.trigger('keyboard', 'undo', null);
    }
  };

  const handleRedo = () => {
    if (monacoInstanceRef.current) {
      monacoInstanceRef.current.trigger('keyboard', 'redo', null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Editor toolbar */}
      <div className="h-8 flex items-center justify-between px-3 bg-[var(--bg-tertiary)] border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <button
              onClick={handleUndo}
              className="px-2 py-0.5 text-xs hover:bg-[var(--bg-secondary)] rounded text-[var(--text-secondary)]"
              title="Undo (Cmd+Z)"
            >
              ↶ Undo
            </button>
            <button
              onClick={handleRedo}
              className="px-2 py-0.5 text-xs hover:bg-[var(--bg-secondary)] rounded text-[var(--text-secondary)]"
              title="Redo (Cmd+Shift+Z)"
            >
              ↷ Redo
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          {isSaving && <span className="text-yellow-500">Saving...</span>}
          {lastSaved && !isSaving && (
            <span>Saved {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      {/* Monaco editor container */}
      <div ref={containerRef} className="flex-1" />
    </div>
  );
};

export default Monaco;
