import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import LinearGradient from 'react-native-linear-gradient';
import supabase from '../../services/supabaseClient';
import Tooltip from 'react-native-walkthrough-tooltip';
import TourTipCard from '../../Components/Tooltip/TourTipCard';
import { updateHasSeenTour, getReflectionsByUser } from '../../services/api.ts';

import NotebookIcon from '../../../assets/icons/notebook.svg';
import MailboxIcon from '../../../assets/icons/mailbox.svg';
import CloseIcon from '../../../assets/icons/close.svg';

import CircularIconButton from '../../Components/UI/button/CircularIconButton';
import AnimatedRippleButton from '../../Components/UI/button/AnimatedRippleButton';

import SceneCard from '../../Components/UI/card/SceneCard';
import scenarioService from '../../services/scenarioService';
import SafeAreaBottom from '../../Components/UI/SafeAreaBottom.js';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

const emojiMap = {
  'Ordering Coffee': require('../../../assets/pipo/pipo-coffee.png'),
  Connecting: require('../../../assets/pipo/pipo-hi.png'),
  'Job Interview': require('../../../assets/pipo/pipo-job.png'),
};

const avatarImages = {
  pipo_set: require('../../../assets/pipo_set.png'),
  bro_set: require('../../../assets/bro_set.png'),
  cherry_set: require('../../../assets/cherry_set.png'),
  mshrom_set: require('../../../assets/mshrom_set.png'),
};

