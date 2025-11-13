import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

import CustomHeader from '../../Components/UI/CustomHeader';

const Level3IntroScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    levelNumber = 3,
    levelTitle = 'Level 3',
    scenarioTitle = 'Voice and Facial Expressions Practice',
    scenarioDescription = 'You are at your favourite cafe. You ordered your usual menu but the barista gives you the wrong order . . .',
    scenarioId,
  } = route.params || {};

  useEffect(() => {
    navigation.setOptions({
      title: levelTitle || 'Level 3',
    });
  }, [navigation, route.params]);

  const handleStart = () => {
    navigation.navigate('Level3Screen', route.params);
  };

  return (
    <LinearGradient colors={['#fafaff', '#d6dafe']} style={styles.container}>
      <CustomHeader
        safeAreaColor="#fafaff"
        headerColor="#fafaff"
        title={'Level 3'}
        onLeftPress={() => {
          navigation.navigate('Level3NoticeScreen', { ...route.params });
        }}
      />

      {/* Top Section - Level Info */}
      <View style={styles.topSection}>
        <Text style={styles.levelTitle}>
          Voice and Facial Expressions Practice
        </Text>
      </View>

      {/* Middle Section - Character */}
      <View style={styles.middleSection}>
        <Image
          source={require('../../../assets/pipo/pipo-loading.png')}
          style={styles.characterImage}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Section - Scenario Card + Start Button */}
      <View style={styles.bottomSection}>
        <View style={styles.scenarioCard}>
          <Text style={styles.scenarioText}>{scenarioDescription}</Text>
        </View>
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>START</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  levelTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 14,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterImage: {
    width: 240,
    height: 240,
    marginBottom: 0,
  },
  bottomSection: {
    padding: 20,
    paddingBottom: 30,
  },
  scenarioCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 20,
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
    backgroundColor: '#6B5B95',
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
});

export default Level3IntroScreen;
