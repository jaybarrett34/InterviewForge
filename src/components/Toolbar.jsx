import React, { useState } from 'react';
import { useSession } from '../hooks/useSession';
import { useStats } from '../hooks/useStats';
import StatsModal from './StatsModal';

const Toolbar = () => {
  const { submitSolution, currentProblem, startNewSession } = useSession();
  const { addSession } = useStats();
  const [showStats, setShowStats] = useState(false);

  const handleSubmit = async () => {
    const confirmed = window.confirm(
      'Submit your solution? This will end the current session and save your results.'
    );

    if (confirmed) {
      try {
        // Archive the session
        if (window.electronAPI) {
          await window.electronAPI.session.archive();
        }

        const sessionData = submitSolution();
        addSession(sessionData);

        alert(
          `Solution submitted!\n\n` +
          `Time taken: ${Math.floor((sessionData.duration || 0) / 60)}m ${Math.floor((sessionData.duration || 0) % 60)}s\n` +
          `Hints used: ${sessionData.hintsUsed || 0}\n` +
          `Tests passed: ${sessionData.testResults?.passed || 0}/${sessionData.testResults?.total || 0}`
        );
      } catch (error) {
        console.error('Failed to submit:', error);
        alert('Failed to archive session: ' + error.message);
      }
    }
  };

  const handleNewProblem = async () => {
    const confirmed = window.confirm(
      'Start a new problem?\n\n' +
      'This will clear your current solution.\n' +
      'Use the Claude Code terminal to generate a new problem after clicking OK.'
    );

    if (confirmed) {
      try {
        // Clear the working directory
        if (window.electronAPI) {
          await window.electronAPI.session.clear();
        }

        // Reset session state
        startNewSession(null);

        // Reload the page to reset editor
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear session:', error);
        alert('Failed to clear session: ' + error.message);
      }
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSubmit}
          className="px-3 py-1 text-sm rounded bg-purple-600 hover:bg-purple-700 text-white"
          title="Submit solution"
        >
          Submit
        </button>

        <button
          onClick={handleNewProblem}
          className="px-3 py-1 text-sm rounded bg-gray-600 hover:bg-gray-700 text-white"
          title="Generate new problem"
        >
          New Problem
        </button>

        <div className="w-px h-6 bg-[var(--border-color)]" />

        <button
          onClick={() => setShowStats(true)}
          className="px-3 py-1 text-sm rounded bg-gray-600 hover:bg-gray-700 text-white"
          title="View statistics"
        >
          Stats
        </button>
      </div>

      {/* Stats Modal */}
      {showStats && (
        <StatsModal onClose={() => setShowStats(false)} />
      )}
    </>
  );
};

export default Toolbar;
