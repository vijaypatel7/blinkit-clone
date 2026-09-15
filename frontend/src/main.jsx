import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App.jsx';
import './assets/global.css';

/**
 * Application entry point.
 *
 * We mount once and let React handle everything. The Redux store, router and
 * theme providers are wired up inside <App />.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
