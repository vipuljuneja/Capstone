/**
 * Helper functions to format practice session data from frontend to backend format
 */

interface TranscriptionResult {
  recordingNumber: number;
  timestamp: string;
  wpm: number;
  totalWords: number;
  fillerWordCount: number;
  fillerWords: Array<{ word: string; time: string }>;
  pauseCount: number;
  pauses: Array<{ duration: string; timestamp: string }>;
  duration: string;
  transcript: string;
}

interface FacialAnalysisResult {
  summary: {
    overallScore: number;
    level: string;
    totalFrames: number;
    duration: number;
    timestamp: string;
  };
  scores: {
    eyeContact: number;
    posture: number;
    expressiveness: number;
    composure: number;
    naturalness: number;
  };
  detailedMetrics: any;
  strengths: any[];
  weaknesses: any[];
  recommendations: any[];
  keyInsights: string[];
}

/**
 * Format transcription results into backend step format
 */
export const formatTranscriptionToSteps = (
  transcriptionResults: TranscriptionResult[],
  facialAnalysis: FacialAnalysisResult | null
) => {
  return transcriptionResults.map((result, index) => {
    // Validate and parse dates
    if (!result.timestamp) {
      console.warn(`⚠️ Step ${index + 1}: Missing timestamp, using current time`);
    }
    if (!result.duration) {
      console.warn(`⚠️ Step ${index + 1}: Missing duration, using 0`);
    }
    
    const startTime = result.timestamp ? new Date(result.timestamp) : new Date();
    const duration = result.duration ? parseFloat(result.duration) : 0;
    const endTime = new Date(startTime.getTime() + duration * 1000);

    // Only add facial metrics to the first step (since facial analysis is for entire session)
    const facialMetrics = index === 0 && facialAnalysis ? {
      eyeContact: {
        available: true,
        ratio: facialAnalysis.scores.eyeContact / 100
      },
      smile: {
        ratio: facialAnalysis.detailedMetrics?.smiles?.percentage / 100 || null
      }
    } : {
      eyeContact: {
        available: false,
        ratio: null
      },
      smile: {
        ratio: null
      }
    };

    return {
      order: index + 1,
      startedAt: startTime,
      endedAt: endTime,
      transcript: result.transcript || 'No transcription',
      metrics: {
        durationSec: parseFloat(result.duration),
        wpm: result.wpm,
        fillers: (result.fillerWords || []).map(f => ({
          word: f.word,
          t: parseFloat(f.time)
        })),
        pauses: (result.pauses || []).map(p => ({
          t: parseFloat(p.timestamp),
          len: parseFloat(p.duration)
        })),
        tone: {
          score: 0,
          labels: []
        },
        ...facialMetrics
      }
    };
  });
};

/**
 * Calculate aggregate metrics from transcription results
 */
export const calculateAggregateMetrics = (
  transcriptionResults: TranscriptionResult[],
  facialAnalysis: FacialAnalysisResult | null
) => {
  if (!transcriptionResults || transcriptionResults.length === 0) {
    return {
      wpmAvg: 0,
      fillersPerMin: 0,
      toneScore: 0,
      eyeContactRatio: null,
      score: facialAnalysis?.summary?.overallScore || 0
    };
  }

  const totals = transcriptionResults.reduce(
    (acc, result) => ({
      wpm: acc.wpm + (result.wpm || 0),
      fillerWords: acc.fillerWords + (result.fillerWordCount || 0),
      duration: acc.duration + parseFloat(result.duration || '0')
    }),
    { wpm: 0, fillerWords: 0, duration: 0 }
  );

  const count = transcriptionResults.length;
  const avgWpm = Math.round(totals.wpm / count);
  const fillersPerMin = totals.duration > 0 
    ? Math.round((totals.fillerWords / totals.duration) * 60)
    : 0;

  return {
    wpmAvg: avgWpm,
    fillersPerMin,
    toneScore: 0,
    eyeContactRatio: facialAnalysis?.scores?.eyeContact 
      ? facialAnalysis.scores.eyeContact / 100 
      : null,
    score: facialAnalysis?.summary?.overallScore || 0
  };
};

/**
 * Format facial analysis data for backend
 * Converts string timestamps to Date objects
 */
export const formatFacialAnalysis = (facialAnalysis: FacialAnalysisResult | null) => {
  if (!facialAnalysis) {
    return null;
  }

  return {
    ...facialAnalysis,
    summary: {
      ...facialAnalysis.summary,
      timestamp: new Date(facialAnalysis.summary.timestamp)
    }
  };
};

/**
 * Complete session data formatter
 * Takes raw frontend data and returns backend-ready format
 */
export const formatCompleteSessionData = (
  userId: string,
  scenarioId: string,
  level: number,
  transcriptionResults: TranscriptionResult[],
  facialAnalysis: FacialAnalysisResult | null
) => {
  const steps = formatTranscriptionToSteps(transcriptionResults, facialAnalysis);
  const aggregate = calculateAggregateMetrics(transcriptionResults, facialAnalysis);
  const formattedFacialAnalysis = formatFacialAnalysis(facialAnalysis);

  return {
    userId,
    scenarioId,
    level,
    steps,
    aggregate,
    facialAnalysis: formattedFacialAnalysis,
    // aiFeedbackCards will be auto-generated by backend from facialAnalysis
    achievementsUnlocked: [] // TODO: Calculate based on performance
  };
};

