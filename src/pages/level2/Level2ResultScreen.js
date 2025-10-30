// src/screens/levels/Level2ResultScreen.js
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useSessionSaver } from '../../services/sessionSaver';

// Utility helpers for analysis and feedback
const getPaceFeedback = avgWpm => {
  if (avgWpm < 100) {
    return 'Your speaking pace is very calm and steady! This gives listeners time to absorb your words.';
  }
  if (avgWpm < 150) {
    return 'Sometimes your words come out quickly, which is very common. Taking an extra breath before speaking can help your pace feel even calmer. You’re leveling up bit by bit!';
  }
  return 'You speak quite quickly! Try to slow down a bit – taking pauses can help your listener follow along better.';
};

const getToneFeedback = transcriptionResults => {
  // Use more advanced tone analysis if available; fallback to generic
  return "I loved how calm your voice sounded! Maybe next time, try sprinkling in a little up-and-down melody. It'll make your words sparkle even more.";
};

const getFillerFeedback = (totalFillers, usedWords) => {
  if (totalFillers === 0) {
    return "Excellent work! You didn't use any filler words. Your speech was clear and confident!";
  }
  if (totalFillers <= 3) {
    return `You used some '${usedWords.join(
      "', '",
    )}' and that happens to everyone. If you'd like, try a soft pause instead. Pauses can feel peaceful and give your listener a moment to lean in.`;
  }
  return `You used several fillers such as '${usedWords.join(
    "', '",
  )}'. Try pausing briefly when you need to gather your thoughts.`;
};

const getPauseFeedback = totalPauses => {
  if (totalPauses === 0) {
    return 'Try adding some natural pauses to give your listener time to process.';
  }
  return 'Your flow feels warm and steady. A quick pause now and then can make your speech shine.';
};

const getEyeContactFeedback = eyeContactScore => {
  if (eyeContactScore >= 70) {
    return 'Excellent eye contact! You maintained great focus, which shows confidence and connection.';
  }
  if (eyeContactScore >= 40) {
    return 'You looked around a few times. Try focusing on one spot or the person you’re talking to next time. With a little practice, it’ll feel easier and more natural.';
  }
  return "Try to look at the camera more often! Eye contact helps build trust and shows you're engaged.";
};

const getExpressionFeedback = smileScore => {
  if (smileScore >= 70) {
    return 'Your smile felt so genuine. Keeping your face relaxed helped you appear calm and approachable. You’re doing wonderfully here. Just keep letting your natural warmth come through.';
  }
  if (smileScore >= 40) {
    return 'Nice work with your expressions! Try smiling a bit more naturally - it helps make your message more engaging.';
  }
  return 'Remember to smile occasionally! A warm expression helps your listener feel more comfortable and engaged.';
};

const getPostureFeedback = postureScore => {
  if (postureScore >= 70) {
    return 'Your steady head position projected confidence and authority.';
  }
  return 'Try to keep a balanced, upright posture. It signals self-assurance.';
};

const getUsedFillerWords = transcriptionResults => {
  const wordSet = new Set();
  transcriptionResults.forEach(r => {
    if (r.fillerWords && Array.isArray(r.fillerWords)) {
      r.fillerWords.forEach(f => {
        wordSet.add(f.word);
      });
    }
  });
  return Array.from(wordSet);
};

const getAvgScore = (arr, path) => {
  let total = 0;
  let count = 0;
  arr.forEach(item => {
    const value = path.reduce((obj, key) => obj?.[key], item);
    if (typeof value === 'number') {
      total += value;
      count += 1;
    }
  });
  return count ? Math.round(total / count) : 0;
};

