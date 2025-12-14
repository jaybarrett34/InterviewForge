import React, { useState, useEffect, useRef } from 'react';

const Timer = ({ defaultDuration = 45 * 60, mode = 'countdown' }) => {
  const [duration, setDuration] = useState(defaultDuration); // Total duration in seconds
  const [timeLeft, setTimeLeft] = useState(defaultDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [pausedTime, setPausedTime] = useState(0);
  const animationFrameRef = useRef(null);

  // Use performance.now() for accuracy
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const updateTimer = () => {
      const now = performance.now();
      const elapsed = (now - startTime - pausedTime) / 1000;

      if (mode === 'countdown') {
        const remaining = Math.max(0, duration - elapsed);
        setTimeLeft(remaining);

        if (remaining === 0) {
          setIsRunning(false);
          // Timer finished
          playAlertSound();
        }
      } else {
        // Count-up mode
        setTimeLeft(elapsed);
      }

      animationFrameRef.current = requestAnimationFrame(updateTimer);
    };

    animationFrameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, isPaused, startTime, pausedTime, duration, mode]);

  const playAlertSound = () => {
    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleStart = () => {
    if (!isRunning) {
      setStartTime(performance.now());
      setPausedTime(0);
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    if (isRunning && !isPaused) {
      setIsPaused(true);
      const now = performance.now();
      setPausedTime(now - startTime);
    }
  };

  const handleResume = () => {
    if (isPaused) {
      const now = performance.now();
      setStartTime(now - pausedTime);
      setIsPaused(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(duration);
    setStartTime(null);
    setPausedTime(0);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWarningLevel = () => {
    if (mode !== 'countdown') return 'normal';

    const minutesLeft = timeLeft / 60;

    if (minutesLeft <= 1) return 'critical';
    if (minutesLeft <= 5) return 'urgent';
    if (minutesLeft <= 10) return 'warning';
    return 'normal';
  };

  const warningLevel = getWarningLevel();

  const timerColors = {
    normal: 'text-[var(--text-primary)]',
    warning: 'text-yellow-500',
    urgent: 'text-orange-500',
    critical: 'text-red-500 animate-pulse'
  };

  const timerBgColors = {
    normal: 'bg-[var(--bg-tertiary)]',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30',
    urgent: 'bg-orange-100 dark:bg-orange-900/30',
    critical: 'bg-red-100 dark:bg-red-900/30'
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded ${timerBgColors[warningLevel]}`}>
      <div className={`text-2xl font-mono font-bold ${timerColors[warningLevel]}`}>
        {formatTime(timeLeft)}
      </div>

      <div className="flex gap-2">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="btn btn-sm btn-success"
            title="Start timer"
          >
            Start
          </button>
        ) : isPaused ? (
          <button
            onClick={handleResume}
            className="btn btn-sm btn-primary"
            title="Resume timer"
          >
            Resume
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="btn btn-sm btn-secondary"
            title="Pause timer"
          >
            Pause
          </button>
        )}

        <button
          onClick={handleReset}
          className="btn btn-sm btn-secondary"
          title="Reset timer"
        >
          Reset
        </button>
      </div>

      {warningLevel !== 'normal' && (
        <div className="flex items-center gap-1 text-sm">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className={timerColors[warningLevel]}>
            {warningLevel === 'critical' && 'Time almost up!'}
            {warningLevel === 'urgent' && '5 minutes left'}
            {warningLevel === 'warning' && '10 minutes left'}
          </span>
        </div>
      )}
    </div>
  );
};

export default Timer;
