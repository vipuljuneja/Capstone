import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import LinearGradient from 'react-native-linear-gradient';

import NotebookIcon from '../../../assets/icons/notebook.svg';
import MailboxIcon from '../../../assets/icons/mailbox.svg';
import ProfileIcon from '../../../assets/icons/profile.svg';
import CloseIcon from '../../../assets/icons/close.svg';

import CircularIconButton from '../../Components/UI/button/CircularIconButton';
import AnimatedRippleButton from '../../Components/UI/button/AnimatedRippleButton';

import SceneCard from '../../Components/UI/card/SceneCard';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

export default function HomeScreen() {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  const { user } = useAuth();

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const contentProgress = useSharedValue(0);

  useEffect(() => {
    contentProgress.value = withTiming(visible ? 1 : 0, { duration: 400 });
  }, [visible]);

  const scenarios = [
    {
      id: 1,
      title: 'Ordering Coffee',
      desc: 'Practice ordering drinks',
      emoji: '☕',
    },
    { id: 2, title: 'Restaurant', desc: 'Order food confidently', emoji: '🍽️' },
    { id: 3, title: 'Shopping', desc: 'Shopping conversations', emoji: '🛍️' },
  ];

  const handlePractice = scenario => {
    navigation.navigate('LevelOptions', {
      scenarioTitle: scenario.title,
      scenarioEmoji: scenario.emoji,
      scenarioId: scenario.id,
    });
  };

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
            <CircularIconButton
              style={{ padding: 24 }}
              onPress={() => {
                navigation.navigate('Article', { userId: user?.uid });
              }}
            >
              <NotebookIcon width={32} height={32} />
            </CircularIconButton>
            <CircularIconButton
              style={{ padding: 24 }}
              onPress={() => navigation.navigate('Notebook')}
            >
              <MailboxIcon width={32} height={32} />
            </CircularIconButton>
          </View>
          <View>
            <CircularIconButton
              style={{ padding: 24 }}
              onPress={() => navigation.navigate('Profile')}
            >
              <ProfileIcon width={32} height={32} />
            </CircularIconButton>
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
              {scenarios.map(item => (
                <SceneCard
                  key={item.id}
                  iconSource={require('../../../assets/pipo/pipo-coffee.png')}
                  sceneNumber={item.id}
                  title={item.title}
                  onPress={() => {
                    handlePractice(item);
                  }}
                />
              ))}
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
});
