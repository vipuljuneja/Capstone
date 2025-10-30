import express from 'express';
import { verifyFirebaseToken } from '../middleware/authMiddleware';
import { getUserLevelQuestions, upsertUserLevelQuestions } from '../controllers/userScenarioOverridesController';

const router = express.Router();

// GET user-aware questions for a level (level1 returns shared defaults)
router.get(
  '/users/:userId/scenarios/:scenarioId/levels/:level/questions',
  verifyFirebaseToken,
  getUserLevelQuestions
);

// PUT personalized questions for level2/level3
router.put(
  '/users/:userId/scenarios/:scenarioId/levels/:level/questions',
  verifyFirebaseToken,
  upsertUserLevelQuestions
);

export default router;


