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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import CameraDetector from '../../Components/Facial/CameraDetector';
import VoiceORB from '../../Components/Avatar/VoiceORB';
import AvatarGenerate from '../../Components/Avatar/AvatarGenerate';
import AudioRecorder from '../../Components/Audio/AudioRecorder';

//Waveform
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

  //For Components
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const [recorderState, setRecorderState] = useState(false);

  //Component Refs
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

  // Initialize session when component mounts
  useEffect(() => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.startSession();
      console.log('📝 Session initialized');
    }
  }, []);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (voiceOrbRef.current) {
  //       setOrbState(voiceOrbRef.current.getState());
  //     }
  //   }, 100);
  //   return () => clearInterval(interval);
  // }, []);

  const handleStateChange = useCallback(newState => {
    setOrbState(newState);
  }, []);

  const handlePrev = useCallback(() => {
    voiceOrbRef.current?.prev();
  }, []);

  const handleNext = useCallback(() => {
    voiceOrbRef.current?.next();
  }, []);

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

    // Wait for render
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

      // Start AudioRecorder
      if (audioRecorderRef.current) {
        audioRecorderRef.current.startRecording();
      }
    }, 200);
  };

  const handleStop = async () => {
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

    // Stop AudioRecorder
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stopRecording();
    }

    // Delay state change slightly
    setTimeout(() => {
      setIsRecording(false);
    }, 100);
  };

  // NEW FUNCTION - Finish session and get all data

  // Sukhbir this is the function you need to call when user clicks "Finish" or you can you use it when the session ends.
  const handleFinishSession = () => {
    if (audioRecorderRef.current) {
      const allData = audioRecorderRef.current.endSession();
      console.log('✅ SESSION FINISHED - All Data:', allData);
      
      // Here you can:
      // - Send to your backend API
      // - Save to local storage
      // - Navigate to results screen
      // - etc.
    }
  };

  const handleUpload = () => {
    if (audioPath) {
      console.log('Uploading audio file:', audioPath);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Section */}
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        {/* FINISH SESSION BUTTON */}
        <TouchableOpacity 
          style={styles.finishButton}
          onPress={handleFinishSession}
        >
          <Icon name="check-circle" size={24} color="#4CAF50" />
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
        {/* <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View> */}
      </View>

      {/* Middle Section For Avatar */}
      <View style={styles.middleSection}>
        <View style={styles.avatarPlaceholder}>
          <VoiceORB ref={voiceOrbRef} onStateChange={handleStateChange} />
          {/* <AvatarGenerate /> */}
          {/* <AudioRecorder ref={audioRecorderRef} onAudioLevel={setAudioLevel} /> */}
        </View>

        {/* <View style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}>
          <AudioRecorder ref={audioRecorderRef} onAudioLevel={setAudioLevel} />
        </View> */}

        {/* Draggable Camera Component */}
        <Animated.View
          style={[
            styles.cameraComponent,
            {
              transform: [{ translateX: pan.x }, { translateY: pan.y }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <CameraDetector ref={cameraRef} />
        </Animated.View>
      </View>

      {/* Buttons Section */}

      <View
        style={isRecording ? styles.waveformVisible : styles.waveformHidden}
      >
        <AudioWaveform ref={waveformRef} />
      </View>

      {/* Bottom Section */}
      <View
        style={
          !isRecording ? styles.bottomSectionBefore : styles.bottomSectionAfter
        }
      >
        <AudioRecorder ref={audioRecorderRef} />
        <TouchableOpacity
          onPress={handlePrev}
          disabled={orbState.speaking || orbState.loading || orbState.idx === 0}
          style={
            !isRecording
              ? 'none'
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
          disabled={
            orbState.speaking ||
            orbState.loading ||
            orbState.idx === orbState.totalLines - 1
          }
          style={
            !isRecording
              ? 'none'
              : [
                  styles.btn,
                  (orbState.speaking ||
                    orbState.loading ||
                    orbState.idx === orbState.totalLines - 1) &&
                    styles.btnDisabled,
                ]
          }
        >
          <Icon name="arrow-right-circle" size={30} color="white" />
        </TouchableOpacity>

        {/* {isRecording && (
          <TouchableOpacity style={styles.uploadButton} onPress={handleRepeat}>
            <Icon name="rotate-right" size={30} color="white" />
          </TouchableOpacity>
        )} */}
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#ff4444',
  },
  recordButtonText: {
    fontSize: 24,
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
    width: 70,
    height: 70,
    borderRadius: 35,
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
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  recordButtonText: {
    fontSize: 32,
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
    // gap: 12,
    display: 'flex',
    justifyContent: 'space-between',
    bottom: 0,
    right: 0,
    left: 0,
    width: '100%',
    paddingHorizontal: '10%',
    // position: 'absolute',
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
});

export default Levels;