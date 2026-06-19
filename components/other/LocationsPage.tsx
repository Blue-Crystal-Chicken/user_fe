import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Search, Check } from 'lucide-react-native';
import { useAuth } from '@/components/context/AuthContext';
import { LocationResponse } from '@/type';

export function LocationsPage() {
  const router = useRouter();
  const { user, token, selectedLocation, setSelectedLocation, updateUserLocation } = useAuth();
  
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelected, setTempSelected] = useState<LocationResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const backButtonTop = (Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 48) + 12;

  const baseUrl = Platform.OS === 'web'
    ? process.env.EXPO_PUBLIC_API_URL_WEB
    : process.env.EXPO_PUBLIC_API_URL_MOBILE;

  // Carica tutti i locali dal backend
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/locations`);
        if (response.ok) {
          const data = await response.json();
          setLocations(data);
        } else {
          console.error('[Locations] Error fetching locations:', response.status);
        }
      } catch (error) {
        console.error('[Locations] Network error fetching locations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, [baseUrl]);

  // Imposta la selezione iniziale basandosi su quella attiva
  useEffect(() => {
    if (selectedLocation) {
      setTempSelected(selectedLocation);
    }
  }, [selectedLocation]);

  // Filtra per città, raggruppa e ordina per indirizzo
  const groupedLocations = useMemo(() => {
    const filtered = locations.filter(loc =>
      loc.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups: { [key: string]: LocationResponse[] } = {};
    filtered.forEach(loc => {
      if (!groups[loc.city]) {
        groups[loc.city] = [];
      }
      groups[loc.city].push(loc);
    });

    Object.keys(groups).forEach(city => {
      groups[city].sort((a, b) => a.address.localeCompare(b.address));
    });

    return Object.keys(groups)
      .sort()
      .map(city => ({
        city,
        items: groups[city]
      }));
  }, [locations, searchQuery]);

  const handleSaveLocation = async () => {
    if (!tempSelected) return;
    setIsSaving(true);
    try {
      if (user && token) {
        // Utente autenticato: salva su DB
        const success = await updateUserLocation(tempSelected.id);
        if (success) {
          router.back();
        } else {
          alert("Impossibile salvare la selezione sul server. Riprova.");
        }
      } else {
        // Guest: salva solo localmente nel context (AsyncStorage)
        setSelectedLocation(tempSelected);
        router.back();
      }
    } catch (e) {
      console.error('[Locations] Error updating location selection:', e);
      alert("Errore di rete. Controlla la tua connessione.");
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
          className="absolute w-11 h-11 bg-white/10 border border-white/20 rounded-2xl items-center justify-center"
          style={{ top: backButtonTop, left: 16 }}
        >
          <ArrowLeft color="#e0f0ff" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text className="text-white text-3xl font-bold tracking-tight">Ristoranti</Text>
      </View>

      {/* Barra di ricerca */}
      <View className="px-6 mb-4">
        <View className="flex-row items-center bg-[#121a2e] border border-white/5 rounded-2xl px-4 py-2">
          <Search size={18} color="#8ab4e0" className="mr-2" />
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cerca per città..."
            className="flex-1 text-white placeholder-[#8ab4e080] bg-transparent border-0 h-10 p-0"
            style={{ color: '#ffffff' }}
          />
        </View>
      </View>

      {/* Contenuto principale / Lista dei locali */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4cc9f0" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {groupedLocations.length === 0 ? (
            <View className="py-20 items-center">
              <Text className="text-[#8ab4e0] text-base">Nessun ristorante trovato</Text>
            </View>
          ) : (
            groupedLocations.map(group => (
              <View key={group.city} className="mb-6">
                {/* Intestazione città */}
                <Text className="text-[#67b8e0] text-xs font-semibold uppercase tracking-[1.5px] mb-3 ml-1">
                  {group.city}
                </Text>

                {/* Lista locali della città */}
                <View className="gap-3">
                  {group.items.map(item => {
                    const isSelected = tempSelected?.id === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.7}
                        onPress={() => setTempSelected(item)}
                        className={`p-5 rounded-[24px] border flex-row items-center justify-between ${
                          isSelected
                            ? 'bg-[#4cc9f01a] border-[#4cc9f0]'
                            : 'bg-[#121a2e8c] border-white/5'
                        }`}
                      >
                        <View className="flex-1 mr-4">
                          <View className="flex-row items-center gap-2 mb-1.5">
                            <Text className="text-white text-lg font-semibold">{item.name}</Text>
                            
                            {/* Badge Stato Aperto/Chiuso */}
                            <View className="flex-row items-center gap-1 bg-black/30 px-2.5 py-1 rounded-full border border-white/5">
                              <View
                                className={`w-2 h-2 rounded-full ${
                                  item.isOpen ? 'bg-[#5ce1d6]' : 'bg-[#ef4444]'
                                }`}
                              />
                              <Text className="text-white text-xs font-bold tracking-wide uppercase">
                                {item.isOpen ? 'Aperto' : 'Chiuso'}
                              </Text>
                            </View>
                          </View>
                          
                          {/* Indirizzo in grigio piccolo */}
                          <Text className="text-[#8ab4e0] text-sm leading-5">
                            {item.address}
                          </Text>
                        </View>

                        {/* Icona di selezione */}
                        <View
                          className={`w-7 h-7 rounded-full border items-center justify-center ${
                            isSelected
                              ? 'bg-[#4cc9f0] border-[#4cc9f0]'
                              : 'border-white/20 bg-transparent'
                          }`}
                        >
                          {isSelected && <Check size={16} color="#0a0f1c" strokeWidth={3} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Sezione pulsante di conferma */}
      <View className="p-6 bg-[#0a0f1ce6] border-t border-white/5 pb-10">
        <Button
          className={`w-full h-14 rounded-2xl flex-row justify-center items-center gap-2 ${
            tempSelected ? 'bg-[#4cc9f0]' : 'bg-[#1e2f5a]'
          } ${(!tempSelected || isSaving) ? 'opacity-60' : 'opacity-100'}`}
          onPress={handleSaveLocation}
          disabled={!tempSelected || isSaving || loading}
        >
          {isSaving ? (
            <ActivityIndicator color="#0a0f1c" />
          ) : (
            <MapPin size={18} color="#0a0f1c" />
          )}
          <Text className="text-[#0a0f1c] font-bold text-base">
            {isSaving ? 'Salvataggio...' : 'Rendi questo il mio ristorante'}
          </Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
