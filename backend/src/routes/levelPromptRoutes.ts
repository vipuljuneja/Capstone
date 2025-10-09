import express from 'express';
import { verifyFirebaseToken } from '../middleware/authMiddleware';
import {
  createLevelPrompt,
  deleteLevelPrompt,
  getAllLevelPromptsForScenario,
  getLevelPromptByScenarioAndLevel,
  updateLevelPrompt
} from '../controllers/levelPromptController';

const router = express.Router();

router.post('/', verifyFirebaseToken, createLevelPrompt);
router.get('/:scenarioId', verifyFirebaseToken, getAllLevelPromptsForScenario);
router.get('/:scenarioId/:level', verifyFirebaseToken, getLevelPromptByScenarioAndLevel);
router.put('/:id', verifyFirebaseToken, updateLevelPrompt);
router.delete('/:id', verifyFirebaseToken, deleteLevelPrompt);

export default router;
