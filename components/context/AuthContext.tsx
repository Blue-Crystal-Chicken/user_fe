import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { LocationResponse } from '@/type';

// Configura il comportamento delle notifiche in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const STORAGE_KEY_NOTIFICATIONS = 'notifications_enabled';
const STORAGE_KEY_FCM_TOKEN = 'fcm_token';

interface User {
  id: number;
  email: string;
  name: string;
  surname: string;
  phone?: string;
  gender?: string;
  birthday?: string;
  roles?: string[];
  location?: LocationResponse;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  notificationsEnabled: boolean;
  notificationsLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  toggleNotifications: (enable: boolean) => Promise<void>;
  selectedLocation: LocationResponse | null;
  setSelectedLocation: (location: LocationResponse | null) => void;
  updateUserLocation: (locationId: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const fcmTokenRef = useRef<string | null>(null);
  const router = useRouter();

  const [selectedLocation, setSelectedLocationState] = useState<LocationResponse | null>(null);

  const setSelectedLocation = useCallback(async (location: LocationResponse | null) => {
    setSelectedLocationState(location);
    if (location) {
      await AsyncStorage.setItem('selected_location', JSON.stringify(location)).catch(e => console.error(e));
    } else {
      await AsyncStorage.removeItem('selected_location').catch(e => console.error(e));
    }
  }, []);

  const updateUserLocation = useCallback(async (locationId: number): Promise<boolean> => {
    if (!token || !user) return false;
    try {
      const response = await fetch(`${baseUrl}/api/users/v1/users/${user.id}/location/${locationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const updatedUser = await response.json();
        login(token, updatedUser);
        return true;
      } else {
        const errorText = await response.text();
        console.error('[AuthContext] Failed to update user location:', errorText);
        return false;
      }
    } catch (e) {
      console.error('[AuthContext] Error updating user location:', e);
      return false;
    }
  }, [token, user]);

  const baseUrl = Platform.OS === 'web'
    ? process.env.EXPO_PUBLIC_API_URL_WEB
    : process.env.EXPO_PUBLIC_API_URL_MOBILE;

  const notificationBaseUrl = Platform.OS === 'web'
    ? process.env.EXPO_PUBLIC_NOTIFICATION_URL_WEB
    : process.env.EXPO_PUBLIC_NOTIFICATION_URL_MOBILE;

  // Carica lo stato notifiche salvato
  useEffect(() => {
    const loadNotifState = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
        const savedToken = await AsyncStorage.getItem(STORAGE_KEY_FCM_TOKEN);
        if (saved !== null) setNotificationsEnabled(saved === 'true');
        if (savedToken) fcmTokenRef.current = savedToken;
        
        const storedLoc = await AsyncStorage.getItem('selected_location');
        if (storedLoc) {
          setSelectedLocationState(JSON.parse(storedLoc));
        }
      } catch (e) {
        console.error('[Notifications/Location] Errore caricamento stato:', e);
      }
    };
    loadNotifState();
  }, []);

  const requestPermissionAndGetToken = async (): Promise<string | null> => {
    if (!Device.isDevice) {
      console.warn('[Notifications] Le notifiche push non funzionano su emulatori.');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Notifications] Permesso negato.');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notifiche BCC',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4cc9f0',
      });
    }

    try {
      const pushTokenData = await Notifications.getDevicePushTokenAsync();
      const deviceToken = pushTokenData.data;
      fcmTokenRef.current = deviceToken;
      await AsyncStorage.setItem(STORAGE_KEY_FCM_TOKEN, deviceToken);
      console.log('[Notifications] FCM Token:', deviceToken);
      return deviceToken;
    } catch (e) {
      console.error('[Notifications] Errore nel recuperare il token FCM:', e);
      return null;
    }
  };

  const registerDeviceOnBackend = async (
    authToken: string,
    userId: string | number,
    fcmToken: string,
  ): Promise<boolean> => {
    if (!notificationBaseUrl) return false;
    try {
      const response = await fetch(`${notificationBaseUrl}/user-devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          userId: String(userId),
          token: fcmToken,
          platform: Platform.OS.toUpperCase(),
        }),
      });
      const ok = response.ok || response.status === 201;
      if (ok) console.log('[Notifications] Device registrato sul backend.');
      else console.warn('[Notifications] Backend register error:', response.status);
      return ok;
    } catch (e) {
      console.error('[Notifications] Errore rete register:', e);
      return false;
    }
  };

  const deregisterDeviceOnBackend = async (
    authToken: string,
    userId: string | number,
    fcmToken: string,
  ): Promise<boolean> => {
    if (!notificationBaseUrl) return false;
    try {
      const response = await fetch(`${notificationBaseUrl}/user-devices/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          userId: String(userId),
          token: fcmToken,
          platform: Platform.OS.toUpperCase(),
        }),
      });
      if (response.ok) console.log('[Notifications] Device deregistrato (isActive=false).');
      else console.warn('[Notifications] Backend deregister error:', response.status);
      return response.ok;
    } catch (e) {
      console.error('[Notifications] Errore rete deregister:', e);
      return false;
    }
  };

  const registerDeviceForNotifications = useCallback(
    async (authToken: string, userId: string | number) => {
      try {
        const fcmToken = await requestPermissionAndGetToken();
        if (!fcmToken) {
          await AsyncStorage.setItem(STORAGE_KEY_NOTIFICATIONS, 'false');
          setNotificationsEnabled(false);
          return;
        }
        const success = await registerDeviceOnBackend(authToken, userId, fcmToken);
        if (success) {
          setNotificationsEnabled(true);
          await AsyncStorage.setItem(STORAGE_KEY_NOTIFICATIONS, 'true');
        }
      } catch (e) {
        console.error('[Notifications] Errore in registerDeviceForNotifications:', e);
      }
    },
    [notificationBaseUrl],
  );

  const toggleNotifications = useCallback(
    async (enable: boolean) => {
      if (notificationsLoading || !token || !user) return;
      setNotificationsLoading(true);
      try {
        if (enable) {
          const { status } = await Notifications.getPermissionsAsync();
          if (status === 'denied') {
            Alert.alert(
              'Notifiche disabilitate',
              'Per ricevere notifiche, abilita i permessi nelle impostazioni del dispositivo.',
              [
                { text: 'Annulla', style: 'cancel' },
                { text: 'Apri Impostazioni', onPress: () => Linking.openSettings() },
              ],
            );
            return;
          }
          let fcmToken = fcmTokenRef.current;
          if (!fcmToken) {
            fcmToken = await requestPermissionAndGetToken();
          } else {
            // verifica permesso anche se abbiamo già il token
            await requestPermissionAndGetToken();
          }
          if (!fcmToken) return;
          const success = await registerDeviceOnBackend(token, user.id, fcmToken);
          if (success) {
            setNotificationsEnabled(true);
            await AsyncStorage.setItem(STORAGE_KEY_NOTIFICATIONS, 'true');
          }
        } else {
          let fcmToken = fcmTokenRef.current;
          if (!fcmToken) {
            fcmToken = await AsyncStorage.getItem(STORAGE_KEY_FCM_TOKEN);
            if (fcmToken) fcmTokenRef.current = fcmToken;
          }
          if (!fcmToken) {
            setNotificationsEnabled(false);
            await AsyncStorage.setItem(STORAGE_KEY_NOTIFICATIONS, 'false');
            return;
          }
          const success = await deregisterDeviceOnBackend(token, user.id, fcmToken);
          if (success) {
            setNotificationsEnabled(false);
            await AsyncStorage.setItem(STORAGE_KEY_NOTIFICATIONS, 'false');
          }
        }
      } catch (e) {
        console.error('[Notifications] Errore in toggleNotifications:', e);
      } finally {
        setNotificationsLoading(false);
      }
    },
    [token, user, notificationsLoading, notificationBaseUrl],
  );

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
                if (result.location) {
                  setSelectedLocationState(result.location);
                  AsyncStorage.setItem('selected_location', JSON.stringify(result.location)).catch(e => console.error(e));
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
    if (newUser.location) {
      setSelectedLocationState(newUser.location);
      AsyncStorage.setItem('selected_location', JSON.stringify(newUser.location)).catch(e => console.error(e));
    }
    // Registra il device per le notifiche push dopo il login
    if (Platform.OS !== 'web') {
      registerDeviceForNotifications(newToken, newUser.id);
    }
  };

  const performLogout = async () => {
    // Deregistra il device prima di fare logout
    if (token && user && Platform.OS !== 'web') {
      const fcmToken = fcmTokenRef.current || (await AsyncStorage.getItem(STORAGE_KEY_FCM_TOKEN).catch(() => null));
      if (fcmToken) {
        await deregisterDeviceOnBackend(token, user.id, fcmToken).catch(e =>
          console.error('[Notifications] Errore deregister al logout:', e),
        );
      }
    }
    setToken(null);
    setUser(null);
    setNotificationsEnabled(false);
    fcmTokenRef.current = null;
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
      await AsyncStorage.removeItem(STORAGE_KEY_FCM_TOKEN);
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
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        notificationsEnabled,
        notificationsLoading,
        login,
        logout,
        toggleNotifications,
        selectedLocation,
        setSelectedLocation,
        updateUserLocation,
      }}
    >
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

