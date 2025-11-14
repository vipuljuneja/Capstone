import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomHeader from '../../Components/UI/CustomHeader';

const Level3NoticeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    levelNumber = 3,
    levelTitle = 'Face Time',
    scenarioTitle = 'Ordering Coffee',
    scenarioEmoji = '☕',
    scenarioId,
  } = route.params || {};

  const handleGotIt = () => {
    navigation.navigate('Level3IntroScreen', {
      levelNumber,
      levelTitle,
      scenarioTitle,
      scenarioEmoji,
      scenarioId,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        safeAreaColor="#fafaff"
        headerColor="#fafaff"
        title={'Level 3'}
        onLeftPress={() => {
          navigation.navigate('LevelOptions', { ...route.params });
        }}
      />

      <View style={styles.content}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Front camera</Text>
          <Text style={styles.title}>required</Text>
          <Text style={styles.subtitle}>
            This level requires front camera to practice facial impressions
          </Text>
        </View>

        {/* Instruction Cards */}
        <View style={styles.instructionsContainer}>
          {/* Card 1 - Keep face visible */}
          <View style={styles.instructionCard1}>
            <View style={styles.phoneIcon}>
              <View style={styles.phoneScreen}>
                <Image
                  source={require('../../../assets/level-illustrations/pipo-notice-lighting.png')}
                  style={styles.characterInPhone}
                />
              </View>
              <View style={styles.phoneButton} />
            </View>
            <Text style={styles.instructionText}>
              Always keep your face visible in the frame
            </Text>
          </View>

          {/* Card 2 - Good lighting */}
          <View style={styles.instructionCard2}>
            <Text style={styles.instructionText2}>
              Ensure good lighting for better recognition
            </Text>
            <View style={styles.lightingIcon}>
              <Image
                source={require('../../../assets/level-illustrations/pipo-notice-lighting.png')}
                style={styles.characterNotInPhone}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Got It Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.gotItButton} onPress={handleGotIt}>
          <Text style={styles.gotItButtonText}>GOT IT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    fontSize: 28,
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  instructionsContainer: {
    gap: 20,
  },
  instructionCard1: {
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    padding: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  phoneIcon: {
    width: 80,
    height: 120,
    backgroundColor: '#4A4458',
    borderRadius: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  phoneScreen: {
    width: 65,
    height: 95,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  characterInPhone: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    top: 20,
  },
  characterNotInPhone: {
    width: 60,
    height: 60,
    resizeMode: 'cover',
    // top: 20,
  },
  phoneButton: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: 'white',
    opacity: 0.6,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  instructionCard2: {
    backgroundColor: '#F0F4E8',
    borderRadius: 20,
    padding: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  instructionText2: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  lightingIcon: {
    position: 'relative',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sunEmoji: {
    fontSize: 40,
    position: 'absolute',
    top: -5,
    right: 0,
  },
  characterEmoji: {
    fontSize: 45,
    marginTop: 10,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  gotItButton: {
    backgroundColor: '#6B5B95',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  gotItButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default Level3NoticeScreen;
