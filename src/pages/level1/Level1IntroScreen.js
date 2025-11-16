// src/screens/levels/LevelIntroScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { StackActions } from '@react-navigation/native';

import CustomHeader from '../../Components/UI/CustomHeader';

const LevelIntroScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Get level info from navigation params
  const {
    levelNumber = 1,
    levelTitle = 'Level 1',
    scenarioTitle = 'Ordering Coffee',
    scenarioDescription = "You're at your local café, and you want to order the new Halloween drinks...",
    scenarioId,
  } = route.params || {};

  useEffect(() => {
    navigation.setOptions({
      title: levelTitle || 'Level 1',
    });
  }, [navigation, route.params]);

  console.log('LevelIntroScreen params:', route.params);

  const handleStart = () => {
    // Navigate to the actual level screen based on level number
    const levelScreens = {
      1: 'Level1Practice',
      2: 'Level2Practice',
      3: 'Level3Practice',
    };

    navigation.navigate('Level1Screen', route.params);
  };

  return (
    <LinearGradient colors={['#fafaff', '#d6dafe']} style={styles.container}>
      <CustomHeader
        safeAreaColor="#fafaff"
        headerColor="#fafaff"
        // title={'Voice Practice'}
        onLeftPress={() => {
          navigation.navigate('LevelOptions', { ...route.params });
        }}
      />

      <View style={styles.topSection1}>
        <Text style={styles.levelTitle1}>Level 1</Text>
      </View>

      <View style={styles.topSection}>
        <Text style={styles.levelTitle}>Voice Practice</Text>
      </View>

      {/* Middle Section - Character */}
      <View style={styles.middleSection}>
        <Image
          source={require('../../../assets/gifs/LoadingPIPO.gif')}
          style={styles.characterImage}
          resizeMode="contain"
        />
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
      {/* </View> */}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  topSection1: {
    alignItems: 'center',
    paddingTop: 80,
  },
  levelLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  topSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  levelLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  levelTitle1: {
    fontSize: 20,
    // fontWeight: 'bold',
    color: '#333',
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
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
    // backgroundColor: 'white',
    borderRadius: 18,
    padding: 20,
    marginBottom: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
  scenarioText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#3E3153',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 32,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  characterImage: {
    width: 450,
    height: 600,
    marginBottom: 0,
  },
  levelLabel: {
    fontSize: 18,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default LevelIntroScreen;
