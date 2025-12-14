import React, { useMemo } from 'react';
import { useStats } from '../hooks/useStats';

const StatsModal = ({ onClose }) => {
  const { getStats, clearStats } = useStats();
  const stats = useMemo(() => getStats(), [getStats]);

  const handleClose = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClearStats = () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all statistics? This cannot be undone.'
    );
    if (confirmed) {
      clearStats();
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content">
        {/* Header */}
        <div className="panel-header flex justify-between items-center">
          <h2 className="text-xl font-bold">Performance Statistics</h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none hover:text-[var(--accent-primary)] transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {stats.totalSessions === 0 ? (
            <div className="text-center py-12 text-[var(--text-secondary)]">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="text-lg mb-2">No statistics yet</p>
              <p className="text-sm">Complete some problems to see your performance</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview */}
              <section>
                <h3 className="text-lg font-semibold mb-3">Overview</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-[var(--bg-secondary)] rounded text-center">
                    <div className="text-3xl font-bold text-[var(--accent-primary)]">
                      {stats.totalSessions}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] mt-1">
                      Total Sessions
                    </div>
                  </div>
                  <div className="p-4 bg-[var(--bg-secondary)] rounded text-center">
                    <div className="text-3xl font-bold text-[var(--success)]">
                      {stats.passRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] mt-1">
                      Pass Rate
                    </div>
                  </div>
                  <div className="p-4 bg-[var(--bg-secondary)] rounded text-center">
                    <div className="text-3xl font-bold">
                      {formatDuration(stats.averageTime)}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] mt-1">
                      Avg Time
                    </div>
                  </div>
                </div>
              </section>

              {/* Difficulty Performance */}
              <section>
                <h3 className="text-lg font-semibold mb-3">Performance by Difficulty</h3>
                <div className="space-y-3">
                  {Object.entries(stats.difficultyPerformance).map(([difficulty, data]) => {
                    const rate = data.total > 0 ? (data.passed / data.total) * 100 : 0;
                    return (
                      <div key={difficulty} className="p-3 bg-[var(--bg-secondary)] rounded">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{difficulty}</span>
                          <span className="text-sm text-[var(--text-secondary)]">
                            {data.passed} / {data.total} passed ({rate.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              rate === 100
                                ? 'bg-green-500'
                                : rate >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Category Performance */}
              {Object.keys(stats.categoryPerformance).length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold mb-3">Performance by Category</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(stats.categoryPerformance)
                      .sort((a, b) => b[1].total - a[1].total)
                      .map(([category, data]) => {
                        const rate = data.total > 0 ? (data.passed / data.total) * 100 : 0;
                        return (
                          <div
                            key={category}
                            className="flex items-center justify-between p-2 bg-[var(--bg-secondary)] rounded"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm">{category}</div>
                              <div className="text-xs text-[var(--text-secondary)]">
                                {data.passed} / {data.total} passed
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-[var(--bg-tertiary)] rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="h-full bg-[var(--accent-primary)]"
                                  style={{ width: `${rate}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium w-12 text-right">
                                {rate.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </section>
              )}

              {/* Weak Areas */}
              {stats.weakAreas.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    Areas for Improvement
                    <span className="text-sm font-normal text-[var(--text-secondary)]">
                      (Categories with pass rate below 60%)
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {stats.weakAreas.map((area) => (
                      <div
                        key={area.category}
                        className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-red-900 dark:text-red-200">
                            {area.category}
                          </span>
                          <span className="text-sm text-red-700 dark:text-red-300">
                            {area.passRate.toFixed(1)}% pass rate ({area.total} problems)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Recent Sessions */}
              <section>
                <h3 className="text-lg font-semibold mb-3">Recent Sessions</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {stats.recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 rounded border ${
                        session.passed
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-2">
                            <span>{session.passed ? '✓' : '✗'}</span>
                            <span>{session.problemTitle}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                session.difficulty === 'Easy'
                                  ? 'badge-easy'
                                  : session.difficulty === 'Medium'
                                  ? 'badge-medium'
                                  : 'badge-hard'
                              }`}
                            >
                              {session.difficulty}
                            </span>
                          </div>
                          <div className="text-sm text-[var(--text-secondary)] mt-1">
                            {formatDate(session.timestamp)} • {formatDuration(session.duration)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border-color)] p-4 flex justify-between">
          {stats.totalSessions > 0 && (
            <button
              onClick={handleClearStats}
              className="btn btn-danger"
            >
              Clear All Stats
            </button>
          )}
          <button
            onClick={onClose}
            className="btn btn-primary ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
