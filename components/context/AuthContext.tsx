import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface User {
  id: number;
  email: string;
  name: string;
  surname: string;
  phone?: string;
  gender?: string;
  birthday?: string;
  roles?: string[];
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
  const router = useRouter();

  const baseUrl = Platform.OS === 'web'
    ? process.env.EXPO_PUBLIC_API_URL_WEB
    : process.env.EXPO_PUBLIC_API_URL_MOBILE;

  useEffect(() => {
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
        const initialUser = storedUser || webUser;

        if (finalToken) {
          // If we have a token, verify it with the backend (with retry)
          let retryCount = 0;
          const maxRetries = 3;
          let success = false;

          while (retryCount < maxRetries && !success) {
            try {
              const response = await fetch(`${baseUrl}/api/auth/me`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${finalToken}`
                }
              });

              if (response.ok) {
                const result = await response.json();
                setToken(finalToken);
                setUser(result);
                AsyncStorage.setItem('user', JSON.stringify(result)).catch(e => console.error(e));
                if (Platform.OS === 'web') {
                  localStorage.setItem('auth_user', JSON.stringify(result));
                }
                success = true;
              } else if (response.status === 401 || response.status === 403) {
                // Token invalid or expired - don't retry
                console.warn('Session expired or invalid token');
                await performLogout();
                success = true; // stop loop
              } else {
                throw new Error(`Server returned ${response.status}`);
              }
            } catch (err) {
              retryCount++;
              console.warn(`Attempt ${retryCount} to verify session failed:`, err);
              if (retryCount < maxRetries) {
                // Wait before retrying (1s, 2s, 3s)
                await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
              } else {
                console.error('Final attempt to verify session failed');
                // On final failure, use what we have in storage if available
                if (initialUser) {
                  setToken(finalToken);
                  setUser(JSON.parse(initialUser));
                }
              }
            }
          }
        }
 else if (initialUser) {
          // No token but we have a user? Should not happen normally, clear it
          await performLogout();
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

  const performLogout = async () => {
    setToken(null);
    setUser(null);
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      if (Platform.OS === 'web') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const logout = () => {
    performLogout().then(() => {
      router.replace('/');
    });
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

