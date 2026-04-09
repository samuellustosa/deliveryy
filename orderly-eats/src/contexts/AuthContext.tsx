// orderly-eats/src/contexts/AuthContext.tsx
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
      // CORREÇÃO: Use o método .login() que você já criou no seu api.ts
      // Ele já mapeia o identifier para 'phone' internamente
      const response = await api.login({ 
        email: identifier, 
        password 
      });

      const { token } = response;
      api.setToken(token); 
      setIsAuthenticated(true);
    } catch (error: any) {
      // O seu api.ts já faz o throw new Error(message), 
      // então basta repassar a mensagem aqui.
      throw new Error(error.message || 'Erro ao realizar login');
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
  try {
    // CORREÇÃO: Chame api.signup para criar o USUÁRIO e receber o TOKEN
    const response = await api.signup({ 
      email, 
      password 
    });

    // Agora 'response.token' existirá conforme definido no seu api.ts
    const { token } = response;
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