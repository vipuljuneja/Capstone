import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { STT_API_KEY } from '@env';

const AudioRecorder = () => {
  const [audioRecorder] = useState(() => new AudioRecorderPlayer());
  const [isRecording, setIsRecording] = useState(false);
  const [recordingPath, setRecordingPath] = useState(null);

  // Animation values for wave bars
  const [waves] = useState(() => [
    new Animated.Value(0.3),
    new Animated.Value(0.5),
    new Animated.Value(0.7),
    new Animated.Value(0.4),
    new Animated.Value(0.6),
    new Animated.Value(0.8),
    new Animated.Value(0.5),
    new Animated.Value(0.3),
    new Animated.Value(0.6),
    new Animated.Value(0.4),
  ]);

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

  // Animate waves when recording
  useEffect(() => {
    if (isRecording) {
      const animations = waves.map((wave, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(wave, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: 300 + Math.random() * 200,
              useNativeDriver: false,
            }),
            Animated.timing(wave, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: 300 + Math.random() * 200,
              useNativeDriver: false,
            }),
          ])
        );
      });
      
      animations.forEach(anim => anim.start());
      
      return () => {
        animations.forEach(anim => anim.stop());
      };
    }
  }, [isRecording, waves]);

  const startRecording = async () => {
    console.log('=== START RECORDING ===');
    try {
      try {
        await audioRecorder.stopRecorder();
      } catch (e) {}
      audioRecorder.removeRecordBackListener();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const path = await audioRecorder.startRecorder();
      console.log('✓ Recording started:', path);
      setRecordingPath(path);
      setIsRecording(true);

      audioRecorder.addRecordBackListener((e) => {
        // Silent
      });
    } catch (error) {
      console.error('!!! START ERROR:', error.message);
    }
  };

  const stopRecording = async () => {
    console.log('=== STOP RECORDING ===');
    try {
      const result = await audioRecorder.stopRecorder();
      audioRecorder.removeRecordBackListener();
      setIsRecording(false);
      console.log('✓ Recording stopped:', result);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      await transcribeAudio(result);
    } catch (error) {
      console.error('!!! STOP ERROR:', error.message);
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioPath) => {
    console.log('=== TRANSCRIBING ===');
    try {
      const cleanPath = audioPath.replace('file://', '');
      
      const RNFS = require('react-native-blob-util').default;
      const audioBase64 = await RNFS.fs.readFile(cleanPath, 'base64');
      
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBuffer = bytes.buffer;

      const response = await fetch('https://api.deepgram.com/v1/listen?filler_words=true&punctuate=true&utterances=true&utt_split=0.8', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${STT_API_KEY}`,
          'Content-Type': 'audio/m4a',
        },
        body: audioBuffer,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      const transcriptText = data.results?.channels[0]?.alternatives[0]?.transcript || 'No transcription';
      const words = data.results?.channels[0]?.alternatives[0]?.words || [];
      
      const fillers = words.filter((w) => {
        const word = w.word.toLowerCase();
        return ['uh', 'um', 'like', 'you know', 'so', 'basically', 'literally', 'actually'].includes(word);
      });
      
      const totalWords = words.length - fillers.length;
      const duration = data.metadata?.duration || 0;
      const calculatedWpm = duration > 0 ? Math.round((totalWords / duration) * 60) : 0;

      const detectedPauses = [];
      for (let i = 0; i < words.length - 1; i++) {
        const gap = words[i + 1].start - words[i].end;
        if (gap > 0.8) {
          detectedPauses.push({
            duration: gap.toFixed(2),
            timestamp: words[i].end.toFixed(2),
          });
        }
      }

      console.log('\n╔════════════════════════════════════════╗');
      console.log('║       SPEECH ANALYSIS RESULTS          ║');
      console.log('╚════════════════════════════════════════╝\n');
      
      console.log('📊 STATISTICS:');
      console.log(`   WPM: ${calculatedWpm}`);
      console.log(`   Total Words: ${words.length}`);
      console.log(`   Filler Words: ${fillers.length}`);
      console.log(`   Pauses (>0.8s): ${detectedPauses.length}`);
      console.log(`   Duration: ${duration.toFixed(2)}s\n`);
      
      console.log('💬 FILLER WORDS:');
      if (fillers.length > 0) {
        fillers.forEach((f, i) => {
          console.log(`   ${i + 1}. "${f.word}" at ${f.start.toFixed(2)}s`);
        });
      } else {
        console.log('   None detected');
      }
      
      console.log('\n⏸️  PAUSES:');
      if (detectedPauses.length > 0) {
        detectedPauses.forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.duration}s pause at ${p.timestamp}s`);
        });
      } else {
        console.log('   None detected');
      }
      
      console.log('\n📝 TRANSCRIPT:');
      console.log(`   ${transcriptText}\n`);
      
      console.log('═══════════════════════════════════════════\n');

      const report = {
        wpm: calculatedWpm,
        totalWords: words.length,
        fillerWordCount: fillers.length,
        fillerWords: fillers.map(f => ({ word: f.word, time: f.start.toFixed(2) })),
        pauseCount: detectedPauses.length,
        pauses: detectedPauses,
        duration: duration.toFixed(2),
        transcript: transcriptText,
      };
      
      console.log('📋 JSON REPORT:');
      console.log(JSON.stringify(report, null, 2));
      console.log('\n');

      await RNFS.fs.unlink(cleanPath);
      console.log('✓ Audio file deleted\n');
      
    } catch (error) {
      console.error('!!! TRANSCRIPTION ERROR:', error.message);
      
      try {
        const cleanPath = audioPath.replace('file://', '');
        const RNFS = require('react-native-blob-util').default;
        await RNFS.fs.unlink(cleanPath);
      } catch (e) {}
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Speech Analyzer</Text>
      <Text style={styles.subtitle}>Results in Console</Text>

      <View style={styles.recordingArea}>
        {!isRecording ? (
          // RECORD BUTTON (when not recording)
          <TouchableOpacity
            style={styles.recordButton}
            onPress={startRecording}
          >
            <View style={styles.recordButtonInner}>
              <Text style={styles.recordIcon}>🎙</Text>
              <Text style={styles.recordButtonText}>RECORD</Text>
            </View>
          </TouchableOpacity>
        ) : (
          // WAVE + STOP BUTTON (when recording)
          <View style={styles.recordingContainer}>
            {/* Audio Wave */}
            <View style={styles.waveContainer}>
              {waves.map((wave, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.waveBar,
                    {
                      height: wave.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['20%', '100%'],
                      }),
                    },
                  ]}
                />
              ))}
            </View>

            {/* Stop Button */}
            <TouchableOpacity
              style={styles.stopButton}
              onPress={stopRecording}
            >
              <View style={styles.stopIcon} />
              <Text style={styles.stopButtonText}>STOP</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>• Press RECORD to start</Text>
        <Text style={styles.infoText}>• Speak clearly into mic</Text>
        <Text style={styles.infoText}>• Press STOP when done</Text>
        <Text style={styles.infoText}>• Check console for results</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 60,
    textAlign: 'center',
  },
  recordingArea: {
    height: 200,
    marginBottom: 60,
  },
  recordButton: {
    flex: 1,
    backgroundColor: '#3a7afe',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3a7afe',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  recordButtonInner: {
    alignItems: 'center',
  },
  recordIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  recordButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  waveContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  waveBar: {
    width: 6,
    backgroundColor: '#3a7afe',
    borderRadius: 3,
    minHeight: 20,
  },
  stopButton: {
    width: 100,
    height: '100%',
    backgroundColor: '#ff4444',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  stopIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    marginBottom: 8,
  },
  stopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  infoBox: {
    padding: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3a7afe',
  },
  infoText: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 8,
  },
});

export default AudioRecorder;