import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ImageBackground, Dimensions, Image, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/components/context/AuthContext';
import StatusBadge from './status_badge';
import { LocationResponse } from '@/type';

const { height } = Dimensions.get('window');
const AVATAR_SIZE = 210;

const Hero = ({ title, subtitle }: { title: string; subtitle: string }) => {
  const router = useRouter();
  const { selectedLocation, setSelectedLocation } = useAuth();

  const baseUrl = Platform.OS === 'web'
    ? process.env.EXPO_PUBLIC_API_URL_WEB
    : process.env.EXPO_PUBLIC_API_URL_MOBILE;

  useEffect(() => {
    if (!selectedLocation) {
      const fetchDefaultLocation = async () => {
        try {
          const response = await fetch(`${baseUrl}/api/locations`);
          if (response.ok) {
            const data: LocationResponse[] = await response.json();
            if (data && data.length > 0) {
              // Cerca "Torino" come default iniziale per retrocompatibilità, altrimenti prende il primo
              const torino = data.find(l => l.city.toLowerCase() === 'torino');
              setSelectedLocation(torino || data[0]);
            }
          }
        } catch (error) {
          console.error("Error fetching default location:", error);
        }
      };
      fetchDefaultLocation();
    }
  }, [selectedLocation, baseUrl, setSelectedLocation]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/hero_bg.png')}
        style={styles.image}
        imageStyle={{ opacity: 0.85 }}
      >
        <View style={styles.overlay}>
          <View style={styles.avatarCenterer}>
            <View style={styles.avatarContainer}>
              <Image
                source={require('@/assets/images/avatar.png')}
                style={styles.avatarImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Testi in basso */}
          <View style={styles.textContainer}>
            <Text style={styles.welcomeSpan}>Welcome to</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            {selectedLocation && (
              <TouchableOpacity
                onPress={() => router.push('/other/locations')}
                activeOpacity={0.7}
                style={styles.badgeWrapper}
              >
                <StatusBadge isOpen={selectedLocation.isOpen} city={selectedLocation.city} />
                <Text style={styles.addressText}>{selectedLocation.address}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: height * 0.48,
    width: '100%',
  },
  image: {
    flex: 1,
  },
  overlay: {
    backgroundColor: 'rgba(10, 15, 28, 0.65)', // overlay blu scuro semi-trasparente
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  avatarCenterer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 5,
    borderColor: 'rgba(76, 201, 240, 0.45)', // bordo crystal blue
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 26, 46, 0.6)',
    shadowColor: '#4cc9f0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  avatarImage: {
    width: '88%',
    height: '88%',
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  welcomeSpan: {
    color: '#67d8ff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#c0d4f0',
    fontSize: 16.5,
    marginTop: 6,
    opacity: 0.95,
  },
  badgeWrapper: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  addressText: {
    color: '#8ab4e0',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 8,
    opacity: 0.8,
    fontWeight: '500',
  },
});

export default Hero;