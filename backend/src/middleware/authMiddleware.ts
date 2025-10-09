import { Request, Response, NextFunction } from 'express';
import { firebaseAdmin } from '../config/firebase';
import { User } from '../models';
import { Types } from 'mongoose';

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        userId?: string; // MongoDB User _id
      };
    }
  }
}

/**
 * Middleware to verify Firebase JWT token
 * Extracts token from Authorization header and verifies it
 */
export const verifyFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'No authorization token provided'
      });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token format'
      });
      return;
    }

    // Verify token with Firebase
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);

    // Find user in MongoDB by Firebase UID
    const user = await User.findOne({ authUid: decodedToken.uid });

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      userId: user?._id ? (user._id as Types.ObjectId).toString() : undefined
    };

    next();
  } catch (error: any) {
    console.error('❌ Auth error:', error);

    if (error.code === 'auth/id-token-expired') {
      res.status(401).json({
        status: 'error',
        message: 'Token expired. Please login again.'
      });
      return;
    }

    if (error.code === 'auth/argument-error') {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
      return;
    }

    res.status(401).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};

/**
 * Optional middleware - only verifies if token exists
 * Useful for endpoints that work with or without auth
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      const user = await User.findOne({ authUid: decodedToken.uid });

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        userId: user?._id ? (user._id as Types.ObjectId).toString() : undefined
      };
    }

    next();
  } catch (error) {
    // Don't block request if optional auth fails
    next();
  }
};