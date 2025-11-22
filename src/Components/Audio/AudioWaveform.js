import React, {
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Waveform,
  UpdateFrequency,
  useAudioPermission,
  PermissionStatus,
} from '@simform_solutions/react-native-audio-waveform';

const AudioWaveform = forwardRef((props, ref) => {
  const waveformRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const { checkHasAudioRecorderPermission, getAudioRecorderPermission } =
    useAudioPermission();

  const startRecording = async () => {
    try {
      console.log('🎤 AudioWaveform: Starting recording...');

      // Check permission first
      let hasPermission = await checkHasAudioRecorderPermission();

      // Request permission if not granted
      if (hasPermission === PermissionStatus.undetermined) {
        hasPermission = await getAudioRecorderPermission();
      }

      if (hasPermission !== PermissionStatus.granted) {
        console.warn('⚠️ Audio permission not granted:', hasPermission);
        return false;
      }

      // Start recording
      await waveformRef.current?.startRecord({
        encoder: 1,
        sampleRate: 44100,
        bitRate: 128000,
        fileNameFormat: 'audio_recording',
        useLegacy: false,
        updateFrequency: UpdateFrequency.high,
      });

      setIsRecording(true);
      console.log('✅ AudioWaveform: Recording started successfully');
      return true;
    } catch (error) {
      console.error('❌ AudioWaveform: Error starting recording:', error);
      return false;
    }
  };

  const stopRecording = async () => {
    if (!isRecording) {
      console.log('⚠️ AudioWaveform: Not currently recording');
      return null;
    }

    try {
      console.log('⏹️ AudioWaveform: Stopping recording...');
      const audioPath = await waveformRef.current?.stopRecord();
      setIsRecording(false);
      console.log('✅ AudioWaveform: Audio saved at:', audioPath);
      return audioPath;
    } catch (error) {
      console.error('❌ AudioWaveform: Error stopping recording:', error);
      setIsRecording(false);
      return null;
    }
  };

  const handleRecorderStateChange = state => {
    console.log('🎙️ AudioWaveform: Recorder state changed to:', state);
  };

  useImperativeHandle(ref, () => ({
    start: startRecording,
    stop: stopRecording,
    isRecording,
  }));

  return (
    <View style={styles.container}>
      <Waveform
        mode="live"
        ref={waveformRef}
        candleSpace={2}
        candleWidth={4}
        candleHeightScale={3}
        waveColor="#000000"
        containerStyle={styles.waveformContainer}
        onRecorderStateChange={handleRecorderStateChange}
        scrubColor="#000000"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformContainer: {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
});

export default AudioWaveform;
