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

  // Start visualizing waveforms
  const start = async () => {
    try {
      let hasPermission = await checkHasAudioRecorderPermission();

      if (hasPermission === PermissionStatus.undetermined) {
        hasPermission = await getAudioRecorderPermission();
      }

      if (hasPermission !== PermissionStatus.granted) {
        console.error('Audio permission not granted');
        return false;
      }

      await waveformRef.current?.startRecord({
        encoder: 1,
        sampleRate: 44100,
        bitRate: 128000,
        fileNameFormat: 'audio_recording',
        useLegacy: false,
        updateFrequency: UpdateFrequency.high,
      });

      setIsRecording(true);
      return true;
    } catch (error) {
      console.error('Error starting waveform:', error.message);
      return false;
    }
  };

  // Stop waveform and reset
  const stop = async () => {
    try {
      if (isRecording && waveformRef.current) {
        await waveformRef.current.stopRecord();
      }
    } catch (error) {
      console.error('Error stopping waveform:', error.message);
    } finally {
      setIsRecording(false);
    }
  };

  useImperativeHandle(ref, () => ({
    start,
    stop,
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
