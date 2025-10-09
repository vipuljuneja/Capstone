import { Request, Response } from 'express';
import { Progress } from '../models';

export const initializeProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, scenarioId } = req.body;

    const existingProgress = await Progress.findOne({ userId, scenarioId });
    if (existingProgress) {
      res.status(400).json({ error: 'Progress already exists' });
      return;
    }

    const progress = await Progress.create({
      userId,
      scenarioId,
      levels: {
        '1': {
          attempts: 0,
          lastCompletedAt: null,
          achievements: [],
          unlockedAt: new Date()
        }
      },
      totalSessions: 0,
      lastPlayedAt: null
    });

    res.status(201).json({ success: true, data: progress });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const progress = await Progress.find({ userId })
      .populate('scenarioId')
      .sort({ lastPlayedAt: -1 });

    res.json({ success: true, data: progress });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProgressForScenario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, scenarioId } = req.params;

    const progress = await Progress.findOne({ userId, scenarioId }).populate('scenarioId');

    if (!progress) {
      res.status(404).json({ error: 'Progress not found' });
      return;
    }

    res.json({ success: true, data: progress });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const unlockLevel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, scenarioId } = req.params;
    const { level } = req.body;

    const progress = await Progress.findOne({ userId, scenarioId });
    if (!progress) {
      res.status(404).json({ error: 'Progress not found' });
      return;
    }

    const levelKey = level.toString();
    const levelProgress =
      progress.levels.get(levelKey) || {
        attempts: 0,
        lastCompletedAt: null,
        achievements: [],
        unlockedAt: null
      };

    if (!levelProgress.unlockedAt) {
      levelProgress.unlockedAt = new Date();
      progress.levels.set(levelKey, levelProgress);
      await progress.save();
    }

    res.json({ success: true, data: progress });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
