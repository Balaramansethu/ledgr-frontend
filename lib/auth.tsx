'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { UserDto } from '@ledgr/shared';
import { api, ApiError } from './api';

interface AuthContextValue {
  user: UserDto | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserDto>;
  register: (email: string, password: string, name: string) => Promise<UserDto>;
  logout: () => Promise<void>;
  setUser: (user: UserDto) => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user } = await api.get<{ user: UserDto }>('/auth/me');
      setUserState(user);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setUserState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await api.post<{ user: UserDto }>('/auth/login', { email, password });
    setUserState(user);
    return user;
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const { user } = await api.post<{ user: UserDto }>('/auth/register', { email, password, name });
    setUserState(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    setUserState(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, setUser: setUserState, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
