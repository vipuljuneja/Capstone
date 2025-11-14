import express from 'express';
import { verifyFirebaseToken } from '../middleware/authMiddleware';
import {
  createScenario,
  getAllScenarios,
  getScenarioById,
  updateScenario,
  updateScenarioQuestions,
  deleteScenario,
  initializeDefaultScenarios
} from '../controllers/simpleScenarioController';

const router = express.Router();

// POST /api/scenarios - Create new scenario
router.post('/', verifyFirebaseToken, createScenario);

// GET /api/scenarios - Get all scenarios
router.get('/', verifyFirebaseToken, getAllScenarios);

// GET /api/scenarios/:id - Get scenario by ID
router.get('/:id', verifyFirebaseToken, getScenarioById);

// PUT /api/scenarios/:id - Update scenario
router.put('/:id', verifyFirebaseToken, updateScenario);

// PUT /api/scenarios/:id/questions - Update scenario questions for specific level
router.put('/:id/questions', verifyFirebaseToken, updateScenarioQuestions);

// DELETE /api/scenarios/:id - Delete scenario
router.delete('/:id', verifyFirebaseToken, deleteScenario);

// POST /api/scenarios/initialize - Initialize default scenarios
router.post('/initialize', verifyFirebaseToken, initializeDefaultScenarios);

export default router;







