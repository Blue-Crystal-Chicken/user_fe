import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Text } from 'react-native';

const StatusBadge = ({ isOpen }: { isOpen: boolean }) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animazione loop: va da 1 a 0.3 e torna indietro
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    if (isOpen) {
      animation.start();
    } else {
      animation.stop();
      opacity.setValue(1); // Resta fisso se chiuso
    }

    return () => animation.stop();
  }, [isOpen]);

  return (
    <View style={styles.badgeContainer}>
      <Animated.View 
        style={[
          styles.dot, 
          { backgroundColor: isOpen ? '#34d399' : '#ef4444', opacity } 
        ]} 
      />
      <Text style={styles.statusText}>
        {isOpen ? 'Open Now' : 'Closed'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default StatusBadge;