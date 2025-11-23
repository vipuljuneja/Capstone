import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

// Components
import LevelHeader from '../components/LevelHeader';
import DraggableCamera from '../components/DraggableCamera';
import AudioRecorder from '../../Components/Audio/AudioRecorder';
import AudioWaveform from '../../Components/Audio/AudioWaveform';

const Level2Screen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const cameraRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const audioWaveformRef = useRef(null);

  const handleFacialAnalysisComplete = useCallback(result => {
    console.log('📸 Facial analysis complete:', result);
  }, []);

  const handleTranscriptionComplete = useCallback(result => {
    console.log('🎤 Transcription complete:', result);
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

  // Memoize route params to prevent unnecessary re-renders
  const routeParams = useMemo(() => route.params, [route.params]);

  const handleBackPress = useCallback(async () => {
    resetCamera();
    resetAudioRecorder();
    await resetAudioWaveform();
    navigation.navigate('LevelOptions', routeParams);
  }, [
    navigation,
    routeParams,
    resetCamera,
    resetAudioRecorder,
    resetAudioWaveform,
  ]);

  useEffect(() => {
    return () => {
      resetCamera();
      resetAudioRecorder();
      resetAudioWaveform();
    };
  }, [resetCamera, resetAudioRecorder, resetAudioWaveform]);

  const handleStart = useCallback(async () => {
    // Start all components simultaneously
    const startPromises = [];

    if (cameraRef.current) {
      cameraRef.current.start();
    }

    if (audioRecorderRef.current) {
      startPromises.push(audioRecorderRef.current.start());
    }

    if (audioWaveformRef.current) {
      startPromises.push(audioWaveformRef.current.start());
    }

    // Start both audio components together to share microphone access
    await Promise.all(startPromises);
  }, []);

  const handleStop = useCallback(async () => {
    // Stop all components simultaneously
    const stopPromises = [];

    if (cameraRef.current) {
      cameraRef.current.stop();
    }

    if (audioRecorderRef.current) {
      stopPromises.push(audioRecorderRef.current.stop());
    }

    if (audioWaveformRef.current) {
      stopPromises.push(audioWaveformRef.current.stop());
    }

    await Promise.all(stopPromises);
  }, []);

  const handleFinish = useCallback(async () => {
    // Stop waveform first, then finish recording
    if (audioWaveformRef.current) {
      await audioWaveformRef.current.stop();
    }

    if (cameraRef.current) {
      cameraRef.current.finish();
    }

    if (audioRecorderRef.current) {
      await audioRecorderRef.current.finish();
    }
  }, []);

  return (
    <View style={styles.container}>
      <LevelHeader
        currentIndex={0}
        totalQuestions={1}
        onBackPress={handleBackPress}
      />

      <View style={styles.middleSection}>
        <DraggableCamera
          ref={cameraRef}
          onAnalysisComplete={handleFacialAnalysisComplete}
        />
      </View>

      <AudioRecorder
        ref={audioRecorderRef}
        onTranscriptionComplete={handleTranscriptionComplete}
      />

      <View style={styles.waveformContainer}>
        <AudioWaveform ref={audioWaveformRef} />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleStop}>
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.finishButton]}
          onPress={handleFinish}
        >
          <Text style={styles.buttonText}>Finish</Text>
        </TouchableOpacity>
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
  waveformContainer: {
    height: 60,
    width: '100%',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
    backgroundColor: '#6B5B95',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  finishButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Level2Screen;
