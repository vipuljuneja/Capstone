import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';

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

      // Add this: Start AudioRecorder
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

    // Add this: Stop AudioRecorder
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stopRecording();
    }

    // Delay state change slightly
    setTimeout(() => {
      setIsRecording(false);
    }, 100);
  };

  const handleUpload = () => {
    if (audioPath) {
      console.log('Uploading audio file:', audioPath);
      // Add your upload logic here
      // You can access the file at the audioPath
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Section */}
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        {/* <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View> */}
      </View>

      {/* Middle Section For Avatar */}
      <View style={styles.middleSection}>
        <View style={styles.avatarPlaceholder}>
          <VoiceORB ref={voiceOrbRef} />
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

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <AudioRecorder ref={audioRecorderRef} />
        <TouchableOpacity
          style={isRecording ? styles.stopButton : styles.recordButton}
          onPress={isRecording ? handleStop : handleStart}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? '⬛' : '🎤'}
          </Text>
        </TouchableOpacity>

        <View
          style={isRecording ? styles.waveformVisible : styles.waveformHidden}
        >
          <AudioWaveform ref={waveformRef} />
        </View>

        {isRecording && (
          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
            <Text style={styles.uploadButtonText}>↑</Text>
          </TouchableOpacity>
        )}
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
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#666',
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
  },
  waveformVisible: {
    flex: 1,
  },
  waveformHidden: {
    width: 0,
    height: 0,
    overflow: 'hidden',
    opacity: 0,
  },
  waveformVisible: {
    flex: 1,
    height: 60,
  },
  waveformHidden: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
    left: -9999,
  },
});

export default Levels;
