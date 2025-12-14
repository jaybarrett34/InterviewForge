import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'xterm/css/xterm.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
// StrictMode disabled - causes issues with xterm double-mounting
root.render(<App />);
