import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useSessionSaver } from '../../services/sessionSaver';
import { unlockLevel, getProgressForScenario } from '../../services/api';

import BackIcon from '../../../assets/icons/back.svg';

// Utility helpers for analysis and feedback
const getPaceFeedback = avgWpm => {
  if (avgWpm < 100) {
    return "Your speaking pace is very calm and steady! This gives listeners time to absorb your words. You're doing great!";
  } else if (avgWpm < 150) {
    return "Sometimes your words come out quickly, which is very common. Taking an extra breath before speaking can help your pace feel even calmer. You're leveling up bit by bit!";
  } else {
    return 'You speak quite quickly! Try to slow down a bit - taking pauses between sentences can help your listener follow along better.';
  }
};

const getFillerFeedback = (totalFillers, usedWords) => {
  if (totalFillers === 0) {
    return "Excellent work! You didn't use any filler words. Your speech was clear and confident!";
  } else if (totalFillers <= 3) {
    return `You used ${totalFillers} filler word${
      totalFillers > 1 ? 's' : ''
    } like 'um' or 'like', and that happens to everyone. If you'd like, try a soft pause instead. Pauses can feel peaceful and give your listener a moment to lean in.`;
  } else {
    return `You used ${totalFillers} filler words during your practice. Try replacing them with brief pauses - it will make your speech sound more confident!`;
  }
};

const getPauseFeedback = totalPauses => {
  if (totalPauses === 0) {
    return 'Try adding some natural pauses to give your listener time to process your words.';
  } else if (totalPauses < 5) {
    return 'Good use of pauses! They help make your speech more natural and easier to follow.';
  } else {
    return "You're using pauses well! This gives your listener moments to absorb what you're saying.";
  }
};

const getEyeContactFeedback = eyeContactScore => {
  if (eyeContactScore >= 70) {
    return 'Excellent eye contact! You maintained great focus, which shows confidence and connection.';
  }
  if (eyeContactScore >= 40) {
    return "You looked around a few times. Try focusing on one spot or the person you're talking to next time. With a little practice, it'll feel easier and more natural.";
  }
  return "Try to look at the camera more often! Eye contact helps build trust and shows you're engaged.";
};

