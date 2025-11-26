import React, {
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
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

import BackIcon from '../../../assets/icons/back.svg';
import MicIcon from '../../../assets/icons/mic-white.svg';
import DeleteIcon from '../../../assets/icons/delete-filled.svg';

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
  const [showOverlay, setShowOverlay] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  // Results tracking
  const transcriptionResultsRef = useRef([]);
  const facialAnalysisResultsRef = useRef([]);
  const [lastTranscriptionReceived, setLastTranscriptionReceived] =
    useState(false);
  const [lastFacialAnalysisReceived, setLastFacialAnalysisReceived] =
    useState(false);
  const waitingForFinalResult = useRef(false);

  const memoizedQuestionsData = useMemo(() => {
    return userQuestions;
  }, [userQuestions]);

  const handleFacialAnalysisComplete = useCallback(result => {
    if (result && !result.error) {
      facialAnalysisResultsRef.current = [
        ...facialAnalysisResultsRef.current,
        result,
      ];
      if (waitingForFinalResult.current) {
        setLastFacialAnalysisReceived(true);
      }
    }
  }, []);

  const handleTranscriptionComplete = useCallback(result => {
    if (result && !result.error) {
      transcriptionResultsRef.current = [
        ...transcriptionResultsRef.current,
        result,
      ];
      if (waitingForFinalResult.current) {
        setLastTranscriptionReceived(true);
      }
    }
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
    setCurrentIndex(0);
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
    setCurrentIndex(0);
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
    setIsRecording(true);

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

  const handleDelete = useCallback(async () => {
    const stopPromises = [];

    // Stop AudioWaveform
    if (audioWaveformRef.current) {
      stopPromises.push(audioWaveformRef.current.stop());
    }

    // Stop and reset Camera
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current.reset();
    }

    // Stop and reset AudioRecorder
    if (audioRecorderRef.current) {
      if (audioRecorderRef.current.isRecording) {
        stopPromises.push(audioRecorderRef.current.stop());
      }
      if (audioRecorderRef.current.reset) {
        audioRecorderRef.current.reset();
      }
    }

    await Promise.all(stopPromises);

    // Stop and reset AvatarGenerator (resets to first question)
    if (avatarRef.current) {
      avatarRef.current.stop();
      avatarRef.current.reset();
    }
    setCurrentIndex(0);

    // Clear results
    transcriptionResultsRef.current = [];
    facialAnalysisResultsRef.current = [];

    setIsRecording(false);
  }, []);

  // Watch for both results and navigate when ready
  useEffect(() => {
    if (
      waitingForFinalResult.current &&
      lastTranscriptionReceived &&
      lastFacialAnalysisReceived
    ) {
      const navigateToResults = () => {
        waitingForFinalResult.current = false;
        setLastTranscriptionReceived(false);
        setLastFacialAnalysisReceived(false);

        const avatarState = avatarRef.current?.getState();
        const { scenarioEmoji, scenarioTitle } = routeParams;

        setShowOverlay(false);

        navigation.navigate('Level2ResultScreen', {
          totalQuestions: avatarState?.totalVideos || totalQuestions,
          transcriptionResults: transcriptionResultsRef.current,
          facialAnalysisResults: facialAnalysisResultsRef.current,
          scenarioTitle: scenarioTitle || 'Ordering Coffee',
          scenarioEmoji: scenarioEmoji || '☕',
          scenarioId: scenarioId,
          ...routeParams,
        });

        // Reset AvatarGenerator
        if (avatarRef.current) {
          avatarRef.current.reset();
        }
        setCurrentIndex(0);
        setIsRecording(false);
      };

      navigateToResults();
    }
  }, [
    lastTranscriptionReceived,
    lastFacialAnalysisReceived,
    navigation,
    routeParams,
    scenarioId,
    totalQuestions,
  ]);

  const handleFinish = useCallback(async () => {
    setShowOverlay(true);
    waitingForFinalResult.current = true;
    setLastTranscriptionReceived(false);
    setLastFacialAnalysisReceived(false);

    // Stop Waveform
    if (audioWaveformRef.current) {
      await audioWaveformRef.current.stop();
    }

    // Finish Camera - this will trigger onAnalysisComplete callback
    let facialResult = null;
    if (cameraRef.current) {
      facialResult = cameraRef.current.finish();
      cameraRef.current.reset();
    }

    // Finish AudioRecorder - this will trigger onTranscriptionComplete callback
    let transcriptionResult = null;
    try {
      if (audioRecorderRef.current) {
        transcriptionResult = await audioRecorderRef.current.finish();
        audioRecorderRef.current.reset();
      }
    } catch (error) {
      console.error('Error finishing AudioRecorder:', error);
    }

    // Wait a bit for callbacks to fire
    await new Promise(resolve => setTimeout(resolve, 500));

    // Process results if callbacks didn't fire
    if (facialResult && !facialResult.error) {
      facialAnalysisResultsRef.current = [
        ...facialAnalysisResultsRef.current,
        facialResult,
      ];
      setLastFacialAnalysisReceived(true);
    }

    if (transcriptionResult && !transcriptionResult.error) {
      let finalTranscriptionResults = [];
      if (
        Array.isArray(transcriptionResult.sessionData) &&
        transcriptionResult.sessionData.length > 0
      ) {
        finalTranscriptionResults = transcriptionResult.sessionData;
      } else {
        const report = {
          transcript: transcriptionResult.transcript,
          wpm: transcriptionResult.wpm,
          totalWords: transcriptionResult.totalWords,
          fillerWordCount: transcriptionResult.fillerWordCount,
          fillerWords: transcriptionResult.fillerWords,
          pauseCount: transcriptionResult.pauseCount,
          pauses: transcriptionResult.pauses,
          duration: transcriptionResult.duration,
          timestamp: transcriptionResult.timestamp,
        };
        finalTranscriptionResults = [report];
      }
      transcriptionResultsRef.current = [
        ...transcriptionResultsRef.current,
        ...finalTranscriptionResults,
      ];
      setLastTranscriptionReceived(true);
    }
  }, []);

  const handleNext = useCallback(() => {
    const avatarState = avatarRef.current?.getState();

    if (!avatarState) {
      return;
    }

    const isLastQuestion =
      avatarState.currentIndex === avatarState.totalVideos - 1;

    if (isLastQuestion) {
      // Last question - execute finish
      handleFinish();
    } else {
      // Move to next question
      avatarRef.current?.next();
      // Update current index after next
      setTimeout(() => {
        const state = avatarRef.current?.getState();
        if (state) {
          setCurrentIndex(state.currentIndex);
        }
      }, 100);
    }
  }, [handleFinish]);

  // Watch for avatar state changes to update progress
  useEffect(() => {
    const interval = setInterval(() => {
      const state = avatarRef.current?.getState();
      if (state) {
        setCurrentIndex(state.currentIndex);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Reset progress when questions change
  useEffect(() => {
    setCurrentIndex(0);
  }, [userQuestions]);

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
      {showOverlay && (
        <View style={styles.overlay}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#6B5B95" />
          </View>
        </View>
      )}

      <LevelHeader
        currentIndex={currentIndex}
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

      <View style={styles.bottomSection}>
        {isRecording ? (
          <View style={styles.recordingControls}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <DeleteIcon height={24} width={24} style={{ color: '#FFFFFF' }} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>
                {currentIndex === totalQuestions - 1 ? '✓' : '→'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.micButton} onPress={handleStart}>
            <MicIcon height={24} width={24} />
          </TouchableOpacity>
        )}
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
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  recordingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 10,
    gap: 12,
  },
  deleteButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A3F5B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6B5B95',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A3F5B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 24,
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 10,
  },
});

export default Level2Screen;
