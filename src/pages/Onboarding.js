import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Image,
  ImageBackground
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QuestionCard from '../Components/Onboarding/QuestionCard';
import { updateOnboardingStatus, updateSeverityLevel } from '../services/api';
// import { useNavigation } from "@react-navigation/native";
import { useAuth } from '../contexts/AuthContext';
import { CommonActions, useNavigation } from '@react-navigation/native';

const questionList = [
  'I avoid certain social situations because I’m afraid of embarrassing myself.',
  'My heart races or I overthink before speaking in front of others.',
  'I criticize myself harshly after social interactions.',
  'I find it hard to relax or fall asleep after a party or social event.',
  'I worry for a long time, replaying what I said or did.',
];

const SLIDES = [
  {
    key: 'data',
    title: 'Your data is safe',
    desc:
      'PIP uses your voice and video data to personalize AI feedback and help you grow.\n\n' +
      'Your information stays secure and is never shared without your consent.',
    image: require('../../assets/pipo/pipo-onboard2.png'),
    cta: 'NEXT',
  },
  {
    key: 'notClinical',
    title: 'PIP is a self-help tool',
    desc:
      'PIP focuses on learning and self-growth. It’s not a replacement for clinical therapy.\n\n' +
      'For persistent conditions or neurodivergent concerns, please consult a qualified professional.',
    image: require('../../assets/pipo/pipo-onboard1.png'),
    cta: 'NEXT',
  },
  {
    key: 'questionIntro',
    title: 'Let’s take a quick self-check',
    desc:
      'This is a safe space for self-discovery, not a diagnosis. If discomfort persists or affects daily life, ' +
      'consider reaching out to a mental-health professional.',
    image: require('../../assets/pipo/loginPipo.png'),
    cta: 'START',
  },
];
const HERO_BG = {
  data: require('../../assets/on-slide1.png'),
  notClinical: require('../../assets/on-slide2.png'),
  questionIntro: require('../../assets/on-slide3.png'),
};

function getSummary(responses) {
  const valid = responses.filter(v => typeof v === 'number');
  const avg = valid.length
    ? valid.reduce((a, b) => a + b, 0) / valid.length
    : 0;

  if (avg < 1.5)
    return {
      label: 'Minimal',
      title: 'Little to no social anxiety symptoms. ',
      message: 'You’re doing great! Keep nurturing your confidence.',
    };
  if (avg < 2.5)
    return {
      label: 'Mild',
      title: 'Some anxiety in specific social situations.',
      message: 'Seems like you’ve got a bit on your mind',
    };
  if (avg < 3.5)
    return {
      label: 'Moderate',
      title: 'Noticeable distress or avoidance.',
      message: 'Sometimes things can be overwhelming.',
    };
  return {
    label: 'Severe',
    title: 'Frequent, intense anxiety affecting daily life.',
    message: 'That sounds tough but you are not alone!',
  };
}

