// src/screens/levels/LevelIntroScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const LevelIntroScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Get level info from navigation params
  const {
    levelNumber = 1,
    levelTitle = 'Voice Practice',
    scenarioTitle = 'Ordering Coffee',
    scenarioDescription = "You're at your local café, and you want to order the new Halloween drinks...",
    scenarioId,
  } = route.params || {};

  const handleStart = () => {
    // Navigate to the actual level screen based on level number
    const levelScreens = {
      1: 'Level1Practice',
      2: 'Level2Practice',
      3: 'Level3Practice',
    };

    navigation.navigate('Level1Screen', {
      levelNumber,
      scenarioTitle,
      scenarioId,
    });
  };

  return (
    <View style={styles.container}>
      {/* Top Section - Level Info */}
      <View style={styles.topSection}>
        <Text style={styles.levelLabel}>Level {levelNumber}</Text>
        <Text style={styles.levelTitle}>{levelTitle}</Text>
      </View>

      {/* Middle Section - Character */}
      <View style={styles.middleSection}>
        <View style={styles.characterContainer}>
          <Text style={styles.characterEmoji}>💧</Text>
        </View>
      </View>

      {/* Bottom Section - Scenario Card + Start Button */}
      <View style={styles.bottomSection}>
        <View style={styles.scenarioCard}>
          <Text style={styles.scenarioText}>{scenarioDescription}</Text>
        </View>

        {/* Start Button */}
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>START</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#333',
  },
  topSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  levelLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  levelTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  characterEmoji: {
    fontSize: 100,
  },
  bottomSection: {
    padding: 20,
    paddingBottom: 30,
  },
  scenarioCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default LevelIntroScreen;