const getExpressionFeedback = smileScore => {
  if (smileScore >= 70) {
    return "Your smile felt so genuine. Keeping your face relaxed helped you appear calm and approachable. You're doing wonderfully here. Just keep letting your natural warmth come through.";
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

const Level3ResultScreen = () => {
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

  const finalScenarioId = scenarioId;

  // Calculate transcript metrics (same as Level1)
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
  const usedFillerWords = getUsedFillerWords(transcriptionResults);

  // Calculate facial metrics
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
    const finalScenarioId = scenarioId;
    const autoSaveSession = async () => {
      if (savedSessionId) return;
      if (!mongoUser?._id) return;
      if (!finalScenarioId) return;
      if (!transcriptionResults || transcriptionResults.length === 0) return;
      try {
        await saveSession({
          userId: mongoUser._id,
          scenarioId: finalScenarioId,
          level: 3,
          transcriptionResults,
          facialAnalysisResults,
        });

        // Unlock Level 3
        try {
          await unlockLevel(mongoUser?._id, finalScenarioId, 3);
          console.log('🔓 Level 3 unlocked');
          setNextLevelUnlocked(true);
        } catch (e) {
          console.warn(
            '⚠️ Failed to unlock Level 3 (non-fatal):',
            e?.message || e,
          );
        }
      } catch (error) {
        // Save error handled in state
      }
    };
    autoSaveSession();
  }, []);

  // Enable NEXT LEVEL only when level 3 is unlocked
  const [checkingNext, setCheckingNext] = useState(true);
  const [nextLevelUnlocked, setNextLevelUnlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      if (!mongoUser?._id) {
        setCheckingNext(false);
        return;
      }
      if (!finalScenarioId) {
        setCheckingNext(false);
        return;
      }
      try {
        setCheckingNext(true);
        let attempts = 0;
        const maxAttempts = 10; // ~5s
        while (!cancelled && attempts < maxAttempts) {
          const progress = await getProgressForScenario(
            mongoUser?._id,
            finalScenarioId,
          );
          const unlocked = Boolean(progress?.levels?.['3']?.unlockedAt);
          if (unlocked) {
            setNextLevelUnlocked(true);
            break;
          }
          attempts += 1;
          await new Promise(r => setTimeout(r, 500));
        }
      } catch (e) {
        // ignore
      } finally {
        if (!cancelled) setCheckingNext(false);
      }
    };
    check();
    return () => {
      cancelled = true;
    };
  }, [mongoUser?._id, finalScenarioId]);

  // Button handlers replicating Level1ResultScreen structure
  const handleRetry = () => {
    navigation.navigate('Level3IntroScreen', route.params);
  };

  const handleNextLevel = () => {
    navigation.navigate('LevelOptions', {
      scenarioTitle,
      scenarioEmoji,
      scenarioId: finalScenarioId,
    });
  };

  const getResultTitle = () => {
    if (
      metrics.avgWpm >= 100 &&
      metrics.avgWpm <= 150 &&
      metrics.totalFillers <= 3 &&
      metrics.totalPauses <= 5 &&
      avgEyeContact >= 40 &&
      avgSmile >= 40 &&
      avgPosture >= 40
    ) {
      return 'Great job! You spoke very well!';
    }
    return 'Good effort! Some areas can be improved.';
  };

  // Page logic
  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('LevelOptions', {
              scenarioTitle: scenarioTitle || '',
              scenarioEmoji: scenarioEmoji || '',
              scenarioId: finalScenarioId,
            })
          }
        >
          <BackIcon width={24} height={24} style={styles.backButton} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mascot & Title */}
        <View style={styles.topSection}>
          <Image
            source={require('../../../assets/pipo/pipo-complete.png')}
            style={styles.characterImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>{getResultTitle()}</Text>
        </View>

        {/* Voice Feedback Card - Same as Level1 */}
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
            <Text style={styles.sectionText}>
              {getPaceFeedback(metrics.avgWpm)}
            </Text>
          </View>

          {/* Filler Words Section */}
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>FILLER WORDS</Text>
            <Text style={styles.sectionMetric}>
              Total: {metrics.totalFillers} filler
              {metrics.totalFillers !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.sectionText}>
              {getFillerFeedback(metrics.totalFillers, usedFillerWords)}
            </Text>
          </View>

          {/* Pauses Section */}
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>PAUSES</Text>
            <Text style={styles.sectionMetric}>
              Total: {metrics.totalPauses} pause
              {metrics.totalPauses !== 1 ? 's' : ''} detected
            </Text>
            <Text style={styles.sectionText}>
              {getPauseFeedback(metrics.totalPauses)}
            </Text>
          </View>
        </View>

        {/* Expressions Feedback Card - Keep as is */}
        <View style={styles.expressionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderIcon}>😊</Text>
            <Text style={styles.cardHeaderText}>Your Expressions</Text>
          </View>
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>EYE CONTACT</Text>
            <Text style={styles.sectionText}>
              {getEyeContactFeedback(avgEyeContact)}
            </Text>
          </View>
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>EXPRESSIONS</Text>
            <Text style={styles.sectionText}>
              {getExpressionFeedback(avgSmile)}
            </Text>
          </View>
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>POSTURE</Text>
            <Text style={styles.sectionText}>
              {getPostureFeedback(avgPosture)}
            </Text>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Facial expressions vary across cultures and personalities. These
              insights are based on general patterns. Take what feels right for
              you. If you're neurodivergent, we recommend you seek extra
              guidance from a professional.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>RETRY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, { opacity: nextLevelUnlocked ? 1 : 0.6 }]}
          onPress={handleNextLevel}
          disabled={!nextLevelUnlocked}
        >
          {checkingNext ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>NEXT LEVEL</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    fontSize: 28,
    color: '#333',
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  topSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
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
  expressionCard: {
    backgroundColor: '#f3edf9',
    borderRadius: 18,
    padding: 22,
    marginBottom: 20,
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
  footer: {
    marginTop: 6,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 10,
  },
  footerText: { color: '#888', fontSize: 12, lineHeight: 17 },
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
  characterImage: {
    height: 180,
    width: 180,
    marginBottom: 20,
  },
});

export default Level3ResultScreen;
