import { useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getUser());
  const [token, setToken] = useState(authService.getToken());

  useEffect(() => {
    setUser(authService.getUser());
    setToken(authService.getToken());
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    login: (authData) => {
      setUser(authData?.user || null);
      setToken(authData?.token || null);
    },
    logout: () => {
      authService.logout();
      setUser(null);
      setToken(null);
    },
  }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
