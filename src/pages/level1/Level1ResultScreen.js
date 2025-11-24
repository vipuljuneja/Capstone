import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useSessionSaver } from '../../services/sessionSaver';
import { unlockLevel, getProgressForScenario } from '../../services/api';
import { ActivityIndicator } from 'react-native';

import BackIcon from '../../../assets/icons/back.svg';

const Level1ResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mongoUser } = useAuth();
  const { isSaving, savedSessionId, saveError, saveSession } =
    useSessionSaver();
  const [checkingNext, setCheckingNext] = useState(true);
  const [nextLevelUnlocked, setNextLevelUnlocked] = useState(false);

  const {
    transcriptionResults = [],
    scenarioId,
    scenarioTitle,
    scenarioEmoji,
  } = route.params || {};

  const finalScenarioId = scenarioId;

  console.log('📊 Results screen received:', route.params);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      if (!mongoUser?._id || !finalScenarioId) {
        setCheckingNext(false);
        return;
      }
      try {
        setCheckingNext(true);
        let attempts = 0;
        const maxAttempts = 8; // ~4s total
        while (!cancelled && attempts < maxAttempts) {
          const progress = await getProgressForScenario(
            mongoUser?._id,
            finalScenarioId,
          );
          const unlocked = Boolean(progress?.levels?.['2']?.unlockedAt);
          if (unlocked) {
            setNextLevelUnlocked(true);
            break;
          }
          attempts += 1;
          await new Promise(r => setTimeout(r, 500));
        }
      } catch (e) {
        // ignore, keep disabled
      } finally {
        if (!cancelled) setCheckingNext(false);
      }
    };
    check();
    return () => {
      cancelled = true;
    };
  }, [mongoUser?._id, finalScenarioId]);

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

  // Auto-save session when component mounts
  useEffect(() => {
    const autoSaveSession = async () => {
      // Skip if already saved or missing required data
      if (savedSessionId) {
        console.log('⏭️ Session already saved, skipping...');
        return;
      }

      if (!mongoUser?._id) {
        console.warn('⚠️ Cannot save session: User not logged in');
        return;
      }

      if (!finalScenarioId) {
        console.warn('⚠️ Cannot save session: Scenario ID not provided');
        return;
      }

      if (!transcriptionResults || transcriptionResults.length === 0) {
        console.warn('⚠️ Cannot save session: No transcription results');
        return;
      }

      try {
        console.log('💾 Auto-saving Level 1 session...');

        await saveSession({
          userId: mongoUser?._id,
          scenarioId: finalScenarioId,
          level: 1,
          transcriptionResults: transcriptionResults,
        });

        console.log('✅ Level 1 session saved successfully');

        // Unlock Level 2
        try {
          await unlockLevel(mongoUser?._id, finalScenarioId, 2);
          console.log('🔓 Level 2 unlocked');
          setNextLevelUnlocked(true);
        } catch (e) {
          console.warn(
            '⚠️ Failed to unlock Level 2 (non-fatal):',
            e?.message || e,
          );
        }
      } catch (error) {
        console.error('❌ Failed to save Level 1 session:', error);
      }
    };

    autoSaveSession();
  }, []); // Empty dependency array to run only once

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
    navigation.navigate('Level1IntroScreen', route.params);
  };

  const handleNextLevel = () => {
    navigation.navigate('LevelOptions', {
      scenarioTitle: scenarioTitle || 'Ordering Coffee',
      scenarioEmoji: scenarioEmoji || '☕',
      scenarioId: finalScenarioId,
    });
  };

  const getResultTitle = () => {
    if (
      metrics.avgWpm >= 100 &&
      metrics.avgWpm <= 150 &&
      metrics.totalFillers <= 3 &&
      metrics.totalPauses <= 5
    ) {
      return 'Great job! You spoke very well!';
    }
    return 'Good effort! Some areas can be improved.';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('LevelOptions', {
              scenarioTitle: scenarioTitle || 'Ordering Coffee',
              scenarioEmoji: scenarioEmoji || '☕',
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
        {/* Character and Title */}
        <View style={styles.topSection}>
          <Image
            source={require('../../../assets/pipo/pipo-complete.png')}
            style={styles.characterImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>{getResultTitle()}</Text>
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
          {/* <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>TONE</Text>
            <Text style={styles.sectionText}>{generateToneFeedback()}</Text>
          </View> */}

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
        {/* <View style={styles.statsCard}>
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

          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Session status:</Text>
            <Text
              style={[
                styles.statsValue,
                {
                  color: savedSessionId
                    ? '#10b981'
                    : isSaving
                    ? '#f59e0b'
                    : '#ef4444',
                },
              ]}
            >
              {savedSessionId
                ? 'Saved ✓'
                : isSaving
                ? 'Saving...'
                : 'Not saved'}
            </Text>
          </View>

          {saveError && (
            <View style={styles.errorRow}>
              <Text style={styles.errorText}>Save failed: {saveError}</Text>
            </View>
          )}
        </View> */}
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
  errorRow: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    textAlign: 'center',
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
  characterImage: {
    height: 180,
    width: 180,
    marginBottom: 20,
  },
});

export default Level1ResultScreen;
