import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { STT_API_KEY } from '@env';

const AudioRecorder = forwardRef(
  ({ onTranscriptionComplete, onSessionComplete }, ref) => {
    const [audioRecorder] = useState(() => new AudioRecorderPlayer());
    const [isRecording, setIsRecording] = useState(false);
    const [recordingPath, setRecordingPath] = useState(null);
    const [audioResult, setAudioResult] = useState(null);

    const [recordingCount, setRecordingCount] = useState(0);
    const [sessionData, setSessionData] = useState([]);
    const [sessionActive, setSessionActive] = useState(false);
    
    // Refs to track recording state for listener callbacks
    const isRecordingRef = useRef(false);
    const recordingPathRef = useRef(null);
    const restartInProgressRef = useRef(false);

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

    const startSession = () => {
      console.log('\n╔═══════════════════════════════════════════╗');
      console.log('║           NEW SESSION STARTED             ║');
      console.log('╚═══════════════════════════════════════════╝\n');

      setSessionActive(true);
      setRecordingCount(0);
      setSessionData([]);
      setAudioResult(null);

      console.log('✓ Session initialized');
      console.log('Ready to record\n');
    };

    const startRecording = async () => {
      console.log(`=== START RECORDING #${recordingCount + 1} ===`);

      if (!audioRecorder) {
        console.error('!!! AudioRecorder not initialized');
        return;
      }

      // Prevent starting if already recording - this is critical for continuous recording
      if (isRecording) {
        console.warn('⚠️ Already recording, skipping start to maintain continuity');
        console.warn('⚠️ Current recording path:', recordingPath);
        return;
      }

      try {
        // Only stop if we're actually recording (defensive check)
        if (isRecording) {
          try {
            await audioRecorder.stopRecorder();
          } catch (e) {
            // Ignore if not recording
          }
        }
        try {
          audioRecorder.removeRecordBackListener();
        } catch (e) {
          // Ignore if no listener exists
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        if (!audioRecorder.startRecorder) {
          console.error('!!! startRecorder method not available');
          return;
        }

        const path = await audioRecorder.startRecorder();
        console.log('✓ Recording started:', path);
        console.log('📊 Recording path will be used for entire session');
        
        // Use setTimeout to defer state updates and avoid potential race conditions
        setTimeout(() => {
          setRecordingPath(path);
          setIsRecording(true);
          isRecordingRef.current = true;
          recordingPathRef.current = path;
          restartInProgressRef.current = false;
        }, 0);

        // Add a delay before adding listener to let native module stabilize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          if (audioRecorder.addRecordBackListener) {
            let lastLoggedSecond = 0;
            let lastPositionTime = Date.now();
            let lastPosition = 0;
            audioRecorder.addRecordBackListener(e => {
              // Log recording progress to detect if recording stops
              if (e.currentPosition !== undefined) {
                const seconds = Math.floor(e.currentPosition / 1000);
                const currentTime = Date.now();
                
                // Log every 5 seconds to track recording progress
                if (seconds > 0 && seconds % 5 === 0 && seconds !== lastLoggedSecond) {
                  console.log(`📊 Recording progress: ${seconds}s`);
                  lastLoggedSecond = seconds;
                  lastPositionTime = currentTime;
                  lastPosition = e.currentPosition;
                }
                
                // Detect if recording position callback has stopped updating
                // NOTE: This doesn't necessarily mean recording stopped - the file might still be growing
                // We'll log a warning but NOT restart, as restarting creates a new file and loses previous data
                if (e.currentPosition === lastPosition && currentTime - lastPositionTime > 5000 && lastPosition > 0) {
                  console.warn(`⚠️ Recording position callback frozen at ${seconds}s - but file may still be recording. Not restarting to preserve data.`);
                  // Don't restart - just log. The file might still be recording even if callback stopped.
                  // Restarting would create a new file and lose all previous recording.
                } else if (e.currentPosition !== lastPosition) {
                  // Position is updating, reset the timer
                  lastPositionTime = currentTime;
                  lastPosition = e.currentPosition;
                }
              }
            });
          }
        } catch (listenerError) {
          console.error('!!! LISTENER ERROR:', listenerError.message);
          // Continue even if listener fails - recording should still work
        }
      } catch (error) {
        console.error('!!! START ERROR:', error.message, error);
        setIsRecording(false);
        isRecordingRef.current = false;
      }
    };

    const stopRecording = async () => {
      console.log('=== STOP RECORDING ===');
      try {
        const result = await audioRecorder.stopRecorder();
        audioRecorder.removeRecordBackListener();
        setIsRecording(false);
        isRecordingRef.current = false;
        console.log('✓ Recording stopped:', result);

        // Check file size to verify recording captured everything
        if (result) {
          try {
            const RNFS = require('react-native-blob-util').default;
            const cleanPath = result.replace('file://', '');
            const fileInfo = await RNFS.fs.stat(cleanPath);
            const fileSizeMB = (fileInfo.size / (1024 * 1024)).toFixed(2);
            console.log(`📊 Recording file size: ${fileSizeMB} MB (${fileInfo.size} bytes)`);
            console.log(`📊 Expected duration: ~${Math.round(fileInfo.size / 16000)} seconds (estimated)`);
          } catch (fileError) {
            console.warn('⚠️ Could not check file size:', fileError);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 200));

        // Increment recording count
        setRecordingCount(prev => prev + 1);

        // Only transcribe if we have a valid file path (not "Already stopped")
        if (result && result !== 'Already stopped' && typeof result === 'string' && result.startsWith('file://')) {
          await transcribeAudio(result);
        } else {
          console.log('⏸️ Skipping transcription - recording was already stopped');
        }
      } catch (error) {
        console.error('!!! STOP ERROR:', error.message);
        setIsRecording(false);
        isRecordingRef.current = false;
      }
    };

    const transcribeAudio = async audioPath => {
      console.log('=== TRANSCRIBING ===');
      try {
        const cleanPath = audioPath.replace('file://', '');

        const RNFS = require('react-native-blob-util').default;
        
        // Check file size before reading
        let fileInfo = null;
        try {
          fileInfo = await RNFS.fs.stat(cleanPath);
          const fileSizeMB = (fileInfo.size / (1024 * 1024)).toFixed(2);
          console.log(`📊 Audio file size: ${fileSizeMB} MB (${fileInfo.size} bytes)`);
          // Estimate duration: ~16KB per second for m4a at typical quality
          const estimatedDuration = Math.round(fileInfo.size / 16000);
          console.log(`📊 Estimated duration: ~${estimatedDuration} seconds`);
        } catch (fileError) {
          console.warn('⚠️ Could not check file info:', fileError);
        }
        
        const audioBase64 = await RNFS.fs.readFile(cleanPath, 'base64');
        console.log(`📊 Audio base64 length: ${audioBase64.length} characters`);

        const binaryString = atob(audioBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBuffer = bytes.buffer;

        // Log request details
        console.log(`📤 Sending to Deepgram: ${(audioBuffer.byteLength / (1024 * 1024)).toFixed(2)} MB`);
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
        
        let response;
        try {
          response = await fetch(
            'https://api.deepgram.com/v1/listen?filler_words=true&punctuate=true&utterances=true&utt_split=0.8',
            {
              method: 'POST',
              headers: {
                Authorization: `Token ${STT_API_KEY}`,
                'Content-Type': 'audio/m4a',
              },
              body: audioBuffer,
              signal: controller.signal,
            },
          );
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            throw new Error('Deepgram request timed out after 2 minutes');
          }
          throw fetchError;
        }
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Deepgram API error ${response.status}:`, errorText);
          throw new Error(`API error: ${response.status} - ${errorText.substring(0, 200)}`);
        }

        const data = await response.json();
        
        // Log if response seems truncated
        if (data.results?.channels?.[0]?.alternatives?.[0]?.words?.length > 0) {
          const lastWord = data.results.channels[0].alternatives[0].words[data.results.channels[0].alternatives[0].words.length - 1];
          const transcribedDuration = lastWord.end || 0;
          console.log(`📊 Deepgram transcribed up to: ${transcribedDuration.toFixed(2)}s`);
          
          // Check if this matches expected duration
          const expectedDuration = fileInfo?.size ? Math.round(fileInfo.size / 16000) : 0;
          if (expectedDuration > 0 && transcribedDuration < expectedDuration * 0.5) {
            console.warn(`⚠️ WARNING: Transcription seems truncated! Expected ~${expectedDuration}s, got ${transcribedDuration.toFixed(2)}s`);
          }
        }

        // Log full response for debugging
        console.log('📊 Deepgram response:', {
          hasResults: !!data.results,
          hasChannels: !!data.results?.channels,
          channelCount: data.results?.channels?.length || 0,
          hasAlternatives: !!data.results?.channels?.[0]?.alternatives,
          alternativeCount: data.results?.channels?.[0]?.alternatives?.length || 0,
        });

        const transcriptText =
          data.results?.channels[0]?.alternatives[0]?.transcript ||
          'No transcription';
        const words = data.results?.channels[0]?.alternatives[0]?.words || [];
        
        console.log(`📊 Transcript length: ${transcriptText.length} characters`);
        console.log(`📊 Word count: ${words.length} words`);
        
        // Check if transcript seems truncated
        if (words.length > 0) {
          const lastWord = words[words.length - 1];
          const totalDuration = lastWord.end || 0;
          console.log(`📊 Transcript duration from words: ${totalDuration.toFixed(2)} seconds`);
          
          // Check metadata duration vs actual transcribed duration
          const metadataDuration = data.metadata?.duration || 0;
          if (metadataDuration > 0) {
            console.log(`📊 Deepgram metadata duration: ${metadataDuration.toFixed(2)} seconds`);
            if (totalDuration < metadataDuration * 0.5) {
              console.warn(`⚠️ WARNING: Deepgram metadata shows ${metadataDuration.toFixed(2)}s but only transcribed ${totalDuration.toFixed(2)}s`);
            }
          }
          
          // Compare with file size estimate
          if (fileInfo?.size) {
            const expectedDuration = Math.round(fileInfo.size / 16000);
            if (totalDuration < expectedDuration * 0.5) {
              console.warn(`⚠️ WARNING: File size suggests ~${expectedDuration}s but only transcribed ${totalDuration.toFixed(2)}s - audio may be corrupted or Deepgram truncated`);
            }
          }
        } else {
          console.warn('⚠️ No words in Deepgram response - transcription may have failed');
        }
        
        // Ensure words array is included in the report for filtering
        // Deepgram returns words with start/end timestamps which we need for filtering

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
          recordingNumber: recordingCount + 1,
          timestamp: new Date().toISOString(),
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
          words: words, // Include words array with timestamps for filtering question audio
        };

        setAudioResult(report);

        // Add to session data
        setSessionData(prev => [...prev, report]);

        console.log('📋 JSON REPORT:');
        console.log(JSON.stringify(report, null, 2));
        console.log('\n');

        // Call the callback function to pass data to parent
        if (onTranscriptionComplete) {
          console.log(
            'Transcription complete, passing data to parent...',
            report,
          );
          onTranscriptionComplete(report);
        }

        await RNFS.fs.unlink(cleanPath);
        console.log('✓ Audio file deleted\n');
      } catch (error) {
        // Silently handle "Already stopped" errors - this is expected in per-question recording flow
        const isAlreadyStoppedError = error.message && error.message.includes('Already stopped');
        
        if (isAlreadyStoppedError) {
          console.log('⏸️ Transcription skipped - recording already stopped (expected behavior)');
        } else {
          // Only log actual errors, not expected "already stopped" cases
          console.log('⚠️ Transcription error:', error.message);
        }

        // Pass error to parent if callback exists (but silently for "already stopped")
        if (onTranscriptionComplete) {
          onTranscriptionComplete({
            error: true,
            message: isAlreadyStoppedError ? 'Recording already stopped' : error.message,
          });
        }

        // Try to clean up file if it exists
        try {
          if (audioPath && audioPath !== 'Already stopped' && audioPath.startsWith('file://')) {
            const cleanPath = audioPath.replace('file://', '');
            const RNFS = require('react-native-blob-util').default;
            await RNFS.fs.unlink(cleanPath);
          }
        } catch (e) {
          // Silently ignore cleanup errors
        }
      }
    };

    // End session and get all recordings data
    const endSession = () => {
      console.log('\n\n╔═══════════════════════════════════════════╗');
      console.log('║        SESSION COMPLETE - ALL DATA        ║');
      console.log('╚═══════════════════════════════════════════╝\n');

      const sessionSummary = {
        totalRecordings: sessionData.length,
        sessionDate: new Date().toISOString(),
        recordings: sessionData,
        averageWpm:
          sessionData.length > 0
            ? Math.round(
                sessionData.reduce((sum, r) => sum + r.wpm, 0) /
                  sessionData.length,
              )
            : 0,
        totalFillerWords: sessionData.reduce(
          (sum, r) => sum + r.fillerWordCount,
          0,
        ),
        totalPauses: sessionData.reduce((sum, r) => sum + r.pauseCount, 0),
        totalDuration: sessionData
          .reduce((sum, r) => sum + parseFloat(r.duration), 0)
          .toFixed(2),
      };

      console.log('📊 COMPLETE SESSION JSON:');
      console.log(JSON.stringify(sessionSummary, null, 2));
      console.log('\n');

      if (onSessionComplete) {
        onSessionComplete(sessionSummary);
      }

      setSessionActive(false);

      return sessionSummary;
    };

    const getSessionData = () => {
      return {
        recordingCount: recordingCount,
        totalRecordings: sessionData.length,
        data: sessionData,
      };
    };

    // Reset the entire component state and stop any recording
    const reset = () => {
      console.log('↩️ Resetting AudioRecorder state');
      // Stop recording if active
      if (isRecording) {
        audioRecorder.stopRecorder().catch(() => {});
        audioRecorder.removeRecordBackListener();
      }
      setIsRecording(false);
      setRecordingPath(null);
      setAudioResult(null);
      setRecordingCount(0);
      setSessionData([]);
      setSessionActive(false);
    };

    useImperativeHandle(ref, () => ({
      startSession,
      startRecording,
      stopRecording,
      endSession,
      getSessionData,
      reset, // expose reset
      isRecording,
      recordingPath,
      audioResult,
      sessionActive,
      recordingCount,
      sessionData,
    }));

    return null;
  },
);

export default AudioRecorder;
