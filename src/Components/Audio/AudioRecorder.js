import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { STT_API_KEY } from '@env';

const AudioRecorder = forwardRef(({ onTranscriptionComplete }, ref) => {
  const [audioRecorder] = useState(() => new AudioRecorderPlayer());
  const [isRecording, setIsRecording] = useState(false);
  const [recordingPath, setRecordingPath] = useState(null);
  const [audioResult, setAudioResult] = useState(null);

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

      audioRecorder.addRecordBackListener(e => {
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

  const transcribeAudio = async audioPath => {
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

      const response = await fetch(
        'https://api.deepgram.com/v1/listen?filler_words=true&punctuate=true&utterances=true&utt_split=0.8',
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${STT_API_KEY}`,
            'Content-Type': 'audio/m4a',
          },
          body: audioBuffer,
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      const transcriptText =
        data.results?.channels[0]?.alternatives[0]?.transcript ||
        'No transcription';
      const words = data.results?.channels[0]?.alternatives[0]?.words || [];

      const fillers = words.filter(w => {
        const word = w.word.toLowerCase();
        return [
          'uh',
          'um',
          'like',
          'you know',
          'so',
          'basically',
          'literally',
          'actually',
        ].includes(word);
      });

      const totalWords = words.length - fillers.length;
      const duration = data.metadata?.duration || 0;
      const calculatedWpm =
        duration > 0 ? Math.round((totalWords / duration) * 60) : 0;

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
        fillerWords: fillers.map(f => ({
          word: f.word,
          time: f.start.toFixed(2),
        })),
        pauseCount: detectedPauses.length,
        pauses: detectedPauses,
        duration: duration.toFixed(2),
        transcript: transcriptText,
      };

      setAudioResult(report);

      console.log('📋 JSON REPORT:');
      console.log(JSON.stringify(report, null, 2));
      console.log('\n');

      // **NEW: Call the callback function to pass data to parent**
      if (onTranscriptionComplete) {
        console.log('Trascription complete, passing data to parent...', report);
        onTranscriptionComplete(report);
      }

      await RNFS.fs.unlink(cleanPath);
      console.log('✓ Audio file deleted\n');
    } catch (error) {
      console.error('!!! TRANSCRIPTION ERROR:', error.message);

      // **NEW: Pass error to parent if callback exists**
      if (onTranscriptionComplete) {
        onTranscriptionComplete({
          error: true,
          message: error.message,
        });
      }

      try {
        const cleanPath = audioPath.replace('file://', '');
        const RNFS = require('react-native-blob-util').default;
        await RNFS.fs.unlink(cleanPath);
      } catch (e) {}
    }
  };

  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
    isRecording,
    recordingPath,
    audioResult,
  }));

  return null;
});

export default AudioRecorder;
