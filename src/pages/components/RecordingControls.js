import React, { forwardRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import AudioRecorder from '../../Components/Audio/AudioRecorder';
import MicIcon from '../../../assets/icons/mic-white.svg';
import DeleteIcon from '../../../assets/icons/delete-filled.svg';

const RecordingControls = forwardRef(
  (
    {
      isRecording,
      avatarReady,
      isLastQuestion,
      isSpeaking,
      isLoading,
      onStart,
      onStop,
      onNext,
      onTranscriptionComplete,
    },
    ref,
  ) => {
    return (
      <View style={styles.container}>
        <AudioRecorder
          ref={ref}
          onTranscriptionComplete={onTranscriptionComplete}
        />

        <TouchableOpacity
          style={isRecording ? styles.stopButton : styles.micButton}
          onPress={isRecording ? onStop : onStart}
          disabled={!avatarReady && !isRecording}
          accessibilityLabel={
            isRecording ? 'Stop recording' : 'Start recording'
          }
          accessibilityRole="button"
        >
          {isRecording ? (
            <DeleteIcon height={24} width={24} />
          ) : (
            <MicIcon height={24} width={24} />
          )}
        </TouchableOpacity>

        {isRecording && (
          <TouchableOpacity
            onPress={onNext}
            disabled={isSpeaking || isLoading}
            style={[
              styles.nextButton,
              (isSpeaking || isLoading) && styles.buttonDisabled,
            ]}
            accessibilityLabel={isLastQuestion ? 'Finish' : 'Next question'}
            accessibilityRole="button"
          >
            <Text style={styles.nextButtonText}>
              {isLastQuestion ? '✓' : '→'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
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

export default RecordingControls;
