import React from 'react';
import { StyleSheet, View, Text, ImageBackground, Dimensions, Image } from 'react-native';
import { Badge } from './ui/badge';
import { Icon } from './ui/icon';
import { BadgeCheckIcon } from 'lucide-react-native';
import StatusBadge from './status_badge';

const { height } = Dimensions.get('window');
const AVATAR_SIZE = 180;

const Hero = ({ title, subtitle }: { title: string; subtitle: string }) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/hero_bg.png')}
        style={styles.image}
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

          {/* Testi in basso a sinistra */}
          <View style={styles.textContainer}>
            <Text style={styles.welcomeSpan}>Welcome to</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <StatusBadge isOpen={true} />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: height * 0.45,
    width: '100%',
  },
  image: {
    flex: 1,
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
    padding: 20,
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
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarImage: {
    width: '90%', // Ridotto leggermente per non toccare il bordo se l'immagine è quadrata
    height: '90%',
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  welcomeSpan: {
    color: '#34d399', // Un verde smeraldo o un colore che richiami il brand
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  subtitle: {
    color: '#e2e8f0',
    fontSize: 16,
    marginTop: 4,
    opacity: 0.9,
  },
});

export default Hero;