import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import VoiceOrb from '../../Components/Avatar/VoiceORB';
import AudioRecorder from '../../Components/Audio/AudioRecorder';
import AudioWaveform from '../../Components/Audio/AudioWaveform';
import scenarioService from '../../services/scenarioService';

import BackIcon from '../../../assets/icons/back.svg';
import MicIcon from '../../../assets/icons/mic-white.svg';
import DeleteIcon from '../../../assets/icons/delete-white.svg';

import { useNavigation, useRoute } from '@react-navigation/native';
import LevelResultsLoadingScreen from '../components/LevelResultsLoadingScreen';

const Level1Screen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { scenarioTitle, scenarioId, scenarioEmoji, scenarioDescription } =
    route.params || {};

  const [isRecording, setIsRecording] = useState(false);
  const [scenarioData, setScenarioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const [hasStartedRecording, setHasStartedRecording] = useState(false);
  const [orbState, setOrbState] = useState({
    speaking: false,
    loading: false,
    idx: 0,
    totalLines: 5,
  });

  const voiceOrbRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const waveformRef = useRef(null);
  const isFinishingRef = useRef(false);

  useEffect(() => {
    const loadScenarioData = async () => {
      try {
        setLoading(true);
        if (scenarioId) {
          const scenario = await scenarioService.getScenarioById(scenarioId);
          setScenarioData(scenario);
          const questionCount = scenario?.level1?.questions?.length || 5;
          setOrbState(prev => ({
            ...prev,
            totalLines: questionCount,
          }));
        }
      } catch (error) {
        console.error('Failed to load scenario data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScenarioData();
  }, [scenarioId]);

  const stopWaveform = async () => {
    try {
      if (waveformRef.current) {
        await waveformRef.current.stop();
      }
    } catch (error) {
      console.error('Error stopping waveform:', error);
    }
  };

  const resetAudioRecorder = () => {
    try {
      if (audioRecorderRef.current?.reset) {
        audioRecorderRef.current.reset();
      }
    } catch (error) {
      console.error('Error resetting AudioRecorder:', error);
    }
  };

  const stopAndResetAudioRecorder = () => {
    try {
      if (audioRecorderRef.current) {
        if (audioRecorderRef.current.isRecording) {
          audioRecorderRef.current.stop().catch(() => {});
        }
        if (audioRecorderRef.current.reset) {
          audioRecorderRef.current.reset();
        }
      }
    } catch (error) {
      console.error('Error stopping/resetting AudioRecorder:', error);
    }
  };

  const stopAndResetVoiceOrb = () => {
    if (voiceOrbRef.current) {
      if (voiceOrbRef.current.stop) {
        voiceOrbRef.current.stop();
      }
      if (voiceOrbRef.current.reset) {
        voiceOrbRef.current.reset();
      }
    }
  };

  const resetLevel = useCallback(() => {
    setIsRecording(false);
    setHasStartedRecording(false);
    setOrbState({
      speaking: false,
      loading: false,
      idx: 0,
      totalLines: scenarioData?.level1?.questions?.length || 5,
    });
    stopWaveform();
    stopAndResetAudioRecorder();
    stopAndResetVoiceOrb();
  }, [scenarioData]);

  const handleStateChange = useCallback(newState => {
    setOrbState(newState);
  }, []);

  const handleStart = async () => {
    setIsRecording(true);
    setHasStartedRecording(true);

    setTimeout(async () => {
      if (waveformRef.current) {
        await waveformRef.current.start();
      }
      if (voiceOrbRef.current?.start) {
        voiceOrbRef.current.start();
      }
      if (audioRecorderRef.current) {
        audioRecorderRef.current.start();
      }
    }, 200);
  };

  const handleDelete = async () => {
    await stopWaveform();
    stopAndResetAudioRecorder();
    resetLevel();
    stopAndResetVoiceOrb();
  };

  const handleBack = async () => {
    try {
      await stopWaveform();
      stopAndResetAudioRecorder();
      stopAndResetVoiceOrb();
    } catch (error) {
      console.error('Error stopping components:', error);
    } finally {
      navigation.navigate('LevelOptions', {
        scenarioTitle,
        scenarioEmoji,
        scenarioId,
        scenarioDescription,
      });
    }
  };

  const handleNext = useCallback(() => {
    const currentState = voiceOrbRef.current?.getState();

    if (!currentState) {
      return;
    }

    const isLastQuestion = currentState.idx === currentState.totalLines - 1;

    if (isLastQuestion) {
      const handleLastQuestion = async () => {
        isFinishingRef.current = true;
        setShowOverlay(true);

        try {
          try {
            if (waveformRef.current) {
              await waveformRef.current.stop();
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          } catch (error) {
            console.error('Error stopping waveform:', error);
          }

          let result = null;
          try {
            if (audioRecorderRef.current?.finish) {
              result = await audioRecorderRef.current.finish();
              console.log('Final transcript:', JSON.stringify(result, null, 2));
            }
          } catch (error) {
            console.error('Error calling finish:', error);
          }

          await new Promise(resolve => setTimeout(resolve, 500));

          try {
            resetAudioRecorder();
          } catch (error) {
            console.error('Error resetting AudioRecorder:', error);
          }

          try {
            stopAndResetVoiceOrb();
          } catch (error) {
            console.error('Error stopping/resetting VoiceOrb:', error);
          }

          await new Promise(resolve => setTimeout(resolve, 300));

          isFinishingRef.current = false;

          // Prepare transcript results for navigation
          let finalResults = [];
          if (result && !result.error) {
            if (
              Array.isArray(result.sessionData) &&
              result.sessionData.length > 0
            ) {
              finalResults = result.sessionData;
            } else {
              // Extract report from result if sessionData is not available
              const report = {
                transcript: result.transcript,
                wpm: result.wpm,
                totalWords: result.totalWords,
                fillerWordCount: result.fillerWordCount,
                fillerWords: result.fillerWords,
                pauseCount: result.pauseCount,
                pauses: result.pauses,
                duration: result.duration,
                timestamp: result.timestamp,
              };
              finalResults = [report];
            }
          }

          // Navigate to results screen
          try {
            navigation.navigate('Level1ResultScreen', {
              totalQuestions: currentState.totalLines,
              transcriptionResults: finalResults,
              scenarioTitle: scenarioTitle || 'Ordering Coffee',
              scenarioEmoji: scenarioEmoji || '☕',
              scenarioId: scenarioId,
              ...route.params,
            });
          } catch (error) {
            console.error('Navigation error:', error);
          }

          // Hide overlay and reset state after navigation
          setShowOverlay(false);
          setTimeout(() => {
            if (!isFinishingRef.current) {
              setIsRecording(false);
            }
          }, 100);
        } catch (error) {
          console.error('Error handling last question:', error);
          try {
            stopAndResetAudioRecorder();
            stopAndResetVoiceOrb();
            isFinishingRef.current = false;
            setShowOverlay(false);
            requestAnimationFrame(() => {
              setTimeout(() => {
                setIsRecording(false);
              }, 100);
            });
          } catch (resetError) {
            console.error('Error during cleanup:', resetError);
            isFinishingRef.current = false;
            setShowOverlay(false);
            requestAnimationFrame(() => {
              setTimeout(() => {
                setIsRecording(false);
              }, 200);
            });
          }
        }
      };

      handleLastQuestion();
    } else {
      voiceOrbRef.current?.next();
    }
  }, [navigation, scenarioTitle, scenarioEmoji, scenarioId, route.params]);

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

  const isLastQuestion = orbState.idx === orbState.totalLines - 1;

  return (
    <View style={styles.container}>
      <LevelResultsLoadingScreen visible={showOverlay} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
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

      <View style={styles.middleSection}>
        <View style={styles.voiceOrbWrapper}>
          <VoiceOrb
            ref={voiceOrbRef}
            onStateChange={handleStateChange}
            lines={(scenarioData?.level1?.questions || []).map(q => q.text)}
          />
        </View>
        {hasStartedRecording && isRecording && (
          <View style={styles.tooltipContainer} pointerEvents="none">
            <View style={styles.tooltipContent}>
              <Text style={styles.tooltipText}>Tap on PIP to listen again</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.bottomSection}>
        <AudioRecorder ref={audioRecorderRef} />

        <View style={[styles.recordingControls, !isRecording && styles.hidden]}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={!isRecording}
          >
            <DeleteIcon height={24} width={24} style={{ color: '#FFFFFF' }} />
          </TouchableOpacity>

          <View style={styles.waveformContainer}>
            <AudioWaveform ref={waveformRef} />
          </View>

          <TouchableOpacity
            onPress={handleNext}
            disabled={!isRecording || orbState.speaking || orbState.loading}
            style={[
              styles.nextButton,
              (orbState.speaking || orbState.loading || !isRecording) &&
                styles.buttonDisabled,
            ]}
          >
            <Text style={styles.nextButtonText}>
              {isLastQuestion ? '✓' : '→'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.micButtonContainer}>
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.hidden]}
            onPress={handleStart}
            disabled={isRecording}
          >
            <MicIcon height={24} width={24} />
          </TouchableOpacity>
        </View>
        {!isRecording && !hasStartedRecording && (
          <View style={styles.micTooltipContainer} pointerEvents="none">
            <View style={styles.tooltipContent}>
              <Text style={styles.tooltipText}>Tap here to speak</Text>
            </View>
          </View>
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
  middleSection: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceOrbWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonContainer: {
    position: 'relative',
  },
  micTooltipContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
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
    justifyContent: 'space-between',
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
  waveformContainer: {
    flex: 1,
    height: 60,
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
  buttonDisabled: {
    opacity: 0.5,
  },
  hidden: {
    opacity: 0,
    pointerEvents: 'none',
    position: 'absolute',
    width: 0,
    height: 0,
    overflow: 'hidden',
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
  tooltipContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tooltipText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Level1Screen;
