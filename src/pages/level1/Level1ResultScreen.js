// src/screens/levels/Level1ResultScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const Level1ResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { transcriptionResults = [] } = route.params || {};

  console.log('📊 Results screen received:', transcriptionResults);

  // Calculate average metrics from all recordings
  const calculateMetrics = () => {
    if (transcriptionResults.length === 0) {
      return {
        avgWpm: 0,
        totalFillers: 0,
        totalPauses: 0,
        avgDuration: 0,
      };
    }

    const totalWpm = transcriptionResults.reduce(
      (sum, r) => sum + (r.wpm || 0),
      0,
    );
    const totalFillers = transcriptionResults.reduce(
      (sum, r) => sum + (r.fillerWordCount || 0),
      0,
    );
    const totalPauses = transcriptionResults.reduce(
      (sum, r) => sum + (r.pauseCount || 0),
      0,
    );
    const totalDuration = transcriptionResults.reduce(
      (sum, r) => sum + parseFloat(r.duration || 0),
      0,
    );

    return {
      avgWpm: Math.round(totalWpm / transcriptionResults.length),
      totalFillers,
      totalPauses,
      avgDuration: (totalDuration / transcriptionResults.length).toFixed(1),
    };
  };

  const metrics = calculateMetrics();

  // Generate feedback based on actual data
  const generatePaceFeedback = () => {
    if (metrics.avgWpm < 100) {
      return "Your speaking pace is very calm and steady! This gives listeners time to absorb your words. You're doing great!";
    } else if (metrics.avgWpm < 150) {
      return "Sometimes your words come out quickly, which is very common. Taking an extra breath before speaking can help your pace feel even calmer. You're leveling up bit by bit!";
    } else {
      return 'You speak quite quickly! Try to slow down a bit - taking pauses between sentences can help your listener follow along better.';
    }
  };

  const generateToneFeedback = () => {
    return "I loved how calm your voice sounded! Maybe next time, try sprinkling in a little up-and-down melody. It'll make your words sparkle even more";
  };

  const generateFillerFeedback = () => {
    if (metrics.totalFillers === 0) {
      return "Excellent work! You didn't use any filler words. Your speech was clear and confident!";
    } else if (metrics.totalFillers <= 3) {
      return `You used ${metrics.totalFillers} filler word${
        metrics.totalFillers > 1 ? 's' : ''
      } like 'um' or 'like', and that happens to everyone. If you'd like, try a soft pause instead. Pauses can feel peaceful and give your listener a moment to lean in.`;
    } else {
      return `You used ${metrics.totalFillers} filler words during your practice. Try replacing them with brief pauses - it will make your speech sound more confident!`;
    }
  };

  const handleRetry = () => {
    navigation.navigate('Level1IntroScreen');
  };

  const handleNextLevel = () => {
    // Get the scenario info from route params if available
    const { scenarioTitle, scenarioEmoji } = route.params || {};

    navigation.navigate('LevelOptions', {
      scenarioTitle: scenarioTitle || 'Ordering Coffee',
      scenarioEmoji: scenarioEmoji || '☕',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('LevelOptions')}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Character and Title */}
        <View style={styles.topSection}>
          <View style={styles.characterContainer}>
            <Text style={styles.characterEmoji}>💧</Text>
          </View>
          <Text style={styles.title}>That was smooth!</Text>
        </View>

        {/* Feedback Card */}
        <View style={styles.feedbackCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderIcon}>🎙️</Text>
            <Text style={styles.cardHeaderText}>Your voice</Text>
          </View>

          {/* Pace Section */}
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>PACE</Text>
            <Text style={styles.sectionMetric}>
              Average: {metrics.avgWpm} words per minute
            </Text>
            <Text style={styles.sectionText}>{generatePaceFeedback()}</Text>
          </View>

          {/* Tone Section */}
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>TONE</Text>
            <Text style={styles.sectionText}>{generateToneFeedback()}</Text>
          </View>

          {/* Filler Words Section */}
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>FILLER WORDS</Text>
            <Text style={styles.sectionMetric}>
              Total: {metrics.totalFillers} filler
              {metrics.totalFillers !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.sectionText}>{generateFillerFeedback()}</Text>
          </View>

          {/* Pauses Section */}
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>PAUSES</Text>
            <Text style={styles.sectionMetric}>
              Total: {metrics.totalPauses} pause
              {metrics.totalPauses !== 1 ? 's' : ''} detected
            </Text>
            <Text style={styles.sectionText}>
              {metrics.totalPauses === 0
                ? 'Try adding some natural pauses to give your listener time to process your words.'
                : metrics.totalPauses < 5
                ? 'Good use of pauses! They help make your speech more natural and easier to follow.'
                : "You're using pauses well! This gives your listener moments to absorb what you're saying."}
            </Text>
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Session Summary</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Questions completed:</Text>
            <Text style={styles.statsValue}>{transcriptionResults.length}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Average WPM:</Text>
            <Text style={styles.statsValue}>{metrics.avgWpm}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Total filler words:</Text>
            <Text style={styles.statsValue}>{metrics.totalFillers}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Total pauses:</Text>
            <Text style={styles.statsValue}>{metrics.totalPauses}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>RETRY</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNextLevel}>
          <Text style={styles.nextButtonText}>NEXT LEVEL</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    fontSize: 28,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  characterContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  characterEmoji: {
    fontSize: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  feedbackCard: {
    backgroundColor: '#E8F4FF',
    borderRadius: 20,
    padding: 25,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardHeaderIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  cardHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  feedbackSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  sectionMetric: {
    fontSize: 13,
    color: '#6B5B95',
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  statsCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statsLabel: {
    fontSize: 15,
    color: '#666',
  },
  statsValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#6B5B95',
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  retryButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6B5B95',
  },
  retryButtonText: {
    color: '#6B5B95',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#6B5B95',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default Level1ResultScreen;
