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
      console.log('Starting recording... function');
      const hasPermission = await checkHasAudioRecorderPermission();

      if (hasPermission === PermissionStatus.granted) {
        await waveformRef.current?.startRecord({
          encoder: 1,
          sampleRate: 44100,
          bitRate: 128000,
          fileNameFormat: 'audio_recording',
          useLegacy: false,
          updateFrequency: UpdateFrequency.high,
        });
        setIsRecording(true);
      } else if (hasPermission === PermissionStatus.undetermined) {
        const permission = await getAudioRecorderPermission();
        if (permission === PermissionStatus.granted) {
          startRecording();
        }
      }
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!isRecording) {
      return null;
    }

    try {
      const audioPath = await waveformRef.current?.stopRecord();
      setIsRecording(false);
      console.log('Audio saved at:', audioPath);
      return audioPath;
    } catch (error) {
      // console.error('Error stopping recording:', error);
      setIsRecording(false);
      return null;
    }
  };

  const handleRecorderStateChange = state => {
    console.log('Recorder state:', state);
  };

  useImperativeHandle(ref, () => ({
    start: startRecording,
    stop: stopRecording,
  }));

  return (
    <View style={styles.container}>
      <Waveform
        mode="live"
        ref={waveformRef}
        candleSpace={2}
        candleWidth={4}
        candleHeightScale={3}
        waveColor="#545454"
        containerStyle={styles.waveformContainer}
        onRecorderStateChange={handleRecorderStateChange}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  waveformContainer: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  buttonContainer: {
    // marginTop: 20,
  },
});

export default AudioWaveform;
