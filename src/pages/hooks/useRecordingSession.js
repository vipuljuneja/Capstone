// src/hooks/useRecordingSession.js
import { useState, useRef, useCallback } from 'react';

export const useRecordingSession = totalQuestions => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptionResults, setTranscriptionResults] = useState([]);
  const [facialAnalysisResults, setFacialAnalysisResults] = useState([]);
  const [lastTranscriptionReceived, setLastTranscriptionReceived] =
    useState(false);
  const [lastFacialAnalysisReceived, setLastFacialAnalysisReceived] =
    useState(false);

  const transcriptionResultsRef = useRef([]);
  const facialAnalysisResultsRef = useRef([]);
  const transcriptionPromiseRef = useRef(null);
  const waitingForFinalResult = useRef(false);

  const handleTranscriptionComplete = useCallback(
    report => {
      console.log('📥 Transcription result received:', report);

      setTranscriptionResults(prevResults => {
        const newResults = [...prevResults, report];
        transcriptionResultsRef.current = newResults;

        if (
          waitingForFinalResult.current &&
          newResults.length === totalQuestions
        ) {
          setLastTranscriptionReceived(true);
        }
        return newResults;
      });

      if (transcriptionPromiseRef.current) {
        transcriptionPromiseRef.current.resolve(report);
        transcriptionPromiseRef.current = null;
      }
    },
    [totalQuestions],
  );

  const handleFacialAnalysisComplete = useCallback(
    insights => {
      console.log('📥 Facial analysis result received:', insights);

      setFacialAnalysisResults(prevResults => {
        const newResults = [...prevResults, insights];
        facialAnalysisResultsRef.current = newResults;

        if (
          waitingForFinalResult.current &&
          newResults.length === totalQuestions
        ) {
          setLastFacialAnalysisReceived(true);
        }
        return newResults;
      });
    },
    [totalQuestions],
  );

  const resetSession = useCallback(() => {
    console.log('🔄 Resetting session');
    setIsRecording(false);
    setTranscriptionResults([]);
    setFacialAnalysisResults([]);
    transcriptionResultsRef.current = [];
    facialAnalysisResultsRef.current = [];
    setLastTranscriptionReceived(false);
    setLastFacialAnalysisReceived(false);
    waitingForFinalResult.current = false;
  }, []);

  return {
    isRecording,
    setIsRecording,
    transcriptionResults,
    facialAnalysisResults,
    handleTranscriptionComplete,
    handleFacialAnalysisComplete,
    resetSession,
    transcriptionResultsRef,
    facialAnalysisResultsRef,
    transcriptionPromiseRef,
    waitingForFinalResult,
    lastTranscriptionReceived,
    lastFacialAnalysisReceived,
    setLastTranscriptionReceived,
    setLastFacialAnalysisReceived,
  };
};
