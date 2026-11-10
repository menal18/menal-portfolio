import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { TOKEN_KEY } from '../services/api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    api.get('/auth/me')
      .then((r) => setAdmin(r.data.admin))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setAdmin(data.admin);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
  }, []);

  const value = useMemo(() => ({ admin, checking, login, logout }), [admin, checking, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
