import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const Level2IntroScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    levelNumber = 3,
    levelTitle = 'Real Talk',
    scenarioTitle = 'Ordering Coffee',
    scenarioDescription = 'Time to go all in! Combine voice and facial expressions like a pro.',
    scenarioId,
  } = route.params || {};

  const handleStart = () => {
    navigation.navigate('Level2Screen', {
      levelNumber,
      scenarioTitle,
      scenarioId,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.levelLabel}>Level {levelNumber}</Text>
        <Text style={styles.levelTitle}>{levelTitle}</Text>
      </View>

      <View style={styles.middleSection}>
        <View style={styles.characterContainer}>
          <Text style={styles.characterEmoji}>💧</Text>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.scenarioCard}>
          <Text style={styles.scenarioText}>{scenarioDescription}</Text>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>START</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topSection: { alignItems: 'center', paddingTop: 20, paddingBottom: 20 },
  levelLabel: { fontSize: 16, color: '#666', marginBottom: 8 },
  levelTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F0FF',
  },
  characterContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#D4C4F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterEmoji: { fontSize: 100 },
  bottomSection: { padding: 20, paddingBottom: 30 },
  scenarioCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
  },
  scenarioText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#6B5B95',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default Level2IntroScreen;
