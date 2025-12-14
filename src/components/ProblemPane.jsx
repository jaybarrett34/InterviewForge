import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { parseProblemMarkdown } from '../utils/problemParser';

// Hardcoded paths - match electron/main.js
const PROJECT_ROOT = '/Users/bigballsinyourjaws/Interview/interviewforge';
const WORKING_DIR = `${PROJECT_ROOT}/working`;
const PROBLEM_PATH = `${WORKING_DIR}/problem.md`;

const ProblemPane = () => {
  const [currentProblem, setCurrentProblem] = useState(null);
  const [hintsViewed, setHintsViewed] = useState([]);
  const [expandedHints, setExpandedHints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileWatcherRef = useRef(null);
  const lastContentRef = useRef('');

  // Load problem.md and watch for changes
  useEffect(() => {
    const loadProblem = async () => {
      if (!window.electronAPI) {
        setIsLoading(false);
        return;
      }

      try {
        const existsResult = await window.electronAPI.fs.exists(PROBLEM_PATH);
        if (existsResult.exists) {
          const result = await window.electronAPI.fs.readFile(PROBLEM_PATH);
          if (result.success && result.content) {
            // Only update if content changed
            if (result.content !== lastContentRef.current) {
              lastContentRef.current = result.content;
              const parsed = parseProblemMarkdown(result.content);
              if (parsed) {
                setCurrentProblem(parsed);
                setHintsViewed([]); // Reset hints when new problem loads
                setExpandedHints([]);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load problem.md:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load
    loadProblem();

    // Poll for file changes every 2 seconds
    fileWatcherRef.current = setInterval(loadProblem, 2000);

    return () => {
      if (fileWatcherRef.current) {
        clearInterval(fileWatcherRef.current);
      }
    };
  }, []);

  const toggleHint = (index) => {
    if (!expandedHints.includes(index)) {
      setExpandedHints([...expandedHints, index]);
      if (!hintsViewed.includes(index)) {
        setHintsViewed([...hintsViewed, index]);
      }
    } else {
      setExpandedHints(expandedHints.filter(i => i !== index));
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'badge-easy';
      case 'Medium':
        return 'badge-medium';
      case 'Hard':
        return 'badge-hard';
      default:
        return 'badge-medium';
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-[var(--bg-secondary)]">
        <div className="panel-header">
          <span>Problem</span>
        </div>
        <div className="flex-1 p-4 text-sm text-[var(--text-secondary)] flex items-center justify-center">
          Loading...
        </div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="h-full flex flex-col bg-[var(--bg-secondary)]">
        <div className="panel-header">
          <span>Problem</span>
        </div>
        <div className="flex-1 p-4 text-sm text-[var(--text-secondary)]">
          <p className="mb-4 font-medium text-[var(--text-primary)]">No problem loaded</p>
          <p className="mb-3">Use Claude Code (right terminal) to generate a problem:</p>
          <div className="space-y-2 text-xs bg-[var(--bg-tertiary)] p-3 rounded">
            <p><code className="text-green-400">/new</code> - Random problem</p>
            <p><code className="text-green-400">/new arrays</code> - Specific category</p>
            <p><code className="text-green-400">/new dynamic_programming</code> - DP problem</p>
          </div>
          <p className="mt-4 text-xs">Categories: arrays, strings, hash_maps, trees, graphs, dynamic_programming, linked_lists, sorting, searching</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[var(--bg-secondary)]">
      {/* Header */}
      <div className="panel-header">
        <span>Problem</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Title and metadata */}
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">{currentProblem.title}</h2>
          <div className="flex flex-wrap gap-2">
            <span className={`badge ${getDifficultyColor(currentProblem.difficulty)}`}>
              {currentProblem.difficulty}
            </span>
            {currentProblem.timeEstimate && (
              <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {currentProblem.timeEstimate} min
              </span>
            )}
            {currentProblem.company && (
              <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                {currentProblem.company}
              </span>
            )}
            {currentProblem.category && (
              <span className="badge bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {currentProblem.category}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Description</h3>
          <div className="markdown-content text-sm">
            <ReactMarkdown>{currentProblem.description}</ReactMarkdown>
          </div>
        </div>

        {/* Examples */}
        {currentProblem.examples && currentProblem.examples.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Examples</h3>
            {currentProblem.examples.map((example, idx) => (
              <div key={idx} className="mb-3 p-3 bg-[var(--bg-tertiary)] rounded text-sm">
                <div className="mb-1">
                  <span className="font-semibold">Input:</span>
                  <code className="ml-2">{example.input}</code>
                </div>
                <div className="mb-1">
                  <span className="font-semibold">Output:</span>
                  <code className="ml-2">{example.output}</code>
                </div>
                {example.explanation && (
                  <div className="mt-2 text-[var(--text-secondary)]">
                    <span className="font-semibold">Explanation:</span> {example.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Constraints */}
        {currentProblem.constraints && currentProblem.constraints.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Constraints</h3>
            <ul className="list-disc list-inside text-sm text-[var(--text-secondary)]">
              {currentProblem.constraints.map((constraint, idx) => (
                <li key={idx}>{constraint}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Hints */}
        {currentProblem.hints && currentProblem.hints.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">
              Hints ({hintsViewed.length}/{currentProblem.hints.length} viewed)
            </h3>
            <div className="space-y-2">
              {currentProblem.hints.map((hint, idx) => (
                <div key={idx} className="border border-[var(--border-color)] rounded overflow-hidden">
                  <button
                    onClick={() => toggleHint(idx)}
                    className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors ${
                      hintsViewed.includes(idx)
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                        : 'bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)]'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span>Hint {idx + 1}</span>
                      <span className="text-xs">
                        {expandedHints.includes(idx) ? '▼' : '▶'}
                      </span>
                    </span>
                  </button>
                  {expandedHints.includes(idx) && (
                    <div className="p-3 text-sm bg-[var(--bg-primary)] text-[var(--text-secondary)]">
                      {hint}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up questions */}
        {currentProblem.followUp && currentProblem.followUp.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Follow-up Questions</h3>
            <ul className="list-disc list-inside text-sm text-[var(--text-secondary)]">
              {currentProblem.followUp.map((question, idx) => (
                <li key={idx}>{question}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemPane;
