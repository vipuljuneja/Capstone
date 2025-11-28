import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// Theme constants (from src/theme/index.ts)
const colors = {
  backgroundDark: '#fffff',
  textInverse: '#00000',
};

const typography = {
  sizes: {
    sm: 12,
    md: 16,
    xxl: 24,
  },
  weights: {
    bold: '700',
  },
  lineHeights: {
    relaxed: 1.75,
  },
};

const spacing = {
  lg: 24,
  xl: 32,
  xxl: 40,
};

const { width, height } = Dimensions.get('window');

// Random facts about social anxiety and communication
const SOCIAL_ANXIETY_FACTS = [
  'Did you know? Practicing conversations regularly can help reduce social anxiety over time.',
  'Tip: Deep breathing exercises can help calm your nerves before important conversations.',
  "Remember: Everyone feels nervous sometimes. You're not alone in this journey.",
  "Fact: Social anxiety affects millions of people worldwide. You're taking positive steps!",
  'Did you know? Visualizing successful conversations can boost your confidence.',
  'Tip: Starting with small interactions helps build confidence for bigger conversations.',
  'Remember: Progress, not perfection. Every practice session makes you stronger.',
  'Fact: Most people are too focused on themselves to notice your nervousness.',
  'Did you know? Practicing in a safe environment like this builds real-world confidence.',
  "Tip: Focus on the conversation, not on how you're being perceived.",
  'Remember: Your voice matters. Every word you speak is valuable.',
  'Fact: Social skills improve with practice, just like any other skill.',
];

const MISSION_STATEMENT = `Our mission is to help you build confidence
in social situations through safe, guided practice.`;

const LevelResultsLoadingScreen = ({ visible }) => {
  const [currentFact, setCurrentFact] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const factFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Set initial fact
      setCurrentFact(
        SOCIAL_ANXIETY_FACTS[
          Math.floor(Math.random() * SOCIAL_ANXIETY_FACTS.length)
        ],
      );

      // Animate entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Rotate animation for subtle movement
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Change fact every 4 seconds with fade animation
      const factInterval = setInterval(() => {
        Animated.sequence([
          Animated.timing(factFadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(factFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();

        // Change fact in the middle of fade
        setTimeout(() => {
          setCurrentFact(
            SOCIAL_ANXIETY_FACTS[
              Math.floor(Math.random() * SOCIAL_ANXIETY_FACTS.length)
            ],
          );
        }, 300);
      }, 4000);

      return () => clearInterval(factInterval);
    } else {
      // Reset animations when hidden
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      rotateAnim.setValue(0);
      factFadeAnim.setValue(1);
    }
  }, [visible]);

  if (!visible) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  return (
    <LinearGradient colors={['#d6dafe', '#fafaff']} style={styles.container}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Pipo Character */}
          <Animated.View
            style={[
              styles.pipoContainer,
              {
                transform: [{ rotate }],
              },
            ]}
          >
            <Image
              source={require('../../../assets/pipo/pipo-loading.png')}
              style={styles.pipoImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Loading Text */}
          <Text style={styles.loadingText}>LOADING...</Text>

          {/* Random Fact */}
          <Animated.View
            style={[
              styles.factContainer,
              {
                opacity: factFadeAnim,
              },
            ]}
          >
            <Text style={styles.factText}>{currentFact}</Text>
          </Animated.View>

          {/* Mission Statement */}
          <View style={styles.missionContainer}>
            <Text style={styles.missionText}>{MISSION_STATEMENT}</Text>
          </View>
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.backgroundDark, // Dark purple background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    width: width * 0.9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipoContainer: {
    marginBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipoImage: {
    width: width * 0.4,
    height: width * 0.4,
    maxWidth: 200,
    maxHeight: 200,
  },
  loadingText: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
    letterSpacing: 2,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  factContainer: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
  },
  factText: {
    fontSize: typography.sizes.md,
    color: colors.textInverse,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.sizes.md,
    opacity: 0.9,
  },
  missionContainer: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  missionText: {
    fontSize: typography.sizes.sm,
    color: colors.textInverse,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.sizes.sm,
    opacity: 0.8,
  },
});

export default LevelResultsLoadingScreen;

