import { Request, Response } from 'express';
import { PracticeSession, Progress } from '../models';

export const startPracticeSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, scenarioId, level } = req.body;

    const session = await PracticeSession.create({
      userId,
      scenarioId,
      level,
      status: 'active',
      steps: [],
      aggregate: {
        wpmAvg: 0,
        fillersPerMin: 0,
        toneScore: 0,
        eyeContactRatio: null,
        score: 0
      },
      aiFeedbackCards: [],
      achievementsUnlocked: [],
      startedAt: new Date(),
      completedAt: null
    });

    res.status(201).json({ success: true, data: session });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addStepToSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { step } = req.body;

    const session = await PracticeSession.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    session.steps.push(step);
    await session.save();

    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const completeSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { aggregate, aiFeedbackCards, achievementsUnlocked } = req.body;

    const session = await PracticeSession.findByIdAndUpdate(
      sessionId,
      {
        status: 'completed',
        completedAt: new Date(),
        aggregate,
        aiFeedbackCards,
        achievementsUnlocked
      },
      { new: true }
    );

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const progress = await Progress.findOne({
      userId: session.userId,
      scenarioId: session.scenarioId
    });

    if (progress) {
      const levelKey = session.level.toString();
      const levelProgress =
        progress.levels.get(levelKey) || {
          attempts: 0,
          lastCompletedAt: null,
          achievements: [],
          unlockedAt: null
        };

      levelProgress.attempts += 1;
      levelProgress.lastCompletedAt = new Date();
      levelProgress.achievements = [
        ...new Set([...levelProgress.achievements, ...achievementsUnlocked])
      ];

      progress.levels.set(levelKey, levelProgress);
      progress.totalSessions += 1;
      progress.lastPlayedAt = new Date();

      if (aggregate.score >= 70 && session.level < 3) {
        const nextLevelKey = (session.level + 1).toString();
        const nextLevelProgress =
          progress.levels.get(nextLevelKey) || {
            attempts: 0,
            lastCompletedAt: null,
            achievements: [],
            unlockedAt: null
          };

        if (!nextLevelProgress.unlockedAt) {
          nextLevelProgress.unlockedAt = new Date();
          progress.levels.set(nextLevelKey, nextLevelProgress);
        }
      }

      await progress.save();
    }

    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const abandonSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const session = await PracticeSession.findByIdAndUpdate(
      sessionId,
      { status: 'abandoned' },
      { new: true }
    );

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { status, limit } = req.query;

    const filter: Record<string, unknown> = { userId };
    if (status) {
      filter.status = status;
    }

    const sessions = await PracticeSession.find(filter)
      .populate('scenarioId')
      .sort({ startedAt: -1 })
      .limit(limit ? parseInt(limit as string, 10) : 50);

    res.json({ success: true, data: sessions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSessionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const session = await PracticeSession.findById(sessionId)
      .populate('userId')
      .populate('scenarioId');

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const session = await PracticeSession.findByIdAndDelete(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({ success: true, message: 'Session deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
