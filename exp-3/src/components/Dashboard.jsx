import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import PostList from './PostList.jsx';
import TokenInspector from './TokenInspector.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';
  const [showToken, setShowToken] = useState(false);

  return (
    <div>
      <div className="topbar">
        <div className="topbar-left">
          <h2>📣 Social Handle</h2>
        </div>
        <div className="user-chip">
          <button className="btn-logout" onClick={() => setShowToken((s) => !s)}>
            {showToken ? 'Hide' : 'Inspect'} JWT
          </button>
          <div className="avatar">{initial}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{user?.name}</div>
            <span className={`role-tag ${user?.role}`}>{user?.role}</span>
          </div>
          <button className="btn-logout" onClick={logout}>
            Log out
          </button>
        </div>
      </div>
      {showToken && <TokenInspector />}
      <PostList />
    </div>
  );
}
