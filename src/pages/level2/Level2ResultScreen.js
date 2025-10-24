// src/screens/levels/Level2ResultScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const Level2ResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { transcriptionResults = [], facialAnalysisResults = [] } =
    route.params || {};

  console.log('📊 Level2 Results received:', {
    transcription: transcriptionResults.length,
    facial: facialAnalysisResults.length,
  });

  // Calculate audio metrics
  const calculateAudioMetrics = () => {
    if (transcriptionResults.length === 0) {
      return { avgWpm: 0, totalFillers: 0, totalPauses: 0 };
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

    return {
      avgWpm: Math.round(totalWpm / transcriptionResults.length),
      totalFillers,
      totalPauses,
    };
  };

  // Calculate facial metrics
  const calculateFacialMetrics = () => {
    if (facialAnalysisResults.length === 0) {
      return {
        avgSmileScore: 0,
        avgEyeContact: 0,
        avgEngagement: 0,
      };
    }

    const totalSmile = facialAnalysisResults.reduce(
      (sum, r) => sum + (r.smileScore || 0),
      0,
    );
    const totalEyeContact = facialAnalysisResults.reduce(
      (sum, r) => sum + (r.eyeContactScore || 0),
      0,
    );
    const totalEngagement = facialAnalysisResults.reduce(
      (sum, r) => sum + (r.engagementScore || 0),
      0,
    );

    return {
      avgSmileScore: Math.round(totalSmile / facialAnalysisResults.length),
      avgEyeContact: Math.round(totalEyeContact / facialAnalysisResults.length),
      avgEngagement: Math.round(totalEngagement / facialAnalysisResults.length),
    };
  };

  const audioMetrics = calculateAudioMetrics();
  const facialMetrics = calculateFacialMetrics();

  // Generate audio feedback
  const generatePaceFeedback = () => {
    if (audioMetrics.avgWpm < 100) {
      return 'Your speaking pace is very calm and steady! This gives listeners time to absorb your words.';
    } else if (audioMetrics.avgWpm < 150) {
      return 'Sometimes your words come out quickly, which is very common. Taking an extra breath before speaking can help your pace feel even calmer.';
    } else {
      return 'You speak quite quickly! Try to slow down a bit - taking pauses can help your listener follow along better.';
    }
  };

  const generateFillerFeedback = () => {
    if (audioMetrics.totalFillers === 0) {
      return "Excellent work! You didn't use any filler words. Your speech was clear and confident!";
    } else if (audioMetrics.totalFillers <= 3) {
      return `You used ${audioMetrics.totalFillers} filler word${
        audioMetrics.totalFillers > 1 ? 's' : ''
      } like 'um' or 'like'. Try replacing them with brief pauses instead!`;
    } else {
      return `You used ${audioMetrics.totalFillers} filler words during your practice. Try replacing them with brief pauses!`;
    }
  };

  // Generate facial feedback
  const generateFacialFeedback = () => {
    if (facialMetrics.avgSmileScore >= 70) {
      return 'Your smile was warm and genuine! It really helps connect with your listener and shows confidence.';
    } else if (facialMetrics.avgSmileScore >= 40) {
      return 'Nice work with your expressions! Try smiling a bit more naturally - it helps make your message more engaging.';
    } else {
      return 'Remember to smile occasionally! A warm expression helps your listener feel more comfortable and engaged.';
    }
  };

  const generateEyeContactFeedback = () => {
    if (facialMetrics.avgEyeContact >= 70) {
      return 'Excellent eye contact! You maintained great focus, which shows confidence and connection.';
    } else if (facialMetrics.avgEyeContact >= 40) {
      return 'Good effort with eye contact! Try to maintain it a bit more consistently to show engagement.';
    } else {
      return "Try to look at the camera more often! Eye contact helps build trust and shows you're engaged.";
    }
  };

  const handleRetry = () => {
    navigation.navigate('Level2IntroScreen');
  };

  const handleNextLevel = () => {
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

        {/* Audio Feedback Card */}
        <View style={styles.feedbackCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderIcon}>🎙️</Text>
            <Text style={styles.cardHeaderText}>Your voice</Text>
          </View>

          {/* Pace Section */}
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>PACE</Text>
            <Text style={styles.sectionMetric}>
              Average: {audioMetrics.avgWpm} words per minute
            </Text>
            <Text style={styles.sectionText}>{generatePaceFeedback()}</Text>
          </View>

          {/* Filler Words Section */}
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>FILLER WORDS</Text>
            <Text style={styles.sectionMetric}>
              Total: {audioMetrics.totalFillers} filler
              {audioMetrics.totalFillers !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.sectionText}>{generateFillerFeedback()}</Text>
          </View>

          {/* Pauses Section */}
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>PAUSES</Text>
            <Text style={styles.sectionMetric}>
              Total: {audioMetrics.totalPauses} pause
              {audioMetrics.totalPauses !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.sectionText}>
              {audioMetrics.totalPauses === 0
                ? 'Try adding some natural pauses to give your listener time to process.'
                : 'Good use of pauses! They help make your speech more natural.'}
            </Text>
          </View>
        </View>

        {/* Facial Analysis Card */}
        <View style={[styles.feedbackCard, { backgroundColor: '#FFF9E6' }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderIcon}>😊</Text>
            <Text style={styles.cardHeaderText}>Your expressions</Text>
          </View>

          {/* Smile Section */}
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>SMILE & WARMTH</Text>
            <Text style={styles.sectionMetric}>
              Score: {facialMetrics.avgSmileScore}/100
            </Text>
            <Text style={styles.sectionText}>{generateFacialFeedback()}</Text>
          </View>

          {/* Eye Contact Section */}
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>EYE CONTACT</Text>
            <Text style={styles.sectionMetric}>
              Score: {facialMetrics.avgEyeContact}/100
            </Text>
            <Text style={styles.sectionText}>
              {generateEyeContactFeedback()}
            </Text>
          </View>

          {/* Engagement Section */}
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>ENGAGEMENT</Text>
            <Text style={styles.sectionMetric}>
              Score: {facialMetrics.avgEngagement}/100
            </Text>
            <Text style={styles.sectionText}>
              {facialMetrics.avgEngagement >= 70
                ? 'Great energy and presence! You looked engaged and confident throughout.'
                : 'Try to show more animation in your expressions - it helps convey enthusiasm!'}
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
            <Text style={styles.statsValue}>{audioMetrics.avgWpm}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Smile score:</Text>
            <Text style={styles.statsValue}>
              {facialMetrics.avgSmileScore}/100
            </Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Eye contact:</Text>
            <Text style={styles.statsValue}>
              {facialMetrics.avgEyeContact}/100
            </Text>
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingVertical: 15 },
  backButton: { fontSize: 28, color: '#333' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  topSection: { alignItems: 'center', marginBottom: 30 },
  characterContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  characterEmoji: { fontSize: 80 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  feedbackCard: {
    backgroundColor: '#E8F4FF',
    borderRadius: 20,
    padding: 25,
    marginBottom: 15,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  cardHeaderIcon: { fontSize: 24, marginRight: 10 },
  cardHeaderText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  feedbackSection: { marginBottom: 20 },
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
  sectionText: { fontSize: 15, color: '#666', lineHeight: 22 },
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
  statsLabel: { fontSize: 15, color: '#666' },
  statsValue: { fontSize: 15, fontWeight: 'bold', color: '#6B5B95' },
  bottomButtons: { flexDirection: 'row', padding: 20, gap: 15 },
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

export default Level2ResultScreen;
