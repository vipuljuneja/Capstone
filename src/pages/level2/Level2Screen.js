import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

// Components
import ErrorBoundary from '../components/ErrorBoundry';
import LevelHeader from '../components/LevelHeader';
import AvatarSection from '../components/AvatarSection';
import DraggableCamera from '../components/DraggableCamera';
import AudioWaveform from '../../Components/Audio/AudioWaveform';
import RecordingControls from '../components/RecordingControls';
import LoadingOverlay from '../components/LoadingOverlays';

// Hooks
import { useLevel2Logic } from '../hooks/useLevel2Logic';
import { useRecordingSession } from '../hooks/useRecordingSession';

const DEFAULT_AVATAR_URL =
  'https://tiapdsojkbqjucmjmjri.supabase.co/storage/v1/object/public/images/HitinaV2Female.png';

const Level2Screen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { scenarioTitle, scenarioId, scenarioEmoji } = route.params || {};
  const { mongoUser } = useAuth();

  // Custom hooks
  const { scenarioData, userQuestions, loading, error } = useLevel2Logic(
    scenarioId,
    mongoUser?._id,
  );

  const [orbState, setOrbState] = useState({
    speaking: false,
    loading: false,
    idx: 0,
    totalLines: 5,
    isInitialized: false,
  });

  const totalQuestions =
    userQuestions?.length || scenarioData?.level2?.questions?.length || 5;

  const recordingSession = useRecordingSession(totalQuestions);
  const {
    isRecording,
    setIsRecording,
    handleTranscriptionComplete,
    handleFacialAnalysisComplete,
    resetSession,
    transcriptionResultsRef,
    facialAnalysisResultsRef,
    transcriptionPromiseRef,
    waitingForFinalResult,
    lastTranscriptionReceived,
    lastFacialAnalysisReceived,
    setLastTranscriptionReceived,
    setLastFacialAnalysisReceived,
  } = recordingSession;

  const [avatarReady, setAvatarReady] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  // Refs
  const avatarRef = useRef(null);
  const cameraRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const waveformRef = useRef(null);
  const waveformRef1 = useRef(null);

  const waveformRefCallback = useCallback(ref => {
    console.log('🔗 Waveform ref callback called, ref:', ref);
    waveformRef1.current = ref;

    // Start waveform immediately when ref is set
    if (ref) {
      const startWaveform = async () => {
        try {
          console.log('🎵 Starting waveform via callback ref...');
          await ref.start();
          console.log('✅ Waveform started successfully via callback ref');
        } catch (error) {
          console.error('❌ Waveform start error:', error);
        }
      };

      // Small delay to ensure component is fully mounted
      setTimeout(() => {
        startWaveform();
      }, 200);
    }
  }, []);

  // Update orb state when questions load
  useEffect(() => {
    if (totalQuestions) {
      setOrbState(prev => ({ ...prev, totalLines: totalQuestions }));
    }
  }, [totalQuestions]);

  // Navigation effect when both results ready
  useEffect(() => {
    if (
      waitingForFinalResult.current &&
      lastTranscriptionReceived &&
      lastFacialAnalysisReceived
    ) {
      finishAndNavigate();
    }
  }, [lastTranscriptionReceived, lastFacialAnalysisReceived]);

  const handleStateChange = useCallback(
    newState => {
      setOrbState(newState);
      if (newState.isInitialized && !avatarReady) {
        setAvatarReady(true);
      }
    },
    [avatarReady],
  );

  const handleAvatarInitialized = useCallback(() => {
    setAvatarReady(true);
  }, []);

  const finishAndNavigate = useCallback(() => {
    console.log('✅ Navigating to results...');

    waitingForFinalResult.current = false;
    setLastTranscriptionReceived(false);
    setLastFacialAnalysisReceived(false);

    setTimeout(() => {
      setShowOverlay(false);
      navigation.navigate('Level2ResultScreen', {
        totalQuestions,
        transcriptionResults: transcriptionResultsRef.current,
        facialAnalysisResults: facialAnalysisResultsRef.current,
        scenarioTitle: scenarioTitle || 'Ordering Coffee',
        scenarioEmoji: scenarioEmoji || '☕',
        scenarioId,
      });
    }, 5000);
  }, [navigation, totalQuestions, scenarioTitle, scenarioEmoji, scenarioId]);

  const handleStart = useCallback(async () => {
    if (!avatarReady) {
      console.warn('⚠️ Avatar not ready yet');
      return;
    }

    console.log('🎤 Starting recording...');
    setIsRecording(true);

    setTimeout(async () => {
      try {
        // Waveform is already started on mount, no need to start again
        if (cameraRef.current) cameraRef.current.startRecording();
        if (avatarRef.current?.start) avatarRef.current.start();
        if (audioRecorderRef.current) audioRecorderRef.current.startRecording();
      } catch (err) {
        console.error('Error starting recording:', err);
        setIsRecording(false);
      }
    }, 200);
  }, [avatarReady, setIsRecording]);

  const handleStop = useCallback(
    async (options = {}) => {
      const { waitForTranscription = true } = options;

      console.log('🛑 Stopping recording...');

      try {
        if (waveformRef1.current) await waveformRef1.current.stop();
        if (cameraRef.current) cameraRef.current.stopRecording();
        if (avatarRef.current?.stop) avatarRef.current.stop();

        let transcriptionPromise;
        if (waitForTranscription) {
          transcriptionPromise = new Promise(resolve => {
            transcriptionPromiseRef.current = { resolve };
            setTimeout(() => {
              if (transcriptionPromiseRef.current) {
                transcriptionPromiseRef.current.resolve(null);
                transcriptionPromiseRef.current = null;
              }
            }, 5000);
          });
        }

        if (audioRecorderRef.current) audioRecorderRef.current.stopRecording();
        if (transcriptionPromise) await transcriptionPromise;

        resetSession();
      } catch (err) {
        console.error('Error stopping recording:', err);
      }
    },
    [resetSession],
  );

  const handleNext = useCallback(() => {
    const currentState = avatarRef.current?.getState();
    if (!currentState) {
      console.warn('⚠️ Avatar state not available');
      return;
    }

    const isLastQuestion = currentState.idx === currentState.totalLines - 1;

    if (isLastQuestion) {
      handleFinishSession();
    } else {
      avatarRef.current?.next();
    }
  }, []);

  const handleFinishSession = useCallback(async () => {
    if (isRecording) {
      try {
        if (waveformRef1.current) await waveformRef1.current.stop();
        if (cameraRef.current) cameraRef.current.stopRecording();
        if (avatarRef.current?.stop) avatarRef.current.stop();

        const transcriptionPromise = new Promise(resolve => {
          transcriptionPromiseRef.current = { resolve };
          setTimeout(() => {
            if (transcriptionPromiseRef.current) {
              transcriptionPromiseRef.current.resolve(null);
              transcriptionPromiseRef.current = null;
            }
          }, 5000);
        });

        if (audioRecorderRef.current) audioRecorderRef.current.stopRecording();

        setShowOverlay(true);
        await transcriptionPromise;
        setIsRecording(false);
      } catch (err) {
        console.error('Error finishing session:', err);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    waitingForFinalResult.current = true;
    setLastTranscriptionReceived(true);
    setLastFacialAnalysisReceived(true);
  }, [
    isRecording,
    setIsRecording,
    setLastTranscriptionReceived,
    setLastFacialAnalysisReceived,
  ]);

  const handleBackPress = useCallback(async () => {
    try {
      if (isRecording) {
        await handleStop({ waitForTranscription: false });
      } else if (cameraRef.current?.isRecording) {
        cameraRef.current.stopRecording();
      }
    } catch (err) {
      console.error('Error on back press:', err);
    } finally {
      navigation.navigate('LevelOptions', route.params);
    }
  }, [isRecording, handleStop, navigation, route.params]);

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Unable to Load Scenario</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading scenario...</Text>
      </View>
    );
  }

  const lines =
    userQuestions?.map(q => q.text) ||
    scenarioData?.level2?.questions?.map(q => q.text) ||
    [];

  const videoUrls =
    userQuestions
      ?.map(q => q.videoUrl)
      .filter(url => url && url.startsWith('http')) || null;

  return (
    <ErrorBoundary onReset={resetSession}>
      <View style={styles.container}>
        <LoadingOverlay visible={showOverlay} />

        <LevelHeader
          currentIndex={orbState.idx}
          totalQuestions={totalQuestions}
          onBackPress={handleBackPress}
        />

        <View style={styles.middleSection}>
          <AvatarSection
            ref={avatarRef}
            imgURL={DEFAULT_AVATAR_URL}
            lines={lines}
            videoUrls={videoUrls}
            onStateChange={handleStateChange}
            onInitialized={handleAvatarInitialized}
          />

          <DraggableCamera
            ref={cameraRef}
            onAnalysisComplete={handleFacialAnalysisComplete}
          />
        </View>

        <View style={styles.waveformVisible}>
          <AudioWaveform ref={waveformRefCallback} />
        </View>

        <RecordingControls
          ref={audioRecorderRef}
          isRecording={isRecording}
          avatarReady={avatarReady}
          isLastQuestion={orbState.idx === orbState.totalLines - 1}
          isSpeaking={orbState.speaking}
          isLoading={orbState.loading}
          onStart={handleStart}
          onStop={handleStop}
          onNext={handleNext}
          onTranscriptionComplete={handleTranscriptionComplete}
        />
      </View>
    </ErrorBoundary>
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
  waveformVisible: {
    height: 60,
    width: '100%',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  // waveformHidden: {
  //   display: 'none',
  // },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default Level2Screen;
