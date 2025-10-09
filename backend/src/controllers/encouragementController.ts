import { Request, Response } from 'express';
import { EncouragementNote } from '../models';

export const createEncouragementNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, date, title, body, tags, linkedSessionId } = req.body;

    const note = await EncouragementNote.create({
      userId,
      date,
      title,
      body,
      tags: tags || [],
      linkedSessionId: linkedSessionId || null
    });

    res.status(201).json({ success: true, data: note });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { tags, date } = req.query;

    const filter: Record<string, unknown> = { userId };
    if (tags) {
      filter.tags = { $in: (tags as string).split(',') };
    }
    if (date) {
      filter.date = date;
    }

    const notes = await EncouragementNote.find(filter)
      .populate('linkedSessionId')
      .sort({ date: -1, createdAt: -1 });

    res.json({ success: true, data: notes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getNoteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const note = await EncouragementNote.findById(id).populate('linkedSessionId');

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    res.json({ success: true, data: note });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const note = await EncouragementNote.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    res.json({ success: true, data: note });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const note = await EncouragementNote.findByIdAndDelete(id);
    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    res.json({ success: true, message: 'Note deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
