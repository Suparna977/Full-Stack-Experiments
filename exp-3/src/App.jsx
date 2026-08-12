import React from 'react';
import { useAuth } from './context/AuthContext.jsx';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';

export default function App() {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return <div className="loader">Loading…</div>;
  }

  return <div className="app-shell">{isAuthenticated ? <Dashboard /> : <Login />}</div>;
}
