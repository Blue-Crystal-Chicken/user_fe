import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Home, Briefcase, Truck, Navigation, Save } from 'lucide-react-native';
import { useAuth } from '@/components/context/AuthContext';
import * as Location from 'expo-location';

// Dynamically import react-native-maps to prevent crashes on Expo Web
let MapView: any = null;
let Marker: any = null;
if (Platform.OS !== 'web') {
  try {
    const RNMaps = require('react-native-maps');
    MapView = RNMaps.default;
    Marker = RNMaps.Marker;
  } catch (e) {
    console.warn('[SavedAddresses] react-native-maps could not be required:', e);
  }
}

// Default coordinates centered on Rome, Italy
const DEFAULT_LAT = 41.9028;
const DEFAULT_LNG = 12.4964;

export function SavedAddressesPage() {
  const router = useRouter();
  const { user, token, login } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

  // Address form fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [addressType, setAddressType] = useState<'HOME' | 'WORK' | 'DELIVERY'>('DELIVERY');

  // Map region state
  const [region, setRegion] = useState({
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LNG,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const backButtonTop = (Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 48) + 12;

  const baseUrl = Platform.OS === 'web'
    ? process.env.EXPO_PUBLIC_API_URL_WEB
    : process.env.EXPO_PUBLIC_API_URL_MOBILE;

  // Initialize and load address
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        if (user && user.address) {
          // 1. Popola i campi con l'indirizzo esistente
          const addr = user.address;
          setStreet(addr.street || '');
          setCity(addr.city || '');
          setState(addr.state || '');
          setZipCode(addr.zipCode || '');
          setCountry(addr.country || '');
          setAddressType((addr.type as 'HOME' | 'WORK' | 'DELIVERY') || 'DELIVERY');

          // 2. Tenta di geocodificare l'indirizzo esistente per centrare la mappa
          try {
            const addressString = `${addr.street}, ${addr.city}, ${addr.country}`;
            const geocodeResult = await Location.geocodeAsync(addressString);
            if (geocodeResult && geocodeResult.length > 0) {
              setRegion({
                latitude: geocodeResult[0].latitude,
                longitude: geocodeResult[0].longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              });
            }
          } catch (err) {
            console.warn('[SavedAddresses] Geocoding existing address failed:', err);
          }
          setIsLoading(false);
        } else {
          // Se non ha un indirizzo salvato, richiedi permessi e geolocalizza
          await requestAndGetLocation();
        }
      } catch (err) {
        console.error('[SavedAddresses] Initialization error:', err);
        setIsLoading(false);
      }
    };

    initializeLocation();
  }, [user]);

  // Request location and reverse-geocode
  const requestAndGetLocation = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status === 'granted') {
        const geoPosition = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const lat = geoPosition.coords.latitude;
        const lng = geoPosition.coords.longitude;

        setRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });

        await reverseGeocode(lat, lng);
      } else {
        alert("Permesso di geolocalizzazione negato. Inserisci l'indirizzo manualmente.");
      }
    } catch (err) {
      console.error('[SavedAddresses] Error getting current location:', err);
      alert("Errore nel recupero della posizione GPS.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reverse geocode lat/lng to details
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (response && response.length > 0) {
        const item = response[0];
        // Costruisci via e numero civico
        const streetName = item.street || item.name || '';
        const streetNumber = item.streetNumber ? `, ${item.streetNumber}` : '';
        setStreet(`${streetName}${streetNumber}`);
        setCity(item.city || '');
        setState(item.region || '');
        setZipCode(item.postalCode || '');
        setCountry(item.country || 'Italia');
      }
    } catch (err) {
      console.error('[SavedAddresses] Reverse geocoding failed:', err);
    }
  };

  // Handle map interaction (drag or tap)
  const handleLocationChange = async (latitude: number, longitude: number) => {
    setRegion(prev => ({ ...prev, latitude, longitude }));
    await reverseGeocode(latitude, longitude);
  };

  // Submit address update to backend
  const handleSave = async () => {
    if (!street || !city || !zipCode || !country) {
      alert('Compila tutti i campi obbligatori (Via, Città, CAP, Paese).');
      return;
    }

    if (!user || !token) {
      alert("Devi effettuare l'accesso per salvare l'indirizzo.");
      return;
    }

    setIsSaving(true);
    try {
      const body = {
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone || '',
        gender: user.gender || 'OTHER',
        birthday: user.birthday || '2000-01-01',
        address: {
          type: addressType,
          street,
          city,
          state: state || '',
          zipCode,
          country,
        },
      };

      const response = await fetch(`${baseUrl}/api/users/v1/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        // Aggiorna context
        login(token, updatedUser);
        router.back();
      } else {
        const errText = await response.text();
        alert(`Errore di salvataggio: ${errText}`);
      }
    } catch (e) {
      console.error('[SavedAddresses] Network save error:', e);
      alert('Errore di connessione. Controlla la rete.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0a0f1c]">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="relative h-40 justify-end pb-6 px-6 bg-[#0a0f1c]">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute w-11 h-11 bg-white/10 border border-white/20 rounded-2xl items-center justify-center backdrop-blur-md"
          style={{ top: backButtonTop, left: 16 }}
        >
          <ArrowLeft color="#e0f0ff" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text className="text-white text-3xl font-bold tracking-tight">Indirizzo Consegna</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4cc9f0" />
          <Text className="text-[#8ab4e0] mt-4 text-sm font-medium">Recupero posizione in corso...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Map Section */}
          <View className="px-6 mb-6">
            <Text className="text-[#67b8e0] text-xs font-semibold uppercase tracking-[1.5px] mb-3 ml-1">
              LA TUA POSIZIONE SULLA MAPPA
            </Text>

            <View className="h-64 rounded-[32px] overflow-hidden border border-white/10 bg-[#121a2e]">
              {Platform.OS === 'web' || !MapView ? (
                // Web Fallback or Map Mock
                <View className="flex-1 items-center justify-center p-6 bg-[#121a2e]">
                  <View className="w-14 h-14 bg-[#4cc9f01a] rounded-full items-center justify-center border border-[#4cc9f044] mb-3">
                    <MapPin size={28} color="#4cc9f0" />
                  </View>
                  <Text className="text-white font-semibold text-base mb-1">Mappa simulata per Web</Text>
                  <Text className="text-[#8ab4e0] text-center text-xs px-4 mb-4">
                    Latitude: {region.latitude.toFixed(6)} | Longitude: {region.longitude.toFixed(6)}
                  </Text>
                  <Button
                    variant="outline"
                    className="border-white/10"
                    onPress={requestAndGetLocation}
                  >
                    <Navigation size={14} color="#4cc9f0" className="mr-1.5" />
                    <Text className="text-white text-xs font-semibold">Usa Posizione GPS Browser</Text>
                  </Button>
                </View>
              ) : (
                // Native MapView
                <MapView
                  style={StyleSheet.absoluteFillObject}
                  initialRegion={region}
                  region={region}
                  onPress={(e: any) => handleLocationChange(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude)}
                  provider="google"
                >
                  <Marker
                    coordinate={{ latitude: region.latitude, longitude: region.longitude }}
                    draggable
                    onDragEnd={(e: any) => handleLocationChange(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude)}
                    pinColor="#4cc9f0"
                  />
                </MapView>
              )}
            </View>

            {/* GPS Fetch Button for mobile */}
            {Platform.OS !== 'web' && (
              <TouchableOpacity
                onPress={requestAndGetLocation}
                className="flex-row items-center justify-center mt-3 py-2.5 bg-[#121a2e] border border-white/5 rounded-2xl"
              >
                <Navigation size={16} color="#4cc9f0" className="mr-2" />
                <Text className="text-[#4cc9f0] font-semibold text-sm">Aggiorna con GPS</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Form Section */}
          <View className="px-6 gap-5 mb-12">
            <Text className="text-[#67b8e0] text-xs font-semibold uppercase tracking-[1.5px] ml-1">
              DETTAGLI INDIRIZZO
            </Text>

            {/* Address Type Selector */}
            <View className="gap-2">
              <Label>Tipo Indirizzo</Label>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setAddressType('DELIVERY')}
                  className={`flex-1 flex-row items-center justify-center py-3.5 rounded-2xl border ${
                    addressType === 'DELIVERY'
                      ? 'bg-[#4cc9f01a] border-[#4cc9f0]'
                      : 'bg-[#121a2e8c] border-white/5'
                  }`}
                >
                  <Truck size={18} color={addressType === 'DELIVERY' ? '#4cc9f0' : '#8ab4e0'} className="mr-2" />
                  <Text className={`font-semibold ${addressType === 'DELIVERY' ? 'text-[#4cc9f0]' : 'text-[#8ab4e0]'}`}>Altro</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setAddressType('HOME')}
                  className={`flex-1 flex-row items-center justify-center py-3.5 rounded-2xl border ${
                    addressType === 'HOME'
                      ? 'bg-[#4cc9f01a] border-[#4cc9f0]'
                      : 'bg-[#121a2e8c] border-white/5'
                  }`}
                >
                  <Home size={18} color={addressType === 'HOME' ? '#4cc9f0' : '#8ab4e0'} className="mr-2" />
                  <Text className={`font-semibold ${addressType === 'HOME' ? 'text-[#4cc9f0]' : 'text-[#8ab4e0]'}`}>Casa</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setAddressType('WORK')}
                  className={`flex-1 flex-row items-center justify-center py-3.5 rounded-2xl border ${
                    addressType === 'WORK'
                      ? 'bg-[#4cc9f01a] border-[#4cc9f0]'
                      : 'bg-[#121a2e8c] border-white/5'
                  }`}
                >
                  <Briefcase size={18} color={addressType === 'WORK' ? '#4cc9f0' : '#8ab4e0'} className="mr-2" />
                  <Text className={`font-semibold ${addressType === 'WORK' ? 'text-[#4cc9f0]' : 'text-[#8ab4e0]'}`}>Lavoro</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Street */}
            <View className="gap-2">
              <Label>Via / Piazza (e Civico) *</Label>
              <Input
                value={street}
                onChangeText={setStreet}
                placeholder="Es. Via Roma, 12"
                editable={!isSaving}
              />
            </View>

            {/* City & CAP */}
            <View className="flex-row gap-4">
              <View className="flex-1 gap-2">
                <Label>Città *</Label>
                <Input
                  value={city}
                  onChangeText={setCity}
                  placeholder="Es. Roma"
                  editable={!isSaving}
                />
              </View>
              <View className="w-32 gap-2">
                <Label>CAP *</Label>
                <Input
                  value={zipCode}
                  onChangeText={setZipCode}
                  placeholder="Es. 00100"
                  keyboardType="numeric"
                  editable={!isSaving}
                />
              </View>
            </View>

            {/* State & Country */}
            <View className="flex-row gap-4">
              <View className="flex-1 gap-2">
                <Label>Provincia</Label>
                <Input
                  value={state}
                  onChangeText={setState}
                  placeholder="Es. RM"
                  editable={!isSaving}
                />
              </View>
              <View className="flex-1 gap-2">
                <Label>Paese *</Label>
                <Input
                  value={country}
                  onChangeText={setCountry}
                  placeholder="Es. Italia"
                  editable={!isSaving}
                />
              </View>
            </View>

            {/* Save Button */}
            <View className="mt-4">
              <Button
                className={`w-full h-14 rounded-2xl flex-row justify-center items-center gap-2 bg-[#4cc9f0] ${
                  isSaving ? 'opacity-60' : 'opacity-100'
                }`}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#0a0f1c" />
                ) : (
                  <Save size={18} color="#0a0f1c" />
                )}
                <Text className="text-[#0a0f1c] font-bold text-base">
                  {isSaving ? 'Salvataggio...' : 'Salva Indirizzo'}
                </Text>
              </Button>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
