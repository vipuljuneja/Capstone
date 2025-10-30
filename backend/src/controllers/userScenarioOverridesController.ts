import { Request, Response } from 'express';
import UserScenarioOverrides from '../models/UserScenarioOverrides';
import SimpleScenario from '../models/SimpleScenario';

const isValidLevel = (level: string): level is 'level1' | 'level2' | 'level3' =>
  level === 'level1' || level === 'level2' || level === 'level3';

export const getUserLevelQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, scenarioId, level } = req.params as { userId: string; scenarioId: string; level: string };

    if (!isValidLevel(level)) {
      res.status(400).json({ success: false, error: 'Invalid level' });
      return;
    }

    // Level 1 is always the shared default
    if (level === 'level1') {
      const scenario = await SimpleScenario.findById(scenarioId);
      if (!scenario) {
        res.status(404).json({ success: false, error: 'Scenario not found' });
        return;
      }
      res.json({ success: true, data: scenario.level1 });
      return;
    }

    // For level2/3, try user override first, then default
    const override = await UserScenarioOverrides.findOne({ userId, scenarioId });
    if (override && (override as any)[level]) {
      res.json({ success: true, data: (override as any)[level] });
      return;
    }

    const scenario = await SimpleScenario.findById(scenarioId);
    if (!scenario) {
      res.status(404).json({ success: false, error: 'Scenario not found' });
      return;
    }

    res.json({ success: true, data: (scenario as any)[level] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const upsertUserLevelQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, scenarioId, level } = req.params as { userId: string; scenarioId: string; level: string };
    const { questions } = req.body as { questions: Array<{ order: number; text: string; videoUrl: string }> };

    if (!isValidLevel(level) || level === 'level1') {
      res.status(400).json({ success: false, error: 'Only level2 or level3 can be personalized' });
      return;
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ success: false, error: 'questions array is required' });
      return;
    }

    const update: any = {};
    update[level] = { questions };

    const saved = await UserScenarioOverrides.findOneAndUpdate(
      { userId, scenarioId },
      { $set: update },
      { new: true, upsert: true }
    );

    console.log('🧠 Saved personalized questions:', {
      userId,
      scenarioId,
      level,
      count: questions.length,
      preview: questions.slice(0, 2)
    });

    res.json({ success: true, data: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


