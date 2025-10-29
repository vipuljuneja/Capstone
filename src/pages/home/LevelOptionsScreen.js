// src/screens/scenarios/LevelOptionsScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { fetchAndLogUserCards } from '../../services/sessionSaver';

export default function LevelOptionsScreen({ route, navigation }) {
  const { scenarioTitle, scenarioEmoji, scenarioId, scenarioDescription } = route.params;
  
  // Use the actual scenario ID from the API instead of hardcoded fallback
  const finalScenarioId = scenarioId || '507f1f77bcf86cd799439011';
  const { mongoUser } = useAuth();

  // Test function to manually fetch cards
  const testFetchCards = async () => {
    if (mongoUser?._id) {
      console.log('🧪 TESTING CARD FETCH...');
      await fetchAndLogUserCards(mongoUser._id);
    } else {
      console.log('❌ No user ID available for testing');
    }
  };

  const levels = [
    {
      id: 1,
      title: 'Level 1 Voice Check',
      description:
        'Start with your voice. Explore your pace and tone to build up confidence.',
      emoji: '🎵',
      isLocked: false,
      bgColor: '#E3F2FD',
    },
    {
      id: 2,
      title: 'Level 2 Face Time',
      description:
        'Practice both voice and facial expressions at your own pace with Pipo',
      emoji: '😊',
      isLocked: false,
      bgColor: '#FFF9C4',
    },
    {
      id: 3,
      title: 'Level 3 Real Talk',
      description:
        'Time to go all in. Combine voice and facial and expressions like a pro.',
      emoji: '💬',
      isLocked: true,
      bgColor: '#C8E6C9',
    },
  ];

  const handleLevelPress = level => {
    if (level.isLocked) return;

    // Level 2 requires camera notice first
    if (level.id === 2) {
      navigation.navigate('Level2NoticeScreen', {
        levelNumber: level.id,
        levelTitle: level.title.split(' ').slice(0, 2).join(' '), // "Level 2"
        scenarioTitle: scenarioTitle,
        scenarioEmoji: scenarioEmoji,
        scenarioId: finalScenarioId,
      });
    } else {
      // Level 1 goes directly to intro
      navigation.navigate('Level1IntroScreen', {
        levelNumber: level.id,
        levelTitle: level.title.split(' ').slice(0, 2).join(' '),
        scenarioTitle: scenarioTitle,
        scenarioEmoji: scenarioEmoji,
        scenarioId: finalScenarioId,
        scenarioDescription: scenarioDescription,
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{scenarioTitle}</Text>
        <TouchableOpacity
          onPress={testFetchCards}
          style={styles.testButton}
        >
          <Text style={styles.testButtonText}>🃏</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline with Levels */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {levels.map((level, index) => (
          <View key={level.id} style={styles.levelRow}>
            {/* Timeline Dots and Line */}
            <View style={styles.timelineColumn}>
              <View
                style={[
                  styles.timelineCircle,
                  { backgroundColor: level.isLocked ? '#B0A0C0' : '#6B5B95' },
                ]}
              >
                {level.isLocked ? (
                  <Text style={styles.lockIcon}>🔒</Text>
                ) : (
                  <View style={styles.timelineDot} />
                )}
              </View>

              {index < levels.length - 1 && (
                <View style={styles.timelineLine} />
              )}
            </View>

            {/* Level Card */}
            <TouchableOpacity
              style={[styles.levelCard, { opacity: level.isLocked ? 0.6 : 1 }]}
              onPress={() => handleLevelPress(level)}
              disabled={level.isLocked}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardText}>
                  <Text style={styles.levelTitle}>{level.title}</Text>
                  <Text style={styles.levelDescription}>
                    {level.description}
                  </Text>
                </View>

                <View
                  style={[styles.levelIcon, { backgroundColor: level.bgColor }]}
                >
                  <Text style={styles.levelEmoji}>{level.emoji}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}

        {/* Special Mission */}
        <View style={styles.levelRow}>
          <View style={styles.timelineColumn}>
            <View
              style={[styles.timelineCircle, { backgroundColor: '#B0A0C0' }]}
            >
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          </View>

          <View style={styles.specialMission}>
            <Text style={styles.levelTitle}>Special Mission</Text>
            <Text style={styles.levelDescription}>
              Complete all 3 levels to unlock
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
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
  testButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 20,
    color: '#8b5cf6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  levelRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  timelineColumn: {
    alignItems: 'center',
    marginRight: 20,
    width: 50,
  },
  timelineCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  lockIcon: {
    fontSize: 20,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  timelineLine: {
    width: 3,
    flex: 1,
    backgroundColor: '#D0D0D0',
    minHeight: 120,
  },
  levelCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    paddingRight: 10,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  levelDescription: {
    color: '#666',
    fontSize: 13,
    lineHeight: 20,
  },
  levelIcon: {
    width: 80,
    height: 80,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelEmoji: {
    fontSize: 35,
  },
  specialMission: {
    flex: 1,
    backgroundColor: '#E8DCFF',
    borderRadius: 15,
    padding: 20,
  },
});
