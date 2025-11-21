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
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AvatarGenerator from '../../Components/Avatar/AvatarGenerate';
import CameraDetector from '../../Components/Facial/CameraDetector';
import AudioRecorder from '../../Components/Audio/AudioRecorder';
import AudioWaveform from '../../Components/Audio/AudioWaveform';

import scenarioService from '../../services/scenarioService';
import { getUserLevelQuestions } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import BackIcon from '../../../assets/icons/back.svg';
import MicIcon from '../../../assets/icons/mic-white.svg';
import DeleteIcon from '../../../assets/icons/delete-filled.svg';

const { width, height } = Dimensions.get('window');

const Level2Screen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { scenarioTitle, scenarioId } = route.params || {};
  const { mongoUser } = useAuth();

  const [showOverlay, setShowOverlay] = useState(false);

  //Scenario States
  const [scenarioData, setScenarioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userQuestions, setUserQuestions] = useState(null);

  useEffect(() => {
    const loadUserQuestions = async () => {
      try {
        setLoading(true);
        if (scenarioId && mongoUser?._id) {
          // Fetch user-specific questions (includes Supabase video URLs)
          const questionsData = await getUserLevelQuestions(
            mongoUser._id,
            scenarioId,
            'level2',
          );

          console.log(
            '📹 Loaded user questions with video URLs:',
            questionsData,
          );
          setUserQuestions(questionsData.questions || []);

          // Update orb state with question count
          const questionCount = questionsData.questions?.length || 5;
          totalLinesRef.current = questionCount;
          setOrbState(prev => ({ ...prev, totalLines: questionCount }));

          // Also load scenario data for fallback
          const scenario = await scenarioService.getScenarioById(scenarioId);
          setScenarioData(scenario);
        } else if (scenarioId) {
          // Fallback: use default scenario if no user
          const scenario = await scenarioService.getScenarioById(scenarioId);
          setScenarioData(scenario);
          const questionCount = scenario?.level2?.questions?.length || 5;
          totalLinesRef.current = questionCount;
          setOrbState(prev => ({ ...prev, totalLines: questionCount }));
        }
      } catch (error) {
        // console.error('Failed to load questions:', error);
        // Fallback to default scenario
        if (scenarioId) {
          try {
            const scenario = await scenarioService.getScenarioById(scenarioId);
            setScenarioData(scenario);
            const questionCount = scenario?.level2?.questions?.length || 5;
            totalLinesRef.current = questionCount;
            setOrbState(prev => ({ ...prev, totalLines: questionCount }));
          } catch (fallbackError) {
            // console.error('Failed to load fallback scenario:', fallbackError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserQuestions();
  }, [scenarioId, mongoUser?._id]);

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
  const totalLinesRef = useRef(5);
  const questionTimestampsRef = useRef([]); // Track when each question plays
  const recordingStartTimeRef = useRef(null); // Track when recording started
  const recordingHealthCheckRef = useRef(null); // Health check interval for recording
  const pendingRestartTimerRef = useRef(null); // Track pending recording restart timer

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

  // Handle avatar state changes and track question timestamps
  const handleStateChange = useCallback(
    newState => {
      if (!newState) return;
      setOrbState(newState);
      if (newState.isInitialized && !avatarReady) {
        setAvatarReady(true);
      }
      
      // Track when questions start playing (for filtering from transcript)
      if (newState.speaking && recordingStartTimeRef.current) {
        const questionStartTime = Date.now() - recordingStartTimeRef.current;
        questionTimestampsRef.current.push({
          questionIndex: newState.idx,
          startTime: questionStartTime / 1000, // Convert to seconds
          endTime: null, // Will be set when question ends
        });
        console.log(`📝 Question ${newState.idx} started at ${(questionStartTime / 1000).toFixed(2)}s`);
      }
      
      // Track when questions end
      if (!newState.speaking && questionTimestampsRef.current.length > 0) {
        const lastQuestion = questionTimestampsRef.current[questionTimestampsRef.current.length - 1];
        if (lastQuestion && lastQuestion.endTime === null && recordingStartTimeRef.current) {
          const questionEndTime = Date.now() - recordingStartTimeRef.current;
          lastQuestion.endTime = questionEndTime / 1000; // Convert to seconds
          console.log(`📝 Question ${lastQuestion.questionIndex} ended at ${(questionEndTime / 1000).toFixed(2)}s`);
          
          // CRITICAL: Check if recording stopped when video ended - check multiple times
          setTimeout(() => {
            const isStillRecording = audioRecorderRef.current?.isRecording;
            if (isRecording && !isStillRecording) {
              console.error('❌ CRITICAL: Recording stopped when video ended! Restarting...');
              // Force restart recording to maintain continuity
              audioRecorderRef.current?.startRecording().catch(err => {
                console.error('❌ Failed to restart recording:', err);
              });
            } else if (isRecording && isStillRecording) {
              console.log('✅ Recording still active after video ended');
            }
          }, 300);
          
          // Check again after a longer delay
          setTimeout(() => {
            const isStillRecording = audioRecorderRef.current?.isRecording;
            if (isRecording && !isStillRecording) {
              console.error('❌ CRITICAL: Recording stopped after video ended (delayed check)! Restarting...');
              audioRecorderRef.current?.startRecording().catch(err => {
                console.error('❌ Failed to restart recording (delayed):', err);
              });
            }
          }, 1000);
        }
      }
    },
    [avatarReady],
  );

  const handleAvatarInitialized = useCallback(() => {
    setAvatarReady(true);
    // Enable video rendering immediately when avatar initializes (like Level 3)
    // This allows video to show even before recording starts
    if (avatarRef.current?.enableVideoRendering) {
      avatarRef.current.enableVideoRendering();
    }
  }, []);

  const resetLevel = useCallback(() => {
    console.log('🔄 Resetting level to start');

    // Reset local state
    setIsRecording(false);
    setTranscriptionResults([]);
    const questionCount = scenarioData?.level2?.questions?.length || 5;
    totalLinesRef.current = questionCount;
    setOrbState({
      speaking: false,
      loading: false,
      idx: 0,
      totalLines: questionCount,
    });

    transcriptionResultsRef.current = [];
    questionTimestampsRef.current = [];
    recordingStartTimeRef.current = null;
    
    // Clear any pending restart timers
    if (pendingRestartTimerRef.current) {
      clearTimeout(pendingRestartTimerRef.current);
      pendingRestartTimerRef.current = null;
    }

    // Reset AudioRecorder
    if (audioRecorderRef.current?.reset) {
      audioRecorderRef.current.reset();
    }
  }, [scenarioData]);

  // Filtering removed - user wants both questions and answers in transcript

  // Handle transcription result arrival
  const handleTranscriptionComplete = useCallback(
    report => {
      try {
        console.log('📥 Transcription result received:', report);
        
        // User wants both questions and answers - no filtering needed
        // Keep the full transcript as-is
        
        setTranscriptionResults(prevResults => {
          const newResults = [...prevResults, report];
          transcriptionResultsRef.current = newResults;

          // Diagnostic log for flag setting
          const totalLines = totalLinesRef.current || 0;
          console.log(
            'Setting lastTranscriptionReceived?',
            waitingForFinalResult.current,
            newResults.length,
            totalLines,
          );

          if (
            waitingForFinalResult.current &&
            totalLines > 0 &&
            newResults.length === totalLines
          ) {
            setLastTranscriptionReceived(true);
          }
          return newResults;
        });

        if (transcriptionPromiseRef.current) {
          transcriptionPromiseRef.current.resolve(report);
          transcriptionPromiseRef.current = null;
        }
      } catch (error) {
        console.error('❌ Error in handleTranscriptionComplete:', error);
      }
    },
    [],
  );

  // Handle facial analysis result arrival
  const handleFacialAnalysisComplete = useCallback(
    insights => {
      try {
        console.log('📥 Facial analysis result received:', insights);
        setFacialAnalysisResults(prevResults => {
          const newResults = [...prevResults, insights];
          facialAnalysisResultsRef.current = newResults;

          // Diagnostic log for flag setting
          const totalLines = totalLinesRef.current || 0;
          console.log(
            'Setting lastFacialAnalysisReceived?',
            waitingForFinalResult.current,
            newResults.length,
            totalLines,
          );

          if (
            waitingForFinalResult.current &&
            totalLines > 0 &&
            newResults.length === totalLines
          ) {
            setLastFacialAnalysisReceived(true);
          }
          return newResults;
        });
      } catch (error) {
        console.error('❌ Error in handleFacialAnalysisComplete:', error);
      }
    },
    [],
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
      // Add a small delay before navigation to ensure all state is stable
      setTimeout(() => {
        try {
          finishAndNavigate();
        } catch (error) {
          console.error('❌ Error in navigation useEffect:', error);
        }
      }, 100);
    }
  }, [lastTranscriptionReceived, lastFacialAnalysisReceived, finishAndNavigate]);

  // Navigation helper - called when both results are ready
  const finishAndNavigate = useCallback(() => {
    try {
      console.log('Executing finishAndNavigate...');
      waitingForFinalResult.current = false;
      setLastTranscriptionReceived(false);
      setLastFacialAnalysisReceived(false);

      const currentState = avatarRef.current?.getState();
      console.log('Current avatar state before navigation:', currentState);
      const { scenarioEmoji } = route.params || {};

      // Ensure we have valid data before navigating
      const transcriptionData = transcriptionResultsRef.current || [];
      const facialData = facialAnalysisResultsRef.current || [];

      console.log(
        'Here My Data',
        transcriptionData,
        facialData,
      );

      // Validate data before navigation
      if (!scenarioId) {
        console.error('❌ No scenarioId, cannot navigate');
        return;
      }

      setTimeout(() => {
        try {
          setShowOverlay(false);
          
          // Ensure navigation is available and params are valid
          if (!navigation || !navigation.navigate) {
            console.error('❌ Navigation not available');
            return;
          }

          navigation.navigate('Level2ResultScreen', {
            totalQuestions: currentState?.totalLines || transcriptionData.length || 5,
            transcriptionResults: transcriptionData,
            facialAnalysisResults: facialData,
            scenarioTitle: scenarioTitle || 'Ordering Coffee',
            scenarioEmoji: scenarioEmoji || '☕',
            scenarioId: scenarioId,
          });
          console.log('✅ Navigation triggered successfully');
        } catch (navError) {
          console.error('❌ Navigation error:', navError);
          // Don't crash - just log the error
        }
      }, 2000); // Reduced from 5000ms to 2000ms for faster navigation
    } catch (error) {
      console.error('❌ Error in finishAndNavigate:', error);
      // Don't let errors crash the app
    }
  }, [navigation, route.params, scenarioTitle, scenarioId]);

  // Start recording and processing
  const handleStart = async () => {
    if (!avatarReady) {
      console.warn('Avatar not ready yet.');
      return;
    }
    
    // Ensure AudioRecorder ref is ready
    if (!audioRecorderRef.current) {
      console.error('❌ AudioRecorder ref not ready');
      return;
    }
    
    console.log('🎤 Starting recording...');
    setIsRecording(true);

    // Start AudioRecorder FIRST to avoid conflict with video playback
    // Video playback (AvatarGenerator) can interfere with audio recording on iOS
    setTimeout(async () => {
      try {
        // Start AudioRecorder FIRST before video to avoid audio session conflicts
        if (audioRecorderRef.current?.startRecording) {
          console.log('🎙️ Starting AudioRecorder first...');
          await audioRecorderRef.current.startRecording();
          console.log('✅ AudioRecorder started successfully');
          
          // Track recording start time for question timestamp filtering
          recordingStartTimeRef.current = Date.now();
          questionTimestampsRef.current = []; // Reset question timestamps
          
          // Start periodic health check to ensure recording continues
          if (recordingHealthCheckRef.current) {
            clearInterval(recordingHealthCheckRef.current);
          }
          let lastProgressTime = Date.now();
          recordingHealthCheckRef.current = setInterval(() => {
            const isStillRecording = audioRecorderRef.current?.isRecording;
            const currentTime = Date.now();
            
            if (isRecording && !isStillRecording) {
              console.error('❌ CRITICAL: Recording stopped unexpectedly! Attempting restart...');
              audioRecorderRef.current?.startRecording().catch(err => {
                console.error('❌ Failed to restart recording:', err);
              });
            } else if (isRecording && isStillRecording) {
              // Log that recording is still active (every 10 seconds)
              const elapsed = Math.floor((currentTime - lastProgressTime) / 1000);
              if (elapsed >= 10) {
                const totalElapsed = recordingStartTimeRef.current 
                  ? Math.floor((currentTime - recordingStartTimeRef.current) / 1000)
                  : 0;
                console.log(`✅ Recording health check: Still active (${totalElapsed}s total)`);
                lastProgressTime = currentTime;
              }
            }
          }, 2000); // Check every 2 seconds
        } else {
          console.error('❌ startRecording method not available');
          setIsRecording(false);
          return;
        }
        
        // Enable video rendering - video shows immediately (like Level 3)
        // Video is already set to render by default, but we enable it here to be safe
        if (avatarRef.current?.enableVideoRendering) {
          avatarRef.current.enableVideoRendering();
        }
        
        // Wait longer to ensure audio session is fully stable before video starts
        // This prevents crashes when video tries to initialize audio resources
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Now start the avatar video WITH audio (using proper audio session configuration)
        if (avatarRef.current?.start) {
          console.log('🎬 Starting avatar video with audio (mixWithOthers enabled)...');
          avatarRef.current.start();
        }
        
        // Temporarily disable AudioWaveform to test if it conflicts with AudioRecorder
        // AudioWaveform and AudioRecorder both try to record, which may cause conflicts on iOS
        // if (waveformRef.current) {
        //   await waveformRef.current.start();
        // }
        // Temporarily disable camera to test if it's causing crashes
        // Uncomment the line below to re-enable facial analysis
        // if (cameraRef.current) {
        cameraRef.current.startRecording();
        // }
      } catch (error) {
        console.error('❌ Error in handleStart setTimeout:', error);
        setIsRecording(false);
      }
    }, 200); // Back to 200ms since we're starting AudioRecorder first
  };

  // Stop recording and reset state
  const handleStop = useCallback(
    async (options = {}) => {
      const { waitForTranscription = true } = options;

      // Stop health check
      if (recordingHealthCheckRef.current) {
        clearInterval(recordingHealthCheckRef.current);
        recordingHealthCheckRef.current = null;
      }

      waitingForFinalResult.current = false;
      setLastTranscriptionReceived(false);
      setLastFacialAnalysisReceived(false);

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
      } else if (transcriptionPromiseRef.current) {
        transcriptionPromiseRef.current.resolve(null);
        transcriptionPromiseRef.current = null;
      }

      if (audioRecorderRef.current) {
        audioRecorderRef.current.stopRecording();
      }

      if (transcriptionPromise) {
        await transcriptionPromise;
      }

      resetLevel();
    },
    [resetLevel],
  );

  // Handle "Next" button press in conversation
  const handleNext = useCallback(async () => {
    const currentState = avatarRef.current?.getState();
    if (!currentState) {
      console.warn('Avatar state not available');
      return;
    }

    // CRITICAL FIX: Stop and restart recording for each question to avoid iOS audio session interruptions
    // When videos end/start, iOS interrupts the recording session, causing it to stop at ~8s
    // By stopping and restarting for each question, we ensure each question is fully recorded
    
    // Check if this is the last question BEFORE stopping/restarting
    const isLastQuestion = currentState.idx === currentState.totalLines - 1;
    // Check if we're moving TO the last question (need to restart recording for it)
    const isMovingToLastQuestion = currentState.idx + 1 === currentState.totalLines - 1;
    
    // Stop and restart recording for question transitions (including when moving to last question)
    // We need to record the last question too, we just won't restart after it ends
    if (isRecording && audioRecorderRef.current && !isLastQuestion) {
      console.log('🔄 Stopping recording for question transition to prevent iOS interruption...');
      
      // Clear any pending restart timer
      if (pendingRestartTimerRef.current) {
        clearTimeout(pendingRestartTimerRef.current);
        pendingRestartTimerRef.current = null;
      }
      
      // Stop current recording and wait for transcription
      const transcriptionPromise = new Promise(resolve => {
        transcriptionPromiseRef.current = { resolve };
        setTimeout(() => {
          if (transcriptionPromiseRef.current) {
            transcriptionPromiseRef.current.resolve(null);
            transcriptionPromiseRef.current = null;
          }
        }, 3000); // Shorter timeout for per-question transcription
      });

      try {
        await audioRecorderRef.current.stopRecording();
        console.log('⏳ Waiting for question transcription...');
        await transcriptionPromise;
        console.log('✅ Question transcription received');
      } catch (error) {
        console.error('❌ Error stopping recording for question:', error);
      }
      
      // Restart recording for next question (including last question - we need to record it!)
      // We only skip restarting AFTER the last question ends, not before it starts
      pendingRestartTimerRef.current = setTimeout(async () => {
        try {
          if (audioRecorderRef.current?.startRecording && isRecording) {
            console.log(`🔄 Restarting recording for ${isMovingToLastQuestion ? 'last' : 'next'} question...`);
            await audioRecorderRef.current.startRecording();
            console.log(`✅ Recording restarted for ${isMovingToLastQuestion ? 'last' : 'next'} question`);
            recordingStartTimeRef.current = Date.now();
          }
        } catch (error) {
          console.error('❌ Error restarting recording:', error);
        }
        pendingRestartTimerRef.current = null;
      }, 500);
    }

    if (isLastQuestion) {
      const finishAfterResults = async () => {
        // CRITICAL: Clear any pending restart timer to prevent recording from continuing
        if (pendingRestartTimerRef.current) {
          console.log('🛑 Clearing pending recording restart timer (session ending)');
          clearTimeout(pendingRestartTimerRef.current);
          pendingRestartTimerRef.current = null;
        }
        
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

          // Stop recording and ensure it stays stopped
          if (audioRecorderRef.current) {
            try {
              await audioRecorderRef.current.stopRecording();
              console.log('✅ Final recording stopped');
            } catch (error) {
              console.error('❌ Error stopping final recording:', error);
            }
          }

          setShowOverlay(true);

          console.log('⏳ Waiting for final transcription...');
          await transcriptionPromise;
          setIsRecording(false);
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        // Start waiting for both results
        waitingForFinalResult.current = true;

        // Check if results already present
        setLastTranscriptionReceived(true);
        setLastFacialAnalysisReceived(true);
      };

      finishAfterResults();
    } else {
      // Moving to next question - stop and restart recording to avoid iOS audio session interruptions
      // iOS interrupts recording when videos end/start, causing recording to stop at ~8s
      // By stopping and restarting per question, we ensure each question is fully recorded
      console.log('➡️ Moving to next question - stopping current recording to prevent iOS interruption...');
      
      // Stop current recording and wait for transcription (non-blocking)
      if (isRecording && audioRecorderRef.current) {
        const stopAndRestart = async () => {
          try {
            // Stop current recording
            console.log('⏹️ Stopping recording for question transition...');
            await audioRecorderRef.current.stopRecording();
            
            // Wait briefly for transcription (but don't block UI)
            const quickTranscriptionPromise = new Promise(resolve => {
              const timeout = setTimeout(() => {
                resolve(null);
              }, 2000); // 2 second timeout - transcription will come later
              
              if (transcriptionPromiseRef.current) {
                transcriptionPromiseRef.current.resolve = (result) => {
                  clearTimeout(timeout);
                  resolve(result);
                };
              } else {
                transcriptionPromiseRef.current = { resolve: (result) => {
                  clearTimeout(timeout);
                  resolve(result);
                }};
              }
            });
            
            // Don't wait - just start the promise and continue
            quickTranscriptionPromise.then(() => {
              console.log('✅ Question transcription processing...');
            });
            
            // Restart recording for next question after a brief delay
            // Clear any existing timer first
            if (pendingRestartTimerRef.current) {
              clearTimeout(pendingRestartTimerRef.current);
            }
            
            pendingRestartTimerRef.current = setTimeout(async () => {
              try {
                // Check current state to see if we're moving to last question
                const currentStateCheck = avatarRef.current?.getState();
                const isMovingToLastQuestion = currentStateCheck?.idx + 1 === currentStateCheck?.totalLines - 1;
                
                // Restart recording for ALL questions including last one (we need to record it!)
                // We only skip restarting AFTER the last question ends, not before it starts
                if (audioRecorderRef.current?.startRecording && isRecording) {
                  console.log(`🔄 Restarting recording for ${isMovingToLastQuestion ? 'last' : 'next'} question...`);
                  await audioRecorderRef.current.startRecording();
                  console.log(`✅ Recording restarted for ${isMovingToLastQuestion ? 'last' : 'next'} question`);
                  recordingStartTimeRef.current = Date.now(); // Reset start time for next question
                } else {
                  console.log('⏸️ Skipping restart - recording stopped');
                }
              } catch (error) {
                console.error('❌ Error restarting recording:', error);
              }
              pendingRestartTimerRef.current = null;
            }, 500);
          } catch (error) {
            console.error('❌ Error in stopAndRestart:', error);
          }
        };
        
        // Don't await - let it run in background so we can proceed to next question
        stopAndRestart();
      }
      
      // Proceed to next question immediately (don't wait for recording restart)
      avatarRef.current?.next();
    }
  }, [isRecording]);

  const handleBackPress = useCallback(async () => {
    try {
      if (isRecording) {
        await handleStop({ waitForTranscription: false });
      } else if (cameraRef.current?.isRecording) {
        cameraRef.current.stopRecording();
      }
    } catch (error) {
      console.error('Error stopping session before navigating back:', error);
    } finally {
      navigation.navigate('LevelOptions', route.params);
    }
  }, [isRecording, handleStop, navigation, route.params]);

  const isLastQuestion = orbState?.idx !== undefined && 
    orbState?.totalLines !== undefined && 
    orbState.idx === orbState.totalLines - 1;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B5B95" />
        <Text style={styles.loadingText}>Loading scenario...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Progress */}

      {showOverlay && (
        <View style={styles.overlay}>
          <View style={styles.blurFallback} />
          <ActivityIndicator size="large" color="#6B5B95" />
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButtonContainer}
        >
          <BackIcon width={20} height={20} style={styles.backButton} />
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${
                    orbState?.totalLines > 0 && orbState?.idx !== undefined
                      ? ((orbState.idx + 1) / orbState.totalLines) * 100
                      : 0
                  }%`,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Avatar in Center */}
      <View style={styles.middleSection}>
        <AvatarGenerator
          ref={avatarRef}
          onStateChange={handleStateChange}
          onInitialized={handleAvatarInitialized}
          imgURL={
            'https://tiapdsojkbqjucmjmjri.supabase.co/storage/v1/object/public/images/avatar-videos/690d2cffd0cad/6901a891dd02f9e665ba3de8/2/Hitina_Square.png'
          }
          lines={
            userQuestions?.map(q => q.text) ||
            (scenarioData?.level2?.questions || []).map(q => q.text)
          }
          videoUrls={
            userQuestions
              ?.map(q => q.videoUrl)
              .filter(url => url && url.startsWith('http')) || null
          }
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
      <View
        style={isRecording ? styles.waveformVisible : styles.waveformHidden}
      >
        <AudioWaveform ref={waveformRef} />
      </View>

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
          disabled={(!avatarReady && !isRecording) || loading || !userQuestions || userQuestions.length === 0}
        >
          <Text style={styles.buttonEmoji}>
            {isRecording ? (
              <DeleteIcon height={24} width={24} />
            ) : (
              <MicIcon height={24} width={24} />
            )}
          </Text>
        </TouchableOpacity>

        {/* Next/Done Button */}
        {isRecording && (
          <TouchableOpacity
            onPress={handleNext}
            disabled={orbState?.speaking || orbState?.loading}
            style={[
              styles.nextButton,
              (orbState?.speaking || orbState?.loading) && styles.buttonDisabled,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B5B95',
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  blurFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
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
    zIndex: 10, // Ensure camera is above video but video is still visible
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
  progressBarContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  progressBarTrack: {
    width: '95%',
    height: 14,
    borderRadius: 9,
    backgroundColor: '#e2e2e2',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#463855',
    borderRadius: 9,
  },
});

export default Level2Screen;
