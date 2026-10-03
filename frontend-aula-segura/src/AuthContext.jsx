import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restore() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const data = await api('/auth/me');
        setUser(data.user);
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    restore();
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(correo, contrasena) {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ correo, contrasena }),
      });
      setToken(data.token);
      setUser(data.user);
      return data.user;
    },
    logout() {
      setToken(null);
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
