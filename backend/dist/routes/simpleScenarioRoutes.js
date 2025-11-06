"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const simpleScenarioController_1 = require("../controllers/simpleScenarioController");
const router = express_1.default.Router();
// POST /api/scenarios - Create new scenario
router.post('/', authMiddleware_1.verifyFirebaseToken, simpleScenarioController_1.createScenario);
// GET /api/scenarios - Get all scenarios
router.get('/', authMiddleware_1.verifyFirebaseToken, simpleScenarioController_1.getAllScenarios);
// GET /api/scenarios/:id - Get scenario by ID
router.get('/:id', authMiddleware_1.verifyFirebaseToken, simpleScenarioController_1.getScenarioById);
// PUT /api/scenarios/:id - Update scenario
router.put('/:id', authMiddleware_1.verifyFirebaseToken, simpleScenarioController_1.updateScenario);
// PUT /api/scenarios/:id/questions - Update scenario questions for specific level
router.put('/:id/questions', authMiddleware_1.verifyFirebaseToken, simpleScenarioController_1.updateScenarioQuestions);
// DELETE /api/scenarios/:id - Delete scenario
router.delete('/:id', authMiddleware_1.verifyFirebaseToken, simpleScenarioController_1.deleteScenario);
// POST /api/scenarios/initialize - Initialize default scenarios
router.post('/initialize', authMiddleware_1.verifyFirebaseToken, simpleScenarioController_1.initializeDefaultScenarios);
exports.default = router;
//# sourceMappingURL=simpleScenarioRoutes.js.map