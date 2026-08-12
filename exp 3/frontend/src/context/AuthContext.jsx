import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

const TOKEN_KEY = 'jwt_token';

function isTokenExpired(decoded) {
  if (!decoded?.exp) return true;
  // exp is in seconds since epoch; Date.now() is in ms.
  return decoded.exp * 1000 < Date.now();
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // On first load, try to restore session from a token stored in localStorage.
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        if (!isTokenExpired(decoded)) {
          setToken(storedToken);
          setUser(decoded);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setInitializing(false);
  }, []);

  const login = useCallback((newToken) => {
    const decoded = jwtDecode(newToken); // extract user info (id, username, role, name) from the token
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(decoded);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    token,
    user, // { id, username, role, name, iat, exp }
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
