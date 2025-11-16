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
  Image,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CustomHeader from '../../Components/UI/CustomHeader';
import SafeAreaBottom from '../../Components/UI/SafeAreaBottom';

import LockIcon from '../../../assets/icons/lock-white-filled.svg';

const HEADER_HEIGHT = 56;

export default function LevelOptionsScreen({ route, navigation }) {
  const { scenarioTitle, scenarioEmoji, scenarioId, scenarioDescription } =
    route.params || {};
  const { mongoUser } = useAuth();
  const [locks, setLocks] = useState({
    level2Locked: true,
    level3Locked: true,
    specialMissionLocked: true,
  });

  const insets = useSafeAreaInsets();

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
        const level3Completed = Boolean(
          progress.levels?.['3']?.lastCompletedAt,
        );
        setLocks({
          level2Locked: !level2Unlocked,
          level3Locked: !level3Unlocked,
          specialMissionLocked: !level3Completed,
        });

        // If unlocked or we were just checking, break; else wait and retry (handles race after save)
        if (level2Unlocked || level3Unlocked || level3Completed) break;
        attempts += 1;
        await new Promise(r => setTimeout(r, 500));
      }
    } catch (e) {
      setLocks({
        level2Locked: true,
        level3Locked: true,
        specialMissionLocked: true,
      });
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
        title: 'Level 1',
        description:
          'Start with your voice. Explore your pace and tone to build up your confidence.',
        emoji: '🎵',
        isLocked: false,
        bgColor: '#E3F2FD',
        levelEmoji: 1,
      },
      {
        id: 2,
        title: 'Level 2',
        description:
          'Practice both voice and facial expressions at your own pace.',
        emoji: '😊',
        isLocked: locks.level2Locked,
        bgColor: '#FFF9C4',
        levelEmoji: 2,
      },
      {
        id: 3,
        title: 'Level 3',
        description:
          'Lets Go all in. Combine voice and facial and expressions like a pro.',
        emoji: '💬',
        isLocked: locks.level3Locked,
        bgColor: '#C8E6C9',
        levelEmoji: 3,
      },
    ],
    [locks],
  );

  const levelEmoji = {
    1: require('../../../assets/level-illustrations/pip-voice.png'),
    2: require('../../../assets/level-illustrations/pip-avatar.png'),
    3: require('../../../assets/level-illustrations/pip-real.png'),
  };

  const handleLevelPress = async level => {
    if (level.isLocked) return;

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
        ...route.params,
        levelNumber: level.id,
        levelTitle: level.title.split(' ').slice(0, 2).join(' '), // "Level 2"
        scenarioTitle: scenarioTitle,
        scenarioEmoji: scenarioEmoji,
        scenarioId: scenarioId,
      });
    } else if (level.id === 3) {
      navigation.navigate('Level3NoticeScreen', {
        ...route.params,
        levelNumber: level.id,
        levelTitle: level.title.split(' ').slice(0, 2).join(' '), // "Level 2"
        scenarioTitle: scenarioTitle,
        scenarioEmoji: scenarioEmoji,
        scenarioId: scenarioId,
      });
    } else {
      navigation.navigate('Level1IntroScreen', {
        ...route.params,
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
    <View style={{ flex: 1, backgroundColor: '#F6F3FC', height: '100%' }}>
      {/* Header */}
      <CustomHeader
        title={scenarioTitle}
        onLeftPress={() => navigation.navigate('Home')}
      />
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
                  { backgroundColor: '#6B5B95', padding: 16 },
                ]}
              >
                {level.isLocked ? (
                  <LockIcon width={16} height={16} />
                ) : (
                  <View style={styles.timelineDot} />
                )}
              </View>

              {index < levels.length && <View style={styles.timelineLine} />}
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
                  <Image
                    source={levelEmoji[level?.levelEmoji]}
                    resizeMode="cover"
                    style={{ width: '100%', height: '100%', borderRadius: 16 }}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}

        {/* Special Mission */}
        <View style={styles.levelRow}>
          <View style={styles.timelineColumn}>
            <View
              style={[
                styles.timelineCircle,
                {
                  backgroundColor: '#6B5B95',
                  padding: 16,
                },
              ]}
            >
              {locks.specialMissionLocked ? (
                <LockIcon width={16} height={16} />
              ) : (
                <View style={styles.timelineDot} />
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.specialMission,
              { opacity: locks.specialMissionLocked ? 0.6 : 1 },
            ]}
            onPress={() => {
              if (!locks.specialMissionLocked) {
                navigation.navigate('SpecialMissionScreen', {
                  scenarioTitle: scenarioTitle,
                  scenarioEmoji: scenarioEmoji,
                  ...route.params,
                });
              }
            }}
            disabled={locks.specialMissionLocked}
          >
            <Text style={styles.levelTitle}>Special Mission</Text>
            <Text style={styles.levelDescription}>
              {locks.specialMissionLocked
                ? 'Complete Level 3 to unlock'
                : 'Your real-life mission awaits!'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* <SafeAreaBottom color="#F6F3FC" /> */}
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
    paddingHorizontal: 20,
    paddingVertical: 8,
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
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: '#F6F3FC',
    justifyContent: 'center',
  },
  levelRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  timelineCircle: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#F6F3FC',
    backgroundColor: '#9170F5',
  },

  timelineColumn: {
    alignItems: 'center',
    // justifyContent: 'center',
    marginRight: 18,
    width: 32,
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
    minHeight: 45,
  },
  levelCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 26,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#5A4D7B',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#efe6fa',
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  levelDescription: {
    color: '#666',
    fontSize: 13,
    lineHeight: 20,
  },
  levelIcon: {
    width: 100,
    height: 100,
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
