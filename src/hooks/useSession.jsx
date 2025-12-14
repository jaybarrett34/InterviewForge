import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [currentProblem, setCurrentProblem] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [hintsViewed, setHintsViewed] = useState([]);
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Save callback ref - Monaco registers its save function here
  const saveCallbackRef = useRef(null);

  const startNewSession = useCallback((problem) => {
    setCurrentProblem(problem);
    setSessionStartTime(performance.now());
    setHintsViewed([]);
    setCode(problem?.starterCode || '');
    setTestResults(null);
    setIsSubmitted(false);
  }, []);

  const viewHint = useCallback((hintIndex) => {
    setHintsViewed(prev => {
      if (!prev.includes(hintIndex)) {
        return [...prev, hintIndex];
      }
      return prev;
    });
  }, []);

  const updateCode = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  const updateTestResults = useCallback((results) => {
    setTestResults(results);
  }, []);

  const submitSolution = useCallback(() => {
    setIsSubmitted(true);
    const endTime = performance.now();
    const duration = sessionStartTime ? (endTime - sessionStartTime) / 1000 : 0;

    return {
      problem: currentProblem,
      duration,
      hintsUsed: hintsViewed.length,
      testResults,
      timestamp: new Date().toISOString()
    };
  }, [currentProblem, sessionStartTime, hintsViewed, testResults]);

  const getSessionDuration = useCallback(() => {
    if (!sessionStartTime) return 0;
    return (performance.now() - sessionStartTime) / 1000;
  }, [sessionStartTime]);

  // Register a save callback (called by Monaco)
  const registerSaveCallback = useCallback((callback) => {
    saveCallbackRef.current = callback;
  }, []);

  // Request immediate save (called by CodeTerminal before running)
  const requestSave = useCallback(async () => {
    if (saveCallbackRef.current) {
      await saveCallbackRef.current();
    }
  }, []);

  return (
    <SessionContext.Provider value={{
      currentProblem,
      sessionStartTime,
      hintsViewed,
      code,
      testResults,
      isSubmitted,
      startNewSession,
      viewHint,
      updateCode,
      updateTestResults,
      submitSolution,
      getSessionDuration,
      registerSaveCallback,
      requestSave
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};
