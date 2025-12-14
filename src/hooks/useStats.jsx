import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const StatsContext = createContext();

const STORAGE_KEY = 'interviewforge-stats';

export const StatsProvider = ({ children }) => {
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const addSession = useCallback((sessionData) => {
    setSessions(prev => [...prev, {
      ...sessionData,
      id: Date.now(),
      timestamp: new Date().toISOString()
    }]);
  }, []);

  const getStats = useCallback(() => {
    const totalSessions = sessions.length;

    if (totalSessions === 0) {
      return {
        totalSessions: 0,
        passRate: 0,
        averageTime: 0,
        categoryPerformance: {},
        difficultyPerformance: {},
        recentSessions: [],
        weakAreas: []
      };
    }

    const passedSessions = sessions.filter(s =>
      s.testResults?.passed === s.testResults?.total
    );
    const passRate = (passedSessions.length / totalSessions) * 100;

    const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const averageTime = totalTime / totalSessions;

    const categoryPerformance = {};
    const difficultyPerformance = {
      Easy: { total: 0, passed: 0 },
      Medium: { total: 0, passed: 0 },
      Hard: { total: 0, passed: 0 }
    };

    sessions.forEach(session => {
      const category = session.problem?.category || 'Unknown';
      const difficulty = session.problem?.difficulty || 'Medium';
      const passed = session.testResults?.passed === session.testResults?.total;

      if (!categoryPerformance[category]) {
        categoryPerformance[category] = { total: 0, passed: 0 };
      }
      categoryPerformance[category].total++;
      if (passed) {
        categoryPerformance[category].passed++;
      }

      if (difficultyPerformance[difficulty]) {
        difficultyPerformance[difficulty].total++;
        if (passed) {
          difficultyPerformance[difficulty].passed++;
        }
      }
    });

    const weakAreas = Object.entries(categoryPerformance)
      .map(([category, stats]) => ({
        category,
        passRate: stats.total > 0 ? (stats.passed / stats.total) * 100 : 0,
        total: stats.total
      }))
      .filter(area => area.total >= 2 && area.passRate < 60)
      .sort((a, b) => a.passRate - b.passRate);

    const recentSessions = sessions
      .slice(-10)
      .reverse()
      .map(s => ({
        id: s.id,
        problemTitle: s.problem?.title || 'Unknown',
        difficulty: s.problem?.difficulty || 'Medium',
        duration: s.duration,
        passed: s.testResults?.passed === s.testResults?.total,
        timestamp: s.timestamp
      }));

    return {
      totalSessions,
      passRate,
      averageTime,
      categoryPerformance,
      difficultyPerformance,
      recentSessions,
      weakAreas
    };
  }, [sessions]);

  const clearStats = useCallback(() => {
    setSessions([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <StatsContext.Provider value={{
      sessions,
      addSession,
      getStats,
      clearStats
    }}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = () => {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within StatsProvider');
  }
  return context;
};
