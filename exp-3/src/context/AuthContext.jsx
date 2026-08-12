import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import bcrypt from 'bcryptjs';
import { findUserByUsername } from '../data/users';
import { signToken, verifyToken } from '../utils/jwt';

const AuthContext = createContext(null);
const TOKEN_KEY = 'jwt_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // On first load, try to restore the session from a token in localStorage —
  // but only if it still verifies (signature valid + not expired).
  useEffect(() => {
    (async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        try {
          const decoded = await verifyToken(storedToken);
          setToken(storedToken);
          setUser(decoded);
        } catch {
          localStorage.removeItem(TOKEN_KEY);
        }
      }
      setInitializing(false);
    })();
  }, []);

  /**
   * This function is the frontend-only stand-in for what
   * `POST /api/auth/login` did on the Express backend:
   *   1. Look up the user
   *   2. Compare the password against the bcrypt hash
   *   3. Sign a JWT containing their id/username/role/name
   * It's async because both bcrypt.compare and signToken use the
   * (async) Web Crypto API under the hood.
   */
  const login = useCallback(async (username, password) => {
    const user = findUserByUsername(username);
    if (!user) {
      throw new Error('Invalid username or password.');
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid username or password.');
    }

    const payload = { id: user.id, username: user.username, role: user.role, name: user.name };
    const newToken = await signToken(payload, 3600); // 1 hour, same as the backend version

    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(payload);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    token,
    user,
    isAuthenticated: !!token && !!user,
    initializing,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
