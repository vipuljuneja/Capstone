import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import CameraDetector from '../../Components/Facial/CameraDetector';
import VoiceORB from '../../Components/Avatar/VoiceORB';
import AvatarGenerate from '../../Components/Avatar/AvatarGenerate';
import AudioRecorder from '../../Components/Audio/AudioRecorder';

import {
  Waveform,
  IWaveformRef,
} from '@simform_solutions/react-native-audio-waveform';
import { PermissionsAndroid, Platform } from 'react-native';
import AudioWaveform from '../../Components/Audio/AudioWaveform';

const { width, height } = Dimensions.get('window');

const Levels = () => {
  const [pan] = useState(new Animated.ValueXY({ x: 20, y: 20 }));
  const [levelCount, setLevelCount] = useState(3);
  const navigation = useNavigation();

  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const [recorderState, setRecorderState] = useState(false);

  const [transcriptionResults, setTranscriptionResults] = useState([]);

  const [facialAnalysisResults, setFacialAnalysisResults] = useState([]);

  const transcriptionResultsRef = useRef([]);

  const facialAnalysisResultsRef = useRef([]);

  const transcriptionPromiseRef = useRef(null);

  const cameraRef = useRef(null);
  const voiceOrbRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const waveformRef = useRef(null);

  const [orbState, setOrbState] = useState({
    speaking: false,
    loading: false,
    idx: 0,
    totalLines: 5,
  });

  const handleStateChange = useCallback(newState => {
    setOrbState(newState);
  }, []);

  const handleTranscriptionComplete = useCallback(report => {
    console.log('📥 Received transcription result in Levels:', report);

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

  const handleFacialAnalysisComplete = useCallback(insights => {
    console.log('📥 Received facial analysis result in Levels:', insights);

    setFacialAnalysisResults(prevResults => {
      const newResults = [...prevResults, insights];
      facialAnalysisResultsRef.current = newResults;
      return newResults;
    });
  }, []);

  const handlePrev = useCallback(() => {
    voiceOrbRef.current?.prev();
  }, []);

  const handleStop = useCallback(async () => {
    console.log('🛑 Stopping recording...');

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

    if (voiceOrbRef.current && voiceOrbRef.current.stop) {
      voiceOrbRef.current.stop();
    }

    const transcriptionPromise = new Promise((resolve, reject) => {
      transcriptionPromiseRef.current = { resolve, reject };

      setTimeout(() => {
        if (transcriptionPromiseRef.current) {
          console.warn('⚠️  Transcription timeout, proceeding anyway');
          transcriptionPromiseRef.current.resolve(null);
          transcriptionPromiseRef.current = null;
        }
      }, 10000);
    });

    if (audioRecorderRef.current) {
      audioRecorderRef.current.stopRecording();
    }

    console.log('⏳ Waiting for transcription to complete...');

    await transcriptionPromise;

    console.log('✅ Transcription completed!');

    setTimeout(() => {
      setIsRecording(false);
    }, 100);
  }, []);

  const handleNext = useCallback(() => {
    const currentState = voiceOrbRef.current?.getState();

    if (!currentState) {
      console.warn('VoiceORB state not available');
      return;
    }

    console.log('Current state:', currentState);

    if (currentState.idx === currentState.totalLines - 1) {
      const navigateToResults = async () => {
        console.log('🎯 Last question reached, preparing to navigate...');

        if (isRecording) {
          await handleStop();
        }

        await new Promise(resolve => setTimeout(resolve, 300));

        const transcriptionToPass = transcriptionResultsRef.current;
        const facialAnalysisToPass = facialAnalysisResultsRef.current;

        console.log('📤 Navigating to Results with data:');
        console.log('   Transcription results:', transcriptionToPass.length);
        console.log('   Facial analysis results:', facialAnalysisToPass.length);

        if (navigation && typeof navigation.navigate === 'function') {
          try {
            navigation.navigate('Results', {
              totalQuestions: currentState.totalLines,
              transcriptionResults: transcriptionToPass,
              facialAnalysisResults: facialAnalysisToPass,
            });
          } catch (error) {
            console.error('Navigation error:', error);
          }
        } else {
          console.error('Navigation not available');
        }
      };

      navigateToResults();
    } else {
      voiceOrbRef.current?.next();
    }
  }, [navigation, isRecording, handleStop]);

  const handleRepeat = useCallback(() => {
    voiceOrbRef.current?.replay();
  }, []);

  const requestAudioPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Audio Recording Permission',
            message: 'App needs access to your microphone',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

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

  const handleStart = async () => {
    const hasPermission = await requestAudioPermission();
    if (!hasPermission) {
      console.log('Audio permission denied');
      return;
    }

    setIsRecording(true);

    setTimeout(async () => {
      if (waveformRef.current) {
        await waveformRef.current.start();
      }

      if (cameraRef.current) {
        cameraRef.current.startRecording();
      }

      if (voiceOrbRef.current && voiceOrbRef.current.start) {
        voiceOrbRef.current.start();
      }

      if (audioRecorderRef.current) {
        audioRecorderRef.current.startRecording();
      }
    }, 200);
  };

  const isLastQuestion = orbState.idx === orbState.totalLines - 1;

  useEffect(() => {
    console.log(
      '🔄 Transcription results updated:',
      transcriptionResults.length,
    );
    console.log(
      '🔄 Facial analysis results updated:',
      facialAnalysisResults.length,
    );
  }, [transcriptionResults, facialAnalysisResults]);

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.middleSection}>
        <View style={styles.avatarPlaceholder}>
          <VoiceORB ref={voiceOrbRef} onStateChange={handleStateChange} />
        </View>

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

      <View
        style={isRecording ? styles.waveformVisible : styles.waveformHidden}
      >
        <AudioWaveform ref={waveformRef} />
      </View>

      <View
        style={
          !isRecording ? styles.bottomSectionBefore : styles.bottomSectionAfter
        }
      >
        <AudioRecorder
          ref={audioRecorderRef}
          onTranscriptionComplete={handleTranscriptionComplete}
        />

        <TouchableOpacity
          onPress={handlePrev}
          disabled={orbState.speaking || orbState.loading || orbState.idx === 0}
          style={
            !isRecording
              ? styles.hidden
              : [
                  styles.btn,
                  (orbState.speaking ||
                    orbState.loading ||
                    orbState.idx === 0) &&
                    styles.btnDisabled,
                ]
          }
        >
          <Icon name="arrow-left-circle" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={isRecording ? styles.stopButton : styles.recordButton}
          onPress={isRecording ? handleStop : handleStart}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? (
              <Icon name="stop-circle-outline" size={30} color="white" />
            ) : (
              <Icon name="microphone" size={30} color="white" />
            )}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNext}
          disabled={orbState.speaking || orbState.loading}
          style={
            !isRecording
              ? styles.hidden
              : [
                  styles.btn,
                  (orbState.speaking || orbState.loading) && styles.btnDisabled,
                ]
          }
        >
          <Icon
            name={isLastQuestion ? 'check-circle' : 'arrow-right-circle'}
            size={30}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
    gap: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  // NEW STYLES FOR FINISH BUTTON
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginLeft: 'auto',
  },
  finishButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    width: '30%',
    height: '100%',
    backgroundColor: '#333',
    borderRadius: 4,
  },
  middleSection: {
    flex: 1,
    backgroundColor: '#c0c0c0',
    position: 'relative',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  avatarText: {
    fontSize: 18,
    color: '#999',
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
  bottomSectionBefore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'white',
    gap: 20,
  },
  bottomSectionAfter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 30,
    backgroundColor: 'white',
    gap: 20,
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  recordingButton: {
    backgroundColor: '#ff4444',
  },
  recordButtonText: {
    fontSize: 32,
    color: 'white',
  },
  waveform: {
    flex: 1,
    height: 60,
    backgroundColor: '#666',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 20,
  },
  waveBar: {
    width: 3,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  uploadButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 24,
    color: 'white',
  },
  stopButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButtonText: {
    fontSize: 24,
    color: 'white',
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 30,
    backgroundColor: 'white',
    gap: 20,
  },
  waveformContainer: {
    flex: 1,
    height: 60,
    backgroundColor: 'white',
    borderRadius: 30,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  liveWaveform: {
    width: '100%',
    height: 60,
  },
  liveWaveformView: {
    flex: 1,
    borderWidth: '2px',
    borderRadius: '4px',
    paddingHorizontal: '8px',
    backgroundColor: 'white',
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
  },
  row: {
    backgroundColor: 'white',
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',
    bottom: 0,
    right: 0,
    left: 0,
    width: '100%',
    paddingHorizontal: '10%',
  },
  btn: {
    paddingHorizontal: 16,
    height: 70,
    width: 70,
    borderRadius: 35,
    backgroundColor: '#3a7afe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '600' },
  hidden: {
    display: 'none',
  },
});

export default Levels;