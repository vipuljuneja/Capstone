import { Request, Response } from 'express';
import { AssessmentResponse, User } from '../models';

export const submitAssessmentResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, templateId, responses, derived, notes } = req.body;

    const response = await AssessmentResponse.create({
      userId,
      templateId,
      responses,
      derived,
      notes,
      completedAt: new Date()
    });

    await User.findByIdAndUpdate(userId, {
      'profile.severityLevel': derived.severityLevel,
      'profile.focusHints': derived.recommendedTracks
    });

    res.status(201).json({ success: true, data: response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserAssessmentResponses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const responses = await AssessmentResponse.find({ userId })
      .populate('templateId')
      .sort({ completedAt: -1 });

    res.json({ success: true, data: responses });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLatestAssessmentResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const response = await AssessmentResponse.findOne({ userId })
      .populate('templateId')
      .sort({ completedAt: -1 });

    if (!response) {
      res.status(404).json({ error: 'No assessment found' });
      return;
    }

    res.json({ success: true, data: response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
