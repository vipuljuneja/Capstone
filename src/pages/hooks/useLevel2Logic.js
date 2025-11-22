import { useState, useRef, useCallback, useEffect } from 'react';
import scenarioService from '../../services/scenarioService';
import { getUserLevelQuestions } from '../../services/api';

export const useLevel2Logic = (scenarioId, mongoUserId) => {
  const [scenarioData, setScenarioData] = useState(null);
  const [userQuestions, setUserQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (scenarioId && mongoUserId) {
          const questionsData = await getUserLevelQuestions(
            mongoUserId,
            scenarioId,
            'level2',
          );

          console.log('📹 Loaded user questions:', questionsData);
          setUserQuestions(questionsData.questions || []);

          const scenario = await scenarioService.getScenarioById(scenarioId);
          setScenarioData(scenario);
        } else if (scenarioId) {
          const scenario = await scenarioService.getScenarioById(scenarioId);
          setScenarioData(scenario);
        }
      } catch (err) {
        console.error('Failed to load scenario data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [scenarioId, mongoUserId]);

  return { scenarioData, userQuestions, loading, error };
};
