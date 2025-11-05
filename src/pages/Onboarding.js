import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Image,
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

export default function Onboarding() {
  const { user, mongoUser, refreshMongoUser } = useAuth();
  const [phase, setPhase] = useState('slides');
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

  if (phase === 'slides') {
    const slide = SLIDES[slideIndex];
    const onPrimary = () => {
      if (slideIndex < SLIDES.length - 1) {
        setSlideIndex(i => i + 1);
      } else {
        setPhase('questions');
      }
    };

    return (
      <View style={S.container}>
        <Pressable
          onPress={skipAll}
          disabled={submitting}
          style={[S.skip, submitting && S.skipDisabled]}
        >
          <Text style={S.skipText}>SKIP</Text>
        </Pressable>

        <View style={S.center}>
          {
            <Image
              source={slide.image}
              style={{ width: 180, height: 180, marginBottom: 16 }}
              resizeMode="contain"
            />
          }

          <View style={S.dotsRow}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[S.dot, i === slideIndex ? S.dotActive : null]}
              />
            ))}
          </View>

          <Text style={S.title}>{slide.title}</Text>
          <Text style={S.desc}>{slide.desc}</Text>
        </View>

        <Pressable
          onPress={onPrimary}
          disabled={submitting}
          style={[S.startBtn, submitting && S.disabled]}
        >
          <Text style={S.startText}>{slide.cta}</Text>
        </Pressable>
      </View>
    );
  }

  if (phase === 'result') {
    const { label, title, message } = getSummary(responses);
    return (
      <View style={S.container}>
        <View style={S.center}>
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
      </View>
    );
  }

  return (
    <View style={S.container}>
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
    </View>
  );
}

const S = StyleSheet.create({
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
    borderColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  backText: { color: '#111827', fontWeight: '600' },
  nextBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  nextText: { color: '#fff', fontWeight: '700', letterSpacing: 0.3 },
  startBtn: {
    backgroundColor: '#312e81',
    paddingVertical: 16,
    borderRadius: 22,
    alignItems: 'center',
  },
  startText: { color: '#fff', fontWeight: '700', letterSpacing: 1 },
  disabled: { opacity: 0.3 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 4, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#d1d5db' },
  dotActive: { width: 22, borderRadius: 5, backgroundColor: '#4b5563' },
});
