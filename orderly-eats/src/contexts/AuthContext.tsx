import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('auth_token');
  });

  const login = useCallback(async (identifier: string, password: string) => {
    try {
      // Passamos o tipo <{ token: string }> para o TS saber que o token existe
      const response = await api.post<{ token: string }>('/login', { 
        phone: identifier, 
        password 
      });

      const { token } = response.data;
      api.setToken(token); // Usa o método da classe para salvar como 'auth_token'
      setIsAuthenticated(true);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao realizar login');
    }
  }, []);

  const signup = useCallback(async (identifier: string, password: string) => {
    try {
      const response = await api.post<{ token: string }>('/signup', { 
        phone: identifier, 
        password 
      });

      const { token } = response.data;
      api.setToken(token);
      setIsAuthenticated(true);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar conta');
    }
  }, []);

  const logout = useCallback(() => {
    api.setToken(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}