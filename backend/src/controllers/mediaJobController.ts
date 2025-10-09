import { Request, Response } from 'express';
import { MediaJob } from '../models';

export const createMediaJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scenarioId, level, questionOrder, provider, jobId, source } = req.body;

    const mediaJob = await MediaJob.create({
      scenarioId,
      level,
      questionOrder,
      provider,
      jobId,
      status: 'queued',
      requestedAt: new Date(),
      source,
      output: null,
      error: null
    });

    res.status(201).json({ success: true, data: mediaJob });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMediaJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const mediaJob = await MediaJob.findById(id);

    if (!mediaJob) {
      res.status(404).json({ error: 'Media job not found' });
      return;
    }

    res.json({ success: true, data: mediaJob });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMediaJobByJobId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const mediaJob = await MediaJob.findOne({ jobId });

    if (!mediaJob) {
      res.status(404).json({ error: 'Media job not found' });
      return;
    }

    res.json({ success: true, data: mediaJob });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMediaJobStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const { status, output, error } = req.body;

    const mediaJob = await MediaJob.findOneAndUpdate(
      { jobId },
      { status, output, error },
      { new: true, runValidators: true }
    );

    if (!mediaJob) {
      res.status(404).json({ error: 'Media job not found' });
      return;
    }

    res.json({ success: true, data: mediaJob });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getMediaJobsByStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.params;
    const mediaJobs = await MediaJob.find({ status }).sort({ requestedAt: 1 });

    res.json({ success: true, data: mediaJobs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMediaJobsForScenario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scenarioId } = req.params;
    const mediaJobs = await MediaJob.find({ scenarioId }).sort({ level: 1, questionOrder: 1 });

    res.json({ success: true, data: mediaJobs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
