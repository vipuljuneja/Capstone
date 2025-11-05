"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const scenarioController_1 = require("../controllers/scenarioController");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.verifyFirebaseToken, scenarioController_1.createScenario);
router.get('/', authMiddleware_1.verifyFirebaseToken, scenarioController_1.getAllScenarios);
router.get('/published', authMiddleware_1.verifyFirebaseToken, scenarioController_1.getPublishedScenarios);
router.get('/:id', authMiddleware_1.verifyFirebaseToken, scenarioController_1.getScenarioById);
router.put('/:id', authMiddleware_1.verifyFirebaseToken, scenarioController_1.updateScenario);
router.delete('/:id', authMiddleware_1.verifyFirebaseToken, scenarioController_1.deleteScenario);
exports.default = router;
//# sourceMappingURL=scenarioRoutes.js.map