export default function Onboarding({ route }) {
  const { user, mongoUser, refreshMongoUser } = useAuth();
  const skipSlides = route?.params?.skipSlides || false;
  const [phase, setPhase] = useState(skipSlides ? 'questions' : 'slides');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState(
    Array(questionList.length).fill(null),
  );
  const [slideIndex, setSlideIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const navigation = useNavigation();
  const isMountedRef = useRef(true);
  const hasExitedRef = useRef(false);
  const isRetake = !!mongoUser?.onboarding?.completed;

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const markOnboardingComplete = async () => {
    if (!user?.uid) return;
    try {
      await updateOnboardingStatus(user.uid, true);
      await refreshMongoUser();
    } catch (err) {
      console.warn('Failed to persist/refresh onboarding completion', err);
    }
  };
  const exitToHome = () => {
    if (hasExitedRef.current) return;
    hasExitedRef.current = true;

    const parent = navigation.getParent?.();
    if (parent) {
      parent.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        }),
      );
      return;
    }

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      }),
    );
  };

  const selected = responses[currentIndex];

  const startQuestions = () => setPhase('questions');

  const skipAll = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const filled = responses.map(v => (v == null ? 0 : v));
      console.log('Onboarding skipped:', filled);
      if (user?.uid) {
        await updateSeverityLevel(user.uid, 'Moderate');
        console.log('Severity level set to Moderate (skipped)');
      }
      await markOnboardingComplete();
    } catch (error) {
      console.error('Error in skipAll:', error);
    } finally {
      if (isMountedRef.current) setSubmitting(false);
      navigation.navigate("Home")
    }
  };

  const handleSelect = option => {
    const updated = [...responses];
    updated[currentIndex] = option;
    setResponses(updated);
  };

  const next = async () => {
    if (responses[currentIndex] == null) {
      Alert.alert('Please select an option before continuing.');
      return;
    }

    if (currentIndex < questionList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await AsyncStorage.setItem('surveyResponses', JSON.stringify(responses));
      setPhase('result');
    }
  };

  const back = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleFinish = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const summary = getSummary(responses);

      if (user?.uid) {
        await updateSeverityLevel(user.uid, summary.label);
        await markOnboardingComplete();
      }

      navigation.navigate('Home');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save your assessment. Please try again.');
    } finally {
      if (isMountedRef.current) setSubmitting(false);
    }
  };

  // if (phase === "intro") {
  //   return (
  //     <View style={S.container}>
  //       <Pressable onPress={skipAll} style={S.skip}>
  //         <Text style={S.skipText}>SKIP</Text>
  //       </Pressable>
  //       <View style={S.center}>
  //         <Text style={S.title}>A quick self-check before you start</Text>
  //         <Text style={S.desc}>
  //           See how you are feeling with different situations to unlock your confidence.
  //         </Text>
  //       </View>
  //       <Pressable onPress={startQuestions} style={S.startBtn}>
  //         <Text style={S.startText}>START</Text>
  //       </Pressable>
  //     </View>
  //   );
  // }
  if (redirecting) {
    return (
      <View style={S.container}>
        <View style={S.center}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={S.desc}>Wrapping things up… hang tight!</Text>
        </View>
      </View>
    );
  }

  // if (phase === 'slides') {
  //   const slide = SLIDES[slideIndex];
  //   const onPrimary = () => {
  //     if (slideIndex < SLIDES.length - 1) {
  //       setSlideIndex(i => i + 1);
  //     } else {
  //       setPhase('questions');
  //     }
  //   };

  //   return (
  //     <View style={S.container}>
  //       <Pressable
  //         onPress={skipAll}
  //         disabled={submitting}
  //         style={[S.skip, submitting && S.skipDisabled]}
  //       >
  //         <Text style={S.skipText}>SKIP</Text>
  //       </Pressable>

  //       <View style={S.center}>
  //         {
  //           <Image
  //             source={slide.image}
  //             style={{ width: 180, height: 180, marginBottom: 16 }}
  //             resizeMode="contain"
  //           />
  //         }

  //         <View style={S.dotsRow}>
  //           {SLIDES.map((_, i) => (
  //             <View
  //               key={i}
  //               style={[S.dot, i === slideIndex ? S.dotActive : null]}
  //             />
  //           ))}
  //         </View>

  //         <Text style={S.title}>{slide.title}</Text>
  //         <Text style={S.desc}>{slide.desc}</Text>
  //       </View>

  //       <Pressable
  //         onPress={onPrimary}
  //         disabled={submitting}
  //         style={[S.startBtn, submitting && S.disabled]}
  //       >
  //         <Text style={S.startText}>{slide.cta}</Text>
  //       </Pressable>
  //     </View>
  //   );
  // }

  if (phase === 'slides') {
    const slide = SLIDES[slideIndex];
    const onPrimary = () => {
      if (slideIndex < SLIDES.length - 1) setSlideIndex(i => i + 1);
      else setPhase('questions');
    };

    return (
      <View style={S.screen}>
        <View style={S.heroCard}>
          <View style={S.heroClip}>
            <ImageBackground
              source={HERO_BG[slide.key] ?? HERO_BG.data}
              resizeMode="cover"
              style={S.heroImgWrap}
              imageStyle={S.heroImg}
            >
              <Pressable onPress={skipAll} disabled={submitting} style={[S.skipAbs, submitting && S.skipDisabled]}>
                <Text style={S.skipText}>SKIP</Text>
              </Pressable>
            </ImageBackground>
          </View>

          <View style={S.pagerWrap}>
            <View style={S.pagerCard}>
              {SLIDES.map((_, i) =>
                i === slideIndex ? (
                  <View key={i} style={S.pagerActive} />
                ) : (
                  <View key={i} style={S.pagerDot} />
                )
              )}
            </View>
          </View>
        </View>


        <View style={S.sheet}>
          <Text style={S.sheetTitle}>{slide.title}</Text>
          <Text style={S.sheetDesc}>{slide.desc}</Text>
          <Pressable onPress={onPrimary} disabled={submitting} style={[S.ctaBtn, submitting && S.disabled]}>
            <Text style={S.ctaText}>{slide.cta}</Text>
          </Pressable>
        </View>
      </View>
    );
  }



  if (phase === 'result') {
    const { label, title, message } = getSummary(responses);
    return (
      <ImageBackground
        source={require('../../assets/onboard-bg.png')}
        resizeMode="cover"
        style={S.bg}
        imageStyle={S.bgImage}>
        <View style={S.center}>
          <Image source={require('../../assets/pipo_set.png')} style={{ width: 180, height: 180, marginBottom: 16 }} resizeMode="contain" />
          <Text style={S.badge}>{label}</Text>
          <Text style={S.title}>{message}</Text>
          {/* <Text style={S.desc}>{message}</Text> */}
          <Text style={S.desc}>
            {' '}
            {'\n'} Let’s move forward together {'\n'} One step at a time.
          </Text>
        </View>
        <Pressable
          onPress={handleFinish}
          disabled={submitting}
          style={[S.startBtn, submitting && S.disabled]}
        >
          <Text style={S.startText}>LET’S GO!</Text>
        </Pressable>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require('../../assets/onboard-bg.png')}
      resizeMode="cover"
      style={S.bg}
      imageStyle={S.bgImage}>
      <Pressable
        onPress={skipAll}
        disabled={submitting}
        style={[S.skip, submitting && S.skipDisabled]}
      >
        <Text style={S.skipText}>SKIP</Text>
      </Pressable>

      <QuestionCard
        index={currentIndex}
        total={questionList.length}
        prompt={questionList[currentIndex]}
        value={selected}
        onChange={handleSelect}
      />

      <View style={S.footer}>
        <Pressable
          onPress={back}
          disabled={currentIndex === 0}
          style={[S.backBtn, currentIndex === 0 && S.disabled]}
        >
          <Text style={S.backText}>Back</Text>
        </Pressable>

        <Pressable
          onPress={next}
          style={[S.nextBtn, submitting && S.disabled]}
          disabled={submitting}
        >
          <Text style={S.nextText}>Next</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const S = StyleSheet.create({
  bg: {
    flex: 1, padding: 20,
    justifyContent: 'flex-start'

  },
  bgImage: {
    // height: '100%',
    position: 'absolute',
  },
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  skip: { alignSelf: 'flex-end', marginBottom: 10 },
  skipText: { fontSize: 12, color: '#6b7280', letterSpacing: 1 },
  skipDisabled: { opacity: 0.4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  desc: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    color: '#111827',
    fontWeight: '700',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  backBtn: {
    borderWidth: 1,
    borderColor: 'rgba(62, 49, 83, 1)',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  backText: { color: '#111827', fontWeight: '600' },
  nextBtn: {
    backgroundColor: 'rgba(62, 49, 83, 1)',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  nextText: { color: '#fff', fontWeight: '700', letterSpacing: 0.3 },
  startBtn: {
    backgroundColor: 'rgba(62, 49, 83, 1)',
    paddingVertical: 16,
    borderRadius: 22,
    alignItems: 'center',
  },
  startText: { color: '#fff', fontWeight: '700', letterSpacing: 1 },
  disabled: { opacity: 0.3 },
  dotsRowHero: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  dotHero: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  dotActiveHero: {
    width: 42,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4b3a64',
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#d1d5db' },
  dotActive: { width: 22, borderRadius: 5, backgroundColor: '#4b5563' },
  screen: { flex: 1, backgroundColor: '#fff'},
  hero: {
    height: '48%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroCard: {
    position: 'relative',
    marginBottom: 36,   
    overflow: 'visible',
  },
  heroClip: {
    // borderRadius: 18,
    overflow: 'hidden',   
    backgroundColor: '#F6F7FB',
  },



  heroImgWrap: {
    width: '100%',
    aspectRatio: 375 / 365 , // try 375/205 (taller) or 375/220 (shorter)
    justifyContent: 'flex-start',
  },

  heroImg: {
    width: '100%',
    height: '100%',
  },
  skipAbs: { position: 'absolute', top: 14, right: 14, padding: 6 },
  skipText: { fontSize: 12, color: '#111827', letterSpacing: 1, fontWeight: '700' },
  skipDisabled: { opacity: 0.4 },
  pager: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,                 
    transform: [{ translateY: 14 }], 
    alignItems: 'center',
    zIndex: 3,
    elevation: 3,
  },
  pagerWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    transform: [{ translateY: -16 }],
    zIndex: 3,
    elevation: 3,
  },
  pagerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    // backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  pagerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 6,
  },
  pagerActive: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3E3153',
    marginHorizontal: 6,
  },



  sheet: {
    position: 'relative',
    zIndex: 1,
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 20,
    // shadowColor: '#000',
    // shadowOpacity: 0.05,
    // shadowRadius: 12,
    // shadowOffset: { width: 0, height: -2 },
    elevation: 2,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 14,
  },
  sheetDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },

  ctaBtn: {
    marginTop: 'auto',
    backgroundColor: 'rgba(62,49,83,1)',
    paddingVertical: 16,
    borderRadius: 26,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '700', letterSpacing: 1 },

  disabled: { opacity: 0.3 },
});
