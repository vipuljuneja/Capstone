import { Request, Response } from 'express';
import { Achievement } from '../models';

export const createAchievement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key, title, description, icon, category } = req.body;

    const existingAchievement = await Achievement.findOne({ key });
    if (existingAchievement) {
      res.status(400).json({ error: 'Achievement with this key already exists' });
      return;
    }

    const achievement = await Achievement.create({
      key,
      title,
      description,
      icon,
      category
    });

    res.status(201).json({ success: true, data: achievement });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllAchievements = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};

    const achievements = await Achievement.find(filter).sort({ category: 1, title: 1 });
    res.json({ success: true, data: achievements });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAchievementById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const achievement = await Achievement.findById(id);

    if (!achievement) {
      res.status(404).json({ error: 'Achievement not found' });
      return;
    }

    res.json({ success: true, data: achievement });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAchievementByKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const achievement = await Achievement.findOne({ key });

    if (!achievement) {
      res.status(404).json({ error: 'Achievement not found' });
      return;
    }

    res.json({ success: true, data: achievement });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAchievement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const achievement = await Achievement.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!achievement) {
      res.status(404).json({ error: 'Achievement not found' });
      return;
    }

    res.json({ success: true, data: achievement });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAchievement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const achievement = await Achievement.findByIdAndDelete(id);
    if (!achievement) {
      res.status(404).json({ error: 'Achievement not found' });
      return;
    }

    res.json({ success: true, message: 'Achievement deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
