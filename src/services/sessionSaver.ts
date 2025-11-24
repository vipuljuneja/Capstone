/**
 * Reusable session saving service for practice sessions
 * Handles both audio-only (Level 1) and audio+facial (Level 2) data
 */

import { submitCompletePracticeSession, getUserPracticeSessions } from './api';
import { formatCompleteSessionData } from '../utils/sessionDataFormatter';

export interface SessionSaveOptions {
  userId: string;
  scenarioId: string;
  level: number;
  transcriptionResults: any[];
  facialAnalysisResults?: any[];
  onSuccess?: (sessionId: string) => void;
  onError?: (error: Error) => void;
}

export interface SessionSaveResult {
  success: boolean;
  sessionId?: string;
  error?: string;
}

/**
 * Save a practice session with automatic data formatting
 * @param options - Session data and callbacks
 * @returns Promise with save result
 */
export const savePracticeSession = async (
  options: SessionSaveOptions
): Promise<SessionSaveResult> => {
  const {
    userId,
    scenarioId,
    level,
    transcriptionResults,
    facialAnalysisResults = [],
    onSuccess,
    onError
  } = options;

  try {
    console.group('💾 SAVING PRACTICE SESSION');
    console.log('User ID:', userId);
    console.log('Scenario ID:', scenarioId);
    console.log('Level:', level);
    console.log('Steps count:', transcriptionResults.length);
    console.log('Facial analysis available:', facialAnalysisResults.length > 0);

    // Validate required data
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!scenarioId) {
      throw new Error('Scenario ID is required');
    }
    // Validate scenarioId format - must be 24-character MongoDB ObjectId
    if (String(scenarioId).length !== 24) {
      throw new Error(`Invalid scenarioId format: "${scenarioId}". Must be a valid MongoDB ObjectId (24 character hex string).`);
    }
    if (!transcriptionResults || transcriptionResults.length === 0) {
      throw new Error('No transcription results to save');
    }

    // Get facial analysis (if available and valid - filter out error objects)
    const facialAnalysis = facialAnalysisResults && facialAnalysisResults.length > 0
      ? (facialAnalysisResults[0]?.error ? null : facialAnalysisResults[0])
      : null;

    console.log('Overall score:', facialAnalysis?.summary?.overallScore || 0);

            // Format data for backend
            const sessionData = formatCompleteSessionData(
              userId,
              scenarioId, // Already a valid ObjectId from HomeScreen
              level,
              transcriptionResults,
              facialAnalysis
            );

    console.log('📦 Formatted session data:', {
      userId: sessionData.userId,
      scenarioId: sessionData.scenarioId,
      level: sessionData.level,
      stepsCount: sessionData.steps.length,
      score: sessionData.aggregate.score,
      hasFacialAnalysis: !!sessionData.facialAnalysis,
    });

    // Submit to backend
    const savedSession = await submitCompletePracticeSession(sessionData);

    console.log('✅ SESSION SAVED');
    console.log('Session ID:', savedSession._id);
    console.log('Status:', savedSession.status);
    console.log('Feedback Cards:', savedSession.aiFeedbackCards?.length || 0);
    console.log('Pipo Note ID:', savedSession.pipoNoteId);
    
    // Log detailed cards information
    if (savedSession.aiFeedbackCards && savedSession.aiFeedbackCards.length > 0) {
      console.log('🃏 DETAILED FEEDBACK CARDS:');
      savedSession.aiFeedbackCards.forEach((card, index) => {
        console.log(`Card ${index + 1}:`, {
          title: card.title,
          content: card.content,
          type: card.type,
          category: card.category,
          score: card.score,
          suggestions: card.suggestions,
        });
      });
    } else {
      console.log('🃏 No feedback cards generated');
    }
    
    // Log pipo note information
    if (savedSession.pipoNoteId) {
      console.log('📝 PIPO NOTE CREATED:', {
        pipoNoteId: savedSession.pipoNoteId,
        sessionId: savedSession._id,
        level: savedSession.level,
        scenarioId: savedSession.scenarioId,
      });
    } else {
      console.log('📝 No pipo note created');
    }
    
    // Fetch and log all user's cards
    try {
      console.log('🃏 FETCHING ALL USER CARDS...');
      const allSessions = await getUserPracticeSessions(sessionData.userId, 'completed', 20);
      const allCards: any[] = [];
      
      allSessions.forEach(session => {
        if (session.aiFeedbackCards && Array.isArray(session.aiFeedbackCards)) {
          session.aiFeedbackCards.forEach(card => {
            allCards.push({
              ...card,
              sessionId: session._id,
              sessionLevel: session.level,
              sessionScenarioId: session.scenarioId,
              completedAt: session.completedAt,
            });
          });
        }
      });
      
      console.log('🃏 TOTAL CARDS FETCHED:', allCards.length);
      if (allCards.length > 0) {
        console.log('🃏 ALL USER CARDS:', allCards);
      }
    } catch (error) {
      console.error('❌ Failed to fetch user cards:', error);
    }
    
    console.groupEnd();

    // Call success callback
    if (onSuccess) {
      onSuccess(savedSession._id);
    }

    return {
      success: true,
      sessionId: savedSession._id
    };

  } catch (error: any) {
    console.error('❌ FAILED TO SAVE SESSION');
    console.error('Error:', error?.message || 'Unknown error');
    console.error('Details:', error?.response?.data || error);
    console.groupEnd();

    // Call error callback
    if (onError) {
      onError(error instanceof Error ? error : new Error(error?.message || 'Unknown error'));
    }

    return {
      success: false,
      error: error?.message || 'Failed to save session'
    };
  }
};

/**
 * Hook for session saving with state management
 * Returns loading state and save function
 */
export const useSessionSaver = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveSession = async (options: Omit<SessionSaveOptions, 'onSuccess' | 'onError'>) => {
    if (isSaving || savedSessionId) {
      console.log('⏭️ Session already saved or saving in progress, skipping...');
      return { success: false, error: 'Session already saved' };
    }

    setIsSaving(true);
    setSaveError(null);

    const result = await savePracticeSession({
      ...options,
      onSuccess: (sessionId) => {
        setSavedSessionId(sessionId);
        setIsSaving(false);
      },
      onError: (error) => {
        setSaveError(error.message);
        setIsSaving(false);
      }
    });

    return result;
  };

  const reset = () => {
    setIsSaving(false);
    setSavedSessionId(null);
    setSaveError(null);
  };

  return {
    isSaving,
    savedSessionId,
    saveError,
    saveSession,
    reset
  };
};

// Import useState for the hook
import { useState } from 'react';

/**
 * Manual function to fetch and log all user cards
 * Useful for testing and debugging
 */
export const fetchAndLogUserCards = async (userId: string) => {
  try {
    console.log('🃏 MANUAL CARD FETCH - Starting...');
    const sessions = await getUserPracticeSessions(userId, 'completed', 50);
    
    const allCards: any[] = [];
    sessions.forEach(session => {
      if (session.aiFeedbackCards && Array.isArray(session.aiFeedbackCards)) {
        session.aiFeedbackCards.forEach(card => {
          allCards.push({
            ...card,
            sessionId: session._id,
            sessionLevel: session.level,
            sessionScenarioId: session.scenarioId,
            completedAt: session.completedAt,
          });
        });
      }
    });
    
    console.log('🃏 MANUAL FETCH - Total cards found:', allCards.length);
    console.log('🃏 MANUAL FETCH - All cards:', allCards);
    
    return allCards;
  } catch (error) {
    console.error('❌ MANUAL FETCH - Failed:', error);
    return [];
  }
};
