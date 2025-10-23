import express from 'express';
import { verifyFirebaseToken } from '../middleware/authMiddleware';
import {
  abandonSession,
  addStepToSession,
  completeSession,
  createCompleteSession,
  deleteSession,
  getSessionById,
  getUserSessions,
  startPracticeSession
} from '../controllers/practiceSessionController';

const router = express.Router();

router.post('/', verifyFirebaseToken, startPracticeSession);
router.post('/complete', verifyFirebaseToken, createCompleteSession); // Create complete session in one go
router.post('/:sessionId/steps', verifyFirebaseToken, addStepToSession);
router.post('/:sessionId/complete', verifyFirebaseToken, completeSession);
router.post('/:sessionId/abandon', verifyFirebaseToken, abandonSession);
router.get('/user/:userId', verifyFirebaseToken, getUserSessions);
router.get('/:sessionId', verifyFirebaseToken, getSessionById);
router.delete('/:sessionId', verifyFirebaseToken, deleteSession);

export default router;
