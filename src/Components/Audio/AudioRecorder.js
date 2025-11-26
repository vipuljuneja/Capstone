import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { STT_API_KEY } from '@env';
import RNFS from 'react-native-blob-util';

// Constants moved outside component to avoid recreation
const FILLER_WORDS = [
  'uh',
  'um',
  'like',
  'you know',
  'so',
  'basically',
  'literally',
  'actually',
];

const AudioRecorder = forwardRef(
  ({ onTranscriptionComplete, onSessionComplete }, ref) => {
    const [audioRecorder] = useState(() => new AudioRecorderPlayer());
    const [isRecording, setIsRecording] = useState(false);
    const [recordingPath, setRecordingPath] = useState(null);
    const [sessionData, setSessionData] = useState([]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        try {
          audioRecorder.stopRecorder();
          audioRecorder.removeRecordBackListener();
        } catch (e) {
          // Silent cleanup
        }
      };
    }, [audioRecorder]);

    // Helper: Clean audio path
    const cleanAudioPath = audioPath => {
      return audioPath.replace('file://', '');
    };

    // Helper: Read audio file as base64
    const readAudioFile = async audioPath => {
      const cleanPath = cleanAudioPath(audioPath);
      return await RNFS.fs.readFile(cleanPath, 'base64');
    };

    // Helper: Convert base64 to audio buffer
    const base64ToAudioBuffer = audioBase64 => {
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    };

    // Helper: Detect filler words
    const detectFillerWords = words => {
      return words.filter(w => FILLER_WORDS.includes(w.word.toLowerCase()));
    };

    // Helper: Detect pauses
    const detectPauses = words => {
      const pauses = [];
      for (let i = 0; i < words.length - 1; i++) {
        const gap = words[i + 1].start - words[i].end;
        if (gap > 0.8) {
          pauses.push({
            duration: gap.toFixed(2),
            timestamp: words[i].end.toFixed(2),
          });
        }
      }
      return pauses;
    };

    // Helper: Calculate WPM
    const calculateWPM = (totalWords, fillerCount, duration) => {
      if (duration <= 0) return 0;
      const effectiveWords = totalWords - fillerCount;
      return Math.round((effectiveWords / duration) * 60);
    };

    // Helper: Build transcription report
    const buildTranscriptionReport = (
      data,
      words,
      fillers,
      pauses,
      duration,
    ) => {
      const transcriptText =
        data.results?.channels[0]?.alternatives[0]?.transcript ||
        'No transcription';
      const wpm = calculateWPM(words.length, fillers.length, duration);

      return {
        timestamp: new Date().toISOString(),
        wpm,
        totalWords: words.length,
        fillerWordCount: fillers.length,
        fillerWords: fillers.map(f => ({
          word: f.word,
          time: f.start.toFixed(2),
        })),
        pauseCount: pauses.length,
        pauses,
        duration: duration.toFixed(2),
        transcript: transcriptText,
      };
    };

    // Helper: Delete audio file
    const deleteAudioFile = async audioPath => {
      try {
        const cleanPath = cleanAudioPath(audioPath);
        await RNFS.fs.unlink(cleanPath);
      } catch (e) {
        // Silent error handling
      }
    };

    // Transcribe audio
    const transcribeAudio = async audioPath => {
      try {
        const audioBase64 = await readAudioFile(audioPath);
        const audioBuffer = base64ToAudioBuffer(audioBase64);

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
        const words = data.results?.channels[0]?.alternatives[0]?.words || [];
        const duration = data.metadata?.duration || 0;

        const fillers = detectFillerWords(words);
        const pauses = detectPauses(words);
        const report = buildTranscriptionReport(
          data,
          words,
          fillers,
          pauses,
          duration,
        );

        await deleteAudioFile(audioPath);

        return report;
      } catch (error) {
        console.error('Transcription error:', error.message);
        await deleteAudioFile(audioPath);
        throw error;
      }
    };

    // Start recording
    const start = async () => {
      try {
        try {
          await audioRecorder.stopRecorder();
        } catch (e) {
          console.log('No active recording to stop.');
        }
        audioRecorder.removeRecordBackListener();

        await new Promise(resolve => setTimeout(resolve, 100));

        const path = await audioRecorder.startRecorder();
        setRecordingPath(path);
        setIsRecording(true);

        audioRecorder.addRecordBackListener(() => {
          // Silent listener for recording progress
        });
      } catch (error) {
        console.error('Start recording error:', error.message);
        setIsRecording(false);
      }
    };

    // Stop recording and reset
    const stop = async () => {
      try {
        if (isRecording) {
          await audioRecorder.stopRecorder();
          audioRecorder.removeRecordBackListener();
        }
      } catch (error) {
        console.error('Stop recording error:', error.message);
      } finally {
        setIsRecording(false);
        setRecordingPath(null);
        setSessionData([]);
      }
    };

    // Finish recording, return result, then reset
    const finish = async () => {
      try {
        if (!isRecording) {
          const emptyResult = {
            error: true,
            message: 'No active recording',
          };
          console.log('Final transcription result:', emptyResult);
          return emptyResult;
        }

        const audioPath = await audioRecorder.stopRecorder();
        audioRecorder.removeRecordBackListener();
        setIsRecording(false);

        await new Promise(resolve => setTimeout(resolve, 200));

        const report = await transcribeAudio(audioPath);
        const result = {
          ...report,
          sessionData: [...sessionData, report],
        };

        console.log('Final transcription result:', result);

        if (onTranscriptionComplete) {
          onTranscriptionComplete(report);
        }

        if (onSessionComplete) {
          onSessionComplete(result);
        }

        // Reset after returning result
        setRecordingPath(null);
        setSessionData([]);

        return result;
      } catch (error) {
        console.error('Finish recording error:', error.message);
        setIsRecording(false);
        setRecordingPath(null);
        setSessionData([]);

        const errorResult = {
          error: true,
          message: error.message,
        };

        if (onTranscriptionComplete) {
          onTranscriptionComplete(errorResult);
        }

        return errorResult;
      }
    };

    // Reset component
    const reset = () => {
      try {
        if (isRecording) {
          audioRecorder.stopRecorder().catch(() => {});
          audioRecorder.removeRecordBackListener();
        }
      } catch (e) {
        // Silent error handling
      } finally {
        setIsRecording(false);
        setRecordingPath(null);
        setSessionData([]);
      }
    };

    useImperativeHandle(ref, () => ({
      start,
      stop,
      finish,
      reset,
      isRecording,
      recordingPath,
      sessionData,
    }));

    return null;
  },
);

export default AudioRecorder;
