import { Request, Response } from 'express';
import { LevelPrompt } from '../models';

export const createLevelPrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scenarioId, level, introScript, questionSet, rubric, aiSystemPrompt, aiScoringPrompt } = req.body;

    const levelPrompt = await LevelPrompt.create({
      scenarioId,
      level,
      introScript,
      questionSet,
      rubric,
      aiSystemPrompt,
      aiScoringPrompt
    });

    res.status(201).json({ success: true, data: levelPrompt });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLevelPromptByScenarioAndLevel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scenarioId, level } = req.params;

    const levelPrompt = await LevelPrompt.findOne({
      scenarioId,
      level: parseInt(level, 10)
    }).populate('scenarioId');

    if (!levelPrompt) {
      res.status(404).json({ error: 'Level prompt not found' });
      return;
    }

    res.json({ success: true, data: levelPrompt });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllLevelPromptsForScenario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scenarioId } = req.params;

    const levelPrompts = await LevelPrompt.find({ scenarioId }).sort({ level: 1 });
    res.json({ success: true, data: levelPrompts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateLevelPrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const levelPrompt = await LevelPrompt.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!levelPrompt) {
      res.status(404).json({ error: 'Level prompt not found' });
      return;
    }

    res.json({ success: true, data: levelPrompt });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteLevelPrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const levelPrompt = await LevelPrompt.findByIdAndDelete(id);
    if (!levelPrompt) {
      res.status(404).json({ error: 'Level prompt not found' });
      return;
    }

    res.json({ success: true, message: 'Level prompt deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
