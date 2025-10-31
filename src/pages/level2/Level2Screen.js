// src/screens/levels/Level2Screen.js
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AvatarGenerator from '../../Components/Avatar/AvatarGenerate';
import CameraDetector from '../../Components/Facial/CameraDetector';
import AudioRecorder from '../../Components/Audio/AudioRecorder';
import AudioWaveform from '../../Components/Audio/AudioWaveform';

import scenarioService from '../../services/scenarioService';

const { width, height } = Dimensions.get('window');

const Level2Screen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { scenarioTitle, scenarioId } = route.params || {};

  //Scenario States
  const [scenarioData, setScenarioData] = useState(null);
  const [loading, setLoading] = useState(true);

  //Fetch Scenario Data
  useEffect(() => {
    const loadScenarioData = async () => {
      try {
        setLoading(true);
        if (scenarioId) {
          const scenario = await scenarioService.getScenarioById(scenarioId);
          setScenarioData(scenario);

          // Update orb state with question count from loaded data
          const questionCount = scenario?.level2?.questions?.length || 5;
          setOrbState(prev => ({ ...prev, totalLines: questionCount }));
        }
      } catch (error) {
        console.error('Failed to load scenario data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScenarioData();
  }, [scenarioId]);

  const [isRecording, setIsRecording] = useState(false);
  const [avatarReady, setAvatarReady] = useState(false);
  const [transcriptionResults, setTranscriptionResults] = useState([]);
  const [facialAnalysisResults, setFacialAnalysisResults] = useState([]);

  // Flags for tracking last question results received
  const [lastTranscriptionReceived, setLastTranscriptionReceived] =
    useState(false);
  const [lastFacialAnalysisReceived, setLastFacialAnalysisReceived] =
    useState(false);
  const waitingForFinalResult = useRef(false);

  // Drag position for camera overlay
  const [pan] = useState(new Animated.ValueXY({ x: 20, y: 20 }));

  // Refs for components and result buffers
  const avatarRef = useRef(null);
  const cameraRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const waveformRef = useRef(null);
  const transcriptionResultsRef = useRef([]);
  const facialAnalysisResultsRef = useRef([]);
  const transcriptionPromiseRef = useRef(null);

  const [orbState, setOrbState] = useState({
    speaking: false,
    loading: false,
    idx: 0,
    totalLines: 5,
    isInitialized: false,
  });

  // Pan responder to drag camera overlay
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: () => {
      pan.flattenOffset();
    },
    onPanResponderGrant: () => {
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      });
      pan.setValue({ x: 0, y: 0 });
    },
  });

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

  const resetLevel = useCallback(() => {
    setIsRecording(false);
    setTranscriptionResults([]);
    setFacialAnalysisResults([]);
    transcriptionResultsRef.current = [];
    facialAnalysisResultsRef.current = [];

    // Reset flags and refs
    setLastTranscriptionReceived(false);
    setLastFacialAnalysisReceived(false);
    waitingForFinalResult.current = false;

    if (avatarRef.current?.reset) {
      avatarRef.current.reset();
    }

    setOrbState(prev => ({
      ...prev,
      idx: 0,
      speaking: false,
      loading: false,
    }));
  }, []);

  // Handle transcription result arrival
  const handleTranscriptionComplete = useCallback(
    report => {
      console.log('📥 Transcription result received:', report);
      setTranscriptionResults(prevResults => {
        const newResults = [...prevResults, report];
        transcriptionResultsRef.current = newResults;

        // Diagnostic log for flag setting
        console.log(
          'Setting lastTranscriptionReceived?',
          waitingForFinalResult.current,
          newResults.length,
          orbState.totalLines,
        );

        if (
          waitingForFinalResult.current &&
          newResults.length === orbState.totalLines
        ) {
          setLastTranscriptionReceived(true);
        }
        return newResults;
      });

      if (transcriptionPromiseRef.current) {
        transcriptionPromiseRef.current.resolve(report);
        transcriptionPromiseRef.current = null;
      }
    },
    [orbState.totalLines],
  );

  // Handle facial analysis result arrival
  const handleFacialAnalysisComplete = useCallback(
    insights => {
      console.log('📥 Facial analysis result received:', insights);
      setFacialAnalysisResults(prevResults => {
        const newResults = [...prevResults, insights];
        facialAnalysisResultsRef.current = newResults;

        // Diagnostic log for flag setting
        console.log(
          'Setting lastFacialAnalysisReceived?',
          waitingForFinalResult.current,
          newResults.length,
          orbState.totalLines,
        );

        if (
          waitingForFinalResult.current &&
          newResults.length === orbState.totalLines
        ) {
          setLastFacialAnalysisReceived(true);
        }
        return newResults;
      });
    },
    [orbState.totalLines],
  );

  // useEffect to watch for both flags and navigate once both are true
  useEffect(() => {
    console.log(
      'useEffect fires!',
      lastTranscriptionReceived,
      lastFacialAnalysisReceived,
      waitingForFinalResult.current,
    );
    if (
      waitingForFinalResult.current &&
      lastTranscriptionReceived &&
      lastFacialAnalysisReceived
    ) {
      console.log('Navigation conditions met.');
      finishAndNavigate();
    }
  }, [lastTranscriptionReceived, lastFacialAnalysisReceived]);

  // Navigation helper - called when both results are ready
  const finishAndNavigate = useCallback(() => {
    console.log('Executing finishAndNavigate...');
    waitingForFinalResult.current = false;
    setLastTranscriptionReceived(false);
    setLastFacialAnalysisReceived(false);

    const currentState = avatarRef.current?.getState();
    console.log('Current avatar state before navigation:', currentState);
    const { scenarioEmoji } = route.params || {};

    console.log(
      'Here My Data',
      transcriptionResultsRef.current,
      facialAnalysisResultsRef.current,
    );

    setTimeout(() => {
      navigation.navigate('Level2ResultScreen', {
        totalQuestions: currentState?.totalLines || 5,
        transcriptionResults: transcriptionResultsRef.current,
        facialAnalysisResults: facialAnalysisResultsRef.current,
        scenarioTitle: scenarioTitle || 'Ordering Coffee',
        scenarioEmoji: scenarioEmoji || '☕',
        scenarioId: scenarioId,
      });
      console.log('Navigation triggered');
    }, 10000);
  }, [navigation, route.params]);

  // Start recording and processing
  const handleStart = async () => {
    if (!avatarReady) {
      console.warn('Avatar not ready yet.');
      return;
    }
    console.log('🎤 Starting recording...');
    setIsRecording(true);

    setTimeout(async () => {
      if (waveformRef.current) {
        await waveformRef.current.start();
      }
      if (cameraRef.current) {
        cameraRef.current.startRecording();
      }
      if (avatarRef.current?.start) {
        avatarRef.current.start();
      }
      if (audioRecorderRef.current) {
        audioRecorderRef.current.startRecording();
      }
    }, 200);
  };

  // Stop recording and reset state
  const handleStop = useCallback(async () => {
    console.log('🛑 Stopping and resetting...');
    try {
      if (waveformRef.current) {
        await waveformRef.current.stop();
      }
    } catch (error) {
      console.error('Waveform stop error:', error);
    }

    if (cameraRef.current) {
      cameraRef.current.stopRecording();
    }
    if (avatarRef.current?.stop) {
      avatarRef.current.stop();
    }

    const transcriptionPromise = new Promise(resolve => {
      transcriptionPromiseRef.current = { resolve };
      setTimeout(() => {
        if (transcriptionPromiseRef.current) {
          transcriptionPromiseRef.current.resolve(null);
          transcriptionPromiseRef.current = null;
        }
      }, 5000);
    });

    if (audioRecorderRef.current) {
      audioRecorderRef.current.stopRecording();
    }

    await transcriptionPromise;
    resetLevel();
  }, [resetLevel]);

  // Handle "Next" button press in conversation
  const handleNext = useCallback(() => {
    const currentState = avatarRef.current?.getState();
    if (!currentState) {
      console.warn('Avatar state not available');
      return;
    }

    if (currentState.idx === currentState.totalLines - 1) {
      const finishAfterResults = async () => {
        if (isRecording) {
          try {
            if (waveformRef.current) {
              await waveformRef.current.stop();
            }
          } catch (error) {
            console.error('Waveform stop error:', error);
          }

          if (cameraRef.current) {
            cameraRef.current.stopRecording();
          }
          if (avatarRef.current?.stop) {
            avatarRef.current.stop();
          }

          const transcriptionPromise = new Promise(resolve => {
            transcriptionPromiseRef.current = { resolve };
            setTimeout(() => {
              if (transcriptionPromiseRef.current) {
                transcriptionPromiseRef.current.resolve(null);
                transcriptionPromiseRef.current = null;
              }
            }, 5000);
          });

          if (audioRecorderRef.current) {
            audioRecorderRef.current.stopRecording();
          }

          console.log('⏳ Waiting for final transcription...');
          await transcriptionPromise;
          setIsRecording(false);
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        // Start waiting for both results
        waitingForFinalResult.current = true;

        // Check if results already present
        if (
          transcriptionResultsRef.current.length === currentState.totalLines &&
          facialAnalysisResultsRef.current.length === currentState.totalLines
        ) {
          setLastTranscriptionReceived(true);
          setLastFacialAnalysisReceived(true);
        }
      };

      finishAfterResults();
    } else {
      avatarRef.current?.next();
    }
  }, [isRecording]);

  const isLastQuestion = orbState.idx === orbState.totalLines - 1;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading scenario...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Progress */}
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((orbState.idx + 1) / orbState.totalLines) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Avatar in Center */}
      <View style={styles.middleSection}>
        <AvatarGenerator
          ref={avatarRef}
          onStateChange={handleStateChange}
          onInitialized={handleAvatarInitialized}
          lines={(scenarioData?.level2?.questions || [])
            .map(q => q.text)
            .slice(0, 1)}
        />

        {/* Draggable Camera Overlay */}
        <Animated.View
          style={[
            styles.cameraComponent,
            {
              transform: [{ translateX: pan.x }, { translateY: pan.y }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <CameraDetector
            ref={cameraRef}
            onAnalysisComplete={handleFacialAnalysisComplete}
          />
        </Animated.View>
      </View>

      {/* Waveform */}
      {/* <View
        style={isRecording ? styles.waveformVisible : styles.waveformHidden}
      >
        <AudioWaveform ref={waveformRef} />
      </View> */}

      {/* Bottom Controls */}
      <View style={styles.bottomSection}>
        <AudioRecorder
          ref={audioRecorderRef}
          onTranscriptionComplete={handleTranscriptionComplete}
        />

        {/* Microphone Button */}
        <TouchableOpacity
          style={isRecording ? styles.stopButton : styles.micButton}
          onPress={isRecording ? handleStop : handleStart}
          disabled={!avatarReady && !isRecording}
        >
          <Text style={styles.buttonEmoji}>{isRecording ? '⏹️' : '🎤'}</Text>
        </TouchableOpacity>

        {/* Next/Done Button */}
        {isRecording && (
          <TouchableOpacity
            onPress={handleNext}
            disabled={orbState.speaking || orbState.loading}
            style={[
              styles.nextButton,
              (orbState.speaking || orbState.loading) && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.nextButtonText}>
              {isLastQuestion ? '✓' : '→'}
            </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    gap: 15,
  },
  backButton: {
    fontSize: 28,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B5B95',
    borderRadius: 4,
  },
  middleSection: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    position: 'relative',
  },
  cameraComponent: {
    position: 'absolute',
    width: 150,
    height: 200,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  waveformHidden: {
    width: 0,
    height: 0,
    overflow: 'hidden',
    opacity: 0,
  },
  waveformVisible: {
    height: 60,
    backgroundColor: 'white',
    paddingHorizontal: 15,
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'white',
    gap: 20,
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#6B5B95',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonEmoji: {
    fontSize: 30,
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6B5B95',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default Level2Screen;
