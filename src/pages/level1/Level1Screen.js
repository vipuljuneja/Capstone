import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import VoiceOrb from '../../Components/Avatar/VoiceORB';
import AudioRecorder from '../../Components/Audio/AudioRecorder';
import AudioWaveform from '../../Components/Audio/AudioWaveform';

import { useNavigation, useRoute } from '@react-navigation/native';

const Level1Screen = () => {
  const navigation = useNavigation();
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptionResults, setTranscriptionResults] = useState([]);

  const voiceOrbRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const waveformRef = useRef(null);
  const transcriptionResultsRef = useRef([]);
  const transcriptionPromiseRef = useRef(null);

  const route = useRoute();

  const [orbState, setOrbState] = useState({
    speaking: false,
    loading: false,
    idx: 0,
    totalLines: 5,
  });

  const handleStateChange = useCallback(newState => {
    console.log('📥 Level1 received state:', newState);
    setOrbState(newState);
  }, []);

  const resetLevel = useCallback(() => {
    console.log('🔄 Resetting level to start');

    // Reset all state
    setIsRecording(false);
    setTranscriptionResults([]);
    transcriptionResultsRef.current = [];

    // Reset voice orb using the new reset method
    if (voiceOrbRef.current?.reset) {
      voiceOrbRef.current.reset();
    }

    // Reset local state
    setOrbState(prev => ({
      ...prev,
      idx: 0,
      speaking: false,
      loading: false,
    }));
  }, []);

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

  const handleStop = useCallback(async () => {
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

    const transcriptionPromise = new Promise(resolve => {
      transcriptionPromiseRef.current = { resolve };

      setTimeout(() => {
        if (transcriptionPromiseRef.current) {
          transcriptionPromiseRef.current.resolve(null);
          transcriptionPromiseRef.current = null;
        }
      }, 5000); // Reduced timeout
    });

    if (audioRecorderRef.current) {
      audioRecorderRef.current.stopRecording();
    }

    await transcriptionPromise;

    // Reset after stopping
    resetLevel();
  }, [resetLevel]);

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

            // Timeout after 15 seconds
            setTimeout(() => {
              if (transcriptionPromiseRef.current) {
                console.warn('⚠️ Transcription timeout, navigating anyway');
                transcriptionPromiseRef.current.resolve(null);
                transcriptionPromiseRef.current = null;
              }
            }, 15000);
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

        const finalResults = transcriptionResultsRef.current;
        console.log('📤 Navigating with results:', finalResults);

        const { scenarioTitle, scenarioEmoji } = route.params || {};

        navigation.navigate('Level1ResultScreen', {
          totalQuestions: currentState.totalLines,
          transcriptionResults: finalResults,
          scenarioTitle: scenarioTitle || 'Ordering Coffee',
          scenarioEmoji: scenarioEmoji || '☕',
        });
      };

      navigateToResults();
    } else {
      console.log('⏭️ Moving to next question');
      voiceOrbRef.current?.next();
    }
  }, [navigation, isRecording]);

  const isLastQuestion = orbState.idx === orbState.totalLines - 1;

  return (
    <View style={styles.container}>
      {/* Header with Progress */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((orbState.idx + 1) / orbState.totalLines) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Voice Orb in Center */}
      <View style={styles.middleSection}>
        <VoiceOrb ref={voiceOrbRef} onStateChange={handleStateChange} />
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
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
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

export default Level1Screen;
