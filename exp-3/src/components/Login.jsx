import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const DEMO_ACCOUNTS = [
  { role: 'admin', username: 'admin', password: 'Admin@123', label: 'Full access: create, update, delete, view' },
  { role: 'editor', username: 'editor', password: 'Editor@123', label: 'Can view and update posts' },
  { role: 'viewer', username: 'viewer', password: 'Viewer@123', label: 'Can only view posts' },
];

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password); // bcrypt compare + JWT sign happen inside this call
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(account) {
    setUsername(account.username);
    setPassword(account.password);
    setError('');
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Social Handle Login</h1>
        <p className="subtitle">Role-based access secured with JWT (frontend-only simulation)</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="demo-creds">
          <p>Demo accounts (click to autofill)</p>
          {DEMO_ACCOUNTS.map((acc) => (
            <div className="demo-cred-row" key={acc.role} onClick={() => fillDemo(acc)}>
              <span>
                <strong>{acc.username}</strong> / {acc.password}
              </span>
              <span className={`role-tag ${acc.role}`}>{acc.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
