import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { STT_API_KEY } from '@env';

const AudioRecorder = () => {
  // Create a new instance for each component mount
  const [audioRecorder] = useState(() => new AudioRecorderPlayer());
  // State management for recording status and results
  const [isRecording, setIsRecording] = useState(false);
  const [recordingPath, setRecordingPath] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [fillerWords, setFillerWords] = useState([]);
  const [pauses, setPauses] = useState([]);
  const [wpm, setWpm] = useState(0);
  const [recordingTime, setRecordingTime] = useState('00:00');

  /**
   * CLEANUP ON UNMOUNT
   * Ensures recorder is stopped and listeners are removed when component unmounts
   */
  useEffect(() => {
    return () => {
      try {
        audioRecorder.stopRecorder();
        audioRecorder.removeRecordBackListener();
      } catch (e) {
        console.log('Cleanup error:', e);
      }
    };
  }, [audioRecorder]);

  /**
   * START RECORDING
   * Initializes audio recording and sets up the recording timer
   */
  const startRecording = async () => {
    console.log('=== START RECORDING CALLED ===');
    try {
      // Stop any existing recording and remove listeners first
      try {
        await audioRecorder.stopRecorder();
        console.log('Stopped any existing recording');
      } catch (e) {
        console.log('No existing recording to stop');
      }
      audioRecorder.removeRecordBackListener();
      
      // Small delay to ensure recorder is fully reset
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Starting new recording...');
      // Start recording and get the file path where audio will be saved
      const path = await audioRecorder.startRecorder();
      console.log('Recording started successfully at:', path);
      setRecordingPath(path);
      setIsRecording(true);
      
      // Clear previous results
      setTranscript('');
      setFillerWords([]);
      setPauses([]);
      setWpm(0);

      // Set up a listener to update recording time in real-time
      audioRecorder.addRecordBackListener((e) => {
        const minutes = Math.floor(e.currentPosition / 60000);
        const seconds = Math.floor((e.currentPosition % 60000) / 1000);
        setRecordingTime(
          `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      });
    } catch (error) {
      console.error('!!! RECORDING START ERROR !!!', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      Alert.alert('Recording Error', 'Failed to start recording: ' + error.message);
    }
  };

  /**
   * STOP RECORDING
   * Stops the audio recording and triggers transcription
   */
  const stopRecording = async () => {
    console.log('=== STOP RECORDING CALLED ===');
    try {
      // Stop recording and get the final file path
      const result = await audioRecorder.stopRecorder();
      audioRecorder.removeRecordBackListener();
      setIsRecording(false);
      setRecordingTime('00:00');
      console.log('Recording stopped successfully, saved at:', result);
      
      // Small delay before transcription
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Automatically start transcription process
      await transcribeAudio(result);
    } catch (error) {
      console.error('!!! RECORDING STOP ERROR !!!', error);
      Alert.alert('Error', 'Failed to stop recording: ' + error.message);
      setIsRecording(false);
      setRecordingTime('00:00');
    }
  };

  /**
   * TRANSCRIBE AUDIO
   * Sends audio file to Deepgram API and processes the response
   */
  const transcribeAudio = async (audioPath) => {
    setIsProcessing(true);
    try {
      // Remove 'file://' prefix from path if present (iOS specific)
      const cleanPath = audioPath.replace('file://', '');
      
      // Read the audio file as base64 encoded string
      const RNFS = require('react-native-blob-util').default;
      const audioBase64 = await RNFS.fs.readFile(cleanPath, 'base64');
      
      // Convert base64 string to binary ArrayBuffer for API transmission
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBuffer = bytes.buffer;

      /**
       * SEND TO DEEPGRAM API
       * Parameters:
       * - filler_words=true: Detect filler words like "uh", "um"
       * - punctuate=true: Add punctuation to transcript
       * - utterances=true: Segment speech into utterances for pause detection
       * - utt_split=0.8: Consider gaps > 0.8 seconds as utterance boundaries
       */
      const response = await fetch('https://api.deepgram.com/v1/listen?filler_words=true&punctuate=true&utterances=true&utt_split=0.8', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${STT_API_KEY}`,
          'Content-Type': 'audio/m4a',
        },
        body: audioBuffer,
      });

      // Check if API request was successful
      if (!response.ok) {
        throw new Error(`Deepgram API error: ${response.status}`);
      }

      const data = await response.json();
      
      // EXTRACT TRANSCRIPT TEXT
      const transcriptText = data.results?.channels[0]?.alternatives[0]?.transcript || 'No transcription available';
      setTranscript(transcriptText);

      /**
       * EXTRACT FILLER WORDS
       * Filters words array for common filler words and maps to simpler structure
       */
      const words = data.results?.channels[0]?.alternatives[0]?.words || [];
      const fillers = words
        .filter((w) => {
          const word = w.word.toLowerCase();
          return ['uh', 'um', 'like', 'you know', 'so', 'basically', 'literally', 'actually'].includes(word);
        })
        .map((w) => ({
          word: w.word,
          timestamp: w.start,
        }));
      
      setFillerWords(fillers);

      /**
       * CALCULATE WPM (Words Per Minute)
       * Formula: (total words - filler words) / duration in minutes
       * Excludes filler words for more accurate speaking rate
       */
      const totalWords = words.length - fillers.length;
      const duration = data.metadata?.duration || 0;
      const calculatedWpm = duration > 0 ? Math.round((totalWords / duration) * 60) : 0;
      setWpm(calculatedWpm);

      /**
       * DETECT PAUSES
       * Analyzes gaps between consecutive words
       * Considers gaps > 0.8 seconds as significant pauses
       */
      const detectedPauses = [];
      for (let i = 0; i < words.length - 1; i++) {
        const currentWord = words[i];
        const nextWord = words[i + 1];
        const gap = nextWord.start - currentWord.end;
        
        // Only record pauses longer than 0.8 seconds
        if (gap > 0.8) {
          detectedPauses.push({
            duration: gap,
            timestamp: currentWord.end,
          });
        }
      }
      setPauses(detectedPauses);

      /**
       * GENERATE JSON REPORT
       * Creates a comprehensive report of the speech analysis
       */
      const report = {
        transcript: transcriptText,
        wpm: calculatedWpm,
        totalWords: words.length,
        fillerWords: fillers,
        fillerWordCount: fillers.length,
        pauses: detectedPauses,
        pauseCount: detectedPauses.length,
        recordingDuration: duration,
        timestamp: new Date().toISOString(),
      };

      // Log the complete JSON report to console
      console.log('========== SPEECH ANALYSIS REPORT ==========');
      console.log(JSON.stringify(report, null, 2));
      console.log('============================================');
      
      // Also log to alert for visibility
      console.warn('JSON Report generated - check console');
      console.table({
        WPM: calculatedWpm,
        'Total Words': words.length,
        'Filler Words': fillers.length,
        'Pauses': detectedPauses.length,
      });

      /**
       * CLEANUP: Delete audio file after successful transcription
       * Saves device storage by removing temporary audio files
       */
      await RNFS.fs.unlink(cleanPath);
      console.log('Audio file deleted after transcription');
    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert('Error', 'Failed to transcribe audio. Please check your API key and internet connection.');
      
      /**
       * ERROR CLEANUP
       * Still attempt to delete the audio file even if transcription failed
       */
      try {
        const cleanPath = audioPath.replace('file://', '');
        const RNFS = require('react-native-blob-util').default;
        await RNFS.fs.unlink(cleanPath);
      } catch (deleteError) {
        console.log('Could not delete audio file:', deleteError);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * HELPER FUNCTION: Format seconds to MM:SS
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ========== RENDER UI ==========
  return (
    <View style={styles.container}>
      {/* HEADER SECTION */}
      <Text style={styles.title}>Speech Analyzer</Text>
      <Text style={styles.subtitle}>Record your speech and detect filler words</Text>

      {/* RECORDING CONTROLS */}
      <View style={styles.recordingSection}>
        {/* Show recording indicator with timer when recording */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingTime}>{recordingTime}</Text>
          </View>
        )}

        {/* Main record/stop button */}
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordButtonActive]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? '⏹ Stop Recording' : '🎙 Start Recording'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* PROCESSING INDICATOR */}
      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#3a7afe" />
          <Text style={styles.processingText}>Transcribing audio...</Text>
        </View>
      )}

      {/* RESULTS SECTION */}
      {transcript && !isProcessing && (
        <ScrollView style={styles.resultsContainer}>
          {/* THREE STATS CARDS: WPM, Filler Words, Pauses */}
          <View style={styles.statsRow}>
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Words/Min</Text>
              <Text style={styles.statsNumber}>{wpm}</Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Filler Words</Text>
              <Text style={styles.statsNumber}>{fillerWords.length}</Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Pauses</Text>
              <Text style={styles.statsNumber}>{pauses.length}</Text>
            </View>
          </View>

          {/* FILLER WORDS LIST */}
          {fillerWords.length > 0 && (
            <View style={styles.fillersCard}>
              <Text style={styles.cardTitle}>Filler Words:</Text>
              {fillerWords.map((filler, index) => (
                <View key={index} style={styles.fillerItem}>
                  <Text style={styles.fillerWord}>"{filler.word}"</Text>
                  <Text style={styles.fillerTime}>at {formatTime(filler.timestamp)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* PAUSES LIST */}
          {pauses.length > 0 && (
            <View style={styles.fillersCard}>
              <Text style={styles.cardTitle}>Pauses ({">"} 0.8s):</Text>
              {pauses.map((pause, index) => (
                <View key={index} style={styles.fillerItem}>
                  <Text style={styles.pauseDuration}>{pause.duration.toFixed(1)}s pause</Text>
                  <Text style={styles.fillerTime}>at {formatTime(pause.timestamp)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* FULL TRANSCRIPT */}
          <View style={styles.transcriptCard}>
            <Text style={styles.cardTitle}>Full Transcript:</Text>
            <Text style={styles.transcriptText}>{transcript}</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 24,
  },
  recordingSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff4444',
    marginRight: 8,
  },
  recordingTime: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  recordButton: {
    backgroundColor: '#3a7afe',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  recordButtonActive: {
    backgroundColor: '#ff4444',
  },
  recordButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  processingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  processingText: {
    color: '#cccccc',
    marginTop: 16,
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    marginTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statsTitle: {
    color: '#cccccc',
    fontSize: 12,
    marginBottom: 8,
  },
  statsNumber: {
    color: '#3a7afe',
    fontSize: 32,
    fontWeight: '700',
  },
  fillersCard: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  fillerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  fillerWord: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '500',
  },
  pauseDuration: {
    color: '#ffa94d',
    fontSize: 16,
    fontWeight: '500',
  },
  fillerTime: {
    color: '#888888',
    fontSize: 14,
  },
  transcriptCard: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  transcriptText: {
    color: '#cccccc',
    fontSize: 16,
    lineHeight: 24,
  },
});

export default AudioRecorder;