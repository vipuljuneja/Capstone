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

import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import LinearGradient from 'react-native-linear-gradient';
import supabase from '../../services/supabaseClient';
import Tooltip from 'react-native-walkthrough-tooltip';
import TourTipCard from '../../Components/Tooltip/TourTipCard'
import { updateHasSeenTour,getReflectionsByUser} from '../../services/api.ts'

import NotebookIcon from '../../../assets/icons/notebook.svg';
import MailboxIcon from '../../../assets/icons/mailbox.svg';
import CloseIcon from '../../../assets/icons/close.svg';

import CircularIconButton from '../../Components/UI/button/CircularIconButton';
import AnimatedRippleButton from '../../Components/UI/button/AnimatedRippleButton';

import SceneCard from '../../Components/UI/card/SceneCard';
import scenarioService from '../../services/scenarioService';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

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

  const TOTAL_STEPS = 4;

  const { user, mongoUser } = useAuth();

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

  // Log when scenarios state updates
  useEffect(() => {
    console.log('Scenarios state:', scenarios.length, scenarios);
  }, [scenarios]);

  useEffect(() => {
    testDownload();
  }, []);

  useEffect(() => {
    if (!mongoUser) return;
    //  updateHasSeenTour (mongoUser.authUid, true);


    const hasSeen = mongoUser.hasSeenTour === true;


    if (!hasSeen) {

      const t = setTimeout(() => {
        setTourStep(1);
        setTourVisible(true);

      }, 200);
      return () => clearTimeout(t);
    } else {
      setTourVisible(false);
    }
  }, [mongoUser]);

useFocusEffect(
  React.useCallback(() => {
    let stop = false;

    const checkUnread = async () => {
      try {
        const reflections = await getReflectionsByUser(mongoUser._id, { type: 'pipo' });
        console.log(reflections)
        

        if (!stop) {
          const hasUnreadReflections = reflections.some(r => r.readAt == null);
          setHasUnread(hasUnreadReflections);
        }
      } catch (err) {
        console.error('Failed to load reflections:', err);
      }
    };

    checkUnread();

    return () => {
      stop = true;
    };
  }, [mongoUser?._id])
);



  const finishTour = React.useCallback(async () => {
    setTourVisible(false);
    try {
      if (!mongoUser?.authUid) {
        throw new Error('Missing authUid; cannot persist tour status');
      }
      await updateHasSeenTour(mongoUser.authUid, true);
    } catch (e) {
      console.log('updateHasSeenTour failed:', e);
    }
  }, [mongoUser]);

  const nextStep = React.useCallback(() => {
    if (tourStep < TOTAL_STEPS) setTourStep(tourStep + 1);
    else finishTour();
  }, [tourStep, finishTour]);

  const skipTour = React.useCallback(() => { finishTour(); }, [finishTour]);



  const testDownload = async () => {
    console.log('🧪 TESTING FILE DOWNLOAD...');
    try {
      const filePath = '1.mp4';
      const { data, error } = await supabase.storage
        .from('videos')
        .download(filePath);

      if (error) {
        console.error('Error downloading file:', error.message);
        return;
      }
      console.log('File downloaded successfully:', data);

      // To prove you have the file blob, print blob size
      console.log('Blob size:', data.size);

      // Optionally convert to URL to test usage in video tag or Image
      const url = URL.createObjectURL(data);
      console.log('Blob URL:', url);
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

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
      [screenHeight * 0.4, screenHeight * 0.25],
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
              tooltipStyle={{ backgroundColor: 'transparent', padding: 0, }}
              contentStyle={{
                backgroundColor: '#fff',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#E3DDF4',
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 8,
                elevation: 4,
              }}
              content={
                <TourTipCard
                  step={2} total={TOTAL_STEPS}
                  title="Read"
                  desc="Explore daily article tailored just for you"
                  onNext={nextStep} onSkip={skipTour}
                />
              }
            >
              <CircularIconButton
                style={{ padding: 24 }}
                onPress={() => {
                  navigation.navigate('Article', { userId: user?.uid });
                }}
              >
                <NotebookIcon width={32} height={32} />
              </CircularIconButton>
            </Tooltip>
            <Tooltip
              isVisible={tourVisible && tourStep === 3}
              placement="bottom"
              useReactNativeModal
              tooltipStyle={{ backgroundColor: 'transparent', padding: 0, }}
              contentStyle={{
                backgroundColor: '#fff',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#E3DDF4',
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 8,
                elevation: 4,
              }}
              content={
                <TourTipCard
                  step={3} total={TOTAL_STEPS}
                  title="Mailbox"
                  desc="See notes from Pipo and write a reflection note to yourself"
                  onNext={nextStep} onSkip={skipTour}
                />
              }
            >
              <View style={styles.iconWithBadge}>
                <CircularIconButton
                  style={{ padding: 24 }}
                  onPress={() => navigation.navigate('Notebook')}
                >
                  <MailboxIcon width={32} height={32} />
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
                backgroundColor: 'transparent', padding: 0,
                marginLeft: -1
              }}
              arrowStyle={{ right: 40 }}
              contentStyle={{
                backgroundColor: '#fff',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#E3DDF4',
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
          <Animated.Image
            source={require('../../../assets/pipo_set.png')}
            style={[characterAnimStyle, { resizeMode: 'contain' }]}
          />
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
                padding: 0, marginTop: 24
              }}
              contentStyle={{
                backgroundColor: '#fff',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#E3DDF4',
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 8,
                elevation: 4,
              }}
              content={
                <TourTipCard
                  step={1} total={TOTAL_STEPS}
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
    padding: 16,
  },
  scenariosWrapper: {
    marginBottom: 24,
    overflow: 'hidden',
    width: '100%',
    minHeight: 250,
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