const Level2ResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mongoUser } = useAuth();
  const { isSaving, savedSessionId, saveError, saveSession } =
    useSessionSaver();

  const {
    transcriptionResults = [],
    facialAnalysisResults = [],
    scenarioId,
    scenarioTitle,
    scenarioEmoji,
  } = route.params || {};

  // Calculate transcript metrics
  const avgWpm = getAvgScore(transcriptionResults, ['wpm']);
  const totalFillers = transcriptionResults.reduce(
    (sum, r) => sum + (r.fillerWordCount || 0),
    0,
  );
  const usedFillerWords = getUsedFillerWords(transcriptionResults);
  const totalPauses = transcriptionResults.reduce(
    (sum, r) => sum + (r.pauseCount || 0),
    0,
  );

  // Calculate facial metrics
  // Use summary, and fallback to scores if present
  const avgEyeContact = getAvgScore(facialAnalysisResults, [
    'scores',
    'eyeContact',
  ]);
  const avgSmile = getAvgScore(facialAnalysisResults, [
    'scores',
    'expressiveness',
  ]);
  const avgPosture = getAvgScore(facialAnalysisResults, ['scores', 'posture']);

  // Auto-save session when component mounts
  useEffect(() => {
    const finalScenarioId = '507f1f77bcf86cd799439011';
    const autoSaveSession = async () => {
      if (savedSessionId) return;
      if (!mongoUser?._id) return;
      if (!finalScenarioId) return;
      if (!transcriptionResults || transcriptionResults.length === 0) return;
      try {
        await saveSession({
          userId: mongoUser._id,
          scenarioId: finalScenarioId,
          level: 2,
          transcriptionResults,
          facialAnalysisResults,
        });
      } catch (error) {
        // Save error handled in state
      }
    };
    autoSaveSession();
  }, []);

  // Page logic
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mascot & Title */}
        <View style={styles.topSection}>
          <View style={styles.characterContainer}>
            <Text style={styles.characterEmoji}>💧</Text>
          </View>
          <Text style={styles.title}>That was smooth!</Text>
        </View>

        {/* Voice Feedback Card */}
        <View style={styles.voiceCard}>
          <Text style={styles.cardHeader}>
            <Text style={styles.cardHeaderIcon}>🎙️</Text> Your voice
          </Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PACE</Text>
            <Text style={styles.sectionText}>{getPaceFeedback(avgWpm)}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TONE</Text>
            <Text style={styles.sectionText}>
              {getToneFeedback(transcriptionResults)}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FILLER WORDS</Text>
            <Text style={styles.sectionText}>
              {getFillerFeedback(totalFillers, usedFillerWords)}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PAUSES</Text>
            <Text style={styles.sectionText}>
              {getPauseFeedback(totalPauses)}
            </Text>
          </View>
        </View>

        {/* Expressions Feedback Card */}
        <View style={styles.expressionCard}>
          <Text style={styles.cardHeader}>
            <Text style={styles.cardHeaderIcon}>😊</Text> Your Expressions
          </Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EYE CONTACT</Text>
            <Text style={styles.sectionText}>
              {getEyeContactFeedback(avgEyeContact)}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXPRESSIONS</Text>
            <Text style={styles.sectionText}>
              {getExpressionFeedback(avgSmile)}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>POSTURE</Text>
            <Text style={styles.sectionText}>
              {getPostureFeedback(avgPosture)}
            </Text>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Facial expressions vary across cultures and personalities. These
              insights are based on general patterns. Take what feels right for
              you. If you’re neurodivergent, we recommend you seek extra
              guidance from a professional.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom navigation buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.navigate('Level2IntroScreen')}
        >
          <Text style={styles.retryButtonText}>RETRY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() =>
            navigation.navigate('LevelOptions', {
              scenarioTitle,
              scenarioEmoji,
            })
          }
        >
          <Text style={styles.nextButtonText}>NEXT LEVEL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  topSection: { alignItems: 'center', marginBottom: 20 },
  characterContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  characterEmoji: { fontSize: 80 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  voiceCard: {
    backgroundColor: '#e9f3fe',
    borderRadius: 18,
    padding: 22,
    marginBottom: 20,
  },
  expressionCard: {
    backgroundColor: '#f3edf9',
    borderRadius: 18,
    padding: 22,
    marginBottom: 20,
  },
  cardHeader: {
    fontSize: 19,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  cardHeaderIcon: { fontSize: 21, marginRight: 8 },
  section: { marginBottom: 15 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  sectionText: { fontSize: 15, color: '#666', lineHeight: 22 },
  footer: {
    marginTop: 6,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 10,
  },
  footerText: { color: '#888', fontSize: 12, lineHeight: 17 },
  bottomButtons: { flexDirection: 'row', padding: 20, gap: 14 },
  retryButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 14,
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
    paddingVertical: 14,
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
