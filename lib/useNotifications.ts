import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configura il comportamento delle notifiche quando l'app è in foreground
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

interface UseNotificationsOptions {
  userId: string | number | null;
  token: string | null; // JWT token per chiamate API
  baseUrl: string | undefined;
}

interface UseNotificationsReturn {
  notificationsEnabled: boolean;
  isLoading: boolean;
  registerDevice: () => Promise<void>;
  toggleNotifications: (enable: boolean) => Promise<void>;
}

/**
 * Hook per gestire le notifiche push.
 *
 * Usa getDevicePushTokenAsync() per ottenere il token FCM nativo,
 * compatibile con Firebase Admin SDK usato dal backend Spring Boot.
 *
 * NOTA: Le notifiche push NON funzionano su emulatori/simulatori
 * e richiedono un Development Build (non Expo Go da SDK 53+).
 */
export function useNotifications({
  userId,
  token,
  baseUrl,
}: UseNotificationsOptions): UseNotificationsReturn {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fcmTokenRef = useRef<string | null>(null);

  // Carica stato salvato all'avvio
  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
        const savedToken = await AsyncStorage.getItem(STORAGE_KEY_FCM_TOKEN);
        if (saved !== null) {
          setNotificationsEnabled(saved === 'true');
        }
        if (savedToken) {
          fcmTokenRef.current = savedToken;
        }
      } catch (e) {
        console.error('[Notifications] Errore nel caricare lo stato:', e);
      }
    };
    loadSavedState();
  }, []);

  /**
   * Richiede il permesso per le notifiche all'utente.
   * Ritorna true se il permesso è stato concesso.
   */
  const requestPermission = async (): Promise<boolean> => {
    if (!Device.isDevice) {
      console.warn('[Notifications] Le notifiche push non funzionano su emulatori.');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Notifications] Permesso negato.');
      return false;
    }

    // Su Android 13+ serve anche il permesso POST_NOTIFICATIONS
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notifiche BCC',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4cc9f0',
      });
    }

    return true;
  };

  /**
   * Ottiene il token FCM nativo del dispositivo.
   * Usa getDevicePushTokenAsync() per token compatibile con Firebase Admin SDK.
   */
  const getFcmToken = async (): Promise<string | null> => {
    try {
      const pushTokenData = await Notifications.getDevicePushTokenAsync();
      const deviceToken = pushTokenData.data;
      fcmTokenRef.current = deviceToken;
      await AsyncStorage.setItem(STORAGE_KEY_FCM_TOKEN, deviceToken);
      console.log('[Notifications] FCM Token ottenuto:', deviceToken);
      return deviceToken;
    } catch (e) {
      console.error('[Notifications] Errore nel recuperare il token FCM:', e);
      return null;
    }
  };

  /**
   * Registra il dispositivo sul backend (POST /user-devices).
   * Crea o aggiorna la relazione user-device con isActive=true.
   */
  const registerOnBackend = async (fcmToken: string): Promise<boolean> => {
    if (!userId || !token || !baseUrl) {
      console.warn('[Notifications] Dati mancanti per la registrazione:', { userId, hasToken: !!token, baseUrl });
      return false;
    }

    try {
      const response = await fetch(`${baseUrl}/user-devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: String(userId),
          token: fcmToken,
          platform: Platform.OS.toUpperCase(), // "ANDROID" | "IOS"
        }),
      });

      if (response.ok || response.status === 201) {
        console.log('[Notifications] Dispositivo registrato sul backend con successo.');
        return true;
      } else {
        const errorText = await response.text().catch(() => 'unknown');
        console.error('[Notifications] Errore registrazione backend:', response.status, errorText);
        return false;
      }
    } catch (e) {
      console.error('[Notifications] Errore di rete durante la registrazione:', e);
      return false;
    }
  };

  /**
   * Deregistra il dispositivo dal backend (POST /user-devices/logout).
   * Setta isActive=false per questo user-device.
   */
  const deregisterOnBackend = async (fcmToken: string): Promise<boolean> => {
    if (!userId || !token || !baseUrl) {
      console.warn('[Notifications] Dati mancanti per la deregistrazione.');
      return false;
    }

    try {
      const response = await fetch(`${baseUrl}/user-devices/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: String(userId),
          token: fcmToken,
          platform: Platform.OS.toUpperCase(),
        }),
      });

      if (response.ok) {
        console.log('[Notifications] Dispositivo deregistrato (isActive=false).');
        return true;
      } else {
        const errorText = await response.text().catch(() => 'unknown');
        console.error('[Notifications] Errore deregistrazione backend:', response.status, errorText);
        return false;
      }
    } catch (e) {
      console.error('[Notifications] Errore di rete durante la deregistrazione:', e);
      return false;
    }
  };

  /**
   * Registra il dispositivo: chiede permesso, ottiene token, salva sul backend.
   * Chiamato al login dell'utente.
   */
  const registerDevice = useCallback(async (): Promise<void> => {
    if (!userId || !token) return;

    try {
      const permissionGranted = await requestPermission();
      if (!permissionGranted) {
        await AsyncStorage.setItem(STORAGE_KEY_NOTIFICATIONS, 'false');
        setNotificationsEnabled(false);
        return;
      }

      const fcmToken = await getFcmToken();
      if (!fcmToken) return;

      const success = await registerOnBackend(fcmToken);
      if (success) {
        await AsyncStorage.setItem(STORAGE_KEY_NOTIFICATIONS, 'true');
        setNotificationsEnabled(true);
      }
    } catch (e) {
      console.error('[Notifications] Errore in registerDevice:', e);
    }
  }, [userId, token, baseUrl]);

  /**
   * Abilita o disabilita le notifiche.
   * Chiamato dallo switch in SettingsPage.
   */
  const toggleNotifications = useCallback(async (enable: boolean): Promise<void> => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (enable) {
        // --- ABILITAZIONE ---
        // Prima verifica i permessi
        const { status } = await Notifications.getPermissionsAsync();

        if (status === 'denied') {
          // I permessi sono stati negati definitivamente → manda l'utente in Settings
          Alert.alert(
            'Notifiche disabilitate',
            'Per ricevere notifiche, abilita i permessi nelle impostazioni del dispositivo.',
            [
              { text: 'Annulla', style: 'cancel' },
              {
                text: 'Apri Impostazioni',
                onPress: () => Linking.openSettings(),
              },
            ],
          );
          return;
        }

        const permissionGranted = await requestPermission();
        if (!permissionGranted) {
          return;
        }

        // Ottieni o riusa il token FCM
        let fcmToken = fcmTokenRef.current;
        if (!fcmToken) {
          fcmToken = await getFcmToken();
        }
        if (!fcmToken) return;

        const success = await registerOnBackend(fcmToken);
        if (success) {
          setNotificationsEnabled(true);
          await AsyncStorage.setItem(STORAGE_KEY_NOTIFICATIONS, 'true');
        }
      } else {
        // --- DISABILITAZIONE ---
        let fcmToken = fcmTokenRef.current;
        if (!fcmToken) {
          fcmToken = await AsyncStorage.getItem(STORAGE_KEY_FCM_TOKEN);
          if (fcmToken) fcmTokenRef.current = fcmToken;
        }

        if (!fcmToken) {
          // Nessun token salvato, aggiorna solo lo stato locale
          setNotificationsEnabled(false);
          await AsyncStorage.setItem(STORAGE_KEY_NOTIFICATIONS, 'false');
          return;
        }

        const success = await deregisterOnBackend(fcmToken);
        if (success) {
          setNotificationsEnabled(false);
          await AsyncStorage.setItem(STORAGE_KEY_NOTIFICATIONS, 'false');
        }
      }
    } catch (e) {
      console.error('[Notifications] Errore in toggleNotifications:', e);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, userId, token, baseUrl]);

  return {
    notificationsEnabled,
    isLoading,
    registerDevice,
    toggleNotifications,
  };
}