export default function HomeScreen() {
  const [visible, setVisible] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [tourVisible, setTourVisible] = useState(false);
  const [tourStep, setTourStep] = useState(1);
  const [hasUnread, setHasUnread] = useState(false);

  const insets = useSafeAreaInsets();

  const TOTAL_STEPS = 4;

  const { user, mongoUser, refreshMongoUser } = useAuth();

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const contentProgress = useSharedValue(0);

  useEffect(() => {
    contentProgress.value = withTiming(visible ? 1 : 0, { duration: 400 });
  }, [visible]);

  // Load scenarios from API
  useEffect(() => {
    const loadScenarios = async () => {
      try {
        setLoading(true);
        const fetchedScenarios = await scenarioService.getPublishedScenarios();
        console.log(
          'Fetched scenarios:',
          fetchedScenarios.length,
          fetchedScenarios,
        );
        setScenarios(fetchedScenarios);
      } catch (error) {
        console.error('Failed to load scenarios:', error);
        // Fallback scenarios will be used automatically by the service
        setScenarios([]);
      } finally {
        setLoading(false);
      }
    };

    loadScenarios();
  }, []);

  useEffect(() => {
    if (!mongoUser || !mongoUser._id) {
      setTourVisible(false);
      return;
    }

    // Only show tour if hasSeenTour is explicitly false or undefined (new users)
    // If hasSeenTour is true, user has already seen it
    const hasSeen = mongoUser.hasSeenTour === true;

    if (!hasSeen) {
      // Only show tour for users who haven't seen it yet
      const t = setTimeout(() => {
        setTourStep(1);
        setTourVisible(true);
      }, 200);
      return () => clearTimeout(t);
    } else {
      // User has already seen the tour
      setTourVisible(false);
    }
  }, [mongoUser]);

  useFocusEffect(
    React.useCallback(() => {
      let stop = false;

      const checkUnread = async () => {
        // Validate mongoUser and _id before making the API call
        if (!mongoUser || !mongoUser._id) {
          console.log(
            '⚠️ Skipping reflections check: mongoUser or _id not available',
          );
          return;
        }

        // Validate MongoDB ObjectId format (24 hex characters)
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(mongoUser._id);
        if (!isValidObjectId) {
          console.log('⚠️ Skipping reflections check: Invalid _id format');
          return;
        }

        try {
          const reflections = await getReflectionsByUser(mongoUser._id, {
            type: 'pipo',
          });

          if (!stop) {
            const hasUnreadReflections = reflections.some(
              r => r.readAt == null,
            );
            setHasUnread(hasUnreadReflections);
          }
        } catch (err) {
          // Silently handle errors - don't crash the app
          // The error is already logged by the API service
          console.log(
            '⚠️ Failed to load reflections (non-blocking):',
            err.message || err,
          );
          // Set to false on error to avoid showing unread badge incorrectly
          if (!stop) {
            setHasUnread(false);
          }
        }
      };

      // Add a small delay to ensure mongoUser is fully loaded
      // This prevents race conditions during login/signup
      const timeoutId = setTimeout(() => {
        checkUnread();
      }, 500);

      return () => {
        stop = true;
        clearTimeout(timeoutId);
      };
    }, [mongoUser?._id]),
  );

  const finishTour = React.useCallback(async () => {
    setTourVisible(false);
    try {
      if (!mongoUser?.authUid) {
        throw new Error('Missing authUid; cannot persist tour status');
      }
      await updateHasSeenTour(mongoUser.authUid, true);
      await refreshMongoUser();
    } catch (e) {
      console.log('updateHasSeenTour failed:', e);
    }
  }, [mongoUser, refreshMongoUser]);

  const nextStep = React.useCallback(() => {
    if (tourStep < TOTAL_STEPS) setTourStep(tourStep + 1);
    else finishTour();
  }, [tourStep, finishTour]);

  const skipTour = React.useCallback(() => {
    finishTour();
  }, [finishTour]);

  const handlePractice = scenario => {
    navigation.navigate('LevelOptions', {
      scenarioTitle: scenario.title,
      scenarioEmoji: scenario.emoji,
      scenarioId: scenario._id, // Use MongoDB _id instead of custom id
      scenarioDescription: scenario.description,
    });
  };

  const avatarSource = useMemo(() => {
    const candidate =
      mongoUser?.avatarImage ??
      mongoUser?.avatarUrl ??
      mongoUser?.profile?.avatarImage ??
      mongoUser?.profile?.avatarUrl;

    if (!candidate) {
      return avatarImages.pipo_set;
    }

    if (
      typeof candidate === 'string' &&
      (candidate.startsWith('http') ||
        candidate.startsWith('file:') ||
        candidate.startsWith('data:'))
    ) {
      return { uri: candidate };
    }

    return avatarImages[candidate] || avatarImages.pipo_set;
  }, [
    mongoUser?.avatarImage,
    mongoUser?.avatarUrl,
    mongoUser?.profile?.avatarImage,
    mongoUser?.profile?.avatarUrl,
  ]);

  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentProgress.value,
    position: contentProgress.value === 0 ? 'absolute' : 'absolute',
    top: '10%',
    left: 0,
    right: 0,
    // bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: contentProgress.value === 0 ? 'none' : 'auto',
  }));

  const characterAnimStyle = useAnimatedStyle(() => {
    const size = interpolate(
      contentProgress.value,
      [0, 1],
      [screenHeight * 0.5, screenHeight * 0.4],
      Extrapolate.CLAMP,
    );
    return {
      width: size,
      height: size,
      transform: [
        {
          translateY: interpolate(
            contentProgress.value,
            [0, 1],
            [0, screenHeight * 0.18],
            Extrapolate.CLAMP,
          ),
        },
      ],
    };
  });

  const startAnimStyle = useAnimatedStyle(() => ({
    opacity: 1 - contentProgress.value,
    transform: [{ scale: 1 - 0.2 * contentProgress.value }],
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: visible ? 'none' : 'auto',
  }));

  const closeAnimStyle = useAnimatedStyle(() => ({
    opacity: contentProgress.value,
    transform: [{ scale: 0.7 + 0.3 * contentProgress.value }],
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: visible ? 'auto' : 'none',
  }));

  return (
    <View style={styles.container}>
      {/* <View
        style={{
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor: '#C7DFFF',
          zIndex: 100,
        }}
        pointerEvents="none"
      /> */}
      <LinearGradient
        colors={['#C7DFFF', '#EEF3E7', '#FFFFFF']}
        locations={[0, 0.5, 1]}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Tooltip
              isVisible={tourVisible && tourStep === 2}
              placement="bottom"
              useReactNativeModal
              tooltipStyle={{ backgroundColor: 'transparent', padding: 0 }}
              contentStyle={{
                backgroundColor: '#fff',
                borderRadius: 16,
                borderWidth: 0,
                borderColor: 'transparent',
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 8,
                elevation: 4,
              }}
              content={
                <TourTipCard
                  step={2}
                  total={TOTAL_STEPS}
                  title="Read"
                  desc="Explore daily article tailored just for you"
                  onNext={nextStep}
                  onSkip={skipTour}
                />
              }
            >
              <CircularIconButton
                style={{ padding: 24 }}
                onPress={() => {
                  navigation.navigate('Article', { userId: user?.uid });
                }}
              >
                <NotebookIcon width={28} height={28} />
              </CircularIconButton>
            </Tooltip>
            <Tooltip
              isVisible={tourVisible && tourStep === 3}
              placement="bottom"
              useReactNativeModal
              tooltipStyle={{ backgroundColor: 'transparent', padding: 0 }}
              contentStyle={{
                backgroundColor: '#fff',
                borderRadius: 16,
                borderWidth: 0,
                borderColor: 'transparent',
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 8,
                elevation: 4,
              }}
              content={
                <TourTipCard
                  step={3}
                  total={TOTAL_STEPS}
                  title="Mailbox"
                  desc="See notes from Pip and write a reflection note to yourself"
                  onNext={nextStep}
                  onSkip={skipTour}
                />
              }
            >
              <View style={styles.iconWithBadge}>
                <CircularIconButton
                  style={{ padding: 24 }}
                  onPress={() => navigation.navigate('Notebook')}
                >
                  <MailboxIcon width={28} height={28} />
                </CircularIconButton>
                {hasUnread && <View style={styles.badge} />}
              </View>
            </Tooltip>
          </View>
          <View>
            <Tooltip
              isVisible={tourVisible && tourStep === 4}
              placement="bottom"
              useReactNativeModal
              tooltipStyle={{
                backgroundColor: 'transparent',
                padding: 0,
                marginLeft: -1,
              }}
              arrowStyle={{ right: 40 }}
              contentStyle={{
                backgroundColor: '#fff',
                borderRadius: 16,
                borderWidth: 0,
                borderColor: 'transparent',
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 8,
                elevation: 4,
              }}
              content={
                <TourTipCard
                  step={4}
                  total={TOTAL_STEPS}
                  title="Profile"
                  desc="You can manage your profile and settings here"
                  onNext={finishTour}
                  onSkip={skipTour}
                  isLast
                />
              }
            >
              <CircularIconButton
                style={{ padding: 24 }}
                onPress={() => navigation.navigate('Profile')}
              >
                <Image source={avatarSource} style={styles.headerAvatar} />
              </CircularIconButton>
            </Tooltip>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Animated.View style={[styles.scenariosWrapper, contentAnimStyle]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              pointerEvents={visible ? 'auto' : 'none'}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading scenarios...</Text>
                </View>
              ) : scenarios.length > 0 ? (
                scenarios.map(item => (
                  <SceneCard
                    key={item._id}
                    iconSource={
                      emojiMap[item.title] ||
                      require('../../../assets/pipo/pipo-coffee.png')
                    }
                    sceneNumber={item.id}
                    title={item.title}
                    onPress={() => {
                      handlePractice(item);
                    }}
                  />
                ))
              ) : (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>No scenarios available</Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>

          {/* Character */}
          {/* <Animated.Image
            source={require('../../../assets/gifs/HomePipo2.gif')}
            style={[characterAnimStyle, { resizeMode: 'contain' }]}
          /> */}

          <Animated.View style={characterAnimStyle}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
              }}
            >
              <LottieView
                source={require('../../../assets/json/HomePipo.json')}
                autoPlay
                loop
                style={{
                  marginTop: 20,
                  width: '80%',
                  height: '80%',
                }}
              />
            </View>
          </Animated.View>
        </View>

        {/* Bottom Buttons `*/}
        <View style={styles.micWrapper}>
          <Animated.View style={startAnimStyle}>
            <Tooltip
              isVisible={tourVisible && tourStep === 1}
              placement="top"
              useReactNativeModal
              tooltipStyle={{
                backgroundColor: 'transparent',
                padding: 0,
                marginTop: 24,
              }}
              contentStyle={{
                backgroundColor: '#fff',
                borderRadius: 16,
                borderWidth: 0,
                borderColor: 'transparent',
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 8,
                elevation: 4,
              }}
              content={
                <TourTipCard
                  step={1}
                  total={TOTAL_STEPS}
                  title="Scene Practice"
                  desc="Tap here to select scenes to practice"
                  onNext={() => setTourStep(2)}
                  onSkip={skipTour}
                />
              }
            >
              <AnimatedRippleButton
                size={160}
                diskSize={80}
                rippleColor="rgba(113,99,168,0.5)"
                onPress={() => setVisible(true)}
                disabled={visible}
              >
                <Image
                  source={require('../../../assets/icons/purple-button.png')}
                  style={{ width: 80, height: 80, borderRadius: 50 }}
                  resizeMode="cover"
                />
              </AnimatedRippleButton>
            </Tooltip>
          </Animated.View>

          <Animated.View style={closeAnimStyle}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setVisible(false)}
              disabled={!visible}
            >
              <CloseIcon width={24} height={24} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </LinearGradient>
      {/* <View
        style={{
          top: 0,
          left: 0,
          right: 0,
          height: insets.bottom,
          backgroundColor: '#C7DFFF',
          zIndex: 100,
        }}
        pointerEvents="none"
      /> */}
      {/* <SafeAreaBottom /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerIcon: {
    flexDirection: 'row',
    gap: 16,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    resizeMode: 'cover',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  icon: {
    fontSize: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scenariosWrapper: {
    marginBottom: 24,
    overflow: 'hidden',
    width: '100%',
    minHeight: 200,
  },

  button: {
    backgroundColor: '#4A4458',
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 13,
  },
  closeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    marginBottom: 52,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  micWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: 100,
    flex: 0,
    position: 'relative',
    height: 100,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  iconWithBadge: {
    position: 'relative',
  },

  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E53935',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    pointerEvents: 'none',
  },
});
