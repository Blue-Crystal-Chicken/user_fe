import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  email: string;
  name: string;
  surname: string;
  phone?: string;
  gender?: string;
  birthday?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load persisted token/user on mount
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');

        let webToken = null;
        let webUser = null;
        if (Platform.OS === 'web') {
          webToken = localStorage.getItem('auth_token');
          webUser = localStorage.getItem('auth_user');
        }

        const finalToken = storedToken || webToken;
        const finalUser = storedUser || webUser;

        if (finalToken && finalUser) {
          setToken(finalToken);
          setUser(JSON.parse(finalUser));
        }
      } catch (error) {
        console.error('Failed to load auth data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    AsyncStorage.setItem('token', newToken).catch(e => console.error(e));
    AsyncStorage.setItem('user', JSON.stringify(newUser)).catch(e => console.error(e));
    if (Platform.OS === 'web') {
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    AsyncStorage.removeItem('token').catch(e => console.error(e));
    AsyncStorage.removeItem('user').catch(e => console.error(e));
    if (Platform.OS === 'web') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
