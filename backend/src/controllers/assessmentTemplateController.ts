import { Request, Response } from 'express';
import { AssessmentTemplate } from '../models';

export const createAssessmentTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, scale, items } = req.body;

    const template = await AssessmentTemplate.create({ title, scale, items });
    res.status(201).json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllAssessmentTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const templates = await AssessmentTemplate.find();
    res.json({ success: true, data: templates });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAssessmentTemplateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const template = await AssessmentTemplate.findById(id);

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    res.json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAssessmentTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const template = await AssessmentTemplate.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    res.json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAssessmentTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const template = await AssessmentTemplate.findByIdAndDelete(id);

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    res.json({ success: true, message: 'Template deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
