import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, TouchableOpacity } from 'react-native';

const RIPPLE_COUNT = 3; // Number of visible rings at a time

const AnimatedRippleButton = ({
  size = 120,
  rippleColor = '#f1fff0ff',
  rippleCount = RIPPLE_COUNT,
  duration = 2500,
  diskSize = 60,
  onPress,
  children,
  style,
}) => {
  const ripples = Array.from({ length: rippleCount }, (_, i) => ({
    scale: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(1)).current,
  }));

  useEffect(() => {
    let isMounted = true;

    function animateRipple(idx, delay) {
      if (!isMounted) return;
      const { scale, opacity } = ripples[idx];
      scale.setValue(0);
      opacity.setValue(1);
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration,
          useNativeDriver: true,
          delay,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
          delay,
        }),
      ]).start(() => {
        // Restart this ripple
        if (isMounted) animateRipple(idx, 0);
      });
    }

    ripples.forEach((_, idx) => {
      // Stagger the animation
      animateRipple(idx, (duration / rippleCount) * idx);
    });

    return () => {
      isMounted = false;
    };
  }, [duration, rippleCount, ripples]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.container, { width: size, height: size }, style]}
    >
      {/* Ripples underneath */}
      <View style={styles.rippleWrapper}>
        {ripples.map(({ scale, opacity }, idx) => (
          <Animated.View
            key={idx}
            style={[
              styles.ripple,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: rippleColor,
                position: 'absolute',
                opacity,
                transform: [{ scale }],
              },
            ]}
          />
        ))}
      </View>
      {/* Central disk or SVG */}
      <View
        style={[
          styles.disk,
          {
            width: diskSize,
            height: diskSize,
            borderRadius: diskSize / 2,
          },
        ]}
      >
        {children}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ripple: {
    position: 'absolute',
  },
  disk: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // Soft blue to match your disk, or set transparent to use passed-in SVG
    elevation: 3,
    // shadowColor: '#B0B0FF',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.11,
    // shadowRadius: 8,
  },
});

export default AnimatedRippleButton;
