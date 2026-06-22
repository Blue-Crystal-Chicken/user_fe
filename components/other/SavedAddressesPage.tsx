import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { ArrowLeft, Home, Briefcase, Truck, Navigation, Save } from 'lucide-react-native';
import { useAuth } from '@/components/context/AuthContext';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// Dynamically require react-native-webview only on native to prevent web crashes
let WebView: any = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch (e) {
    console.warn('[SavedAddresses] react-native-webview could not be required:', e);
  }
}

// Dynamically require expo-location
let Location: any = null;
try {
  Location = require('expo-location');
} catch (e) {
  console.warn('[SavedAddresses] expo-location could not be required:', e);
}

const DEFAULT_LAT = 41.9028;
const DEFAULT_LNG = 12.4964;

const getLeafletHtml = (lat: number, lng: number) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map {
          height: 100%;
          margin: 0;
          padding: 0;
          background-color: #0a0f1c;
        }
        .leaflet-container {
          background: #0a0f1c !important;
        }
        .leaflet-tile {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%) !important;
        }
        .leaflet-control-attribution {
          display: none !important;
        }
        .leaflet-marker-icon {
          filter: drop-shadow(0px 0px 8px #4cc9f0);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 16);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        var marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);

        function sendLocation(lat, lng) {
          var msg = JSON.stringify({
            type: 'location_change',
            latitude: lat,
            longitude: lng
          });
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(msg);
          } else {
            window.parent.postMessage(msg, '*');
          }
        }

        marker.on('dragend', function(e) {
          var pos = marker.getLatLng();
          sendLocation(pos.lat, pos.lng);
        });

        map.on('click', function(e) {
          marker.setLatLng(e.latlng);
          sendLocation(e.latlng.lat, e.latlng.lng);
        });
      </script>
    </body>
    </html>
  `;
};

export function SavedAddressesPage() {
  const router = useRouter();
  const { user, token, login } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [addressType, setAddressType] = useState<'HOME' | 'WORK' | 'DELIVERY'>('DELIVERY');

  const [region, setRegion] = useState({
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LNG,
  });

  const backButtonTop = (Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 48) + 12;

  const baseUrl = Platform.OS === 'web'
    ? process.env.EXPO_PUBLIC_API_URL_WEB
    : process.env.EXPO_PUBLIC_API_URL_MOBILE;

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleWebMsg = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'location_change') {
            handleLocationChange(data.latitude, data.longitude);
          }
        } catch (e) {}
      };
      window.addEventListener('message', handleWebMsg);
      return () => window.removeEventListener('message', handleWebMsg);
    }
  }, []);

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        if (user && user.address) {
          const addr = user.address;
          setStreet(addr.street || '');
          setCity(addr.city || '');
          setState(addr.state || '');
          setZipCode(addr.zipCode || '');
          setCountry(addr.country || '');
          setAddressType((addr.type as 'HOME' | 'WORK' | 'DELIVERY') || 'DELIVERY');

          if (Location) {
            try {
              const addressString = `${addr.street}, ${addr.city}, ${addr.country}`;
              const geocodeResult = await Location.geocodeAsync(addressString);
              if (geocodeResult && geocodeResult.length > 0) {
                setRegion({
                  latitude: geocodeResult[0].latitude,
                  longitude: geocodeResult[0].longitude,
                });
              }
            } catch (err) {
              console.warn(err);
            }
          }
          setIsLoading(false);
        } else {
          await requestAndGetLocation();
        }
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };

    initializeLocation();
  }, [user]);

  const requestAndGetLocation = async () => {
    if (!Location) {
      setIsLoading(false);
      alert("La geolocalizzazione automatica non è disponibile perché i moduli nativi (expo-location) non sono compilati in questa build.\n");
      return;
    }
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
        });

        await reverseGeocode(lat, lng);
      } else {
        alert("Permesso di geolocalizzazione negato. Inserisci l'indirizzo manualmente.");
      }
    } catch (err) {
      console.error(err);
      alert("Errore nel recupero della posizione GPS.");
    } finally {
      setIsLoading(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    if (!Location) return;
    try {
      const response = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (response && response.length > 0) {
        const item = response[0];
        const streetName = item.street || item.name || '';
        const streetNumber = item.streetNumber ? `, ${item.streetNumber}` : '';
        setStreet(`${streetName}${streetNumber}`);
        setCity(item.city || '');
        setState(item.region || '');
        setZipCode(item.postalCode || '');
        setCountry(item.country || 'Italia');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLocationChange = async (latitude: number, longitude: number) => {
    setRegion({ latitude, longitude });
    await reverseGeocode(latitude, longitude);
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'location_change') {
        handleLocationChange(data.latitude, data.longitude);
      }
    } catch (e) {
      console.error(e);
    }
  };

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
        login(token, updatedUser);
        router.back();
      } else {
        const errText = await response.text();
        alert(`Errore di salvataggio: ${errText}`);
      }
    } catch (e) {
      console.error(e);
      alert('Errore di connessione. Controlla la rete.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0a0f1c]">
      <StatusBar barStyle="light-content" />

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
        <KeyboardAwareScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          extraScrollHeight={100}
          keyboardShouldPersistTaps="handled"
        >
          {!Location && (
            <View className="mx-6 mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
              <Text className="text-yellow-500 text-xs font-semibold uppercase mb-1">Geolocalizzazione disabilitata</Text>
              <Text className="text-white text-xs leading-4">
                La geolocalizzazione automatica del GPS non è supportata su questa build. Inserisci il tuo indirizzo di consegna manualmente nei campi sottostanti.
              </Text>
            </View>
          )}

          <View className="px-6 mb-6">
            <Text className="text-[#67b8e0] text-xs font-semibold uppercase tracking-[1.5px] mb-3 ml-1">
              LA TUA POSIZIONE SULLA MAPPA
            </Text>

            <View className="h-64 rounded-[32px] overflow-hidden border border-white/10 bg-[#121a2e]">
              {Platform.OS === 'web' ? (
                React.createElement('iframe', {
                  srcDoc: getLeafletHtml(region.latitude, region.longitude),
                  style: { border: 'none', width: '100%', height: '100%', borderRadius: 24 }
                })
              ) : WebView ? (
                <WebView
                  originWhitelist={['*']}
                  source={{ html: getLeafletHtml(region.latitude, region.longitude) }}
                  style={{ flex: 1, backgroundColor: '#0a0f1c' }}
                  onMessage={handleWebViewMessage}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                />
              ) : (
                <View className="flex-1 justify-center items-center p-6 bg-[#121a2e]">
                  <Text className="text-[#8ab4e0] text-center text-sm font-semibold mb-2">
                    Servizi Mappa Non Disponibili
                  </Text>
                </View>
              )}
            </View>

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

          <View className="px-6 gap-5 mb-12">
            <Text className="text-[#67b8e0] text-xs font-semibold uppercase tracking-[1.5px] ml-1">
              DETTAGLI INDIRIZZO
            </Text>

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

            <View className="gap-2">
              <Label>Via / Piazza (e Civico) *</Label>
              <Input
                value={street}
                onChangeText={setStreet}
                placeholder="Es. Via Roma, 12"
                editable={!isSaving}
              />
            </View>

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
        </KeyboardAwareScrollView>
      )}
    </View>
  );
}