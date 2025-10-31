// src/screens/scenarios/LevelOptionsScreen.js
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { fetchAndLogUserCards } from '../../services/sessionSaver';
import { useFocusEffect } from '@react-navigation/native';
import {
  getProgressForScenario,
  initializeProgress,
  getUserLevelQuestions,
} from '../../services/api';

export default function LevelOptionsScreen({ route, navigation }) {
  const { scenarioTitle, scenarioEmoji, scenarioId, scenarioDescription } =
    route.params || {};
  const { mongoUser } = useAuth();
  const [locks, setLocks] = useState({
    level2Locked: true,
    level3Locked: true,
  });
  const userId = mongoUser?._id;

  // Test function to manually fetch cards
  const testFetchCards = async () => {
    if (mongoUser?._id) {
      console.log('🧪 TESTING CARD FETCH...');
      await fetchAndLogUserCards(mongoUser._id);
    } else {
      console.log('❌ No user ID available for testing');
    }
  };

  const ensureInFlightRef = useRef(false);

  const ensureProgress = useCallback(async () => {
    if (!userId || !scenarioId) return;
    if (ensureInFlightRef.current) return;
    ensureInFlightRef.current = true;
    try {
      let attempts = 0;
      const maxAttempts = 6; // ~3s total with 500ms delay
      while (attempts < maxAttempts) {
        let progress = await getProgressForScenario(userId, scenarioId);
        if (!progress) {
          try {
            progress = await initializeProgress(userId, scenarioId);
          } catch (e) {
            const msg = e?.response?.data?.error || e?.message || '';
            // If another call created it first, ignore and refetch
            if (
              typeof msg === 'string' &&
              msg.includes('E11000 duplicate key')
            ) {
              progress = await getProgressForScenario(userId, scenarioId);
            } else {
              throw e;
            }
          }
        }

        const level2Unlocked = Boolean(progress.levels?.['2']?.unlockedAt);
        const level3Unlocked = Boolean(progress.levels?.['3']?.unlockedAt);
        setLocks({
          level2Locked: !level2Unlocked,
          level3Locked: !level3Unlocked,
        });

        // If unlocked or we were just checking, break; else wait and retry (handles race after save)
        if (level2Unlocked || level3Unlocked) break;
        attempts += 1;
        await new Promise(r => setTimeout(r, 500));
      }
    } catch (e) {
      setLocks({ level2Locked: true, level3Locked: true });
    } finally {
      ensureInFlightRef.current = false;
    }
  }, [userId, scenarioId]);

  useEffect(() => {
    ensureProgress();
  }, [ensureProgress]);

  useFocusEffect(
    useCallback(() => {
      // Refresh locks when screen comes into focus (after returning from results)
      ensureProgress();
    }, [ensureProgress]),
  );

  useEffect(() => {
    navigation.setOptions({
      title: scenarioTitle || 'Levels',
    });
  }, [navigation]);

  const levels = useMemo(
    () => [
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
        isLocked: locks.level2Locked,
        bgColor: '#FFF9C4',
      },
      {
        id: 3,
        title: 'Level 3 Real Talk',
        description:
          'Time to go all in. Combine voice and facial and expressions like a pro.',
        emoji: '💬',
        isLocked: locks.level3Locked,
        bgColor: '#C8E6C9',
      },
    ],
    [locks],
  );

  const handleLevelPress = async level => {
    if (level.isLocked) return;

    // Console log questions for this level before navigating
    try {
      if (userId && scenarioId) {
        const levelKey =
          level.id === 1 ? 'level1' : level.id === 2 ? 'level2' : 'level3';
        const data = await getUserLevelQuestions(userId, scenarioId, levelKey);
        console.log(`🧾 Questions for ${levelKey}:`, data?.questions || []);
      } else {
        console.log(
          'ℹ️ Missing userId or scenarioId; skipping question fetch/log',
        );
      }
    } catch (e) {
      console.log('⚠️ Failed to fetch questions for logging:', e?.message || e);
    }

    // Level 2 requires camera notice first
    if (level.id === 2) {
      navigation.navigate('Level2NoticeScreen', {
        levelNumber: level.id,
        levelTitle: level.title.split(' ').slice(0, 2).join(' '), // "Level 2"
        scenarioTitle: scenarioTitle,
        scenarioEmoji: scenarioEmoji,
        scenarioId: scenarioId,
      });
    } else {
      // Level 1 goes directly to intro
      navigation.navigate('Level1IntroScreen', {
        levelNumber: level.id,
        levelTitle: level.title.split(' ').slice(0, 2).join(' '),
        scenarioTitle: scenarioTitle,
        scenarioEmoji: scenarioEmoji,
        scenarioId: scenarioId,
        scenarioDescription: scenarioDescription,
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      {/* <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >

        </TouchableOpacity>
        <Text style={styles.headerTitle}>{scenarioTitle}</Text>
        <TouchableOpacity
          onPress={async () => {
            try {
              console.log('🔐 Logging out...');
              await signOut(auth);
              console.log('✅ Signed out');
            } catch (e) {
              console.log('❌ Sign out error:', e?.message || e);
            }
          }}
          style={styles.testButton}
        >
          <Text style={styles.testButtonText}>🚪</Text>
        </TouchableOpacity>
      </View> */}

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
