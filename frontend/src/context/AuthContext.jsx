import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    try { return u ? JSON.parse(u) : null; } catch { return null; }
  });

  const login = (tokenVal, roleVal, userData = null) => {
    localStorage.setItem('token', tokenVal);
    localStorage.setItem('role', roleVal);
    if (userData) localStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenVal);
    setRole(roleVal);
    setUser(userData);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setToken(null);
    setRole(null);
    setUser(null);
  }, []);

  // Listen for forced logout events from axios interceptor (401/403)
  useEffect(() => {
    const handleForcedLogout = () => {
      logout();
      // Navigate to login — using window.location since we're outside Router
      window.location.replace('/');
    };

    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, role, user, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
