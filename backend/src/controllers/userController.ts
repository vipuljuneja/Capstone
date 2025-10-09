import { Request, Response } from 'express';
import {
  AssessmentResponse,
  EncouragementNote,
  PracticeSession,
  Progress,
  User
} from '../models';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { authUid, email, name, profile } = req.body;

    const existingUser = await User.findOne({ authUid });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const user = await User.create({
      authUid,
      email,
      name,
      profile: profile || { severityLevel: 'Moderate', focusHints: [] },
      streak: { current: 0, longest: 0, lastActiveAt: null },
      achievements: []
    });

    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserByAuthUid = async (req: Request, res: Response): Promise<void> => {
  try {
    const { authUid } = req.params;
    const user = await User.findOne({ authUid });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { authUid } = req.params;
    const { name, profile } = req.body;

    const user = await User.findOneAndUpdate(
      { authUid },
      { name, profile },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserStreak = async (req: Request, res: Response): Promise<void> => {
  try {
    const { authUid } = req.params;
    const user = await User.findOne({ authUid });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const now = new Date();
    const lastActive = user.streak.lastActiveAt;

    if (!lastActive) {
      user.streak.current = 1;
      user.streak.longest = 1;
    } else {
      const daysSinceActive = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceActive === 0) {
        // Already active today
      } else if (daysSinceActive === 1) {
        user.streak.current += 1;
        if (user.streak.current > user.streak.longest) {
          user.streak.longest = user.streak.current;
        }
      } else {
        user.streak.current = 1;
      }
    }

    user.streak.lastActiveAt = now;
    await user.save();

    res.json({ success: true, data: user.streak });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addUserAchievement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { authUid } = req.params;
    const { achievementKey } = req.body;

    const user = await User.findOne({ authUid });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!user.achievements.includes(achievementKey)) {
      user.achievements.push(achievementKey);
      await user.save();
    }

    res.json({ success: true, data: user.achievements });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { authUid } = req.params;

    const user = await User.findOneAndDelete({ authUid });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await AssessmentResponse.deleteMany({ userId: user._id });
    await PracticeSession.deleteMany({ userId: user._id });
    await Progress.deleteMany({ userId: user._id });
    await EncouragementNote.deleteMany({ userId: user._id });

    res.json({ success: true, message: 'User and related data deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
