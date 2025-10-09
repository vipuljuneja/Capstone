import { Request, Response } from 'express';
import { LevelPrompt, MediaJob, Scenario } from '../models';

export const createScenario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, levels, status } = req.body;

    const scenario = await Scenario.create({
      title,
      description,
      levels: levels || [1, 2, 3],
      status: status || 'published'
    });

    res.status(201).json({ success: true, data: scenario });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllScenarios = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const scenarios = await Scenario.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: scenarios });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPublishedScenarios = async (req: Request, res: Response): Promise<void> => {
  try {
    const scenarios = await Scenario.find({ status: 'published' }).sort({ createdAt: -1 });
    res.json({ success: true, data: scenarios });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getScenarioById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const scenario = await Scenario.findById(id);

    if (!scenario) {
      res.status(404).json({ error: 'Scenario not found' });
      return;
    }

    res.json({ success: true, data: scenario });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateScenario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const scenario = await Scenario.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!scenario) {
      res.status(404).json({ error: 'Scenario not found' });
      return;
    }

    res.json({ success: true, data: scenario });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteScenario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const scenario = await Scenario.findByIdAndDelete(id);
    if (!scenario) {
      res.status(404).json({ error: 'Scenario not found' });
      return;
    }

    await LevelPrompt.deleteMany({ scenarioId: id });
    await MediaJob.deleteMany({ scenarioId: id });

    res.json({ success: true, message: 'Scenario and related data deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
