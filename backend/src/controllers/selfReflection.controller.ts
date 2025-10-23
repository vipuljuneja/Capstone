import { Request, Response } from 'express';
import SelfReflection from '../models/SelfReflection';
import User from '../models/User';
import PracticeSession from '../models/PracticeSession';
import Scenario from '../models/Scenario';
import mongoose from 'mongoose';
import { generatePipoNote, prepareSessionDataForAI } from '../services/practiceSessionAIService';

/**
 * Create a new self-reflection entry
 */
export const createReflection = async (req: Request, res: Response) => {
  try {
    const { userId, title, description, date, type, imageName } = req.body;

    // Validate required fields
    if (!userId || !title || !date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, title, and date are required',
      });
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid userId format',
      });
    }

    // Verify user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Create new reflection
    const reflection = await SelfReflection.create({
      userId,
      title,
      description: description || '',
      date: new Date(date),
      type: type || 'self',
      imageName: imageName || undefined, // For Pipo avatar image
    });

    return res.status(201).json({
      success: true,
      data: reflection,
    });
  } catch (error: any) {
    console.error('❌ Error creating reflection:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create reflection',
    });
  }
};

/**
 * Get reflections for a user (with optional filters)
 */
export const getReflectionsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { date, type, startDate, endDate } = req.query;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid userId format',
      });
    }

    // Build query
    const query: any = { userId };

    // Filter by specific date
    if (date) {
      const targetDate = new Date(date as string);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = {
        $gte: targetDate,
        $lt: nextDay,
      };
    }

    // Filter by date range
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    // Filter by type
    if (type && (type === 'pipo' || type === 'self')) {
      query.type = type;
    }

    const reflections = await SelfReflection.find(query)
      .sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: reflections,
    });
  } catch (error: any) {
    console.error('❌ Error fetching reflections:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch reflections',
    });
  }
};

/**
 * Get a single reflection by ID
 */
export const getReflectionById = async (req: Request, res: Response) => {
  try {
    const { reflectionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reflectionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reflection ID format',
      });
    }

    const reflection = await SelfReflection.findById(reflectionId);

    if (!reflection) {
      return res.status(404).json({
        success: false,
        error: 'Reflection not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: reflection,
    });
  } catch (error: any) {
    console.error('❌ Error fetching reflection:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch reflection',
    });
  }
};

/**
 * Update a reflection
 */
export const updateReflection = async (req: Request, res: Response) => {
  try {
    const { reflectionId } = req.params;
    const { title, description, date, type, imageName } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reflectionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reflection ID format',
      });
    }

    // Build update object
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date);
    if (type !== undefined && (type === 'pipo' || type === 'self')) {
      updateData.type = type;
    }
    if (imageName !== undefined) updateData.imageName = imageName;

    const reflection = await SelfReflection.findByIdAndUpdate(
      reflectionId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!reflection) {
      return res.status(404).json({
        success: false,
        error: 'Reflection not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: reflection,
    });
  } catch (error: any) {
    console.error('❌ Error updating reflection:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update reflection',
    });
  }
};

/**
 * Delete a reflection
 */
export const deleteReflection = async (req: Request, res: Response) => {
  try {
    const { reflectionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reflectionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reflection ID format',
      });
    }

    const reflection = await SelfReflection.findByIdAndDelete(reflectionId);

    if (!reflection) {
      return res.status(404).json({
        success: false,
        error: 'Reflection not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Reflection deleted successfully',
      data: reflection,
    });
  } catch (error: any) {
    console.error('❌ Error deleting reflection:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete reflection',
    });
  }
};

/**
 * Get dates that have reflections for a user (for calendar markers)
 */
export const getReflectionDates = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, type } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid userId format',
      });
    }

    const query: any = { userId };

    // Filter by date range
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    // Filter by type
    if (type && (type === 'pipo' || type === 'self')) {
      query.type = type;
    }

    // Get unique dates
    const reflections = await SelfReflection.find(query)
      .select('date type')
      .sort({ date: -1 });

    // Format dates for calendar
    const dates = reflections.map(r => ({
      date: r.date.toISOString().split('T')[0],
      type: r.type,
    }));

    return res.status(200).json({
      success: true,
      data: dates,
    });
  } catch (error: any) {
    console.error('❌ Error fetching reflection dates:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch reflection dates',
    });
  }
};

/**
 * Create a Pipo note from a completed practice session
 */
export const createPipoNoteFromSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;

    // Validate sessionId
    if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        success: false,
        error: 'Valid sessionId is required',
      });
    }

    // Fetch the practice session
    const session = await PracticeSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Practice session not found',
      });
    }

    // Check if session is completed
    if (session.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Can only create Pipo notes from completed sessions',
      });
    }

    // Check if Pipo note already exists for this session
    if (session.pipoNoteId) {
      const existingNote = await SelfReflection.findById(session.pipoNoteId);
      if (existingNote) {
        return res.status(200).json({
          success: true,
          data: existingNote,
          message: 'Pipo note already exists for this session',
        });
      }
    }

    // Fetch scenario title for better AI context
    let scenarioTitle = 'Practice';
    try {
      const scenario = await Scenario.findById(session.scenarioId);
      if (scenario) {
        scenarioTitle = scenario.title;
      }
    } catch (err) {
      console.warn('Could not fetch scenario title');
    }

    // Generate AI-powered Pipo message
    const aiData = prepareSessionDataForAI(session, scenarioTitle);
    const pipoMessage = await generatePipoNote(aiData);

    // Create the Pipo reflection note
    const pipoNote = await SelfReflection.create({
      userId: session.userId,
      title: pipoMessage.title,
      description: pipoMessage.body,
      date: session.completedAt || new Date(),
      type: 'pipo',
      imageName: 'articlePipo.png', // Default Pipo image
      linkedSessionId: session._id,
      scenarioId: session.scenarioId,
      level: session.level,
    });

    // Update the session with the pipoNoteId (two-way link)
    session.pipoNoteId = pipoNote._id as mongoose.Types.ObjectId;
    await session.save();

    return res.status(201).json({
      success: true,
      data: pipoNote,
      message: 'Pipo note created successfully',
    });
  } catch (error: any) {
    console.error('❌ Error creating Pipo note from session:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create Pipo note from session',
    });
  }
};

