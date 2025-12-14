import React from 'react';
import { ThemeProvider } from './hooks/useTheme';
import { StatsProvider } from './hooks/useStats';
import { SessionProvider } from './hooks/useSession';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <StatsProvider>
        <SessionProvider>
          <Layout />
        </SessionProvider>
      </StatsProvider>
    </ThemeProvider>
  );
}

export default App;
