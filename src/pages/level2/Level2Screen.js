import React, {
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

// Services
import { getUserLevelQuestions } from '../../services/api';
import scenarioService from '../../services/scenarioService';

// Components
import LevelHeader from '../components/LevelHeader';
import DraggableCamera from '../components/DraggableCamera';
import AudioRecorder from '../../Components/Audio/AudioRecorder';
import AudioWaveform from '../../Components/Audio/AudioWaveform';
import AvatarGenerator from '../../Components/Avatar/AvatarGenerate';
import LoadingOverlay from '../components/LoadingOverlays';

const Level2Screen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mongoUser } = useAuth();

  const cameraRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const audioWaveformRef = useRef(null);
  const avatarRef = useRef(null);

  const routeParams = useMemo(() => route.params || {}, [route.params]);
  const scenarioId = useMemo(
    () => routeParams.scenarioId,
    [routeParams.scenarioId],
  );
  const mongoUserId = useMemo(() => mongoUser?._id, [mongoUser?._id]);

  // Questions state
  const [userQuestions, setUserQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  const memoizedQuestionsData = useMemo(() => {
    return userQuestions;
  }, [userQuestions]);

  const handleFacialAnalysisComplete = useCallback(result => {
    console.log('📸 Facial analysis complete:', result);
  }, []);

  const handleTranscriptionComplete = useCallback(result => {
    console.log('🎤 Transcription complete:', result);
  }, []);

  const resetCamera = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.reset();
    }
  }, []);

  const resetAudioRecorder = useCallback(() => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.reset();
    }
  }, []);

  const resetAudioWaveform = useCallback(async () => {
    if (audioWaveformRef.current) {
      await audioWaveformRef.current.stop();
    }
  }, []);

  const resetAvatarGenerator = useCallback(() => {
    if (avatarRef.current) {
      avatarRef.current.reset();
    }
  }, []);

  // Fetch user questions
  const fetchUserQuestions = useCallback(async () => {
    if (!scenarioId || !mongoUserId) {
      setIsLoadingQuestions(false);
      return;
    }

    try {
      setIsLoadingQuestions(true);
      const questionsData = await getUserLevelQuestions(
        mongoUserId,
        scenarioId,
        'level2',
      );

      const questions = questionsData.questions || [];
      // Batch state updates to prevent multiple re-renders
      setUserQuestions(questions);
      setTotalQuestions(questions.length);
    } catch (error) {
      console.error('Error fetching questions:', error.message);
      setUserQuestions([]);
      setTotalQuestions(0);
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [scenarioId, mongoUserId]);

  useEffect(() => {
    fetchUserQuestions();
  }, [fetchUserQuestions]);

  const showQuestionsLoading = useMemo(
    () => isLoadingQuestions && userQuestions.length === 0,
    [isLoadingQuestions, userQuestions.length],
  );

  const handleBackPress = useCallback(async () => {
    resetCamera();
    resetAudioRecorder();
    await resetAudioWaveform();
    resetAvatarGenerator();
    navigation.navigate('LevelOptions', routeParams);
  }, [
    navigation,
    routeParams,
    resetCamera,
    resetAudioRecorder,
    resetAudioWaveform,
    resetAvatarGenerator,
  ]);

  useEffect(() => {
    return () => {
      // Use refs directly in cleanup to avoid dependency issues
      if (cameraRef.current) {
        cameraRef.current.reset();
      }
      if (audioRecorderRef.current) {
        audioRecorderRef.current.reset();
      }
      if (audioWaveformRef.current) {
        audioWaveformRef.current.stop().catch(() => {});
      }
      if (avatarRef.current) {
        avatarRef.current.reset();
      }
    };
  }, []);

  const handleStart = useCallback(async () => {
    const startPromises = [];

    // Start AvatarGenerator (plays first video)
    if (avatarRef.current) {
      avatarRef.current.start();
    }

    // Start Camera
    if (cameraRef.current) {
      cameraRef.current.start();
    }

    // Start AudioRecorder
    if (audioRecorderRef.current) {
      startPromises.push(audioRecorderRef.current.start());
    }

    // Start AudioWaveform
    if (audioWaveformRef.current) {
      startPromises.push(audioWaveformRef.current.start());
    }

    // Start both audio components together to share microphone access
    await Promise.all(startPromises);
  }, []);

  const handleStop = useCallback(async () => {
    const stopPromises = [];

    // Stop and reset AvatarGenerator (resets to first question)
    if (avatarRef.current) {
      avatarRef.current.stop();
      avatarRef.current.reset();
    }

    // Stop and reset Camera
    if (cameraRef.current) {
      cameraRef.current.stop();
    }

    // Stop and reset AudioRecorder
    if (audioRecorderRef.current) {
      stopPromises.push(audioRecorderRef.current.stop());
    }

    // Stop AudioWaveform
    if (audioWaveformRef.current) {
      stopPromises.push(audioWaveformRef.current.stop());
    }

    await Promise.all(stopPromises);
  }, []);

  const handleFinish = useCallback(async () => {
    // Stop Waveform
    if (audioWaveformRef.current) {
      await audioWaveformRef.current.stop();
    }

    // Finish Camera and reset
    if (cameraRef.current) {
      cameraRef.current.finish();
      cameraRef.current.reset();
    }

    // Finish AudioRecorder and reset
    if (audioRecorderRef.current) {
      await audioRecorderRef.current.finish();
      audioRecorderRef.current.reset();
    }

    // Reset AvatarGenerator
    if (avatarRef.current) {
      avatarRef.current.reset();
    }
  }, []);

  const handleNext = useCallback(() => {
    avatarRef.current?.next();
  }, []);

  // Show loading overlay if questions are being generated
  if (showQuestionsLoading) {
    return (
      <View style={styles.container}>
        <LoadingOverlay visible={true} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Questions are getting generated...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LevelHeader
        currentIndex={0}
        totalQuestions={totalQuestions || 1}
        onBackPress={handleBackPress}
      />

      <View style={styles.middleSection}>
        <AvatarGenerator
          ref={avatarRef}
          questionsData={memoizedQuestionsData}
        />
        <DraggableCamera
          ref={cameraRef}
          onAnalysisComplete={handleFacialAnalysisComplete}
        />
      </View>

      <AudioRecorder
        ref={audioRecorderRef}
        onTranscriptionComplete={handleTranscriptionComplete}
      />

      {/* <View style={styles.waveformContainer}>
        <AudioWaveform ref={audioWaveformRef} />
      </View> */}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleStop}>
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.nextButton]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.finishButton]}
          onPress={handleFinish}
        >
          <Text style={styles.buttonText}>Finish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  middleSection: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    position: 'relative',
  },
  waveformContainer: {
    height: 60,
    width: '100%',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
    backgroundColor: '#6B5B95',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#2196F3',
  },
  finishButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 100,
  },
});

export default Level2Screen;
