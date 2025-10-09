import express from 'express';
import { verifyFirebaseToken } from '../middleware/authMiddleware';
import {
  createScenario,
  deleteScenario,
  getAllScenarios,
  getPublishedScenarios,
  getScenarioById,
  updateScenario
} from '../controllers/scenarioController';

const router = express.Router();

router.post('/', verifyFirebaseToken, createScenario);
router.get('/', verifyFirebaseToken, getAllScenarios);
router.get('/published', verifyFirebaseToken, getPublishedScenarios);
router.get('/:id', verifyFirebaseToken, getScenarioById);
router.put('/:id', verifyFirebaseToken, updateScenario);
router.delete('/:id', verifyFirebaseToken, deleteScenario);

export default router;
