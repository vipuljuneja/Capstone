import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import VoiceOrb from '../../Components/Avatar/VoiceORB';
import AudioRecorder from '../../Components/Audio/AudioRecorder';
import AudioWaveform from '../../Components/Audio/AudioWaveform';
import scenarioService from '../../services/scenarioService';

import BackIcon from '../../../assets/icons/back.svg';
import MicIcon from '../../../assets/icons/mic-white.svg';
import DeleteIcon from '../../../assets/icons/delete-filled.svg';

import { useNavigation, useRoute } from '@react-navigation/native';

const Level1Screen = () => {
  const navigation = useNavigation();
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptionResults, setTranscriptionResults] = useState([]);
  const [scenarioData, setScenarioData] = useState(null);
  const [loading, setLoading] = useState(true);

  const voiceOrbRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const waveformRef = useRef(null);
  const transcriptionResultsRef = useRef([]);
  const transcriptionPromiseRef = useRef(null);

  const route = useRoute();
  const { scenarioTitle, scenarioId, scenarioEmoji, scenarioDescription } =
    route.params || {};

  const [orbState, setOrbState] = useState({
    speaking: false,
    loading: false,
    idx: 0,
    totalLines: 5,
  });

  // Load scenario data on component mount
  useEffect(() => {
    const loadScenarioData = async () => {
      try {
        setLoading(true);
        if (scenarioId) {
          const scenario = await scenarioService.getScenarioById(scenarioId);
          setScenarioData(scenario);

          // Update orb state with actual question count
          const questionCount = scenario?.level1?.questions?.length || 5;
          setOrbState(prev => ({
            ...prev,
            totalLines: questionCount,
          }));
        }
      } catch (error) {
        console.error('Failed to load scenario data:', error);
        // Keep default state if loading fails
      } finally {
        setLoading(false);
      }
    };

    loadScenarioData();
  }, [scenarioId]);

  const handleStateChange = useCallback(newState => {
    console.log('📥 Level1 received state:', newState);
    setOrbState(newState);
  }, []);

  const resetLevel = useCallback(() => {
    console.log('🔄 Resetting level to start');

    // Reset local state
    setIsRecording(false);
    setTranscriptionResults([]);
    setOrbState({
      speaking: false,
      loading: false,
      idx: 0,
      totalLines: scenarioData?.level1?.questions?.length || 5,
    });

    transcriptionResultsRef.current = [];

    // Reset VoiceOrb
    if (voiceOrbRef.current?.reset) {
      voiceOrbRef.current.reset();
    }

    // Reset AudioRecorder
    if (audioRecorderRef.current?.reset) {
      audioRecorderRef.current.reset();
    }
  }, [scenarioData]);

  const handleTranscriptionComplete = useCallback(report => {
    console.log('📥 Transcription result:', report);

    setTranscriptionResults(prevResults => {
      const newResults = [...prevResults, report];
      transcriptionResultsRef.current = newResults;
      return newResults;
    });

    if (transcriptionPromiseRef.current) {
      transcriptionPromiseRef.current.resolve(report);
      transcriptionPromiseRef.current = null;
    }
  }, []);

  const handleStart = async () => {
    console.log('🎤 Starting recording...');
    setIsRecording(true);

    setTimeout(async () => {
      if (waveformRef.current) {
        await waveformRef.current.start();
      }

      if (voiceOrbRef.current?.start) {
        voiceOrbRef.current.start();
      }

      if (audioRecorderRef.current) {
        audioRecorderRef.current.startRecording();
      }
    }, 200);
  };

  const handleStop = useCallback(
    async (options = {}) => {
      const { waitForTranscription = true } = options;

      console.log('🛑 Stopping and resetting...');

      try {
        if (waveformRef.current) {
          await waveformRef.current.stop();
        }
      } catch (error) {
        console.error('Waveform stop error:', error);
      }

      if (voiceOrbRef.current?.stop) {
        voiceOrbRef.current.stop();
      }

      let transcriptionPromise;

      if (waitForTranscription) {
        transcriptionPromise = new Promise(resolve => {
          transcriptionPromiseRef.current = { resolve };

          // Timeout after 30 seconds
          setTimeout(() => {
            if (transcriptionPromiseRef.current) {
              transcriptionPromiseRef.current.resolve(null);
              transcriptionPromiseRef.current = null;
            }
          }, 30000);
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

      // Reset after stopping
      resetLevel();
    },
    [resetLevel],
  );

  const handleNext = useCallback(() => {
    const currentState = voiceOrbRef.current?.getState();

    if (!currentState) {
      console.warn('⚠️ VoiceOrb state not available');
      return;
    }

    console.log('➡️ Current state:', currentState);

    if (currentState.idx === currentState.totalLines - 1) {
      // Last question - wait for transcription then navigate
      const navigateToResults = async () => {
        console.log('✅ Last question completed, waiting for transcription...');

        if (isRecording) {
          // Stop recording
          try {
            if (waveformRef.current) {
              await waveformRef.current.stop();
            }
          } catch (error) {
            console.error('Waveform stop error:', error);
          }

          if (voiceOrbRef.current?.stop) {
            voiceOrbRef.current.stop();
          }

          // Wait for transcription to complete
          const transcriptionPromise = new Promise(resolve => {
            transcriptionPromiseRef.current = { resolve };

            // Timeout after 30 seconds
            setTimeout(() => {
              if (transcriptionPromiseRef.current) {
                console.warn('⚠️ Transcription timeout, navigating anyway');
                transcriptionPromiseRef.current.resolve(null);
                transcriptionPromiseRef.current = null;
              }
            }, 30000);
          });

          if (audioRecorderRef.current) {
            audioRecorderRef.current.stopRecording();
          }

          console.log('⏳ Waiting for final transcription...');
          await transcriptionPromise;
          console.log('✅ Transcription received!');

          setIsRecording(false);
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        let finalResults = transcriptionResultsRef.current;
        if (!finalResults || finalResults.length === 0) {
          // If we timed out just before the transcript landed, give it a brief grace window
          await new Promise(resolve => setTimeout(resolve, 1000));
          finalResults = transcriptionResultsRef.current;
        }
        console.log('📤 Navigating with results:', finalResults);

        const { scenarioEmoji } = route.params || {};

        navigation.navigate('Level1ResultScreen', {
          totalQuestions: currentState.totalLines,
          transcriptionResults: finalResults,
          scenarioTitle: scenarioTitle || 'Ordering Coffee',
          scenarioEmoji: scenarioEmoji || '☕',
          scenarioId: scenarioId,
          ...route.params,
        });
      };

      navigateToResults();
    } else {
      console.log('⏭️ Moving to next question');
      voiceOrbRef.current?.next();
    }
  }, [navigation, isRecording]);

  const isLastQuestion = orbState.idx === orbState.totalLines - 1;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '0%' }]} />
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading scenario...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Progress */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={async () => {
            try {
              if (isRecording) {
                await handleStop({ waitForTranscription: false });
              }
            } catch (error) {
              console.error(
                'Error stopping Level 1 session before navigating back:',
                error,
              );
            } finally {
              navigation.navigate('LevelOptions', {
                scenarioTitle,
                scenarioEmoji,
                scenarioId,
                scenarioDescription,
              });
            }
          }}
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
                  width: `${((orbState.idx + 1) / orbState.totalLines) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Voice Orb in Center */}
      <View style={styles.middleSection}>
        <VoiceOrb
          ref={voiceOrbRef}
          onStateChange={handleStateChange}
          lines={(scenarioData?.level1?.questions || []).map(q => q.text)}
        />
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
          onPress={isRecording ? resetLevel : handleStart}
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
  // Header with back button and progress bar
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  backButtonContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButton: {
    fontSize: 20,
    color: '#222',
    fontWeight: '400',
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
  // Main content
  middleSection: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Audio waveform display
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
  // Controls at the bottom
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});

export default Level1Screen;
