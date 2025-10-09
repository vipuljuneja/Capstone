import express from 'express';
import { verifyFirebaseToken } from '../middleware/authMiddleware';
import {
  getProgressForScenario,
  getUserProgress,
  initializeProgress,
  unlockLevel
} from '../controllers/progressController';

const router = express.Router();

router.post('/', verifyFirebaseToken, initializeProgress);
router.get('/user/:userId', verifyFirebaseToken, getUserProgress);
router.get('/user/:userId/scenario/:scenarioId', verifyFirebaseToken, getProgressForScenario);
router.post('/user/:userId/scenario/:scenarioId/unlock', verifyFirebaseToken, unlockLevel);

export default router;
