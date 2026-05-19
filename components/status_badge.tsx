import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Text } from 'react-native';

const StatusBadge = ({ isOpen, city }: { isOpen: boolean, city: string }) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    if (isOpen) {
      animation.start();
    } else {
      animation.stop();
      opacity.setValue(1);
    }

    return () => animation.stop();
  }, [isOpen]);

  return (
    <View style={styles.badgeContainer}>
      <Animated.View 
        style={[
          styles.dot, 
          { 
            backgroundColor: isOpen ? '#5ce1d6' : '#ef4444', 
            opacity 
          } 
        ]} 
      />
      <Text style={styles.statusText}>
        {city} • {isOpen ? 'APERTO' : 'CHIUSO'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 26, 46, 0.75)', // blu scuro semi-trasparente
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(76, 201, 240, 0.2)',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: '#c0d4f0',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});

export default StatusBadge;