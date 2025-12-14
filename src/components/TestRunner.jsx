import React, { useState } from 'react';
import { useSession } from '../hooks/useSession';

const TestRunner = () => {
  const { testResults } = useSession();
  const [expandedTests, setExpandedTests] = useState([]);

  const toggleTest = (testName) => {
    setExpandedTests(prev =>
      prev.includes(testName)
        ? prev.filter(t => t !== testName)
        : [...prev, testName]
    );
  };

  if (!testResults) {
    return (
      <div className="h-full flex flex-col bg-[var(--bg-secondary)]">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-[var(--text-secondary)]">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <p className="text-lg mb-2">No test results yet</p>
            <p className="text-sm">Run tests to see results here</p>
          </div>
        </div>
      </div>
    );
  }

  const passRate = testResults.total > 0
    ? ((testResults.passed / testResults.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="h-full flex flex-col bg-[var(--bg-secondary)]">
      {/* Summary header */}
      <div className="p-4 bg-[var(--bg-tertiary)] border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Test Results</h3>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-[var(--success)] font-semibold">
                {testResults.passed}
              </span>
              <span className="text-[var(--text-secondary)]"> / </span>
              <span className="font-semibold">{testResults.total}</span>
              <span className="text-[var(--text-secondary)] ml-1">passed</span>
            </div>
            <div
              className={`px-3 py-1 rounded font-semibold ${
                passRate === 100
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : passRate >= 50
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {passRate}%
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-[var(--success)] transition-all duration-300"
            style={{ width: `${passRate}%` }}
          />
        </div>

        {/* Execution time */}
        {testResults.executionTime && (
          <div className="mt-2 text-sm text-[var(--text-secondary)]">
            Total execution time: {testResults.executionTime}ms
          </div>
        )}
      </div>

      {/* Test cases list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {testResults.tests && testResults.tests.map((test, idx) => (
            <div
              key={idx}
              className="border border-[var(--border-color)] rounded overflow-hidden"
            >
              <button
                onClick={() => toggleTest(test.name)}
                className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                  test.passed
                    ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                    : 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xl">
                    {test.passed ? (
                      <span className="text-[var(--success)]">✓</span>
                    ) : (
                      <span className="text-[var(--error)]">✗</span>
                    )}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{test.name}</div>
                    {test.executionTime && (
                      <div className="text-xs text-[var(--text-secondary)] mt-1">
                        {test.executionTime}ms
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs text-[var(--text-secondary)]">
                  {expandedTests.includes(test.name) ? '▼' : '▶'}
                </span>
              </button>

              {expandedTests.includes(test.name) && (
                <div className="p-4 bg-[var(--bg-primary)] border-t border-[var(--border-color)]">
                  {test.passed ? (
                    <div className="text-sm text-[var(--success)]">
                      Test passed successfully
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {test.error && (
                        <div>
                          <div className="text-sm font-semibold text-[var(--error)] mb-1">
                            Error:
                          </div>
                          <pre className="text-xs bg-[var(--bg-tertiary)] p-3 rounded overflow-x-auto">
                            {test.error}
                          </pre>
                        </div>
                      )}
                      {test.traceback && (
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-secondary)] mb-1">
                            Traceback:
                          </div>
                          <pre className="text-xs bg-[var(--bg-tertiary)] p-3 rounded overflow-x-auto text-[var(--text-secondary)]">
                            {test.traceback}
                          </pre>
                        </div>
                      )}
                      {test.expected !== undefined && test.actual !== undefined && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-sm font-semibold text-[var(--text-secondary)] mb-1">
                              Expected:
                            </div>
                            <pre className="text-xs bg-[var(--bg-tertiary)] p-3 rounded overflow-x-auto">
                              {JSON.stringify(test.expected, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[var(--text-secondary)] mb-1">
                              Actual:
                            </div>
                            <pre className="text-xs bg-[var(--bg-tertiary)] p-3 rounded overflow-x-auto">
                              {JSON.stringify(test.actual, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestRunner;
